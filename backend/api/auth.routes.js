const express = require('express');
const {
  startRegistration,
  completeRegistration,
  login,
  requestPasswordReset,
  resetPassword,
} = require('../services/auth.service');

const router = express.Router();

router.post('/register/start', async (req, res, next) => {
  try {
    const result = await startRegistration(req.body?.contact);
    res.json({
      success: true,
      ...result,
      message: 'Στάλθηκε κωδικός επιβεβαίωσης.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register/complete', async (req, res, next) => {
  try {
    const user = await completeRegistration({
      contact: req.body?.contact,
      code: req.body?.code,
      password: req.body?.password,
      fullName: req.body?.fullName,
      username: req.body?.username,
    });

    res.status(201).json({
      success: true,
      user,
      message: 'Ο λογαριασμός δημιουργήθηκε επιτυχώς.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await login({
      contact: req.body?.contact,
      password: req.body?.password,
    });

    res.json({
      success: true,
      user,
      message: 'Η σύνδεση ολοκληρώθηκε.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/password/forgot', async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body?.contact);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/password/reset', async (req, res, next) => {
  try {
    const user = await resetPassword({
      contact: req.body?.contact,
      code: req.body?.code,
      newPassword: req.body?.newPassword,
    });

    res.json({
      success: true,
      user,
      message: 'Ο κωδικός άλλαξε επιτυχώς.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Έγινε αποσύνδεση.',
  });
});

module.exports = router;
