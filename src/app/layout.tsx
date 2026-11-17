import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hamza Ben Tekaya — Engineering Portfolio",
  description:
    "Personal portfolio of Hamza Ben Tekaya — prospective Electrical & Electronic Engineering student, Technical Baccalaureate graduate with Highest Honors (Mention Très Bien, 17.05/20), and founder of multiple ventures.",
  authors: [{ name: "Hamza Ben Tekaya" }],
  keywords: [
    "Hamza Ben Tekaya",
    "Electrical Engineering",
    "Mechatronics",
    "Semiconductors",
    "Tunisia",
    "Sousse",
    "IPEIM",
  ],
  openGraph: {
    title: "Hamza Ben Tekaya — Engineering Portfolio",
    description:
      "Electrical & Electronic Engineering student, entrepreneur, and photographer based in Sousse, Tunisia.",
    locale: "en_US",
    type: "website",
  },
};

// This script runs synchronously before React hydrates, preventing a
// flash of the wrong theme. It reads localStorage and sets the class
// on <html> before the first paint.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme script — must run before body renders */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
