"use client";

import { useState } from "react";

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  solution_link: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("An error occurred while fetching results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-900 text-green-200';
      case 'medium':
        return 'bg-yellow-900 text-yellow-200';
      case 'hard':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Problem Search</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <textarea
          className="p-4 border border-gray-700 rounded-md text-base w-full resize-y bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the problem you're looking for..."
          rows={5}
        />
        <button 
          type="submit" 
          className={`py-3 px-6 rounded-md text-base font-medium transition-colors ${
            loading || !query.trim() 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
          disabled={loading || !query.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!!results && results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Top Results</h2>
          <div className="flex flex-col gap-6">
            {results.map((problem) => (
              <div key={problem.id} className="p-6 border border-gray-700 rounded-lg bg-gray-900 shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">{problem.title}</h3>
                <span className={`inline-block px-2 py-1 rounded-md text-sm font-medium mb-4 ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <p className="text-gray-300">{problem.description.substring(0, 200)}...</p>
                {problem.solution_link && (
                  <a 
                    href={problem.solution_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block mt-4 text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    View Solution
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}