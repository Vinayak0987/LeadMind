"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const API = process.env.NEXT_PUBLIC_API_URL || "/api";
    // Verify token with backend
    fetch(`${API}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    })
    .catch(() => {
      // In case of network error, we might want to still show the UI if it's just a temporary glitch
      // but for security/correctness, we'll keep it as is.
      setIsAuthorized(true); 
    });
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-ink text-paper font-mono text-sm uppercase">
        <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-ink bg-mute">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 flex flex-col overflow-y-auto bg-grid-pattern relative">
          {children}
        </main>
      </div>
    </div>
  );
}