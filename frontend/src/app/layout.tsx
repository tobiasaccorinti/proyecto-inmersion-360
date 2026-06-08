import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const body = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Inspira — Orientación vocacional real",
  description: "Conectamos estudiantes secundarios con el mundo profesional",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${heading.variable} ${body.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}