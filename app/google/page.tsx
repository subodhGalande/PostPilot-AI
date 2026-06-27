"use client";

import { Button } from "@/components/ui/button";

export default function GoogleLoginButton() {
  return (
    <Button
      type="button"
      onClick={() => {
        window.location.href = "/api/auth/google";
      }}
    >
      Sign In with Google
    </Button>
  );
}
