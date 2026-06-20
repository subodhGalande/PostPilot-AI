"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DangerSection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationKey: ["deleteAccount"],
    mutationFn: async (): Promise<unknown> => {
      const res = await fetch("/api/dashboard/settings/account", {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to delete account");
      }
      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account.",
      );
    },
  });

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Irreversible actions affecting your account.
        </p>
      </div>

      <div className="rounded-xl border border-destructive/50 bg-card p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-destructive">Delete Account</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl p-0 sm:max-w-md">
              <DialogHeader>
                <div className="flex items-start gap-4 px-6 py-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <DialogTitle className="text-left">
                      Delete account?
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-left leading-6">
                      This will permanently delete your account, drafts, posts,
                      and all associated data. This action cannot be undone.
                    </DialogDescription>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Type{" "}
                        <span className="font-medium text-foreground">
                          DELETE
                        </span>{" "}
                        to confirm.
                      </p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                      />
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter className="px-6 py-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setConfirmText("");
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={
                    confirmText !== "DELETE" || deleteMutation.isPending
                  }
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <AlertTriangle />
                  )}
                  {deleteMutation.isPending
                    ? "Deleting..."
                    : "Delete my account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
