const express = require('express');

const router = express.Router();

// Redirect the client to the valid path.
router.get('/', (req, res, next) => {
  res.redirect('/v1');
});

module.exports = router;
