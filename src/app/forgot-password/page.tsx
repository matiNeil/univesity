import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RequestForm } from "./request-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <GraduationCap className="mb-1 size-6 text-primary" />
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter the email address on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
