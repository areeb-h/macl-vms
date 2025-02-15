import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Visitor Management System",
  description: "A modern visitor management system for Maldives Airports Company Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "black",
              border: "1px solid #E2E8F0",
              borderRadius: "0.5rem",
            },
            className: "toast-custom",
          }}
          closeButton
          richColors
        />
      </body>
    </html>
  );
}
