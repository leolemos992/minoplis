# Prompt para Reconstrução de Aplicação Web: MINOPOLIS

## Objetivo Principal

Recriar uma aplicação web de um jogo de tabuleiro multiplayer, originalmente desenvolvida em Next.js com React, Firebase (Firestore e Auth), e Tailwind CSS, para uma nova stack tecnológica composta por **PHP**, um servidor local **XAMPP**, e um banco de dados **MySQL**. O frontend deve ser renderizado com **HTML, CSS (usando Tailwind CSS via CDN) e JavaScript puro (ou jQuery)** para interatividade do lado do cliente.

## Visão Geral do Projeto

**Nome do Jogo:** MINOPOLIS
**Conceito:** Uma versão multiplayer online do clássico jogo de tabuleiro de troca de propriedades (como o Monopólio), adaptado com nomes de locais e temas específicos ("Bahia Palace"). Os jogadores podem criar salas de jogo, entrar em salas existentes, escolher personagens e competir para levar os outros à falência.

---

## 1. Estrutura da Base de Dados (MySQL)

Projete e gere o esquema SQL para as seguintes tabelas, refletindo a estrutura de dados do projeto original.

### Tabela: `games`
Armazena o estado de cada partida.

| Coluna            | Tipo         | Descrição                                                              |
| ----------------- | ------------ | ---------------------------------------------------------------------- |
| `id`              | `INT` (PK, AI) | Identificador único da partida.                                        |
| `game_code`       | `VARCHAR(10)`| Um código curto e único (ex: "AB12CD") para os jogadores entrarem na sala. |
| `name`            | `VARCHAR(255)` | Nome da sala de jogo.                                                  |
| `status`          | `ENUM(...)`  | Status atual: `waiting`, `rolling_to_start`, `active`, `finished`.   |
| `host_id`         | `INT` (FK)   | ID do jogador (`players.id`) que criou a partida.                      |
| `current_player_id` | `INT` (FK) | ID do jogador (`players.id`) do turno atual.                             |
| `player_order`    | `JSON`       | Array de `players.id` que define a ordem dos turnos.                   |
| `created_at`      | `TIMESTAMP`  | Timestamp de quando a partida foi criada.                              |

### Tabela: `players`
Armazena os dados de cada jogador numa partida.

| Coluna                   | Tipo          | Descrição                                                              |
| ------------------------ | ------------- | ---------------------------------------------------------------------- |
| `id`                     | `INT` (PK, AI)| Identificador único do jogador.                                        |
| `game_id`                | `INT` (FK)    | ID da partida (`games.id`) a que o jogador pertence.                   |
| `session_id`             | `VARCHAR(255)`| ID da sessão PHP para identificar o jogador anónimo.                  |
| `name`                   | `VARCHAR(255)`| Nome do jogador na partida.                                            |
| `money`                  | `INT`         | Dinheiro atual do jogador (valor inicial: 1500).                       |
| `position`               | `INT`         | Posição no tabuleiro (0-39).                                           |
| `color`                  | `VARCHAR(50)` | Cor escolhida (ex: 'red', 'blue').                                      |
| `totem`                  | `VARCHAR(50)` | Peça/totem escolhido (ex: 'car', 'dog').                                 |
| `in_jail`                | `BOOLEAN`     | `true` se o jogador estiver na prisão.                                   |
| `get_out_of_jail_cards`  | `INT`         | Número de cartas "Saia da Prisão" que o jogador possui.                |

### Tabela: `player_properties`
Relaciona jogadores com as propriedades que possuem.

| Coluna         | Tipo          | Descrição                                                               |
| -------------- | ------------- | ----------------------------------------------------------------------- |
| `id`           | `INT` (PK, AI)| Identificador único.                                                      |
| `player_id`    | `INT` (FK)    | ID do jogador (`players.id`).                                           |
| `property_id`  | `VARCHAR(255)`| ID da propriedade (string, ex: 'poco-fundo').                           |
| `houses`       | `INT`         | Número de casas construídas (5 para um hotel).                         |
| `is_mortgaged` | `BOOLEAN`     | `true` se a propriedade estiver hipotecada.                             |

### Tabela: `rolls_to_start`
Armazena os resultados da rolagem de dados para decidir a ordem inicial.

| Coluna      | Tipo       | Descrição                                      |
| ----------- | ---------- | ---------------------------------------------- |
| `id`        | `INT` (PK, AI) | Identificador único.                         |
| `game_id`   | `INT` (FK) | ID da partida (`games.id`).                    |
| `player_id` | `INT` (FK) | ID do jogador (`players.id`).                  |
| `roll`      | `INT`      | Resultado da rolagem dos dados.                |

---

## 2. Estrutura de Arquivos (PHP e Frontend)

Crie a seguinte estrutura de arquivos, preenchendo cada um com o código PHP, HTML e JavaScript necessário.

