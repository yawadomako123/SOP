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
  User as UserIcon,
  ChevronRight
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
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <Sidebar variant="inset" side="left" className="border-r-0">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutDashboard className="size-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight uppercase tracking-tight">POS Admin</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Management Suite</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-2">
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.path)}
                      tooltip={item.label}
                    >
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>System Control</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Platform Settings">
                    <Link href="/admin/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    tooltip="End Session"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-border/50">
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50">
              <Avatar className="size-10 rounded-xl border-2 border-background">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {session?.user?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{session?.user?.name || 'Administrator'}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase truncate tracking-widest">Root Level</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background/20 overflow-hidden flex flex-col">
          {/* Dashboard Header */}
          <header className="h-20 flex items-center justify-between px-8 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
            <div className="flex items-center gap-6 flex-1">
              <SidebarTrigger className="-ml-3" />
              <div className="h-6 w-px bg-border/40 hidden md:block" />
              <div className="relative max-w-md w-full hidden lg:block group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Global search command..." 
                  className="h-11 pl-11 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-xl relative">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background ring-offset-0" />
              </Button>
              <ThemeToggle />
              <div className="h-8 w-px bg-border/40" />
              <Button asChild className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                <Link href="/cashier">
                  Store Front
                </Link>
              </Button>
            </div>
          </header>

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-7xl mx-auto space-y-8 animate-in">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
