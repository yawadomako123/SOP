"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createStaffMember } from "./actions";

export default function AddStaffModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Basic polyfill for browsers not supporting dialog (mostly older ones)
    if (dialogRef.current && !dialogRef.current.showModal) {
      dialogRef.current.hidden = true;
    }
  }, []);

  const openModal = () => {
    setError("");
    formRef.current?.reset();
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createStaffMember(formData);

    setIsPending(false);

    if (result.success) {
      // Clear form and close dialog
      formRef.current?.reset();
      closeModal();
    } else {
      setError(result.error || "Failed to create staff member");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>Add Staff Member</span>
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/50 backdrop:backdrop-blur-sm 
        p-0 rounded-xl shadow-xl w-full max-w-md bg-card 
        text-card-foreground border border-border fixed inset-0 m-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Register New Staff</h2>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isPending}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
                placeholder="e.g. Ama Ansah"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
                placeholder="ama@EvansCouture.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1.5" htmlFor="password">
                Temporary Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={isPending}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1.5" htmlFor="role">
                Assigned Role
              </label>
              <select
                id="role"
                name="role"
                required
                disabled={isPending}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                defaultValue="CASHIER"
              >
                <option value="CASHIER">Cashier (Standard Access)</option>
                <option value="MANAGER">Manager (Elevated Access)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inserting...</span>
                  </>
                ) : (
                  <span>Add Staff Member</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
