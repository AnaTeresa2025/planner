const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

async function createTask(title) {
  return request(app).post("/tasks").send({
    title,
    date: "14/10/2026"
  });
}

test("GET /tasks returns all tasks", async () => {
  const createdTask = await createTask("Verify task listing includes created task");
  const response = await request(app).get("/tasks");

  assert.equal(response.status, 200);
  assert.ok(response.body.some((task) => task.id === createdTask.body.id));
});

test("GET /tasks/:id returns a specific task", async () => {
  const createdTask = await createTask("Fetch task created by this test");
  const response = await request(app).get(`/tasks/${createdTask.body.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, createdTask.body.id);
  assert.equal(response.body.title, "Fetch task created by this test");
});

test("GET /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app).get("/tasks/9007199254740991");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});

test("GET /tasks filters titles without case sensitivity", async () => {
  const createdTask = await createTask("Prepare the MixedCaseSearchProbe report");
  const response = await request(app).get("/tasks?title=mIXeDcAsEsEaRcHpRoBe");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.map((task) => task.id), [createdTask.body.id]);
});

test("GET /tasks returns an empty list when no title matches", async () => {
  const response = await request(app).get("/tasks?title=NoTaskHasThisUniqueTitleTerm");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
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
  const createdTask = await createTask("Delete task created by this test");
  const response = await request(app).delete(`/tasks/${createdTask.body.id}`);

  assert.equal(response.status, 200);

  const deletedTask = await request(app).get(`/tasks/${createdTask.body.id}`);
  assert.equal(deletedTask.status, 404);
  assert.deepEqual(deletedTask.body, { error: "Task not found" });
});

test("DELETE /tasks/:id does not remove a completed task", async () => {
  const completedTask = (await request(app).get("/tasks")).body.find((task) => task.completed);
  assert.ok(completedTask);

  const response = await request(app).delete(`/tasks/${completedTask.id}`);

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Cannot delete a completed task" });

  const retainedTask = await request(app).get(`/tasks/${completedTask.id}`);
  assert.equal(retainedTask.status, 200);
  assert.equal(retainedTask.body.completed, true);
});

test("DELETE /tasks/:id returns 404 for a non-existent task", async () => {
  const response = await request(app).delete("/tasks/9007199254740991");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});