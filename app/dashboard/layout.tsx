import { redirect } from "next/navigation";
import { requireAuthJose } from "@/lib/auth/requireAuthJose";
import DashboardShell from "./dashboard-shell";
import prisma from "@/lib/prisma";
import { UserContextProvider } from "@/app/context/userDetailsContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthJose();

  if (!user) {
    redirect("/login");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      provider: true,
      onboarded: true,
      accountName: true,
      industry: true,
      accountType: true,
      description: true,
      createdAt: true,
    },
  });

  if (!userData) {
    redirect("/login");
  }

  return (
    <UserContextProvider user={userData}>
      <DashboardShell>{children}</DashboardShell>
    </UserContextProvider>
  );
}
