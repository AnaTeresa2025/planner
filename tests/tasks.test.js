const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

test("GET /tasks returns all tasks", async () => {
  const created = await request(app).post("/tasks").send({
    title: "Tarefa para listar",
    date: "14/10/2026"
  });
  const response = await request(app).get("/tasks");

  assert.equal(created.status, 201);
  assert.equal(response.status, 200);
  assert.ok(response.body.some((task) => task.id === created.body.id));
});

test("GET /tasks/:id returns a specific task", async () => {
  const created = await request(app).post("/tasks").send({
    title: "Tarefa para consultar",
    date: "14/10/2026"
  });
  const response = await request(app).get(`/tasks/${created.body.id}`);

  assert.equal(created.status, 201);
  assert.equal(response.status, 200);
  assert.equal(response.body.id, created.body.id);
  assert.equal(response.body.title, "Tarefa para consultar");
});

test("GET /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app).get("/tasks/999");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});

test("GET /tasks/summary returns live task counts", async () => {
  const before = await request(app).get("/tasks/summary");
  const created = await request(app).post("/tasks").send({
    title: "Tarefa pendente para o resumo",
    date: "14/10/2026"
  });
  const after = await request(app).get("/tasks/summary");

  assert.equal(before.status, 200);
  assert.deepEqual(Object.keys(before.body).sort(), [
    "completedTasks",
    "pendingTasks",
    "totalTasks"
  ]);
  for (const count of Object.values(before.body)) {
    assert.equal(Number.isInteger(count), true);
  }
  assert.equal(created.status, 201);
  assert.equal(after.status, 200);
  for (const count of Object.values(after.body)) {
    assert.equal(Number.isInteger(count), true);
  }
  assert.equal(after.body.totalTasks, before.body.totalTasks + 1);
  assert.equal(after.body.pendingTasks, before.body.pendingTasks + 1);
  assert.equal(after.body.completedTasks, before.body.completedTasks);
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

test("DELETE /tasks/:id removes an existing task", async () => {
  const created = await request(app).post("/tasks").send({
    title: "Tarefa para excluir",
    date: "14/10/2026"
  });
  const response = await request(app).delete(`/tasks/${created.body.id}`);

  assert.equal(created.status, 201);
  assert.equal(response.status, 200);

  const deletedTask = await request(app).get(`/tasks/${created.body.id}`);
  assert.equal(deletedTask.status, 404);
  assert.deepEqual(deletedTask.body, { error: "Task not found" });
});

test("DELETE /tasks/:id does not remove a completed task", async () => {
  const response = await request(app).delete("/tasks/2");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Cannot delete a completed task" });

  const completedTask = await request(app).get("/tasks/2");
  assert.equal(completedTask.status, 200);
  assert.equal(completedTask.body.completed, true);
});

test("DELETE /tasks/:id returns 404 for a non-existent task", async () => {
  const response = await request(app).delete("/tasks/0");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});