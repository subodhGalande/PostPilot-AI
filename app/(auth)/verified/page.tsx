"use client";

import { useRouter } from "next/navigation";
import EmailVerificationCard from "@/components/email-verification-card";

const UserVerified = () => {
  const router = useRouter();

  setTimeout(() => {
    router.push("/login");
  }, 2000);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <EmailVerificationCard />
    </div>
  );
};

export default UserVerified;
