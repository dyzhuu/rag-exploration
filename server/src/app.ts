import express from "express";
import { Pool } from "pg";
import "dotenv/config"
import { generateEmbedding } from "./embedding";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())

const db = new Pool({ connectionString: process.env.DATABASE_URL });

app.post("/search", async (req, res) => {
  const { query } = req.body;
  const queryEmbedding = await generateEmbedding(query);
  // search by title embedding
  const title_result = await db.query(
    "SELECT id, title, description, difficulty, solution_link, title_embedding <=> $1 AS similarity FROM problems ORDER BY similarity LIMIT 5",
    [queryEmbedding]
  );
  
  const similarityThreshold = 0.3; 
  if (title_result.rows[0].similarity > similarityThreshold) {
    // search didn't produce good results, search by description instead
    const desc_result = await db.query(
      "SELECT id, title, description, difficulty, solution_link, desc_embedding <=> $1 AS similarity FROM problems ORDER BY similarity LIMIT 5",
      [queryEmbedding]
    );

    if (desc_result.rows[0].similarity < title_result.rows[0].similarity) {
      res.json(desc_result.rows);
      return;
    }
  }
  res.json(title_result.rows);
});

app.listen(3001, () => console.log("Server running on port 3001"));
