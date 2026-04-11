"use client";

import { LogOut, Clock, ShieldAlert } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <ShieldAlert className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-3">Account Pending Approval</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your account has been created successfully, but it requires manager approval 
            before you can access the POS system. Please contact your manager to activate your account.
          </p>
        </div>

        <div className="pt-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
