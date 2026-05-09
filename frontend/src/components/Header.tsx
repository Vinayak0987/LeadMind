"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ toggleSidebar, isSidebarOpen }: { toggleSidebar?: () => void, isSidebarOpen?: boolean }) {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            const API = process.env.NEXT_PUBLIC_API_URL || "/api";
            fetch(`${API}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(console.error);
        }
    }, []);

    const userDisplay = user?.company_name || user?.email || "";
    // On the client, check if we have a token loosely to know if we should show logout
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("access_token"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    };

    const navItems = [
        { name: "Dashboard",     path: "/",              icon: "dashboard" },
        { name: "The Leads",     path: "/ledger",         icon: "table_chart" },
        { name: "Pipeline",      path: "/pipeline",       icon: "view_kanban" },
        { name: "Task Board",    path: "/tasks",          icon: "task_alt" },
        { name: "Live Tracking", path: "/tracking",       icon: "radar" },
        { name: "Upload Leads",  path: "/upload",         icon: "cloud_upload" },
        { name: "Multi-Channel Designer",path: "/designer", icon: "draw" },
        { name: "Agent Monitor", path: "/agents",         icon: "memory", badge: "RUNNING" },
        { name: "Settings",      path: "/settings",       icon: "settings" },
    ];

    return (
        <header className="bg-ink text-paper h-12 flex items-center justify-between px-4 sm:px-6 border-b border-ink shrink-0 z-50 relative">
            <div className="flex items-center gap-3">
                {/* Mobile Dropdown Toggle */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="md:hidden flex items-center justify-center w-8 h-8 hover:bg-paper/10 transition-colors rounded"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Desktop Sidebar Toggle */}
                {toggleSidebar && (
                    <button 
                        onClick={toggleSidebar} 
                        className="hidden md:flex items-center justify-center w-8 h-8 hover:bg-paper/10 transition-colors rounded"
                    >
                        <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
                    </button>
                )}

                <div className="w-8 h-8 hidden sm:flex items-center justify-center">
                    <img src="/logo.png" alt="LeadMind" className="w-full h-full object-contain" />
                </div>
                <Link href="/" className="font-display font-bold text-xl tracking-tight hover:text-primary transition-colors">
                    LeadMind
                </Link>
            </div>

            <div className="flex items-center gap-6 font-mono text-sm">
                <div className="flex items-center gap-2 hidden lg:flex">
                    <span className="w-2 h-2 bg-data-green rounded-full animate-pulse"></span>
                    <span>SYSTEM ONLINE</span>
                </div>

                <div className="border-l border-white/20 pl-4 sm:pl-6 flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <span className="uppercase text-paper/70 hidden sm:inline-block">COMPANY: <span className="text-paper font-bold">{userDisplay || "Loading..."}</span></span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 text-xs border border-paper/30 hover:bg-paper hover:text-ink transition-colors uppercase font-bold"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 sm:gap-3">
                            <Link href="/login" className="px-3 sm:px-4 py-1.5 text-xs hover:text-primary transition-colors uppercase font-bold">
                                Sign In
                            </Link>
                            <Link href="/signup" className="px-3 sm:px-4 py-1.5 text-xs bg-primary text-white hover:bg-white hover:text-ink transition-colors uppercase font-bold">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-12 left-0 right-0 bg-ink border-b border-paper/20 shadow-xl md:hidden flex flex-col z-40 max-h-[calc(100vh-3rem)] overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-6 py-4 border-b border-paper/10 transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-paper hover:bg-paper/10'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                <span className={`font-display text-sm tracking-wide uppercase ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                                {item.badge && (
                                    <span className="ml-auto font-mono text-xs bg-mute px-1 border border-ink text-ink">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
