const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

test("GET /tasks returns all tasks", async () => {
  const response = await request(app).get("/tasks");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 3);
});

test("GET /tasks/:id returns a specific task", async () => {
  const response = await request(app).get("/tasks/1");

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.title, "Revisar o artigo ACM Survey");
});

test("GET /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app).get("/tasks/999");

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

test("PATCH /tasks/:id updates a task title", async () => {
  const response = await request(app)
    .patch("/tasks/1")
    .send({ title: "Revisar o artigo atualizado" });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.title, "Revisar o artigo atualizado");
  assert.equal(response.body.completed, false);
  assert.equal(response.body.date, "15/10/2026");
  assert.equal(response.body.completionDate, null);
});

test("PATCH /tasks/:id returns 400 when title is missing", async () => {
  const response = await request(app).patch("/tasks/1").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Title is required" });
});

test("PATCH /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app)
    .patch("/tasks/999")
    .send({ title: "Título atualizado" });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});