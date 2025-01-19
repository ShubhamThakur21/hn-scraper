import axios from "axios";
import cron from "node-cron";
import { saveStory } from "./database.js";

const HN_API_URL = "https://hacker-news.firebaseio.com/v0/newstories.json";
const STORY_DETAILS_URL = "https://hacker-news.firebaseio.com/v0/item/";

async function fetchStories() {
  try {
    const { data: storyIds } = await axios.get(HN_API_URL);
    const topStories = storyIds.slice(0, 10);

    for (const id of topStories) {
      const { data: story } = await axios.get(`${STORY_DETAILS_URL}${id}.json`);
      if (story && story.type === "story") {
        const { id, title, url, by: author, score } = story;

        if (!id || !title || !author) {
          console.error("Skipping story due to missing fields:", {
            id,
            title,
            author,
          });
          continue;
        }

        const validUrl = url || "No URL provided";
        const validScore = score || 0;

        console.log("Saving story:", {
          id,
          title,
          validUrl,
          author,
          validScore,
        });
        await saveStory({
          id,
          title,
          url: validUrl,
          author,
          score: validScore,
        });
      }
    }

    console.log("Stories scraped and saved.");
  } catch (error) {
    console.error("Error fetching stories:", error);
  }
}

export function startScraping(wss) {
  cron.schedule("*/5 * * * *", async () => {
    await fetchStories();
    console.log("Broadcasting new stories via WebSocket...");
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({ type: "update", message: "New stories available!" })
      );
    });
  });
}
