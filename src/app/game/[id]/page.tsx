import ClientPage from './client-page';

// This function is required for static export of dynamic routes.
// It tells Next.js not to pre-render any game pages at build time.
export async function generateStaticParams() {
  return [];
}

export default function GamePage() {
  return <ClientPage />;
}
