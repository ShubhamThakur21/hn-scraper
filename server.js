import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { startScraping } from "./scraper.js";
import { initializeWebSocket } from "./websocket.js";
import { initializeDatabase, getPaginatedStories } from "./database.js";
import jwt from "jsonwebtoken";
import NodeCache from "node-cache";
import { logger } from "./logger.js";

const app = express();
const port = process.env.PORT || 3000;

const cache = new NodeCache({ stdTTL: 300 });

app.use(express.json());

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    logger.error("Invalid token", err.message);
    return res.status(403).json({ error: "Invalid Token" });
  }
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

app.get("/stories", authenticate, async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const cacheKey = `stories-page-${page}-limit-${limit}`;

  try {
    const cachedStories = cache.get(cacheKey);
    if (cachedStories) {
      logger.info("Serving stories from cache");
      return res.json(cachedStories);
    }

    const stories = await getPaginatedStories(Number(page), Number(limit));
    cache.set(cacheKey, stories);
    logger.info("Serving stories from database");
    res.json(stories);
  } catch (error) {
    logger.error("Error fetching stories:", error.message);
    next(error);
  }
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
    });

    const wss = initializeWebSocket(server);

    startScraping(wss);
  } catch (error) {
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
