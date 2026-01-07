import { redirect } from "next/navigation";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthJose();

  console.log(user)

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
