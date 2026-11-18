import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Shunyi Garments | Management System",
  description: "Garments ERP with MongoDB and automatic local JSON fallback",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
