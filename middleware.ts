import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/profile(.*)",
]);

const isPublicRoute = createRouteMatcher([
    "/",
    "/unauthorized"
])

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)){
        return;
    }
    const session = await auth(); 

    if (isProtectedRoute(req) && !session.userId) {
        return session.redirectToSignIn(); 
    }
});

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)"],
};
