
"use client";

import { useState, useTransition } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn, getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteCompanion } from "@/lib/actions/companion.actions";

interface CompanionsListProps {
    title: string;
    companions?: Companion[];
    classNames?: string;
    showDeleteButton?: boolean; // Optional prop to show delete button
}

const CompanionsList = ({ title, companions, classNames, showDeleteButton = false }: CompanionsListProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteCompanion(id);
                router.refresh();
                setDeleteConfirm(null);
            } catch (err) {
                console.error("Failed to delete companion:", err);
                alert("Failed to delete companion. Please try again.");
            }
        });
    };
    return (
        <>
            <article className={cn('companion-list', classNames)}>
                <h2 className="font-bold text-3xl">{title}</h2>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-lg w-2/3">Lessons</TableHead>
                            <TableHead className="text-lg">Subject</TableHead>
                            <TableHead className="text-lg text-right">Duration</TableHead>
                            {showDeleteButton && <TableHead className="text-lg text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companions?.map(({ id, subject, name, topic, duration }) => (
                            <TableRow key={id}>
                                <TableCell>
                                    <Link href={`/companions/${id}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden" style={{ backgroundColor: getSubjectColor(subject) }}>
                                                <Image
                                                    src={`/icons/${subject}.svg`}
                                                    alt={subject}
                                                    width={35}
                                                    height={35} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <p className="font-bold text-2xl">
                                                    {name}
                                                </p>
                                                <p className="text-lg">
                                                    {topic}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="subject-badge w-fit max-md:hidden">
                                        {subject}
                                    </div>
                                    <div className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden" style={{ backgroundColor: getSubjectColor(subject) }}>
                                        <Image
                                            src={`/icons/${subject}.svg`}
                                            alt={subject}
                                            width={18}
                                            height={18}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 w-full justify-end">
                                        <p className="text-2xl">
                                            {duration} {' '}
                                            <span className="max-md:hidden">mins</span>
                                        </p>
                                        <Image src="/icons/clock.svg" alt="minutes" width={14} height={14} className="md:hidden" />
                                    </div>
                                </TableCell>
                                {showDeleteButton && (
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setDeleteConfirm({ id, name })}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                disabled={isPending}
                                                title="Delete companion"
                                            >
                                                <Image
                                                    src="/icons/trash.svg"
                                                    alt="delete"
                                                    width={16}
                                                    height={16}
                                                    className="text-red-500"
                                                />
                                            </button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </article>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Delete Companion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
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
    )
}

export default CompanionsList;