const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

const NON_EXISTENT_ID = Number.MAX_SAFE_INTEGER;

async function createTask(title = "Tarefa de teste") {
  const response = await request(app).post("/tasks").send({
    title,
    date: "14/10/2026"
  });

  assert.equal(response.status, 201);
  return response.body;
}

function markTaskCompleted(task) {
  const storedTask = app.locals.tasks.get(task.id);
  storedTask.completed = true;
  storedTask.completionDate = "13/10/2026";
}

test("GET /tasks returns all tasks", async () => {
  const task = await createTask("Tarefa listada");
  const response = await request(app).get("/tasks");

  assert.equal(response.status, 200);
  assert.ok(response.body.some(({ id }) => id === task.id));
});

test("GET /tasks/:id returns a specific task", async () => {
  const task = await createTask("Tarefa específica");
  const response = await request(app).get(`/tasks/${task.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, task.id);
  assert.equal(response.body.title, task.title);
});

test("GET /tasks/:id returns 404 for non-existent task", async () => {
  const response = await request(app).get(`/tasks/${NON_EXISTENT_ID}`);

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});

test("GET /tasks/summary returns live task counts", async () => {
  const before = await request(app).get("/tasks/summary");
  await createTask("Tarefa pendente para o resumo");
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
  assert.equal(after.status, 200);
  assert.equal(after.body.totalTasks, before.body.totalTasks + 1);
  assert.equal(after.body.pendingTasks, before.body.pendingTasks + 1);
  assert.equal(after.body.completedTasks, before.body.completedTasks);
});

test("GET /tasks filters titles without case sensitivity", async () => {
  const task = await createTask("Prepare the MixedCaseSearchProbe report");
  const response = await request(app).get("/tasks?title=mIXeDcAsEsEaRcHpRoBe");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.map(({ id }) => id), [task.id]);
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
  const task = await createTask();
  const response = await request(app).delete(`/tasks/${task.id}`);

  assert.equal(response.status, 200);

  const deletedTask = await request(app).get(`/tasks/${task.id}`);
  assert.equal(deletedTask.status, 404);
  assert.deepEqual(deletedTask.body, { error: "Task not found" });
});

test("DELETE /tasks/:id does not remove a completed task", async () => {
  const task = await createTask();
  markTaskCompleted(task);
  const response = await request(app).delete(`/tasks/${task.id}`);

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Cannot delete a completed task" });

  const completedTask = await request(app).get(`/tasks/${task.id}`);
  assert.equal(completedTask.status, 200);
  assert.equal(completedTask.body.completed, true);
  assert.equal(completedTask.body.completionDate, "13/10/2026");
});

test("DELETE /tasks/:id returns 404 for a non-existent task", async () => {
  const response = await request(app).delete(`/tasks/${NON_EXISTENT_ID}`);

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});

test("PATCH /tasks/:id/reopen reopens a completed task", async () => {
  const task = await createTask();
  markTaskCompleted(task);

  const response = await request(app).patch(`/tasks/${task.id}/reopen`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, task.id);
  assert.equal(response.body.completed, false);
  assert.equal(response.body.completionDate, null);

  const reopenedTask = await request(app).get(`/tasks/${task.id}`);
  assert.equal(reopenedTask.body.completed, false);
  assert.equal(reopenedTask.body.completionDate, null);
});

test("PATCH /tasks/:id/reopen returns 404 for a non-existent task", async () => {
  const response = await request(app).patch(`/tasks/${NON_EXISTENT_ID}/reopen`);

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Task not found" });
});
