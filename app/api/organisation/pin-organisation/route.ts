import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/* -------------------------------- POST (Pin Organisation) -------------------------------- */

export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { organisationId, order } = await req.json();

        if (!organisationId || !mongoose.Types.ObjectId.isValid(organisationId)) {
            return NextResponse.json(
                { message: "Invalid organisationId" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ clerkUserId: clerkUser.id });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Prevent duplicate pin
        const alreadyPinned = user.pinnedOrganisations.some(
            (pin: any) => pin.organisationId.toString() === organisationId
        );

        if (alreadyPinned) {
            return NextResponse.json(
                { message: "Organisation already pinned" },
                { status: 409 }
            );
        }

        user.pinnedOrganisations.push({
            organisationId,
            order: order ?? user.pinnedOrganisations.length,
        });

        await user.save();

        return NextResponse.json({
            message: "Organisation pinned successfully",
            pinnedOrganisations: user.pinnedOrganisations,
        });
    } catch (error) {
        console.error("Pin organisation error:", error);
        return NextResponse.json(
            { message: "Failed to pin organisation" },
            { status: 500 }
        );
    }
}

/* -------------------------------- DELETE (Unpin Organisation) -------------------------------- */

export async function DELETE(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { organisationId } = await req.json();

        if (!organisationId || !mongoose.Types.ObjectId.isValid(organisationId)) {
            return NextResponse.json(
                { message: "Invalid organisationId" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { clerkUserId: clerkUser.id },
            {
                $pull: {
                    pinnedOrganisations: {
                        organisationId,
                    },
                },
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Organisation unpinned successfully",
            pinnedOrganisations: user.pinnedOrganisations,
        });
    } catch (error) {
        console.error("Unpin organisation error:", error);
        return NextResponse.json(
            { message: "Failed to unpin organisation" },
            { status: 500 }
        );
    }
}

/* -------------------------------- GET (Fetch Pinned Organisations) -------------------------------- */

export async function GET() {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ clerkUserId: clerkUser.id })
            .populate("pinnedOrganisations.organisationId")
            .select("pinnedOrganisations");

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            pinnedOrganisations: user.pinnedOrganisations,
        });
    } catch (error) {
        console.error("Get pinned organisations error:", error);
        return NextResponse.json(
            { message: "Failed to fetch pinned organisations" },
            { status: 500 }
        );
    }
}
