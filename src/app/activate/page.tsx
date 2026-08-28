import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentActivationForm } from "./student-activation-form";
import { LecturerActivationForm } from "./lecturer-activation-form";

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <GraduationCap className="mb-1 size-6 text-primary" />
          <CardTitle>Activate your account</CardTitle>
          <CardDescription>
            Verify your identity against university records, then create a password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Tabs defaultValue="student">
            <TabsList className="w-full">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="mt-4">
              <StudentActivationForm />
            </TabsContent>
            <TabsContent value="lecturer" className="mt-4">
              <LecturerActivationForm />
            </TabsContent>
          </Tabs>
          <p className="text-center text-sm text-muted-foreground">
            Already activated?{" "}
            <Link href="/sign-in" className="text-primary underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
