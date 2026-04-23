"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  LogOut,
  Box,
  List,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: List },
    { path: '/admin/inventory', label: 'Inventory', icon: Box },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(201,168,76,0.05)_0%,transparent_70%)] pointer-events-none" />

        <Sidebar variant="inset" side="left" className="border-r border-border/50">
          {/* Logo */}
          <SidebarHeader className="p-6 border-b border-border/30">
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center glow-primary">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm leading-tight tracking-tight text-foreground">
                  Evan&apos;s Couture
                </span>
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">
                  Admin Portal
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold px-2 mb-1">
                Navigation
              </SidebarGroupLabel>
              <SidebarMenu className="gap-0.5">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={item.label}
                      className="rounded-xl h-10 font-medium data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:border data-[active=true]:border-primary/20"
                    >
                      <Link href={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <div className="gold-divider my-4" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold px-2 mb-1">
                System
              </SidebarGroupLabel>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" className="rounded-xl h-10 font-medium">
                    <Link href="/admin/settings">
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="rounded-xl h-10 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    tooltip="End Session"
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* User profile */}
          <SidebarFooter className="p-4 border-t border-border/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/30">
              <Avatar className="size-9 rounded-lg border border-primary/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm rounded-lg">
                  {session?.user?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold truncate leading-tight">{session?.user?.name || 'Administrator'}</span>
                <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">Root Admin</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 sticky top-0 bg-background/90 backdrop-blur-xl z-20 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <div className="h-5 w-px bg-border/40 hidden md:block" />
              <div className="relative max-w-sm w-full hidden lg:block group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search..."
                  className="h-9 pl-10 bg-secondary/40 border-transparent focus:bg-card focus:border-border rounded-xl text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl size-9 relative">
                <Bell className="size-4" />
                <span className="absolute top-2 right-2 size-1.5 bg-primary rounded-full" />
              </Button>
              <ThemeToggle />
              <div className="h-5 w-px bg-border/40" />
              <Button asChild size="sm" className="rounded-xl h-9 px-4 font-bold shadow-md shadow-primary/15 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/cashier">
                  <ShoppingBag className="size-4 mr-1.5" />
                  Store Front
                </Link>
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto animate-in">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
