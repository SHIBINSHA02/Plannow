import { clerkClient } from "@clerk/nextjs/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
export async function syncUser(clerkUserId: string) {
    await connectDB();

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    const existingUser = await User.findOne({ clerkUserId });

    if (!existingUser) {
        // New user
        await User.create({
            clerkUserId,
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
            email: clerkUser.emailAddresses[0]?.emailAddress,
            imageUrl: clerkUser.imageUrl,
        });
        return;
    }

    // Existing user → do NOT overwrite imageUrl
    await User.updateOne(
        { clerkUserId },
        {
            $set: {
                name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
                email: clerkUser.emailAddresses[0]?.emailAddress,
            },
        }
    );
}
