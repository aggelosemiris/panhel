const express = require('express');
const { explainPdf } = require('../services/pdf-explain.service');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { pdfPath, question, title, subjectHint } = req.body || {};

    if (!pdfPath) {
      const error = new Error('Missing pdfPath');
      error.statusCode = 400;
      throw error;
    }

    const result = await explainPdf({
      pdfPath,
      question,
      title,
      subjectHint,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
