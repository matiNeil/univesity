import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <GraduationCap className="mb-1 size-6 text-primary" />
          <CardTitle>Sign in to UniSmart</CardTitle>
          <CardDescription>Students use their registration number; staff use their staff number or university email.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            New student or lecturer?{" "}
            <Link href="/activate" className="text-primary underline underline-offset-2">
              Activate your account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
