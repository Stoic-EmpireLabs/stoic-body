import type { Metadata } from "next";
import "./globals.css";
import { StoicProvider } from "@/context/StoicContext";
import Header from "@/components/Header";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Stoic Body — Discipline, Movement & Sovereign Life Game",
  description: "Offline-first, addictive 5-tier gamified life coordination, calisthenics, OMAD nutrition, and Stoic wisdom engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-white min-h-screen pb-16 antialiased selection:bg-red-900 selection:text-white">
        <StoicProvider>
          <Header />
          <Nav />
          <main className="max-w-4xl mx-auto px-4 mt-6">{children}</main>
        </StoicProvider>
      </body>
    </html>
  );
}
