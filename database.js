import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function initializeDatabase() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS stories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      story_id INT NOT NULL UNIQUE,
      title VARCHAR(255),
      url VARCHAR(255),
      author VARCHAR(255),
      score INT,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function saveStory(story) {
  const { id, title, url, author, score } = story;
  const query = `
    INSERT IGNORE INTO stories (story_id, title, url, author, score)
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.execute(query, [id, title, url, author, score]);
}

export async function getPaginatedStories(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM stories ORDER BY time DESC LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(query, [limit, offset]);
  return rows;
}

export async function getStoriesInLastFiveMinutes() {
  const query = `
    SELECT COUNT(*) AS count FROM stories
    WHERE time >= NOW() - INTERVAL 5 MINUTE
  `;
  const [rows] = await pool.query(query);
  return rows[0].count;
}
