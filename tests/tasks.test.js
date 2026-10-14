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

test("DELETE /tasks/:id removes an existing task", async () => {
  const response = await request(app).delete("/tasks/1");

  assert.equal(response.status, 200);

  const deletedTask = await request(app).get("/tasks/1");
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
  const response = await request(app).delete("/tasks/999");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});