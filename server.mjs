import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { exec } from "node:child_process";

const root = join(import.meta.dirname, "dist");
const port = 4180;
const host = "127.0.0.1";
const url = `http://${host}:${port}/`;
const shouldOpen = !process.argv.includes("--no-open");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/");
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const safePath = normalize(relativePath);

    if (safePath.startsWith("..")) {
      response.writeHead(403).end("Niet toegestaan");
      return;
    }

    let filePath = join(root, safePath);
    try {
      if ((await stat(filePath)).isDirectory()) filePath = join(filePath, "index.html");
    } catch {
      filePath = join(root, "index.html");
    }

    const body = await readFile(filePath);
    const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache" });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`De game kon niet worden geladen: ${error instanceof Error ? error.message : "onbekende fout"}`);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`De game draait al op ${url}`);
    if (shouldOpen) exec(`start "" "${url}"`);
    process.exit(0);
  }
  throw error;
});

server.listen(port, host, () => {
  console.log("");
  console.log("De Boekenbalie is gestart.");
  console.log(`Open: ${url}`);
  console.log("Laat dit venster open tijdens het spelen. Druk op Ctrl+C om te stoppen.");
  if (shouldOpen) exec(`start "" "${url}"`);
});
