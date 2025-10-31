# Prompt para Reconstrução de Aplicação Web: MINOPOLIS (Versão Solo)

## Objetivo Principal

Recriar uma aplicação web de um jogo de tabuleiro a solo, **MINOPOLIS**, utilizando Next.js (com App Router), React, TypeScript, Firebase (Firestore e Auth), Tailwind CSS e componentes ShadCN UI. O objetivo é replicar o estado atual do projeto, que foca numa experiência para um único jogador contra o "banco".

## Visão Geral do Projeto

**Nome do Jogo:** MINOPOLIS
**Conceito:** Uma versão para um jogador do clássássico jogo de tabuleiro de compra e venda de propriedades. O jogador cria uma partida, escolhe um personagem e joga no tabuleiro, interagindo com propriedades, cartas de sorte/azar e outras mecânicas do jogo.

---

## 1. Stack Tecnológica e Configuração

*   **Framework:** Next.js (versão 15+, com App Router)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **Componentes UI:** ShadCN UI (pré-instalado e configurado)
*   **Backend & Base de Dados:** Firebase (Firestore para base de dados, Firebase Authentication para utilizadores anónimos)
*   **Ícones:** `lucide-react`

### `package.json` (Dependências Principais)
O projeto deve incluir as seguintes dependências:
```json
{
  "dependencies": {
    "next": "15.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "firebase": "^11.9.1",
    "lucide-react": "^0.475.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "framer-motion": "^11.5.7",
    "@radix-ui/*": "..." // (todas as dependências do ShadCN)
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

### Configuração de Estilo (`src/app/globals.css`)
O CSS global deve definir as variáveis de tema do ShadCN. O tema principal é claro, com cores primárias em tons de azul.

---

## 2. Estrutura de Dados (Firebase/Firestore)

O arquivo `docs/backend.json` deve ser criado para definir a estrutura da base de dados.

### Entidades
*   **Game:** Representa uma sessão de jogo.
    *   `name`: Nome da partida.
    *   `status`: 'waiting', 'active', ou 'finished'.
    *   `hostId`: ID do utilizador que criou o jogo.
    *   `createdAt`: Timestamp da criação.
    *   `currentPlayerId`: ID do jogador atual (neste caso, sempre o único jogador).
*   **Player:** Representa o jogador na partida.
    *   `userId`: ID do Firebase Auth.
    *   `name`: Nome do jogador.
    *   `money`: Dinheiro (inicial: 1500).
    *   `position`: Posição no tabuleiro (0-39).
    *   `color`: Cor escolhida.
    *   `totem`: Peça escolhida (ex: 'car', 'dog').
    *   `inJail`: Boolean.
    *   `properties`, `mortgagedProperties`, `houses`, `getOutOfJailFreeCards`...

### Estrutura no Firestore
A estrutura deve seguir o modelo de subcoleções:
```
/games/{gameId} (documento com dados do Game)
  /players/{playerId} (subcoleção com documentos de Player)
