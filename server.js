import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ dest: "static/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.lemonfox.ai/v1",
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, "frontend/public")));

// Serve frontend index.html on root "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const { language } = req.body;
  const audioPath = req.file.path;

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    const transcriptText = transcription.text;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You will be provided with a sentence, and your task is to translate it into ${language}`,
        },
        { role: "user", content: transcriptText },
      ],
      temperature: 0,
      max_tokens: 10000,
    });

    fs.unlinkSync(audioPath); // cleanup

    res.json({
      transcript: transcriptText,
      translation: completion.choices[0].message.content,
    });

    console.log("➡️ Upload hit");
    console.log("Language:", language);
    console.log("File path:", audioPath);
    console.log("Transcript:", transcriptText);
    console.log("Translation:", completion.choices[0].message.content);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
