"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart3,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-primary",
  },
  {
    label: "Transactions",
    icon: CreditCard,
    href: "/transactions",
    color: "text-sky-500",
  },
  {
    label: "Subscriptions",
    icon: Wallet,
    href: "/subscriptions",
    color: "text-violet-500",
  },
  {
    label: "Insights",
    icon: BarChart3,
    href: "/insights",
    color: "text-pink-500",
  },
];

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  return (
    <header className="h-16 border-b bg-card flex items-center px-4 md:px-6 shadow-sm justify-between">
      <div className="flex items-center md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 -ml-2"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="px-4 py-6 flex flex-col h-full bg-card">
              <Link
                href="/dashboard"
                className="flex items-center mb-10"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative w-8 h-8 mr-3 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl">
                  F
                </div>
                <h1 className="text-xl font-bold">Agentic AI</h1>
              </Link>
              <div className="space-y-2 flex-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                      pathname === route.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="font-semibold text-lg text-primary">FinanceApp</div>
      </div>

      <div className="flex-1"></div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full overflow-hidden relative border-muted-foreground/20"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-muted hidden sm:flex"
        >
          <User className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 border-muted-foreground/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
