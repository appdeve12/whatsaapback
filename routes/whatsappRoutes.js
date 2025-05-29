const express = require('express');
const router = express.Router();

const whatsappController = require('../controllers/whatsappController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send', authMiddleware, whatsappController.sendMessage);


module.exports = router;
