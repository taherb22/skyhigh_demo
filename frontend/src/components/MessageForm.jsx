import React, { useState } from "react";

// Prefer a relative path so the Vite dev server can proxy requests.
// Fallback to VITE_API_URL when explicitly set. If the page is running on a
// remote host and VITE_API_URL points to localhost, the browser can't reach
// the container-local localhost — prefer relative paths in that case.
function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL || "";
  if (!env) return "";
  if (typeof window === "undefined") return env;
  try {
    const u = new URL(env);
    const envHost = u.hostname;
    if (envHost === "localhost" || envHost === "127.0.0.1") {
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return env.replace(/\/$/, "");
      }
      console.warn(`Ignoring VITE_API_URL=${env} because page origin=${location.origin} is remote; using relative API paths instead.`);
      return "";
    }
    if (location.hostname === envHost) {
      return env.replace(/\/$/, "");
    }
    console.warn(`VITE_API_URL=${env} does not match page origin=${location.origin}; using relative API paths instead.`);
    return "";
  } catch (e) {
    return env;
  }
}

const API_BASE = resolveApiBase();

export default function MessageForm() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("message", msg);

    const res = await fetch(`${API_BASE}/message`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setStatus(data.status);
    setMsg("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-xl font-semibold">Send a Message</h2>
      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type your message"
        className="border p-2 w-full rounded"
        required
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
        Send
      </button>
      <p className="text-sm text-gray-600">{status}</p>
    </form>
  );
}
