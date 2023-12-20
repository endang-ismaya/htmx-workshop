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

handlebars.registerHelper('ifEqual', function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

const todoInput = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/todo-input.handlebars`, 'utf-8')
);
const todoItem = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/todo-item.handlebars`, 'utf-8')
);

const filterBtns = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/filter-btns.handlebars`, 'utf-8')
);

const noTodo = handlebars.compile(
  readFileSync(`${BASE_DIR}/views/partials/no-todo.handlebars`, 'utf-8')
);

const FILTER_MAP = {
  All: () => true,
  Active: (todo) => !todo.completed,
  Completed: (todo) => todo.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

app.get('/', (req, res) => {
  const { todos } = db.data;
  const selectedFilter = req.query.filter ?? 'All';
  const filteredTodos = todos.filter(FILTER_MAP[selectedFilter]);

  res.render('project_1', {
    partials: { todoInput, todoItem, filterBtns, noTodo },
    todos: filteredTodos,
    filters: FILTER_NAMES.map((filterName) => ({
      filterName,
      count: todos.filter(FILTER_MAP[filterName]).length,
    })),
    selectedFilter,
    noTodos: filteredTodos.length,
  });
});

app.post('/todos', async (req, res) => {
  const { todo, filter: selectedFilter = 'All' } = req.body;

  const newTodo = { id: uuid(), completed: false, name: todo };
  db.data.todos.push(newTodo);
  await db.write();
  const { todos } = db.data;
  const filteredTodos = todos.filter(FILTER_MAP[selectedFilter]);

  setTimeout(() => {
    res.render('project_1', {
      layout: false,
      partials: { todoInput, todoItem, filterBtns, noTodo },
      todos: filteredTodos,
      filters: FILTER_NAMES.map((filterName) => ({
        filterName,
        count: todos.filter(FILTER_MAP[filterName]).length,
      })),
      selectedFilter,
      noTodos: filteredTodos.length,
    });
  }, 1000);
});

app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const selectedFilter = req.query.filter ?? 'All';

  const todo = db.data.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).send('Todo not found');
  }

  todo.completed = !!completed;

  await db.write();

  const filteredTodos = db.data.todos.filter(FILTER_MAP[selectedFilter]);

  res.render('project_1', {
    layout: false,
    partials: { todoInput, todoItem, filterBtns, noTodo },
    todos: filteredTodos,
    filters: FILTER_NAMES.map((filterName) => ({
      filterName,
      count: db.data.todos.filter(FILTER_MAP[filterName]).length,
    })),
    selectedFilter,
    noTodos: filteredTodos.length,
  });
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const selectedFilter = req.query.filter ?? 'All';
  const idx = db.data.todos.findIndex((todo) => todo.id === id);
  if (idx !== -1) {
    db.data.todos.splice(idx, 1);
    await db.write();
  }

  return res.render('partials/filter-btns', {
    layout: false,
    partials: { noTodo },
    filters: FILTER_NAMES.map((filterName) => ({
      filterName,
      count: db.data.todos.filter(FILTER_MAP[filterName]).length,
    })),
    selectedFilter,
    noTodos: db.data.todos.filter(FILTER_MAP[selectedFilter]).length,
  });
});

app.get('/todos/:id/edit', (req, res) => {
  const { id } = req.params;
  const selectedFilter = req.query.filter ?? 'All';

  const todo = db.data.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).send('Todo not found');
  }

  return res.render('partials/todo-item-edit', {
    layout: false,
    ...todo,
    selectedFilter,
  });
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  const selectedFilter = req.query.filter ?? 'All';

  const todo = db.data.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).send('Todo not found');
  }

  return res.render('partials/todo-item', {
    layout: false,
    ...todo,
    selectedFilter,
  });
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const todo = db.data.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).send('Todo not found');
  }

  todo.name = name;
  await db.write();

  return res.render('partials/todo-item', {
    layout: false,
    ...todo,
  });
});

app.listen(3000, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
