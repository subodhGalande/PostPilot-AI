import { redirect } from "next/navigation";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const user = await requireAuthJose();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <LogoutButton />
      <div>Dashboard</div>
    </>
  );
}
