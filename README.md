# planner

## Consultar tarefas por situação

Use o parâmetro `status` em `GET /tasks` para filtrar as tarefas:

- `GET /tasks?status=pendente` retorna somente tarefas pendentes.
- `GET /tasks?status=concluida` retorna somente tarefas concluídas.
- `GET /tasks` retorna todas as tarefas.

Valores de `status` diferentes de `pendente` e `concluida` retornam `400 Bad Request`.