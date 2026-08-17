import { resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "dist");
const port = Number(process.env.PORT || 8080);

function fileFor(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = resolve(root, relative);
  return candidate === root || candidate.startsWith(root + sep) ? candidate : null;
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const path = fileFor(url.pathname);
    if (!path || (request.method !== "GET" && request.method !== "HEAD")) {
      return new Response("Not found\n", { status: 404 });
    }

    const file = Bun.file(path);
    if (!(await file.exists())) {
      return new Response("Not found\n", { status: 404 });
    }

    const headers = new Headers({
      "Cache-Control": url.pathname.startsWith("/assets/")
        ? "public, max-age=86400"
        : "public, max-age=300",
      "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    if (file.type) headers.set("Content-Type", file.type);
    return new Response(request.method === "HEAD" ? null : file, { headers });
  },
});

console.log(`The State of Animal Welfare listening on port ${port}`);
