"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleX } from "lucide-react";
import Link from "next/link";

export default function VerifyErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-xs w-full text-center shadow-md shadow-border/70">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            <CircleX className="mx-auto my-2 h-10 w-10 text-destructive" />
            Verification Failed
          </CardTitle>
          <CardDescription>
            This verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-6">
          Please sign up again to receive a new verification email.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/signup">Back to Sign Up</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
