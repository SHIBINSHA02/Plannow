// app/(protected)/dashboard/organisations/[organisationId]/_functions/tools.ts
import { MouseEventHandler, Dispatch, SetStateAction } from "react";

// Define the shape of your organisation matching your type in page.tsx
type Organisation = {
    organisationId: string;
    organisationName: string;
    adminName: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
    allowParallelAssignments?: boolean;
};

interface ToggleArgs {
    organisationId: string;
    organisation: Organisation;
    setOrganisation: Dispatch<SetStateAction<Organisation | null>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

export const createToggleParallelAssignment = ({
    organisationId,
    organisation,
    setOrganisation,
    setLoading
}: ToggleArgs): MouseEventHandler<HTMLButtonElement> => {
    return async () => {
        try {
            setLoading(true);

            const updatedValue = !organisation.allowParallelAssignments;

            const res = await fetch(`/api/organisation/${organisationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    allowParallelAssignments: updatedValue,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update setting");
            }

            setOrganisation((prev) => {
                if (!prev) return null;

                return {
                    ...prev,
                    allowParallelAssignments: updatedValue,
                };
            });

            console.log(data.message);

        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };
};