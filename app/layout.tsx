import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "CWSbooks - Discover Your Next Great Read",
  description: "A freemium book reading platform. Read preview chapters for free, subscribe for full access.",
  keywords: "books, reading, literature, ebooks, online reading",
  authors: [{ name: "CWSbooks Team" }],
  openGraph: {
    title: "CWSbooks - Discover Your Next Great Read",
    description: "A freemium book reading platform. Read preview chapters for free, subscribe for full access.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}