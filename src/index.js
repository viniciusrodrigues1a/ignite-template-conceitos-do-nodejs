const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User doesn\'t exist.' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(u => u.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists.' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: Date.now()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request; 

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  todo.deadline = new Date(deadline);
  todo.title = title;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.find(t => t.id === id);
  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  user.todos = user.todos.filter(t => t.id !== id);

  return response.status(204).end();
});

module.exports = app;
