"use client";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import {
  LayoutDashboard, Users, Receipt, DollarSign, LogOut,
  ShoppingCart, BarChart3, Sparkles, ChevronRight,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

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
    { path: '/manager', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/staff', label: 'Staff', icon: Users },
    { path: '/manager/transactions', label: 'Transactions', icon: Receipt },
    { path: '/manager/closing', label: 'Daily Closing', icon: DollarSign },
    { path: '/manager/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/manager') return pathname === '/manager';
    return pathname.startsWith(path);
  };

  if (isPending || !session) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[350px] bg-[radial-gradient(ellipse,rgba(201,168,76,0.05)_0%,transparent_70%)] pointer-events-none" />

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
                  Manager Portal
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
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="rounded-xl h-10 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    tooltip="Logout"
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* User footer */}
          <SidebarFooter className="p-4 border-t border-border/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/30">
              <Avatar className="size-9 rounded-lg border border-primary/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm rounded-lg">
                  {session?.user?.name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold truncate leading-tight">{session?.user?.name || 'Manager'}</span>
                <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">Manager</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 sticky top-0 bg-background/90 backdrop-blur-xl z-20 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-5 w-px bg-border/40 hidden md:block" />
              <span className="text-sm font-semibold text-muted-foreground hidden md:block">
                Manager Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="h-5 w-px bg-border/40" />
              <Button asChild size="sm" className="rounded-xl h-9 px-4 font-bold bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:bg-primary/90">
                <Link href="/cashier">
                  <ShoppingCart className="size-4 mr-1.5" />
                  Cashier
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
