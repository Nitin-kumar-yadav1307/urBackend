import { useState } from "react";

export default function TryItPanel({ endpoint, method = "POST" }) {
  const [apiKey, setApiKey] = useState("");
  const [jsonBody, setJsonBody] = useState(`{}`);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");

  async function sendRequest() {
    try {
      const res = await fetch(`https://api.urbackend.bitbros.in${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: method !== "GET" ? jsonBody : null,
      });

      const data = await res.text();
      setStatus(res.status);
      setResponse(data);
    } catch (err) {
      setResponse(err.message);
    }
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-lg mt-4 border border-zinc-700">
      <div className="mb-2">
        <label className="text-sm text-zinc-400">x-api-key</label>
        <input
          className="w-full p-2 mt-1 bg-black border border-zinc-700 rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk_live_xxxxx"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm text-zinc-400">Request Body</label>
        <textarea
          className="w-full p-2 mt-1 bg-black border border-zinc-700 rounded font-mono"
          rows={6}
          value={jsonBody}
          onChange={(e) => setJsonBody(e.target.value)}
        />
      </div>

      <button
        onClick={sendRequest}
        className="bg-green-500 text-black px-4 py-2 rounded"
      >
        Send Request
      </button>

      <div className="mt-4">
        <p className="text-sm text-zinc-400">Status: {status}</p>
        <pre className="bg-black p-2 mt-1 rounded text-green-400 text-sm overflow-x-auto">
          {response}
        </pre>
      </div>
    </div>
  );
}
