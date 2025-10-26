import express from 'express';
import OpenAI from 'openai';
import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompts for different personas
const systemPrompts = {
  dwiju: `You are Dwiju, an advanced AI assistant and robo companion. You are helpful, knowledgeable, and friendly. You can assist with a wide range of tasks including education, health advice, legal guidance, farming, business, entertainment, and more. Always provide accurate information and be supportive. You have access to 1950+ features across 14 categories. Respond in the user's preferred language when specified.`,
  teacher: `You are Dwiju Teacher, an expert educator. You specialize in explaining complex concepts in simple terms, creating engaging lessons, and helping students of all ages learn effectively. You can teach any subject and adapt your teaching style to the student's needs.`,
  doctor: `You are Dwiju Doctor, a medical AI assistant. You can provide general health information and guidance, but always remind users to consult with healthcare professionals for medical advice. You're knowledgeable about symptoms, treatments, and health maintenance.`,
  judge: `You are Dwiju Supreme Judge, a legal AI assistant with expertise in law and justice. You can explain legal concepts, provide guidance on legal matters, and help understand legal documents. Always remind users to consult with legal professionals for specific legal advice.`,
  farmer: `You are Dwiju Farmer, an agricultural expert. You specialize in crop management, livestock care, sustainable farming practices, weather analysis, and agricultural technology. You help farmers optimize their yields and practices.`,
  business: `You are Dwiju Business, a business and entrepreneurship expert. You can help with business planning, market analysis, financial advice, marketing strategies, and business operations. You're knowledgeable about various industries and business models.`
};

// POST /api/chat - Send a chat message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, persona = 'dwiju', language = 'en', inputType = 'text' } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find or create chat session
    let chatSession = await ChatSession.findOne({ sessionId, userId });
    
    if (!chatSession) {
      chatSession = new ChatSession({
        userId,
        sessionId,
        settings: {
          language,
          persona,
          model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
        }
      });
    }

    // Add user message to session
    const userMessage = {
      role: 'user',
      content: message.trim(),
      metadata: {
        language,
        inputType,
        model: chatSession.settings.model
      }
    };

    await chatSession.addMessage(userMessage);

    // Prepare messages for OpenAI API
    const systemPrompt = systemPrompts[persona] || systemPrompts.dwiju;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatSession.getRecentMessages(10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: chatSession.settings.model,
      messages: messages,
      max_tokens: chatSession.settings.maxTokens,
      temperature: chatSession.settings.temperature,
      stream: false
    });

    const responseTime = Date.now() - startTime;
    const assistantMessage = completion.choices[0].message.content;

    // Add assistant message to session
    const assistantMessageObj = {
      role: 'assistant',
      content: assistantMessage,
      metadata: {
        tokens: completion.usage?.total_tokens || 0,
        model: chatSession.settings.model,
        responseTime,
        language
      }
    };

    await chatSession.addMessage(assistantMessageObj);

    // Update user API usage
    const user = await User.findById(userId);
    if (user) {
      await user.incrementApiUsage('chatRequests');
    }

    res.json({
      success: true,
      message: assistantMessage,
      sessionId: chatSession.sessionId,
      messageId: chatSession.messages[chatSession.messages.length - 1].id,
      metadata: {
        responseTime,
        tokens: completion.usage?.total_tokens || 0,
        model: chatSession.settings.model
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'AI service authentication failed',
        code: 'AI_AUTH_ERROR'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'AI service rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT'
      });
    }

    res.status(500).json({ 
      error: 'Failed to process chat message',
      code: 'CHAT_ERROR'
    });
  }
});

// GET /api/chat/sessions - Get user's chat sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, active = true } = req.query;

    const query = { userId };
    if (active === 'true') {
      query.isActive = true;
    }

    const sessions = await ChatSession.find(query)
      .select('sessionId title totalMessages totalTokens lastActivity createdAt')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatSession.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});

// GET /api/chat/sessions/:sessionId - Get specific chat session
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOne({ sessionId, userId });
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat session' });
  }
});

// DELETE /api/chat/sessions/:sessionId - Delete chat session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOneAndUpdate(
      { sessionId, userId },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// POST /api/chat/sessions/:sessionId/clear - Clear chat session messages
router.post('/sessions/:sessionId/clear', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOneAndUpdate(
      { sessionId, userId },
      { 
        messages: [],
        totalMessages: 0,
        totalTokens: 0,
        lastActivity: new Date()
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      success: true,
      message: 'Chat session cleared successfully'
    });

  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: 'Failed to clear chat session' });
  }
});

export default router;
