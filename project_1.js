import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// static
app.use(express.static(`${dirname(fileURLToPath(import.meta.url))}/public`));

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
