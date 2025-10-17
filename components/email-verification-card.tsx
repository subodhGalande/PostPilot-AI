import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CircleCheck } from "lucide-react";
import Link from "next/link";

export default function EmailVerificationCard() {
  return (
    <Card className="max-w-xs w-full text-center shadow-md shadow-border/70">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          <CircleCheck className="mx-auto my-2 h-10 w-10" />
          Email Verified{" "}
        </CardTitle>
        <CardDescription>
          Your email address has been verified successfully!
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground flex items-end leading-6"></CardContent>
      <CardFooter className=" flex text-center mx-auto text-muted-foreground text-sm justify-between">
        Redirecting to login page
      </CardFooter>
    </Card>
  );
}
