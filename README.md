# planner

## Consultar tarefas por situação

Use o parâmetro `status` em `GET /tasks` para filtrar as tarefas:

- `GET /tasks?status=pendente` retorna somente tarefas pendentes.
- `GET /tasks?status=concluida` retorna somente tarefas concluídas.
- `GET /tasks` retorna todas as tarefas.

Valores de `status` diferentes de `pendente` e `concluida` retornam `400 Bad Request`.

## Buscar tarefas pelo título

Use o parâmetro `title` em `GET /tasks` para retornar as tarefas cujo título contém o termo informado, sem diferenciar maiúsculas e minúsculas. Os parâmetros podem ser combinados:

- `GET /tasks?title=artigo` retorna as tarefas com "artigo" no título.
- `GET /tasks?status=pendente&title=artigo` retorna apenas as pendentes com "artigo" no título.
