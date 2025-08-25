# PI_Rokuzen
O projeto consiste em otimizar a página de serviços, mbora a ROKUZEN já possua um sistema de agendamento online funcional, o maior problema atual se dá no agendamento de sessões com visualizações em tempo real e utilizações dos espaços físicos.

# 🧪 Projeto Integrador - Testes Automatizados com TDD (React)

Este repositório contém um projeto desenvolvido por alunos de Ciência da Computação (CIC) como parte do Projeto Integrador. O foco principal é aplicar os princípios de **Test-Driven Development (TDD)** utilizando **React** e testes automatizados com **Jest** e **React Testing Library**.

---

## 🎯 Objetivo

- Aplicar TDD no desenvolvimento de funcionalidades React.
- Garantir a qualidade do código com testes automatizados.
- Seguir o ciclo: **Red → Green → Refactor**.
- Criar uma aplicação web interativa e responsiva.
- Utilizar boas práticas de versionamento e organização de código.

---

## 🔧 Tecnologias Utilizadas

- **React** – Biblioteca principal para construção da interface.
- **CSS** – Estilização dos componentes.
- **Jest** – Framework de testes.
- **React Testing Library** – Utilizada para testes de componentes React.
- **Visual Studio Code** – Ambiente de desenvolvimento.
- **React Router DOM** – Para controle de rotas (se aplicável).
- **Mock de APIs** com `jest.fn()`.
- **React Router DOM** – Para controle de rotas.
- **Mock de APIs** com `jest.fn()` e mocks de módulos (`jest.mock`).
- **User Event** (`@testing-library/user-event`) – Para simulação de interações do usuário.
- **EmailJS** (`@emailjs/browser`) – Para funcionalidade de envio de e-mail (mockado nos testes).
- **React VLibras Plugin** – Para acessibilidade (mockado nos testes).

---

## ✨ Funcionalidades Desenvolvidas

- Gerenciamento de treinos:
  - ✅ Listagem de treinos
  - ✅ Adição de novo treino via modal
  - ✅ Validação de formulário
  - ✅ Feedback visual de sucesso e erro
  - 🚧 Edição e exclusão de treinos (em desenvolvimento)
As funcionalidades abaixo foram desenvolvidas seguindo a metodologia TDD, com testes criados antes da implementação do código.

### 1. Gerenciamento de Membros (`GerenciarMembros`)
   - ✅ **Listagem de Membros:**
     - Exibição de estado de carregamento inicial.
     - Carregamento e exibição de membros a partir de uma API.
     - Tratamento de erro em caso de falha na API.
     - Exibição de estado de lista vazia.
   - ✅ **Adição de Novos Membros:**
     - Abertura de modal para cadastro.
     - Preenchimento de formulário (nome, Discord ID, e-mail, função, modalidade, horas PAE).
     - Validação e submissão dos dados para API.
     - Feedback visual de sucesso e erro.
     - Atualização da lista de membros após adição.
   - ✅ **Edição de Membros Existentes:**
     - Abertura de modal com dados do membro pré-preenchidos.
     - Modificação dos dados do membro.
     - Submissão dos dados atualizados para API.
     - Feedback visual de sucesso e erro.
     - Atualização da lista de membros após edição.
   - ✅ **Exclusão de Membros:**
     - Confirmação antes da exclusão.
     - Remoção do membro via API.
     - Feedback visual de sucesso.
     - Atualização da lista de membros após exclusão.
     - Cancelamento da exclusão caso a confirmação seja negada.
   - ✅ **Busca e Filtragem de Membros:**
     - Campo de pesquisa para filtrar membros por nome, e-mail ou modalidade em tempo real.
   - ⚙️ **Carregamento de Modalidades:**
     - Busca e disponibilização de modalidades para seleção nos formulários de adição/edição.

### 2. Página de Contato (`Contato`)
   - ✅ **Formulário de Contato:**
     - Renderização dos campos do formulário (nome, e-mail, mensagem).
     - Permite o preenchimento dos campos pelo usuário.
   - ✅ **Envio de Mensagem:**
     - Submissão do formulário para um serviço de e-mail (EmailJS).
     - Exibição de alerta de sucesso e limpeza dos campos após envio.
     - Exibição de alerta de erro em caso de falha no envio.
   - ✅ **Seção de Perguntas Frequentes (FAQ):**
     - Exibição de perguntas e respostas em formato "acordeão".
     - Permite expandir e recolher respostas.
     - Garante que apenas uma resposta esteja visível por vez.
   - ✅ **Acessibilidade:**
     - Integração com VLibras para tradução para Língua Brasileira de Sinais.
   - ℹ️ **Informações de Contato Adicionais:**
     - Exibição de e-mail de contato e link para perfil do Instagram.

