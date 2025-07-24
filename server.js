// server.js
import path from "path";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist/
app.use(express.static(path.join(__dirname, "dist")));

// For client‑side routing (if you have React Router or similar)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