```
/minopolis/
|-- public/
|   |-- index.php             # Página Inicial (Landing Page)
|   |-- lobby.php             # Lobby para criar ou ver jogos multiplayer
|   |-- create_game.php       # Página para dar nome a um novo jogo
|   |-- character_selection.php # Página para escolher nome, totem e cor
|   |-- game.php              # A página principal do jogo (tabuleiro)
|   |-- assets/
|   |   |-- css/
|   |   |   `-- style.css       # CSS customizado (se necessário)
|   |   `-- js/
|   |       `-- game_logic.js   # Lógica do jogo no cliente (AJAX, manipulação de DOM)
|-- src/
|   |-- db.php                # Conexão com o banco de dados MySQL
|   |-- game_actions.php      # Lógica de backend (criar jogo, entrar, rolar dados, etc.)
|   |-- config/
|   |   `-- game_data.php       # Definições estáticas do jogo (tabuleiro, cartas, etc.)
|-- templates/
|   |-- header.php
|   `-- footer.php
`-- api/
    `-- game_state.php        # Endpoint para polling de estado do jogo via AJAX
```

---

## 3. Funcionalidades e Lógica a Implementar

### Autenticação Anónima
-   Use sessões PHP (`session_start()`) para simular a autenticação anónima. Cada visitante do site recebe um `session_id()` único, que será usado para associá-lo a um `player` no banco de dados.

### Fluxo de Criação e Entrada no Jogo
1.  **`index.php`**: Página inicial com o título "MINOPOLIS" e a descrição. Deve ter botões para "Jogo Solo" (que leva a `create_game.php`) e "Multiplayer" (que leva a `lobby.php`).
2.  **`lobby.php`**: Mostra uma lista de jogos com `status = 'waiting'`. Cada item da lista deve ter um botão "Entrar" que redireciona para `character_selection.php?game_id=...`. Deve haver também um botão "Criar Novo Jogo".
3.  **`create_game.php`**: Um formulário simples com um campo para o nome do jogo. Ao submeter, um registo é criado na tabela `games` e o utilizador é redirecionado para `character_selection.php?game_id=...`.
4.  **`character_selection.php`**:
    -   Recebe `game_id` via `$_GET`.
    -   Mostra um formulário para o jogador inserir o seu nome.
    -   Mostra seletores (radio buttons) para totems e cores. As opções já escolhidas por outros jogadores na mesma partida devem ser desativadas.
    -   Ao submeter, um registo é criado na tabela `players` e o utilizador é redirecionado para `game.php?game_id=...`.

### Página do Jogo (`game.php`)
-   **Estrutura Visual**: Recrie a interface do tabuleiro de jogo usando HTML e Tailwind CSS. O tabuleiro é uma grelha 11x11. As propriedades devem ter as cores e os ícones corretos.
-   **Estado do Jogo**: A página deve usar JavaScript e AJAX (com `fetch`) para consultar periodicamente (`setInterval`) o endpoint `api/game_state.php` e obter o estado mais recente do jogo (posições dos jogadores, dinheiro, propriedades, turno atual, etc.).
-   **`api/game_state.php`**: Este endpoint PHP recebe um `game_id`, consulta o banco de dados para obter todos os dados relevantes da partida (estado do jogo, lista de jogadores, suas propriedades, etc.) e retorna tudo como uma resposta JSON.
-   **Interatividade**: Ações do jogador (rolar dados, comprar propriedade, etc.) devem enviar pedidos AJAX para `src/game_actions.php` e depois atualizar a interface com base na resposta ou no próximo polling de `game_state.php`.

### Lógica do Jogo
-   **Começar o Jogo**:
    -   Quando o anfitrião clica em "Iniciar Jogo" no `game.php` (quando o status é `waiting`), o status do jogo muda para `rolling_to_start`.
    -   Todos os jogadores são apresentados a um modal para rolar os dados. O resultado é guardado na tabela `rolls_to_start`.
    -   Quando todos rolam, o backend determina a ordem (`player_order`), atualiza o `games.status` para `active`, define `current_player_id` para o primeiro jogador e a partida começa.
-   **Ações do Turno**:
    -   O jogador do turno pode rolar os dados. O resultado move o seu peão.
    -   **Comprar Propriedade**: Se parar numa propriedade sem dono, um modal aparece com a opção de comprar ou leiloar.
    -   **Pagar Aluguer**: Se parar numa propriedade com dono, o aluguer é transferido automaticamente.
    -   **Cartas Sorte/Azar**: Se parar num espaço de carta, o backend seleciona uma carta aleatoriamente e aplica o seu efeito.
    -   **Prisão**: Se for para a prisão, o jogador fica preso por 3 rodadas, a menos que pague fiança, use uma carta ou role duplos.
-   **Fim de Jogo**: O jogo termina quando restar apenas um jogador que não foi à falência. Uma mensagem de vitória deve ser exibida.

---

## 4. Tecnologias a Utilizar

-   **Backend**: PHP (versão 8.x recomendada).
-   **Servidor**: XAMPP (Apache + MySQL).
-   **Base de Dados**: MySQL.
-   **Frontend**: HTML5, JavaScript (ES6, sem frameworks como React/Vue), Tailwind CSS (use a CDN para simplicidade).
-   **Comunicação**: AJAX (`fetch` API) para comunicação assíncrona entre cliente e servidor.

Este prompt detalhado deve fornecer a uma IA todas as informações necessárias para recriar a aplicação MINOPOLIS na stack tecnológica desejada.