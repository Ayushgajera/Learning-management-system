import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ✅ Correct Model URL (v1beta + working model)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${process.env.GEMINI_API_KEY}`;

// ✅ Utility function to make request
const callGeminiAPI = async (prompt) => {
  const response = await axios.post(
    GEMINI_URL,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
};

// ✨ Subtitle Generator
router.post("/subtitle", async (req, res) => {
  const { courseTitle } = req.body;
  if (!courseTitle) return res.status(400).json({ error: "Course title is required" });

  try {
    const prompt =`Act as a professional course copywriter. Create a catchy, attention-grabbing, and emotionally engaging subtitle (maximum 10 words) for an online course titled "${courseTitle}". Make sure it clearly reflects the course’s benefit or outcome in a creative and modern tone.`;
;
    const subtitle = await callGeminiAPI(prompt);
    if (!subtitle) throw new Error("No subtitle received");
    res.json({ subtitle });
  } catch (error) {
    console.error("Gemini Subtitle Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Subtitle generation failed" });
  }
});

// ✨ Description Generator
router.post("/description", async (req, res) => {
  const { courseTitle, courseContent } = req.body;
  if (!courseTitle)
    return res.status(400).json({ error: "Course title and content are required" });

  try {
    
const prompt = `
Generate a professional HTML-formatted course description for the course titled: "${courseTitle}".

🧾 Structure:
1. Use <h2> for "Course Title"
2. <p> for paragraph text
3. <h3> for section headings like "What You'll Learn", "Target Audience", "Key Features"
4. <ul> and <li> for bullet lists

⚠️ Guidelines:
- Do NOT include any markdown (like **bold** or triple backticks)
- Return ONLY valid HTML that can be directly rendered in a rich-text editor
- Keep it clear, concise, and structured

📌 Format Example:
<h2>Course Title</h2>
<p>Overview paragraph...</p>
<h3>What You'll Learn</h3>
<ul>
  <li>First point</li>
  <li>Second point</li>
</ul>
<h3>Target Audience</h3>
<ul>
  <li>Beginners in XYZ</li>
</ul>
<h3>Key Features</h3>
<ul>
  <li>Hands-on projects</li>
  <li>Certification</li>
</ul>
`;




    const description = await callGeminiAPI(prompt);
    if (!description) throw new Error("No description received");
    res.json({ description });
  } catch (error) {
    console.error("Gemini Description Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Description generation failed" });
  }
});

//pachi use karva mate v2 mate
// router.post("/description", async (req, res) => {
//   const { courseTitle, courseContent } = req.body;
//   if (!courseTitle || !courseContent)
//     return res.status(400).json({ error: "Course title and content are required" });

//   try {
//     const prompt = `Write a detailed course description for a course titled "${courseTitle}" with the following content: "${courseContent}"`;
//     const description = await callGeminiAPI(prompt);
//     if (!description) throw new Error("No description received");
//     res.json({ description });
//   } catch (error) {
//     console.error("Gemini Description Error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Description generation failed" });
//   }
// });

export default router;
