import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function OrganisationLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ organisationId: string }>;
}) {
    // 🔴 IMPORTANT: unwrap params
    const { organisationId } = await params;

    // ---------- AUTH ----------
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    await connectDB();

    // ---------- GET LOCAL USER ----------
    const user = await User.findOne({ clerkUserId: userId });

    if (!user?.email) {
        throw new Error("Synced user or email not found in DB");
    }

    // ---------- ORG ACCESS ----------
    const organisation = await Organisation.findOne({
        organisationId,
        $or: [
            { adminName: user.email },
            { editors: user.email },
        ],
    });

    if (!organisation) {
        redirect("/unauthorized");
    }

    return <>{children}</>;
}
