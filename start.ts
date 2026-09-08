import { join } from "path";

const port = Number(process.env.PORT) || 3000;
const clientDir = join(import.meta.dir, "build", "client");

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = join(clientDir, url.pathname);
    const file = Bun.file(filePath);

    if (await file.exists() && !(await file.stat())?.isDirectory()) {
      return new Response(file);
    }

    // SPA fallback to index.html for client-side routing
    const indexFile = Bun.file(join(clientDir, "index.html"));
    return new Response(indexFile, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`Amora Frontend production server running at http://localhost:${port}`);
