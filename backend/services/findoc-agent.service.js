const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_FINDOC_MODEL || process.env.GEMINI_SPECIALIZED_TEACHER_MODEL || 'gemini-2.5-flash';
const MAX_DOCUMENTS = 8;
const MAX_HISTORY_ITEMS = 8;
const sessions = new Map();

function normalizeText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function buildTermFrequency(tokens) {
  const freq = new Map();

  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  return freq;
}

function scoreChunk(queryTokens, chunk) {
  if (!queryTokens.length || !chunk.vectorNorm) {
    return 0;
  }

  const queryFreq = buildTermFrequency(queryTokens);
  let dot = 0;
  let queryNorm = 0;

  for (const [token, count] of queryFreq.entries()) {
    const idf = chunk.idfLookup[token] || 0;
    const queryWeight = count * idf;
    queryNorm += queryWeight * queryWeight;

    const chunkCount = chunk.termFreq.get(token) || 0;
    if (!chunkCount) {
      continue;
    }

    dot += queryWeight * chunkCount * idf;
  }

  if (!dot || !queryNorm) {
    return 0;
  }

  return dot / (Math.sqrt(queryNorm) * chunk.vectorNorm);
}

function safeJsonParse(text) {
  const normalized = String(text || '').trim();
  if (!normalized) {
    throw new Error('Empty JSON payload');
  }

  const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : normalized;
  return JSON.parse(candidate);
}

function dataUrlToParts(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid file payload. Expected a base64 data URL.');
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

function decodeTextDataUrl(dataUrl) {
  const { data } = dataUrlToParts(dataUrl);
  return Buffer.from(data, 'base64').toString('utf8');
}

function parseBankStatementCsv(rawText, fileName) {
  const text = normalizeText(rawText);
  if (!text) {
    return { fileName, rows: [], columns: [] };
  }

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (!lines.length) {
    return { fileName, rows: [], columns: [] };
  }

  const delimiter = [';', '\t', ','].reduce(
    (best, candidate) => (lines[0].split(candidate).length > lines[0].split(best).length ? candidate : best),
    ',',
  );

  const columns = lines[0].split(delimiter).map((column) => column.trim());
  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(delimiter).map((value) => value.trim());
    const row = { __rowNumber: index + 2 };

    columns.forEach((column, columnIndex) => {
      row[column || `column_${columnIndex + 1}`] = values[columnIndex] || '';
    });

    return row;
  });

  return { fileName, rows, columns };
}

