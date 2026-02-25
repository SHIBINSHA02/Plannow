import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Organisation from "@/models/Organisation";

/**
 * GET profile
 */
export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId }).lean();
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const organisations = await Organisation.find({
        _id: user.organisationId,
    })
        .select("name organisationId")
        .lean();

    return NextResponse.json({
        user: {
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            role: user.role,
        },
        organisations,
    });
}

/**
 * UPDATE profile image URL
 */
export async function PUT(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
        return NextResponse.json(
            { message: "imageUrl is required" },
            { status: 400 }
        );
    }

    await connectDB();

    await User.findOneAndUpdate(
        { clerkUserId: userId },
        { imageUrl }
    );

    return NextResponse.json({ success: true });
}

/**
 * API Routes for General User Profile
 * 
 * GET /api/profile
 * - Fetches basic user info (name, email, role, imageUrl).
 * - Lists organizations associated with the user.
 * 
 * PUT /api/profile
 * - Updates the user's profile image URL.
 */
