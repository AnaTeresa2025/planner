const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../server");

test("GET /tasks returns all tasks", async () => {
  const response = await request(app).get("/tasks");

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 3);
});