import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/.*",
]);

export default clerkMiddleware((auth, req) => {
  // If the route is not public and user is not authenticated, redirect to sign-in
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|quizqube.svg|quizqube_featured.png).*)"],
};