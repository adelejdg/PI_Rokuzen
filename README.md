<h1 align="center"> Projeto Integrador Interdiciplinar em parceria com a Rokuzen </h1> 
<img width="666" height="265" margin-left=100px alt="logo rokuzen" src="https://github.com/user-attachments/assets/a95c3c8c-3e6c-43f9-8112-a9875070126a" />

O projeto foi desenvolvido com o objetivo de dinamizar o site já existente da Rokuzen. Ao analisar o problema do cliente reuniões foram realizadas acerca do que poderia ser feito para que a experiência do usuário ficasse ainda melhor e a trazer como centro do projeto. Desse modo, o login diferente para cada tipo de persona e aqueles que diretamente seriam afetados pelo site (administradores, massagistas e recepcionistas) foi criado, de acordo com suas necessidades, além de uma interface de inicio que consideramos mais acessível, contando com fontes maiores, vlibras e cores mais marcantes que não afetem nenhum tipo de daltonismo.

# 🔨 Funcionalidades do projeto

A funcionalidade inserida no site deriva de acordo com a necessidade, no login do administrador é possível adicionar e excluir clientes agendados, logins de massagistas/recepcionistas e acesso direto a todo o banco de dados. Ao acessar o login do recepcionista é possível também excluir clientes agendados e alterar a grade horária, enquanto no login do massagista apenas é possível marcar suas sessões já feitas, sendo isento das demais funcionalidades.

Ao navegar no site, o usuário pode conhecer um pouco mais sobre a história da clinica, pacotes de sessões, acesso as redes sociais da empresa, quais as unidades, massagistas e horários disponíveis. Caso haja duvidas sobre eventuais funcionalidades o usuário pode acessar o contato de um dos membros responsáveis pela manutenção do site que estará disponível para responder eventuais problema.

As tecnologias utilizadas ao longo do projeto iniciaram-se no Figma e Canvas, onde foram desenvolvidos protótipos de tela e navegação para que assim o grupo pudesse apresentar ao cliente a ideia inicial e assim ajustar de acordo com as necessidades citadas. Após a aprovação, o grupo iniciou a programação do projeto, fazendo o uso do HTML para a documentação, CSS para a estilização e o JavaScript para executar eventos. Além disso, a partir do banco de dados da empresa o MongoDB foi utilizado com banco de dados não relacional, a fim de armazenar dados de usuários bem como a disponibilidade de equipamentos e grade horária.

O website foi desenvolvido pelo grupo de projeto integrador interdisciplinar mestrado pelo professor Alexander, com seus respectivos membros: Carmen Salido, Adele di Girolamo e Arthemis Nobre. Além disso, os contribuidores para o projeto foram Maurício e Gustavo Ken, que nos disponibilizaram seu próprio sistema e banco de dados para que pudéssemos ter uma base do que era esperado no projeto e o coordenador de curso Rudolf, que auxiliou nos requisitos do projeto e na ponte entre o grupo e o parceiro.


# 📁 Acesso ao projeto

O projeto pode ser acessado por qualquer um que clonar todo o repositorio em seu dispositivo e tiver o vs code e MongoDB ou variaveis instalados em seu dispositivo.

# 🛠️ Abrir e rodar o projeto

Para executar o projeto os passos principais são:

1. Clone o repositorio para uma pasta local

2. Abra esse folder em seu VS Code

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Configure o MongoDB Atlas:
   - Crie um arquivo `.env` na raiz do projeto
   - Copie o conteúdo do arquivo `.env.example` para o `.env`
   - Substitua a string de conexão pela sua URI do MongoDB Atlas:
     ```
     MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco?retryWrites=true&w=majority
     ```
   - **IMPORTANTE**: Nunca compartilhe seu arquivo `.env` ou faça commit dele no Git!

5. Inicie o servidor backend:
   ```bash
   npm start
   ```

6. (Opcional) Inicialize os atendentes padrão no banco de dados:
   - Com o servidor rodando, faça uma requisição POST para `http://localhost:3000/atendentes/init`
   - Você pode usar o Postman, Insomnia, ou executar no terminal:
     ```bash
     curl -X POST http://localhost:3000/atendentes/init
     ```
   - Isso criará 10 atendentes padrão distribuídos entre as unidades

7. Para o frontend, baixe a extensão do Live Server no VS Code

8. Selecione "Go Live" no canto inferior direito do VS Code para abrir o site localmente
