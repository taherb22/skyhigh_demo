import React, { useState, useEffect } from "react";

// Prefer a relative path so the Vite dev server can proxy requests.
// Fallback to VITE_API_URL when explicitly set. However, if the page is
// served from a remote host (for example a forwarded Codespaces URL) and
// VITE_API_URL points to localhost, the browser won't be able to reach the
// container-local localhost. In that case prefer the relative path so the
// dev server proxy handles the request.
function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL || "";
  if (!env) return "";
  if (typeof window === "undefined") return env;
  try {
    const u = new URL(env);
    const envHost = u.hostname;
    // If env host is localhost/127.0.0.1, only use it when the page is also
    // served from localhost (i.e. when the browser can reach container-local
    // services via localhost). Otherwise ignore and allow the dev-server proxy
    // (relative paths) to handle the request.
    if (envHost === "localhost" || envHost === "127.0.0.1") {
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return env.replace(/\/$/, "");
      }
      console.warn(`Ignoring VITE_API_URL=${env} because page origin=${location.origin} is remote; using relative API paths instead.`);
      return "";
    }
    // For non-localhost hosts, use the env only if it matches the page host.
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

export default function FileUpload() {
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    setStatus("");

    const fileInput = e.target.file;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("No file selected");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      // quick connectivity check so we fail fast with a clearer error if the
      // backend is unreachable from the browser environment
      try {
        const ping = await fetch(`${API_BASE}/`, { method: "GET" });
        if (!ping.ok) {
          const pingText = await ping.text().catch(() => "");
          throw new Error(`API ping failed: ${ping.status} ${ping.statusText} ${pingText}`);
        }
      } catch (pingErr) {
        throw new Error(`Unable to reach API at ${API_BASE}: ${pingErr.message}`);
      }
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Upload failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setStatus(`Uploaded: ${data.filename}`);
    } catch (err) {
      console.error("upload error:", err);
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    // Helpful runtime diagnostics for environments where localhost resolution
    // is ambiguous (Codespaces / forwarded URLs). This prints the values the
    // client is using so you can verify whether it's attempting to contact
    // localhost or a proxied relative path.
    try {
      console.debug("FileUpload: location.origin=", location.origin);
      console.debug("FileUpload: location.hostname=", location.hostname);
    } catch (e) {
      console.debug("FileUpload: location not available in this environment");
    }
    console.debug("FileUpload: VITE_API_URL=", import.meta.env.VITE_API_URL);
    console.debug("FileUpload: resolved API_BASE=", API_BASE || "(relative)");
  }, []);

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <h2 className="text-xl font-semibold">Upload a File</h2>
      <input
        type="file"
        name="file"
        className="block w-full"
        required
        disabled={uploading}
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {status && <p className="text-sm text-green-600">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">API base: {API_BASE || '(relative / proxied by Vite)'}</p>
    </form>
  );
}
