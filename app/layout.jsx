import "./globals.css";

export const metadata = {
  title: "ALBERTO FIERZ — Escola Técnica Integrada",
  description:
    "ALBERTO FIERZ: Ensino Médio Técnico Integrado. Avisos, cursos, projetos, jornal semanal e localização.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
