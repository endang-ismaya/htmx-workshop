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

app.post('/form', (req, res) => {
  res.send('<h3>Form Submission success</h3>');
});

app.post('/validate', (req, res) => {
  res.send('<h3>Validation OK!</h3>');
});

app.post('/delete', (req, res) => {
  res.send('<h3>Post is deleted!</h3>');
});

app.get('/blog', (req, res) => {
  res.send('<h3>Blog Page</h3>');
});

const color_picks = [
  'blue',
  'yellow',
  'green',
  'white',
  'black',
  'aqua',
  'brown',
];

app.get('/colors', (req, res) => {
  const random = Math.floor(Math.random() * color_picks.length);

  res.send(`<div
  id="color-demo"
  class="smooth"
  style="color: ${color_picks[random]}"
  hx-get="/colors"
  hx-swap="outerHTML"
  hx-trigger="every 2s"
>
  Color Swap
</div>`);
});

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
