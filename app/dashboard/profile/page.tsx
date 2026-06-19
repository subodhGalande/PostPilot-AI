import { redirect } from "next/navigation";
import { requireAuthJose } from "@/lib/auth/auth";
import ProfilePage from "@/components/profile/profile-page";

export default async function ProfilePageRoute() {
  const authUser = await requireAuthJose();

  if (!authUser || !authUser.id) {
    redirect("/login");
  }

  return <ProfilePage />;
}
