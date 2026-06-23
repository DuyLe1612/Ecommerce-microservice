// layout cho client
import Header from "@/components/MainLayout/Header/Header";
import "../../styles/globals.css";
import Footer from "@/components/MainLayout/Footer/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import { Container } from "@/components/MainLayout/Container";
import { Metadata } from "next";
import { Toaster } from "sonner";

// Đặt metadata cho layout
export const metadata: Metadata = {
  title: {
    template: "%s - Tekno online store",
    default: "Tekno - online store",
  },
  description: "technology online shopping",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className="bg-background text-foreground flex flex-col min-h-screen antialiased selection:bg-primary selection:text-black">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
