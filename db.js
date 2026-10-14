// Banco de dados de tarefas. Nesta versão, as tarefas estão salvas em memória volátil.
//
// Este módulo oferece apenas operações genéricas de armazenamento (consultar,
// cadastrar, atualizar e remover). Regras de negócio, como filtros e
// validações, devem ficar nas rotas do server.js.

// Tarefas pré-cadastradas, com datas no formato dd/mm/aaaa. Elas servem para
// explorar a API manualmente (por exemplo, pelo Swagger em /api-docs). Os
// testes não devem depender delas: cada teste deve criar as tarefas de que precisa.
const tarefasIniciais = [
  {
    id: 1,
    title: "Revisar o artigo ACM Survey",
    completed: false,
    date: "15/10/2026",
    completionDate: null
  },
  {
    id: 2,
    title: "Preparar material para o curso TDS",
    completed: true,
    date: "12/10/2026",
    completionDate: "10/10/2026"
  },
  {
    id: 3,
    title: "Preparar apresentação da palestra BBDW",
    completed: false,
    date: "15/10/2026",
    completionDate: null
  },
  {
    id: 4,
    title: "Enviar parecer de artigo para o SBES",
    completed: false,
    date: "25/09/2026",
    completionDate: null
  },
  {
    id: 5,
    title: "Corrigir as provas da turma de TDS",
    completed: false,
    date: "08/10/2026",
    completionDate: null
  },
  {
    id: 6,
    title: "Submeter relatório parcial do projeto de pesquisa",
    completed: true,
    date: "30/09/2026",
    completionDate: "02/10/2026"
  },
  {
    id: 7,
    title: "Reunião de orientação de mestrado",
    completed: true,
    date: "05/10/2026",
    completionDate: "05/10/2026"
  },
  {
    id: 8,
    title: "Renovar a inscrição na SBC",
    completed: true,
    date: "01/09/2026",
    completionDate: "28/08/2026"
  },
  {
    id: 9,
    title: "Revisar o capítulo 3 da dissertação de mestrado",
    completed: false,
    date: "20/10/2026",
    completionDate: null
  },
  {
    id: 10,
    title: "Revisar o projeto de iniciação científica",
    completed: false,
    date: "20/10/2026",
    completionDate: null
  },
  {
    id: 11,
    title: "Preparar slides da aula de testes automatizados",
    completed: false,
    date: "05/11/2026",
    completionDate: null
  },
  {
    id: 12,
    title: "Atualizar o currículo Lattes",
    completed: false,
    date: "30/11/2026",
    completionDate: null
  },
  {
    id: 13,
    title: "Organizar o workshop de engenharia de software",
    completed: false,
    date: "15/01/2027",
    completionDate: null
  },
  {
    id: 14,
    title: "Planejar o curso de TDS do próximo semestre",
    completed: false,
    date: "01/03/2027",
    completionDate: null
  }
];

const tarefas = new Map(tarefasIniciais.map(tarefa => [tarefa.id, tarefa]));

// Próximo identificador livre. Nunca é reaproveitado, mesmo após remoções.
let proximoId = Math.max(...tarefas.keys()) + 1;

// Retorna uma lista com todas as tarefas.
function listaTarefas() {
  return [...tarefas.values()];
}

// Retorna a tarefa com o identificador informado, ou undefined se ela não existir.
function consultaPorId(id) {
  return tarefas.get(id);
}

// Cadastra uma nova tarefa pendente e a retorna.
function cadastraTarefa({ title, date }) {
  const tarefa = {
    id: proximoId++,
    title,
    completed: false,
    date,
    completionDate: null
  };

  tarefas.set(tarefa.id, tarefa);
  return tarefa;
}

// Altera os campos informados de uma tarefa (exceto o id) e retorna a tarefa
// atualizada, ou undefined se ela não existir.
// Exemplo: atualizaTarefa(1, { title: "Novo título" })
function atualizaTarefa(id, alteracoes) {
  const tarefa = tarefas.get(id);

  if (!tarefa) {
    return undefined;
  }

  Object.assign(tarefa, alteracoes, { id });
  return tarefa;
}

// Remove a tarefa com o identificador informado. Retorna true se ela existia.
function removeTarefa(id) {
  return tarefas.delete(id);
}

module.exports = {
  listaTarefas,
  consultaPorId,
  cadastraTarefa,
  atualizaTarefa,
  removeTarefa
};
