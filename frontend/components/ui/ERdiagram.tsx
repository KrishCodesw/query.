"use client";
import { useState } from "react";
import Diagram from "./Diagram";

function SQLtoER() {
  const [sqlInput, setSqlInput] = useState(""); // State for the textarea
  const [erData, setErData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateDiagram = async () => {
    if (!sqlInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/structure_sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // The backend expects { "sql_ddl": "string" }
        body: JSON.stringify({ sql_ddl: sqlInput }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      // result matches your SQLStructureResponse model
      setErData(result.conceptual_er_model);
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">SQL to ER Diagram</h2>

      <div className="flex flex-col gap-4 mb-8">
        <textarea
          className="w-full h-48 p-4 border rounded-md font-mono text-sm bg-slate-50 text-black"
          placeholder="Paste your CREATE TABLE statements here..."
          value={sqlInput}
          onChange={(e) => setSqlInput(e.target.value)}
        />

        <button
          onClick={handleGenerateDiagram}
          disabled={loading || !sqlInput}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Processing..." : "Generate Diagram"}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      {/* Rendering Section */}
      <div className="border rounded-xl bg-white min-h-[500px] overflow-hidden shadow-inner">
        {erData ? (
          <Diagram data={erData} />
        ) : (
          <div className="flex items-center justify-center h-[500px] text-gray-400 italic">
            {loading
              ? "AI is generating the schema structure..."
              : "Diagram will appear here"}
          </div>
        )}
      </div>
    </div>
  );
}

export default SQLtoER;
