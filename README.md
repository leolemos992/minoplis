# MINOPLIS - Jogo de Tabuleiro com Next.js e Firebase

Este é um projeto de um jogo de tabuleiro multiplayer, inspirado no clássico Monopólio, construído com Next.js, React, Tailwind CSS e Firebase.

## Como Testar e Rodar o Projeto Localmente

Para rodar este projeto no seu computador, você precisará ter algumas ferramentas instaladas e seguir alguns passos para configurar o ambiente do Firebase.

### 1. Pré-requisitos

Antes de começar, garanta que você tem os seguintes softwares instalados:

*   **Node.js:** (Versão 18 ou superior). Você pode baixar em [nodejs.org](https://nodejs.org/).
*   **Firebase CLI:** A ferramenta de linha de comando do Firebase. Se não tiver, instale globalmente com o npm:
    ```bash
    npm install -g firebase-tools
    ```
*   **Java JDK:** (Versão 11 ou superior). Os emuladores do Firebase precisam do Java. Você pode verificar se tem com `java -version`.

### 2. Configurando o Projeto

1.  **Copie os Arquivos:** Faça o download ou copie todos os arquivos do projeto para uma pasta no seu computador.

2.  **Instale as Dependências:** Abra um terminal na pasta do projeto e instale todas as dependências necessárias com o comando:
    ```bash
    npm install
    ```

### 3. Rodando os Emuladores do Firebase

O projeto está configurado para se conectar aos emuladores do Firebase para desenvolvimento local. Isso permite que você teste a autenticação e o banco de dados sem usar os recursos de produção.

1.  **Faça login no Firebase (se for a primeira vez):**
    ```bash
    firebase login
    ```

2.  **Inicie os Emuladores:** No terminal, na raiz do projeto, execute o seguinte comando para iniciar os emuladores de Autenticação e Firestore:
    ```bash
    firebase emulators:start --only auth,firestore
    ```
    Você deverá ver uma mensagem indicando que os emuladores estão rodando. Mantenha este terminal aberto. A interface dos emuladores geralmente fica disponível em `http://localhost:4000`.

### 4. Iniciando a Aplicação

Com os emuladores do Firebase rodando, abra um **novo terminal** na mesma pasta do projeto e inicie a aplicação Next.js:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:9002` (conforme configurado em `package.json`).

Agora você pode abrir o navegador, aceder ao endereço e testar o jogo completamente no seu PC!
