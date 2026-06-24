// layout cho client
import AdminHeader from "@/components/admin/AdminHeader";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RouteGuard from "@/components/auth/RouteGuard";

// Đặt metadata cho layout
export const metadata = {
  title: "Tekno",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a] text-gray-200 antialiased selection:bg-primary/30 relative">
        {/* Subtle background glow effect */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
        <AuthProvider>
          <RouteGuard role="admin">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
              <AdminSidebar />
              <main className="flex-1 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
