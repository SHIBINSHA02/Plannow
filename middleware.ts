import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const session = await auth(); 

    if (isProtectedRoute(req) && !session.userId) {
        return session.redirectToSignIn(); 
    }
});

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)"],
};
