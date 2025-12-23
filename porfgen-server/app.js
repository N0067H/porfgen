import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fetchProfile, fetchTopRepos } from "./lib/github.js";
import { generateMarkdown } from "./lib/openai.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set — /api/generate will fail without it.");
}

app.get("/api/fetch", async (req, res) => {
  try {
    const username = String(req.query.username || "");
    if (!username) return res.status(400).send("username required");
    let profile = null;
    try {
      profile = await fetchProfile(username);
    } catch (err) {
      return res.status(404).send("GitHub user not found");
    }

    let repos = [];
    try {
      repos = await fetchTopRepos(username, 5);
    } catch (err) {
      console.warn("Failed to fetch repos for preview", err?.message || err);
    }

    res.json({ profile, repos });
  } catch (err) {
    console.error(err);
    res.status(500).send("fetch failed");
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const { username, prompt } = req.body;
    if (!username) return res.status(400).send("username required");

    let profile = null;
    try {
      profile = await fetchProfile(username);
    } catch (err) {
      return res.status(404).send("GitHub user not found");
    }

    let repos = [];
    try {
      repos = await fetchTopRepos(username, 5);
    } catch (err) {
      console.warn(
        "Failed to fetch repos, continuing with just profile",
        err?.message || err
      );
    }

    const instruction = `You are an AI assistant that generates a developer portfolio in Markdown based on the GitHub profile below.

Profile:
${JSON.stringify(profile, null, 2)}

Top public repositories:
${JSON.stringify(repos, null, 2)}

User prompt:
${prompt || "(no extra prompt)"}

Produce a friendly, organized portfolio README including: short bio, a highlighted "Projects" section using the provided repositories (describe each project in 2-4 sentences focusing on the key features and technologies), skills, contact, and README-style sections. Use the profile fields (name, bio, location, blog, email if present). Output only Markdown. Keep it professional, concise, and ready to paste into a GitHub README.`;

    if (!OPENAI_API_KEY)
      return res.status(500).send("OpenAI key not configured on server");

    const { markdown, raw } = await generateMarkdown(
      instruction,
      OPENAI_API_KEY,
      {
        model: "gpt-5.1",
        max_output_tokens: 1500,
        temperature: 1,
        timeout: 120000,
      }
    );

    console.log("FINAL MARKDOWN:", markdown);
    console.log("FULL RESPONSE:", JSON.stringify(raw, null, 2));
    return res.json({ markdown });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    const body = err?.response?.data || err?.message || "Generation failed";
    try {
      return res
        .status(status)
        .send(typeof body === "string" ? body : JSON.stringify(body));
    } catch (sendErr) {
      console.error("Failed to send error response", sendErr);
      return res.status(500).send("Generation failed");
    }
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`Server listening on ${port}`));
