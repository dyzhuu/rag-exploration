import fs from "fs";
import papa from "papaparse";
import { Pool } from "pg";
import "dotenv/config";
import { generateEmbedding } from "../embedding";

type Problem = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    solution_link: string;
    title_embedding: string;
    desc_embedding: string;
}

const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function readCSV(filePath: string) {
    const csvFile = fs.readFileSync(filePath, "utf8");
    return new Promise<any[]>((resolve, reject) => {
      papa.parse(csvFile, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }
  
  async function insertProblem(problem: Problem) {
    // format arrays as PostgreSQL vector strings
    const query = {
      text: "INSERT INTO problems (id, title, description, difficulty, solution_link, title_embedding, desc_embedding) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      values: [problem.id, problem.title, problem.description, problem.difficulty, problem.solution_link, problem.title_embedding, problem.desc_embedding],
    };
  
    try {
      await db.query(query);
      console.log(`Problem with ID ${problem.id} inserted successfully`);
    } catch (error) {
      console.error(`Error inserting problem with ID ${problem.id}:`, error);
    }
  }
  
async function generateEmbeddingsForProblems(filePath: string) {
    try {
        const problems = await readCSV(filePath);
        
        const batchSize = 50; 
        
        for (let i = 0; i < problems.length; i += batchSize) {
            const batch = problems.slice(i, i + batchSize);
            
            // concurrent processing
            await Promise.all(
                batch.map(async (problem) => {
                    if (!problem.description) return;
                    
                    try {
                        const title_embedding = await generateEmbedding(problem.title);
                        const desc_embedding = await generateEmbedding(problem.description);
                        await insertProblem({
                            id: problem.id,
                            title: problem.title,
                            description: problem.description,
                            difficulty: problem.difficulty,
                            solution_link: problem.url,
                            title_embedding,
                            desc_embedding
                        });
                    } catch (err) {
                        console.error(`Error processing problem ${problem.id}:`, err);
                    }
                })
            );
            
            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)}`);
        }

        console.log("Embeddings generation complete");
    } catch (error) {
        console.error("Error generating embeddings:", error);
    }
}
  async function main() {
      try {
          await generateEmbeddingsForProblems("./leetcode.csv");
      } catch (error) {
          console.error("Error in main function:", error);
      } finally {
          await db.end();
      }
  }
  
  main();