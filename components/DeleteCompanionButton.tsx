"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteCompanion } from "@/lib/actions/companion.actions";

interface DeleteCompanionButtonProps {
    companionId: string;
    companionName: string;
    isAuthor: boolean;
}

const DeleteCompanionButton = ({ companionId, companionName, isAuthor }: DeleteCompanionButtonProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteCompanion(companionId);
                router.push('/companions/manage');
            } catch (err) {
                console.error("Failed to delete companion:", err);
                alert("Failed to delete companion. Please try again.");
            }
        });
    };

    if (!isAuthor) return null;

    return (
        <>
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                disabled={isPending}
            >
                <Image
                    src="/icons/trash.svg"
                    alt="delete"
                    width={16}
                    height={16}
                    className="text-red-600"
                />
                <span className="max-sm:hidden">Delete Companion</span>
            </button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Delete Companion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{companionName}"? This action cannot be undone and will remove all session history.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                disabled={isPending}
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteCompanionButton;
