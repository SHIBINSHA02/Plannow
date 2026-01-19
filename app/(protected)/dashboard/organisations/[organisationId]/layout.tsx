import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import { notFound } from "next/navigation";

export default async function OrganisationLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { organisationId: string };
}) {
    // ✅ MUST await auth()
    const authData = await auth();

    const userId = authData.userId;
    const sessionClaims = authData.sessionClaims;

    if (!userId) {
        notFound();
    }

    const email =
        sessionClaims?.email ||
        sessionClaims?.primaryEmailAddress;

    if (!email) {
        notFound();
    }

    await connectDB();

    const organisation = await Organisation.findOne({
        organisationId: params.organisationId,
        $or: [
            { adminName: email },
            { editors: email },
        ],
    });

    if (!organisation) {
        notFound();
    }

    // ✅ All children are now protected
    return <>{children}</>;
}
