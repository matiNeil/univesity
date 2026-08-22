import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth is enforced per-resource (see requirePortal() in each portal layout,
// and getAppUser()/auth() in onboarding and API routes) rather than here,
// per Clerk's guidance to move away from path-matching-based middleware auth.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