```

---

## 3. Fluxo da Aplicação e Estrutura de Páginas

### Autenticação
*   Deve ser implementada a **autenticação anónima** do Firebase.
*   Na primeira visita, o utilizador deve ser automaticamente e silenciosamente autenticado.
*   Um `FirebaseProvider` deve envolver a aplicação para gerir o estado de autenticação e as instâncias do Firebase.

### Páginas (App Router)

1.  **`src/app/page.tsx` (Página Inicial)**
    *   **Visual:** Deve exibir o logo "MINOPOLIS" e uma breve descrição.
    *   **Ação Principal:** Um botão grande "Jogar Agora".
    *   **Funcionalidade:** Ao clicar no botão, o utilizador é redirecionado para `/lobby`.

2.  **`src/app/lobby/page.tsx` (Criação de Jogo)**
    *   **Funcionalidade:** Esta página não deve ter interface visível. Ela deve agir como um **redirecionador automático**.
    *   Ao carregar, ela deve:
        1.  Verificar se o utilizador está autenticado.
        2.  Criar um novo documento na coleção `games` no Firestore com o status `'waiting'` e o `hostId` do utilizador atual.
        3.  Redirecionar o utilizador para a página `/character-selection`, passando o `gameId` e o `gameName` como parâmetros de URL.

3.  **`src/app/character-selection/page.tsx` (Seleção de Personagem)**
    *   **Visual:** Uma `Card` do ShadCN onde o jogador pode:
        *   Inserir o seu nome num campo `Input`.
        *   Selecionar um totem (peça) a partir de uma lista de opções (ícones `lucide-react`) usando `RadioGroup`.
        *   Selecionar uma cor usando botões coloridos.
        *   Uma área de pré-visualização deve mostrar o totem com a cor escolhida e o nome do jogador.
    *   **Funcionalidade:**
        1.  O botão "Iniciar Jogo" só fica ativo se o nome do jogador estiver preenchido.
        2.  Ao clicar, a função `handleJoinGame` deve:
            *   Criar um novo documento de jogador na subcoleção `/games/{gameId}/players/{userId}` com os dados escolhidos (nome, totem, cor, dinheiro inicial, etc.).
            *   Atualizar o documento do jogo (`/games/{gameId}`) para mudar o status de `'waiting'` para `'active'`.
            *   Usar um `writeBatch` do Firestore para garantir que ambas as operações sejam atómicas.
            *   Redirecionar o utilizador para a página do jogo: `/game/[id]`.

4.  **`src/app/game/[id]/page.tsx` (Tela do Jogo)**
    *   **Visual Principal:** Um tabuleiro de jogo 11x11, criado com CSS Grid.
        *   Os 4 cantos são quadrados grandes (`go`, `jail`, `free-parking`, `go-to-jail`).
        *   As laterais são retângulos com as informações das propriedades.
        *   O centro do tabuleiro deve exibir o logo, as pilhas de cartas "Sorte" e "Baú", as notificações do jogo e o componente de ações do jogador.
    *   **Componentes-Chave:**
        *   **`GameBoard`**: Renderiza a estrutura do tabuleiro e os espaços.
        *   **`PlayerToken`**: Representa o peão do jogador, posicionado no espaço correto do tabuleiro. Deve usar `framer-motion` para animações suaves.
        *   **`GameActions`**: Um painel com os dados (dois componentes `DiceIcon`) e botões para "Rolar Dados", "Gerenciar Propriedades" e "Encerrar Turno". A lógica de desativar botões com base no estado do jogo (ex: já rolou, está na prisão) é crucial.
        *   **`PropertyCard`**: Um `Dialog` que aparece ao clicar numa propriedade, mostrando os seus detalhes (preço, aluguer, etc.) e um botão para "Comprar".
        *   **`ManagePropertiesDialog`**: Um `Dialog` para construir/vender casas e hipotecar propriedades.
        *   **`GameNotifications`**: Exibe notificações flutuantes e animadas para ações do jogo (ex: "Você parou em...", "Você pagou...").
    *   **Lógica do Jogo (Hooks e State):**
        *   Usar os hooks `useDoc` e `useCollection` para obter dados do jogo e do jogador em tempo real do Firestore. **É crucial que as referências do Firestore passadas para estes hooks sejam memoizadas com `useMemo` para evitar loops infinitos.**
        *   A lógica principal do turno reside nesta página: `handleDiceRoll`, `handleLandedOnSpace`, `handleBuyProperty`, `applyCardAction`, etc.
        *   As ações do jogador devem atualizar o estado no Firestore (ex: `updatePlayerInFirestore`), e a UI deve reagir a essas mudanças de dados.

---

## 4. Dados Estáticos do Jogo

O arquivo `src/lib/game-data.ts` deve exportar todos os dados estáticos:
*   `boardSpaces`: Um array de 40 objetos, cada um representando um espaço no tabuleiro, com todos os detalhes (nome, preço, alugueres, cor, etc.).
*   `chanceCards` e `communityChestCards`: Arrays de objetos que definem o texto e a ação de cada carta.
*   `totems`: Um array que mapeia um ID de totem ao seu nome e ao componente de ícone `lucide-react` correspondente.

## 5. Tratamento de Erros de Permissão

A aplicação deve ter uma arquitetura robusta para depurar erros de segurança do Firestore.
*   **`FirestorePermissionError` (`src/firebase/errors.ts`):** Uma classe de erro customizada que formata o erro de permissão com contexto detalhado (operação, caminho, dados da requisição) para ser mais fácil de depurar.
*   **`errorEmitter` (`src/firebase/error-emitter.ts`):** Um event emitter global para propagar os erros de permissão.
*   **Lógica de Captura:** Todas as operações de escrita no Firestore (`setDoc`, `updateDoc`, `addDoc`, `writeBatch`) não devem usar `try/catch`. Em vez disso, devem encadear um `.catch()` que cria uma instância de `FirestorePermissionError` e a emite através do `errorEmitter`.
*   **`FirebaseErrorListener` (`src/components/FirebaseErrorListener.tsx`):** Um componente invisível, colocado no layout principal, que ouve os eventos do `errorEmitter` e lança o erro para ser capturado pelo overlay de erro do Next.js, exibindo a mensagem detalhada.
*   **`useCollection` / `useDoc`:** O callback de erro destes hooks também deve implementar a mesma lógica de emissão de `FirestorePermissionError`.

Este prompt detalhado deve fornecer a uma IA todas as informações necessárias para recriar a aplicação MINOPOLIS (versão solo) na stack tecnológica desejada, replicando a sua funcionalidade e estrutura atuais.