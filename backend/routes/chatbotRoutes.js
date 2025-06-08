const express = require("express");
const Chatbot = require("../chatbot.js");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Store chatbot instances per user
const userChatbots = new Map();

// Verify API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY missing in .env!');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/documents';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get or create chatbot for user
function getUserChatbot(userId) {
  if (!userChatbots.has(userId)) {
    userChatbots.set(userId, new Chatbot(process.env.GEMINI_API_KEY));
  }
  return userChatbots.get(userId);
}

// Main chatbot endpoint
router.post('/', async (req, res) => {
  const { question, conversationHistory, context } = req.body;
  const userId = req.user?.id || 'default'; // Use default if no auth

  if (!question) {
    return res.status(400).json({ error: "Question required" });
  }

  try {
    const chatbot = getUserChatbot(userId);
    
    // Update conversation history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      chatbot.conversation_history = conversationHistory;
    }
    
    const response = await chatbot.ask(question, context);
    res.json({ 
      response,
      conversationHistory: chatbot.conversation_history 
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: "Failed to process your request" });
  }
});

// Upload document endpoint
router.post('/upload-document', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id || 'default';
    const chatbot = getUserChatbot(userId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Add document to chatbot's knowledge base
    await chatbot.add_document(req.file.path);
    
    res.json({ 
      message: 'Document uploaded and processed successfully',
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Clear conversation endpoint
router.post('/clear', (req, res) => {
  try {
    const userId = req.user?.id || 'default';
    const chatbot = getUserChatbot(userId);
    chatbot.clear_conversation();
    res.json({ message: 'Conversation cleared' });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// Get conversation history
router.get('/history', (req, res) => {
  try {
    const userId = req.user?.id || 'default';
    const chatbot = getUserChatbot(userId);
    res.json({ history: chatbot.conversation_history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
});

module.exports = router;