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
await db.read();

const todoInput = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/todo-input.handlebars`, 'utf-8')
);
const todoItem = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/todo-item.handlebars`, 'utf-8')
);

app.get('/', (req, res) => {
  const { todos } = db.data;

  res.render('project_1', { partials: { todoInput, todoItem }, todos });
});

app.post('/todos', async (req, res) => {
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

  setTimeout(() => {
    res.render('project_1', {
      layout: false,
      partials: { todoInput, todoItem },
      todos,
    });
  }, 3000);
});

app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const todo = db.data.todos.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).send('ToDo not found!');
  }

  todo.completed = !!completed;
  await db.write();

  setTimeout(() => {
    res.render('project_1', {
      layout: false,
      partials: { todoInput, todoItem },
      todos: db.data.todos,
    });
  }, 3000);
});

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
