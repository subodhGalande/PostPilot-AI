"use client";

import { LogoutButton } from "@/components/logout-button";
import { useUser } from "@/app/context/userDetailsContext";

export default function DashboardPage() {
  const { user } = useUser();
  console.log(user);
  return (
    <>
      <LogoutButton />
      <div className="text-black"> {user?.id} </div>
    </>
  );
}
