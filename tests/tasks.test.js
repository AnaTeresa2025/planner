const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

test("GET /tasks returns all tasks", async () => {
  const createdTask = await request(app).post("/tasks").send({
    title: "Tarefa para consulta de todas as tarefas",
    date: "14/10/2026"
  });
  const response = await request(app).get("/tasks");

  assert.equal(createdTask.status, 201);
  assert.equal(response.status, 200);
  assert.ok(response.body.some(task => task.id === createdTask.body.id));
});

test("GET /tasks/:id returns a specific task", async () => {
  const createdTask = await request(app).post("/tasks").send({
    title: "Tarefa para consulta por ID",
    date: "14/10/2026"
  });
  const response = await request(app).get(`/tasks/${createdTask.body.id}`);

  assert.equal(createdTask.status, 201);
  assert.equal(response.status, 200);
  assert.equal(response.body.id, createdTask.body.id);
  assert.equal(response.body.title, "Tarefa para consulta por ID");
});

test("GET /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app).get("/tasks/999999");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});

test("POST /tasks creates a new task", async () => {
  const newTask = {
    title: "Elaborar os projetos de desenvolvimento da turma.",
    date: "14/10/2026"
  };

  const response = await request(app).post("/tasks").send(newTask);

  assert.equal(response.status, 201);
  assert.equal(response.body.title, newTask.title);
  assert.equal(response.body.completed, false);
  assert.equal(response.body.date, newTask.date);
  assert.equal(response.body.completionDate, null);
});

test("GET /tasks?status=pendente returns only pending tasks", async () => {
  const createdTask = await request(app).post("/tasks").send({
    title: "Tarefa pendente para filtro",
    date: "14/10/2026"
  });
  const response = await request(app).get("/tasks?status=pendente");

  assert.equal(createdTask.status, 201);
  assert.equal(response.status, 200);
  assert.ok(response.body.some(task => task.id === createdTask.body.id));
  assert.ok(response.body.every(task => task.completed === false));
});

test("GET /tasks?status=concluida returns only completed tasks", async () => {
  const pendingTask = await request(app).post("/tasks").send({
    title: "Tarefa pendente para filtro de concluídas",
    date: "14/10/2026"
  });
  const allTasks = await request(app).get("/tasks");
  const response = await request(app).get("/tasks?status=concluida");
  const expectedIds = allTasks.body
    .filter(task => task.completed)
    .map(task => task.id);

  assert.equal(pendingTask.status, 201);
  assert.equal(response.status, 200);
  assert.ok(expectedIds.length > 0);
  assert.deepEqual(response.body.map(task => task.id), expectedIds);
  assert.ok(response.body.every(task => task.completed === true));
  assert.ok(!response.body.some(task => task.id === pendingTask.body.id));
});

test("GET /tasks returns all tasks when no status is provided", async () => {
  const response = await request(app).get("/tasks");

  assert.equal(response.status, 200);
  assert.ok(response.body.some(task => task.completed));
  assert.ok(response.body.some(task => !task.completed));
});

test("GET /tasks returns 400 for an unsupported status", async () => {
  const response = await request(app).get("/tasks?status=em-andamento");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "Invalid status. Use 'pendente' or 'concluida'"
  });
});