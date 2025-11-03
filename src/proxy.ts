import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/resumes(.*)",
  "/editor(.*)",
  "/dashboard(.*)",
  "/jobs/create(.*)",
  "/jobs/edit(.*)",
  "/billing(.*)",
  "/api/linkedin/analyze(.*)", // Add the API route
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // Enforce authentication for protected routes
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};