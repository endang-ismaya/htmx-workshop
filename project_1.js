import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { engine } from 'express-handlebars';
import handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuid } from 'uuid';

const app = express();
const PORT = 3000;
const BASE_DIR = `${dirname(fileURLToPath(import.meta.url))}`;
const file_db = join(BASE_DIR, 'db.json');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', [`${BASE_DIR}/views`]);

app.use(express.urlencoded({ extended: false }));

// static
app.use(express.static(`${BASE_DIR}/public`));

// set low db
const adapter = new JSONFile(file_db);
const defaultData = {
  todos: [],
};
const db = new Low(adapter, defaultData);

const todoInput = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/todo-input.handlebars`, 'utf-8')
);

app.get('/', (req, res) => {
  res.render('project_1', { partials: { todoInput } });
});

app.post('/todos', async (req, res) => {
  setTimeout(async () => {
    const { todo } = req.body;
    const input_todo = {
      id: uuid(),
      completed: false,
      name: todo,
    };
    db.data.todos.push(input_todo);
    await db.write();

    const { todos } = db.data;
    console.log(todos);

    res.render('project_1', { layout: false, partials: { todoInput } });
  }, 10000);
});

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
