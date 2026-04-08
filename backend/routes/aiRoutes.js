const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const FoodItem = require('../models/FoodItem');

// 1. Initialize Groq with a safety check
// We use process.env.GROQ_API_KEY which is loaded in your server.js
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 2. FETCH MENU DATA (The "Brain's" Context)
        // This pulls all your food items from MongoDB
        const menuItems = await FoodItem.find({});
        
        // Convert the database items into a simple list for the AI to read
        const menuContext = menuItems.map(item => 
            `- ${item.name}: ₹${item.price} (Rating: ${item.ratings?.average?.toFixed(1) || 'No ratings'})`
        ).join('\n');

        // 3. TALK TO GROQ (Fast & Reliable)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the "Campus Connect AI", a helpful assistant for the RGUKT RK Valley canteen.
                    
                    RULES:
                    - Use the menu below to answer questions.
                    - If asked for recommendations, suggest the highest-rated items.
                    - If asked for budget options, suggest the cheapest items.
                    - Keep answers short, friendly, and professional.
                    
                    CURRENT MENU:
                    ${menuContext}`
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama-3.3-70b-versatile",// This is the fastest, most stable model
            temperature: 0.7, // Makes the AI sound natural
        });

        // 4. SEND RESPONSE BACK TO FRONTEND
        const aiReply = chatCompletion.choices[0]?.message?.content || "I'm thinking... can you ask that again?";
        
        res.json({ reply: aiReply });

    } catch (err) {
        console.error("❌ AI ROUTE ERROR:", err.message);
        
        // Handle specific API key missing error gracefully
        if (err.message.includes("apiKey")) {
            return res.status(500).json({ reply: "System Error: AI Key is missing in the backend .env file." });
        }
        
        res.status(500).json({ reply: "I'm currently taking a short break. Please try again in a moment! 🤖" });
    }
});

module.exports = router;