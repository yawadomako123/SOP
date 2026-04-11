import { prisma } from "@/lib/prisma";
import { Users, ShieldAlert, BadgeCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomersTab() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Staff Directory</h2>
        <p className="text-muted-foreground mt-1">Manage system access and roles across the portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((u) => {
          const isAdmin = u.role === "ADMIN";
          const isManager = u.role === "MANAGER";
          
          return (
            <div key={u.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    isAdmin ? "bg-purple-500/10 text-purple-500" :
                    isManager ? "bg-blue-500/10 text-blue-500" :
                    "bg-green-500/10 text-green-500"
                  }`}>
                    {isAdmin ? <ShieldAlert className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{u.name}</h3>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    isAdmin ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                    isManager ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    "bg-green-500/10 text-green-500 border-green-500/20"
                  }`}>
                    {u.role}
                  </span>
                </div>
                {u.emailVerified && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <BadgeCheck className="w-4 h-4" /> Verified
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
