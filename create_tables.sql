CREATE EXTENSION vector;

CREATE TABLE problems (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20),
    solution_link VARCHAR(255),
    title_embedding VECTOR(1536),
    desc_embedding VECTOR(1536) -- Matches OpenAI embedding size
);