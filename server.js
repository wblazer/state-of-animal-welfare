import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT || 8080);
const base = "/state-of-animal-welfare";
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function fileFor(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded === base || decoded === `${base}/`) {
    decoded = "/";
  } else if (decoded.startsWith(`${base}/`)) {
    decoded = decoded.slice(base.length);
  }

  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = resolve(root, relative);
  return candidate === root || candidate.startsWith(root + sep) ? candidate : null;
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const path = fileFor(url.pathname);
  if (!path || (request.method !== "GET" && request.method !== "HEAD")) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
    return;
  }

  let body;
  try {
    body = await readFile(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found\n");
      return;
    }
    throw error;
  }

  response.writeHead(200, {
    "Cache-Control": url.pathname.includes("/assets/")
      ? "public, max-age=86400"
      : "public, max-age=300",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Type": contentTypes[extname(path)] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  response.end(request.method === "HEAD" ? undefined : body);
}).listen(port);

console.log(`Animal Welfare Reading List listening on port ${port}`);
