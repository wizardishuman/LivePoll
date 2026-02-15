const express = require('express');
const { vote } = require('../controllers/voteController');

const router = express.Router();

router.post('/:pollId', vote);

module.exports = router;
