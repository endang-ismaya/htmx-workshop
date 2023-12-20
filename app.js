import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// static
app.use(express.static(`${dirname(fileURLToPath(import.meta.url))}/public`));

// send response index.html
app.get('/', (req, res) => {
  res.sendFile(`${dirname(fileURLToPath(import.meta.url))}/index.html`);
});

let count = 0;

app.get('/polling', (req, res) => {
  count++;

  if (count > 10) {
    count = 0;
    return res.status(286);
  }
  res.send(`<h2>Count: ${count}</h2>`);
});

app.get('/indicator', (req, res) => {
  setTimeout(() => {
    res.send("<h3>I'm here after 3s</h3>");
  }, 3000);
});

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