function parseAmount(value) {
  const normalized = String(value || '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function findLikelyRowText(row) {
  return Object.entries(row)
    .filter(([key]) => key !== '__rowNumber')
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
}

function buildChunkDocument(extractedDocument) {
  const chunks = [];
  const fieldEntries = [];

  if (extractedDocument.supplierName) {
    fieldEntries.push(`Supplier: ${extractedDocument.supplierName}`);
  }
  if (extractedDocument.invoiceNumber) {
    fieldEntries.push(`Invoice number: ${extractedDocument.invoiceNumber}`);
  }
  if (extractedDocument.documentDate) {
    fieldEntries.push(`Document date: ${extractedDocument.documentDate}`);
  }
  if (extractedDocument.totalAmount) {
    fieldEntries.push(`Total amount: ${extractedDocument.totalAmount}`);
  }
  if (extractedDocument.currency) {
    fieldEntries.push(`Currency: ${extractedDocument.currency}`);
  }
  if (extractedDocument.taxAmount) {
    fieldEntries.push(`Tax amount: ${extractedDocument.taxAmount}`);
  }

  if (fieldEntries.length) {
    chunks.push({
      chunkId: `${extractedDocument.documentId}:summary`,
      documentId: extractedDocument.documentId,
      documentName: extractedDocument.documentName,
      page: 1,
      sectionLabel: 'summary',
      text: fieldEntries.join('\n'),
      evidenceType: 'summary',
      box: null,
    });
  }

  for (const item of extractedDocument.lineItems || []) {
    const text = [
      item.description ? `Description: ${item.description}` : '',
      item.quantity ? `Quantity: ${item.quantity}` : '',
      item.unitPrice ? `Unit price: ${item.unitPrice}` : '',
      item.amount ? `Amount: ${item.amount}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    if (!text) {
      continue;
    }

    chunks.push({
      chunkId: `${extractedDocument.documentId}:line:${item.lineId || chunks.length + 1}`,
      documentId: extractedDocument.documentId,
      documentName: extractedDocument.documentName,
      page: item.page || 1,
      sectionLabel: item.sectionLabel || 'line item',
      text,
      evidenceType: 'line_item',
      box: item.box || null,
    });
  }

  for (const block of extractedDocument.evidenceBlocks || []) {
    const text = normalizeText(block.text);
    if (!text) {
      continue;
    }

    chunks.push({
      chunkId: `${extractedDocument.documentId}:block:${block.blockId || chunks.length + 1}`,
      documentId: extractedDocument.documentId,
      documentName: extractedDocument.documentName,
      page: block.page || 1,
      sectionLabel: block.sectionLabel || 'document block',
      text,
      evidenceType: 'ocr_block',
      box: block.box || null,
    });
  }

  return chunks;
}

function buildIndex(chunks) {
  const docFreq = new Map();
  const preparedChunks = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach((token) => {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    });

    return {
      ...chunk,
      tokens,
      termFreq: buildTermFrequency(tokens),
    };
  });

  const totalDocs = Math.max(preparedChunks.length, 1);

  return preparedChunks.map((chunk) => {
    const idfLookup = {};
    let vectorNorm = 0;

    for (const [token, count] of chunk.termFreq.entries()) {
      const idf = Math.log(1 + totalDocs / (1 + (docFreq.get(token) || 0)));
      idfLookup[token] = idf;
      const weight = count * idf;
      vectorNorm += weight * weight;
    }

    return {
      ...chunk,
      idfLookup,
      vectorNorm: Math.sqrt(vectorNorm),
    };
  });
}

function retrieveRelevantChunks(session, question, limit = 6) {
  const queryTokens = tokenize(question);

  const scored = session.index
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk),
    }))
    .filter((chunk) => chunk.score > 0.02)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  return scored;
}

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for invoice/receipt extraction.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: DEFAULT_GEMINI_MODEL,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });
}

async function extractDocumentWithGemini(file) {
  const model = getGeminiModel();
  const { mimeType, data } = dataUrlToParts(file.dataUrl);
  const prompt = [
    'You extract facts from invoices, receipts, and financial documents.',
    'Return strict JSON only.',
    'Do not infer values that are not visible in the document.',
    'If a field is missing, use an empty string.',
    'Keep evidenceBlocks grounded to visible text snippets only.',
    'Schema:',
    JSON.stringify({
      documentType: 'invoice | receipt | other',
      supplierName: '',
      invoiceNumber: '',
      documentDate: '',
      currency: '',
      totalAmount: '',
      subtotalAmount: '',
      taxAmount: '',
      lineItems: [
        {
          lineId: 'line-1',
          description: '',
          quantity: '',
          unitPrice: '',
          amount: '',
          page: 1,
          sectionLabel: 'line items',
          box: { x: 0, y: 0, width: 0, height: 0 },
        },
      ],
      evidenceBlocks: [
        {
          blockId: 'block-1',
          page: 1,
          sectionLabel: 'header',
          text: '',
          box: { x: 0, y: 0, width: 0, height: 0 },
        },
      ],
      rawDocumentSummary: '',
    }),
  ].join('\n');

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data,
      },
    },
  ]);

  const text = result.response.text();
  const parsed = safeJsonParse(text);

  return {
    documentId: crypto.randomUUID(),
    documentName: file.name,
    mimeType,
    documentType: parsed.documentType || 'other',
    supplierName: normalizeText(parsed.supplierName),
    invoiceNumber: normalizeText(parsed.invoiceNumber),
    documentDate: normalizeText(parsed.documentDate),
    currency: normalizeText(parsed.currency),
    totalAmount: normalizeText(parsed.totalAmount),
    subtotalAmount: normalizeText(parsed.subtotalAmount),
    taxAmount: normalizeText(parsed.taxAmount),
    lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : [],
    evidenceBlocks: Array.isArray(parsed.evidenceBlocks) ? parsed.evidenceBlocks : [],
    rawDocumentSummary: normalizeText(parsed.rawDocumentSummary),
  };
}

async function answerWithGemini(question, retrievedChunks, history) {
  const model = getGeminiModel();
  const contextText = retrievedChunks
    .map(
      (chunk, index) =>
        `[${index + 1}] file=${chunk.documentName} page=${chunk.page} section=${chunk.sectionLabel} chunkId=${chunk.chunkId}\n${chunk.text}`,
    )
    .join('\n\n');

  const historyText = (history || [])
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${normalizeText(item.text).slice(0, 500)}`)
    .join('\n');

  const prompt = [
    'You are FinDoc AI, a grounded financial document QA agent.',
    'Answer only from the supplied context.',
    'If the answer is not fully supported, say exactly "Δεν βρέθηκε στο παρεχόμενο έγγραφο."',
    'Return strict JSON with keys answer, grounded, confidence, citations.',
    'Each citation must reference one of the chunkIds from the context.',
    historyText ? `Conversation history:\n${historyText}` : '',
    `Question:\n${question}`,
    `Context:\n${contextText}`,
    'JSON schema:',
    JSON.stringify({
      answer: '',
      grounded: true,
      confidence: 0,
      citations: [
        {
          chunkId: '',
          documentName: '',
          page: 1,
          snippet: '',
        },
      ],
    }),
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent(prompt);
  return safeJsonParse(result.response.text());
}

function summarizeDocuments(documents) {
  return documents.map((document) => ({
    documentId: document.documentId,
    name: document.documentName,
    type: document.documentType,
    supplierName: document.supplierName,
    invoiceNumber: document.invoiceNumber,
    documentDate: document.documentDate,
    totalAmount: document.totalAmount,
    currency: document.currency,
    lineItemCount: document.lineItems.length,
  }));
}

function buildBankReconciliationInsight(question, session) {
  if (!session.bankStatement || !/paid|πληρω|reconcil|statement|bank/i.test(question)) {
    return null;
  }

  const invoiceDocs = session.documents.filter((document) => document.totalAmount);
  const matches = [];

  for (const document of invoiceDocs) {
    const invoiceAmount = parseAmount(document.totalAmount);
    if (invoiceAmount == null) {
      continue;
    }

    const supplier = (document.supplierName || '').toLowerCase();
    const row = session.bankStatement.rows.find((candidate) => {
      const rowText = findLikelyRowText(candidate).toLowerCase();
      const rowAmount = Object.values(candidate).map(parseAmount).find((value) => value != null);
      const amountMatches = rowAmount != null && Math.abs(rowAmount - invoiceAmount) < 0.01;
      const supplierMatches = supplier ? rowText.includes(supplier) : true;
      return amountMatches && supplierMatches;
    });

    if (row) {
      matches.push({
        documentName: document.documentName,
        supplierName: document.supplierName,
        totalAmount: document.totalAmount,
        rowNumber: row.__rowNumber,
        rowText: findLikelyRowText(row),
      });
    }
  }

  return matches.length ? matches : null;
}

async function createFinDocSession({ documents = [], bankStatement = null }) {
  if (!Array.isArray(documents) || !documents.length) {
    const error = new Error('Upload at least one invoice or receipt.');
    error.statusCode = 400;
    throw error;
  }

  if (documents.length > MAX_DOCUMENTS) {
    const error = new Error(`You can upload up to ${MAX_DOCUMENTS} documents per session.`);
    error.statusCode = 400;
    throw error;
  }

  const extractedDocuments = [];
  for (const document of documents) {
    extractedDocuments.push(await extractDocumentWithGemini(document));
  }

  const chunks = extractedDocuments.flatMap(buildChunkDocument);
  const index = buildIndex(chunks);
  const sessionId = crypto.randomUUID();
  const parsedBankStatement =
    bankStatement && bankStatement.dataUrl
      ? parseBankStatementCsv(decodeTextDataUrl(bankStatement.dataUrl), bankStatement.name || 'bank-statement.csv')
      : null;

  const session = {
    sessionId,
    createdAt: new Date().toISOString(),
    documents: extractedDocuments,
    chunks,
    index,
    bankStatement: parsedBankStatement,
  };

  sessions.set(sessionId, session);

  return {
    sessionId,
    createdAt: session.createdAt,
    documents: summarizeDocuments(extractedDocuments),
    bankStatement: parsedBankStatement
      ? {
          fileName: parsedBankStatement.fileName,
          rowCount: parsedBankStatement.rows.length,
          columns: parsedBankStatement.columns,
        }
      : null,
  };
}

async function askFinDocQuestion(sessionId, { question, history = [] }) {
  const session = sessions.get(sessionId);
  if (!session) {
    const error = new Error('FinDoc session not found. Re-upload the documents and try again.');
    error.statusCode = 404;
    throw error;
  }

  const normalizedQuestion = normalizeText(question);
  if (!normalizedQuestion) {
    const error = new Error('Question is required.');
    error.statusCode = 400;
    throw error;
  }

  const retrievedChunks = retrieveRelevantChunks(session, normalizedQuestion, 8);
  const bankInsight = buildBankReconciliationInsight(normalizedQuestion, session);

  if (!retrievedChunks.length && !bankInsight) {
    return {
      answer: 'Δεν βρέθηκε στο παρεχόμενο έγγραφο.',
      grounded: false,
      confidence: 0,
      citations: [],
      bankReconciliation: null,
      documents: summarizeDocuments(session.documents),
    };
  }

  if (!retrievedChunks.length && bankInsight) {
    const firstMatch = bankInsight[0];
    return {
      answer: `Ναι, βρέθηκε αντιστοίχιση πληρωμής για το ${firstMatch.documentName} στο bank statement.`,
      grounded: true,
      confidence: 0.88,
      citations: [],
      bankReconciliation: bankInsight,
      documents: summarizeDocuments(session.documents),
    };
  }

  const answerPayload = await answerWithGemini(normalizedQuestion, retrievedChunks, history);
  const citations = Array.isArray(answerPayload.citations) ? answerPayload.citations : [];
  const chunkById = new Map(retrievedChunks.map((chunk) => [chunk.chunkId, chunk]));

  return {
    answer: normalizeText(answerPayload.answer) || 'Δεν βρέθηκε στο παρεχόμενο έγγραφο.',
    grounded: Boolean(answerPayload.grounded),
    confidence: Number(answerPayload.confidence) || 0,
    citations: citations
      .map((citation) => {
        const chunk = chunkById.get(citation.chunkId);
        if (!chunk) {
          return null;
        }

        return {
          chunkId: chunk.chunkId,
          documentName: chunk.documentName,
          page: chunk.page,
          sectionLabel: chunk.sectionLabel,
          snippet: normalizeText(citation.snippet || chunk.text).slice(0, 280),
          box: chunk.box,
        };
      })
      .filter(Boolean),
    bankReconciliation: bankInsight,
    documents: summarizeDocuments(session.documents),
  };
}

module.exports = {
  createFinDocSession,
  askFinDocQuestion,
};
