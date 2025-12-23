import React, { useState } from "react";
import PromptModal from "./PromptModal";
import ResultModal from "./ResultModal";

function Main() {
  const [username, setUsername] = useState("");
  const [openPrompt, setOpenPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [error, setError] = useState("");
  const [repos, setRepos] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const generate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!username) {
      setError("Please enter a GitHub username");
      return;
    }
    setLoading(true);
    setMarkdown("");
    try {
      const res = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, prompt }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      const md = data.markdown || "";
      setMarkdown(md);
      if (md) setShowResultModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const preview = async () => {
    setPreviewError("");
    setRepos([]);
    if (!username) {
      setPreviewError("Enter a GitHub username to preview");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `/api/fetch?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err: any) {
      console.error(err);
      setPreviewError(err.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto panel">
      <div className="flex justify-center items-start">
        <h2 className="text-2xl font-bold text-center w-full">Porfgen</h2>
      </div>

      <form className="mt-4 flex gap-3 items-center" onSubmit={generate}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username"
          className="flex-1 p-2 text-black panel-2 rounded"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenPrompt(true)}
            className="px-3 py-1 border rounded"
          >
            Prompt
          </button>
          <button
            type="button"
            onClick={preview}
            className="px-3 py-1 border rounded"
          >
            {previewLoading ? "..." : "Preview"}
          </button>
          <button
            className="bg-black px-4 py-2 text-white rounded"
            type="submit"
          >
            {loading ? "Waiting..." : "Generate"}
          </button>
        </div>
      </form>

      <p className={`mt-3 ${error ? "text-danger" : "text-accent"}`}>
        {error || (loading ? "Waiting a minute..." : "")}
      </p>

      <ResultModal
        open={showResultModal}
        markdown={markdown}
        onClose={() => setShowResultModal(false)}
      />

      {previewError && <p className="text-danger mt-3">{previewError}</p>}
      {repos && repos.length > 0 && (
        <div className="panel p-3 mt-4">
          <h3 className="font-semibold mb-2">Top repositories</h3>
          <ul className="space-y-2">
            {repos.map((r) => (
              <li key={r.url} className="panel-2 p-2">
                <div className="flex justify-between items-center">
                  <strong>{r.name}</strong>
                  <span className="text-sm">⭐ {r.stars || 0}</span>
                </div>
                <div className="text-sm">{r.description}</div>
                <div className="text-xs mt-1">
                  {r.language} —{" "}
                  <a
                    className="underline"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PromptModal
        open={openPrompt}
        initial={prompt}
        onClose={() => setOpenPrompt(false)}
        onSubmit={(p) => setPrompt(p)}
      />
    </div>
  );
}

export default Main;
