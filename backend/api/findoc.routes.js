const express = require('express');
const { createFinDocSession, askFinDocQuestion } = require('../services/findoc-agent.service');

const router = express.Router();

router.post('/sessions', async (req, res, next) => {
  try {
    const payload = await createFinDocSession({
      documents: req.body?.documents,
      bankStatement: req.body?.bankStatement || null,
    });

    res.status(201).json({
      success: true,
      ...payload,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sessions/:sessionId/ask', async (req, res, next) => {
  try {
    const payload = await askFinDocQuestion(req.params.sessionId, {
      question: req.body?.question,
      history: req.body?.history,
    });

    res.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
