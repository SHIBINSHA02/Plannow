import { clerkClient } from "@clerk/nextjs/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function syncUser(clerkUserId: string) {
    await connectDB();

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    await User.findOneAndUpdate(
        { clerkUserId },
        {
            clerkUserId,
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
            email: clerkUser.emailAddresses[0]?.emailAddress,
            imageUrl: clerkUser.imageUrl,
        },
        { upsert: true, new: true }
    );
}
