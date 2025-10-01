"use client";

export default function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = "/api/auth/google";
      }}
    >
      Sign In with Google
    </button>
  );
}
