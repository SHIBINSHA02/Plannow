import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Organisation from "@/models/Organisation";
import User from "@/models/User";

export async function GET() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            clerkUserId: clerkUser.id
        });

        if (!user || !user.email) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const organisations = await Organisation.find({
            adminName: user.email
        });

        return NextResponse.json({
            count: organisations.length,
            organisations
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to fetch organisations" },
            { status: 500 }
        );
    }
}
