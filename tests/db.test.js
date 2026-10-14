const test = require("node:test");
const assert = require("node:assert/strict");

const db = require("../db");

const NON_EXISTENT_ID = Number.MAX_SAFE_INTEGER;

function cadastra(title = "Tarefa de teste do banco") {
  return db.cadastraTarefa({ title, date: "14/10/2026" });
}

test("cadastraTarefa creates a pending task that can be retrieved by id", () => {
  const tarefa = cadastra("Tarefa cadastrada no banco");

  assert.deepEqual(db.consultaPorId(tarefa.id), {
    id: tarefa.id,
    title: "Tarefa cadastrada no banco",
    completed: false,
    date: "14/10/2026",
    completionDate: null
  });
  assert.ok(db.listaTarefas().some(({ id }) => id === tarefa.id));
});

test("cadastraTarefa never reuses the id of a removed task", () => {
  const primeira = cadastra();
  const segunda = cadastra();
  db.removeTarefa(primeira.id);

  const terceira = cadastra();

  assert.notEqual(terceira.id, primeira.id);
  assert.notEqual(terceira.id, segunda.id);
  assert.equal(db.consultaPorId(segunda.id).title, segunda.title);
});

test("atualizaTarefa changes only the given fields and keeps the id", () => {
  const tarefa = cadastra("Título original");

  const atualizada = db.atualizaTarefa(tarefa.id, { title: "Título novo", id: NON_EXISTENT_ID });

  assert.equal(atualizada.id, tarefa.id);
  assert.equal(atualizada.title, "Título novo");
  assert.equal(atualizada.date, "14/10/2026");
  assert.equal(db.consultaPorId(NON_EXISTENT_ID), undefined);
});

test("atualizaTarefa returns undefined for a non-existent task", () => {
  assert.equal(db.atualizaTarefa(NON_EXISTENT_ID, { title: "Nada" }), undefined);
});

test("removeTarefa removes an existing task and reports whether it existed", () => {
  const tarefa = cadastra();

  assert.equal(db.removeTarefa(tarefa.id), true);
  assert.equal(db.consultaPorId(tarefa.id), undefined);
  assert.equal(db.removeTarefa(tarefa.id), false);
});

test("listaTarefas returns a copy that does not change the database", () => {
  const tarefas = db.listaTarefas();
  tarefas.length = 0;

  assert.ok(db.listaTarefas().length > 0);
});
