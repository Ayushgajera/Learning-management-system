import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY missing in .env");
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * =========================
 * Utility function
 * =========================
 */
const callGroq = async (prompt) => {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // ✅ UPDATED MODEL
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    throw new Error("Groq request failed");
  }
};


/**
 * =========================
 * TEST ROUTE
 * =========================
 */
router.get("/test", async (req, res) => {
  try {
    const text = await callGroq("Reply only with OK");
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * =========================
 * SUBTITLE GENERATOR
 * =========================
 */
router.post("/subtitle", async (req, res) => {
  const { courseTitle } = req.body;

  if (!courseTitle) {
    return res.status(400).json({
      success: false,
      error: "courseTitle is required",
    });
  }

  try {
    const prompt = `Create a catchy subtitle (max 10 words) for course: "${courseTitle}". Do NOT use quotes.`;

    const subtitle = await callGroq(prompt);

    res.json({
      success: true,
      subtitle: subtitle.trim().replace(/^"|"$/g, ''), // Remove surrounding quotes if present
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Subtitle generation failed",
    });
  }
});

/**
 * =========================
 * DESCRIPTION GENERATOR
 * =========================
 */
router.post("/description", async (req, res) => {
  const { courseTitle } = req.body;

  if (!courseTitle) {
    return res.status(400).json({
      success: false,
      error: "courseTitle is required",
    });
  }

  try {
    const prompt = `
Generate ONLY valid HTML for an online course titled "${courseTitle}"
Rules:
- Use <h2> for title
- Use <h3> for section headings
- Use <p> for paragraphs
- Use <ul><li> for bullet points
- NO markdown
- NO explanations
- NO \`\`\`html code blocks

Sections:
1. Overview
2. Target Audience
3. Key Features
4.Outcomes / Career Benefits
`;

    const description = await callGroq(prompt);

    res.json({
      success: true,
      description: description.replace(/```html|```/g, "").trim(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Description generation failed",
    });
  }
});

export default router;
