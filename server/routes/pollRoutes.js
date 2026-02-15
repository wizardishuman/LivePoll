const express = require('express');
const { createPoll, getPoll } = require('../controllers/pollController');

const router = express.Router();

router.post('/', createPoll);
router.get('/:pollId', getPoll);

module.exports = router;
