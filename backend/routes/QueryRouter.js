require('dotenv').config();
const { Router } = require("express");
const  z  = require("zod");
const {Ollama} = require('ollama')
const { User, Question } = require("../db/schema"); // Adjust the path as needed
const authMiddleware = require("../middlewares/authMiddleware");
const { default: mongoose } = require('mongoose');
const axios = require("axios");

const router = Router();

const ollama = new Ollama({
  model: 'newllama'
})

// Sample answer for demonstration
const ans = "This is the sample answer for all the questions for now";

// Zod schemas for input validation
const llmQuerySchema = z.object({
  query: z.string().nonempty(),
  current_session_id: z.string().nonempty(),
});

const createNewSessionSchema = z.object({});

const getSessionDetailsSchema = z.object({
  session_to_change_id: z.string().nonempty(),
});
const getAllSessionsSchema = z.object({});

const updateSessionQuestions = (user, sessionId, question) => {

  let sessionUpdated = false;
  for (let session of user.sessionQuestions) {
    // console.log(session.question);
    if (session.sessionId === sessionId && session.question === "") {
      // console.log()
      session.question = question;
      sessionUpdated = true;
      break;
    }
  }
};

// Endpoint to handle LLM queries and store the result in the database
router.post('/llmquery', authMiddleware, async (req, res) => {
  const validation = llmQuerySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }
  const { query, current_session_id } = validation.data;

  try {
    const userId = req.id;

    const response = await ollama.chat(
      {
        model: 'newllama',
        messages: [{role:'user', content:query}],
        stream: false  
      }
    );
    console.log(response);
    const answer = response.message.content;
    console.log(answer);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new Question
    const newQuestion = new Question({
      question: query,
      answer: answer,
      userId: userId,
      sessionId: current_session_id,
    });

    // Save the new question
    await newQuestion.save();

    // Update user's sessionData
    if (!user.sessionData.has(current_session_id)) {
      user.sessionData.set(current_session_id, []);
    }
    user.sessionData.get(current_session_id).push(newQuestion);

    // Update the sessionQuestions array
    updateSessionQuestions(user, current_session_id, query);
    
    // Save the user with the updated sessionQuestions
    await user.save();

    // Return the updated session data
    res.status(200).json(Array.from(user.sessionData.get(current_session_id)));
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Endpoint to create a new session
router.post('/createNewSession', authMiddleware, async (req, res) => {
  const validation = createNewSessionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const userId = req.id;

    // Create a new session ID
    const newSessionId = new mongoose.Types.ObjectId().toString();

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's sessionQuestions
    user.sessionQuestions.push({ sessionId: newSessionId, question: '' });
    await user.save();

    // Return the new session ID
    res.status(200).json({ newSessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Endpoint to get session details
router.post("/getSessionDetails", authMiddleware, async (req, res) => {
  const validation = getSessionDetailsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }
  const { session_to_change_id } = validation.data;

  try {
    const userId = req.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the current session data
    const sessionData = user.sessionData.get(session_to_change_id);

    res.status(200).json(sessionData ? Array.from(sessionData) : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to get all sessions
router.post("/getAllSessions", authMiddleware, async (req, res) => {
  const validation = getAllSessionsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  try {
    const userId = req.id;

    // Find the user
    const user = await User.findById(userId);
    // console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the response to include session IDs and questions
    const sessionDetails = Array.from(user.sessionData).map(([sessionId, questions]) => ({
      sessionId,
      questions
    }));

    res.status(200).json(sessionDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;