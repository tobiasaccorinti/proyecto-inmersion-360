const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(req.url.split("?")[0]);
  if (pathname === "/" || pathname === "") pathname = "/index.html";

  const file = path.resolve(path.join(root, pathname));
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "text/plain; charset=utf-8",
    });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Inspira MVP running at http://127.0.0.1:${port}`);
});
