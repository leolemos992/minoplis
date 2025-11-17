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

---

## 5. Publicando no GitHub Pages

Este projeto está pré-configurado para ser publicado no GitHub Pages. Siga os passos abaixo para colocar o seu jogo online.

### Passo 1: Crie o Repositório no GitHub

1.  Crie um novo repositório na sua conta do GitHub. **Anote o nome do repositório.**
2.  Envie o código do projeto para este novo repositório.

### Passo 2: Ajuste a Configuração (se necessário)

O projeto está configurado para ser publicado num repositório chamado `minoplis`. Se o seu repositório tiver um nome diferente, você precisa de fazer um pequeno ajuste:

1.  Abra o ficheiro `next.config.ts`.
2.  Encontre as linhas `basePath: isGithubActions ? '/minoplis' : ''` e `assetPrefix: isGithubActions ? '/minoplis/' : ''`.
3.  Substitua `/minoplis` pelo nome do seu repositório (ex: `/meu-jogo-incrivel`).

### Passo 3: Configure o GitHub Pages no seu Repositório

1.  No seu repositório do GitHub, vá para **Settings > Pages**.
2.  Na secção "Build and deployment", em "Source", selecione **GitHub Actions**.
3.  O GitHub irá sugerir um workflow. **Não precisa de criar um novo**, pois o projeto já está pronto.

### Passo 4: Faça o Deploy

1.  Basta fazer um `push` de qualquer alteração para o seu ramo principal (`main` ou `master`).
2.  A GitHub Action configurada irá automaticamente construir o seu projeto e publicá-lo.
3.  Vá para a aba **Actions** no seu repositório para acompanhar o progresso.
4.  Após a conclusão, o seu jogo estará disponível no endereço: `https://<SEU-NOME-DE-USUARIO>.github.io/<NOME-DO-SEU-REPOSITORIO>`.
