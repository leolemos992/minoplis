// Forçando a recompilação para resolver o erro de generateStaticParams.
import ClientPage from './client-page';

// Esta função é necessária para a exportação estática de rotas dinâmicas.
// Ela informa o Next.js para não pré-renderizar nenhuma página de jogo durante a compilação.
export async function generateStaticParams() {
  return [];
}

export default function GamePage() {
  return <ClientPage />;
}