### 3. Consulta de Horas PAE (`ConsultaHorasPAE`)
   - ✅ **Interface de Consulta:**
     - Renderização de campo para inserção de e-mail institucional ou Discord ID.
     - Exibição de botão para iniciar a consulta.
   - ✅ **Processo de Consulta:**
     - Exibição de estado de carregamento durante a busca inicial de dados.
     - Tratamento de erro caso a busca inicial de dados falhe.
     - Validação para campo de busca vazio.
   - ✅ **Exibição de Resultados:**
     - Busca de membro por e-mail (case-insensitive) ou Discord ID.
     - Apresentação dos detalhes do membro encontrado (nome, e-mail, Discord ID, modalidade, horas PAE).
     - Exibição de mensagem de erro caso o usuário não seja encontrado.
     - Limpeza de resultados anteriores ao realizar nova busca.
     - Tratamento de dados opcionais ausentes (ex: horas PAE nulas exibidas como "0").

---

## ✅ Requisitos de Testes Automatizados

Os testes são escritos **antes da implementação** de cada funcionalidade, seguindo o ciclo TDD. Os principais casos cobertos incluem:

- Renderização inicial e carregamento de dados
- Tratamento de erro da API
- Comportamento do modal de adicionar treino
- Submissão do formulário e chamadas à API
- Estados condicionais de erro, sucesso e loading

Exemplo de testes incluídos:
```bash
✔️ Exibe loading durante a busca
✔️ Mostra "Nenhum treino encontrado" se a lista estiver vazia
✔️ Mostra erro se a requisição falhar
✔️ Abre e fecha modal corretamente
✔️ Submete treino novo e exibe sucesso
✔️ Lida com falha ao cadastrar treino
- **Renderização de Componentes:**
  - Renderização inicial de elementos estáticos (títulos, formulários, botões).
  - Verificação de componentes filhos (através de mocks ou renderização real).
- **Interações do Usuário:**
  - Preenchimento de formulários.
  - Submissão de formulários.
  - Cliques em botões e links.
  - Abertura e fechamento de modais.
  - Interação com elementos de FAQ (acordeão).
  - Digitação em campos de busca e filtragem de resultados.
- **Comunicação com API (Mockada):**
  - Simulação de chamadas à API para buscar, criar, atualizar e deletar dados.
  - Testes para cenários de sucesso nas chamadas (resolved promises).
  - Testes para cenários de falha nas chamadas (rejected promises).
- **Estados da Aplicação:**
  - Estados de carregamento (loading).
  - Estados de erro (exibição de mensagens de erro apropriadas).
  - Estados de sucesso (exibição de notificações ou feedback visual).
  - Atualização da UI após operações CRUD.
  - Comportamento da UI com dados vazios ou não encontrados.
- **Validações:**
  - Validação de campos de formulário (ex: campo de busca vazio).
  - Confirmações de ações (ex: exclusão de membro).
- **Lógica Condicional:**
  - Exibição de diferentes informações com base nos dados recebidos (ex: fallback para dados opcionais).
  - Comportamento de limpeza de resultados anteriores em novas buscas.

Exemplo de testes incluídos (conforme os arquivos fornecidos):
```javascript
// Para ConsultaHorasPAE
test("deve renderizar os elementos estáticos e o estado de carregamento inicial", async () => { /*...*/ });
test("deve exibir mensagem de erro se o carregamento inicial de membros falhar", async () => { /*...*/ });
test("deve encontrar e exibir os dados do membro ao buscar por email existente (case-insensitive)", async () => { /*...*/ });
test("deve exibir erro se o usuário não for encontrado", async () => { /*...*/ });

// Para Contato
test("deve renderizar os elementos estáticos principais corretamente", () => { /*...*/ });
test("deve enviar o formulário com sucesso e limpar os campos", async () => { /*...*/ });
test("deve exibir alerta de erro se o envio do formulário falhar", async () => { /*...*/ });
test("deve exibir e ocultar a resposta de um FAQ ao clicar na pergunta", async () => { /*...*/ });

// Para GerenciarMembros
test("deve exibir 'Carregando membros...' inicialmente e depois a lista de membros", async () => { /*...*/ });
test("deve abrir o modal 'Adicionar Membro', permitir preenchimento e chamar createMember ao salvar", async () => { /*...*/ });
test("deve abrir o modal 'Editar Membro' com os dados corretos e salvar as alterações", async () => { /*...*/ });
test("deve excluir um membro com sucesso após confirmação", async () => { /*...*/ });
test("deve filtrar membros ao digitar no campo de pesquisa", async () => { /*...*/ });
