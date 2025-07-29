"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleBookmark, deleteCompanion } from "@/lib/actions/companion.actions";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  isBookmarked: boolean;
  showDeleteButton?: boolean; // Optional prop to show delete button only for user's own companions
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  isBookmarked,
  showDeleteButton = false,
}: CompanionCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBookmark = () => {
    startTransition(async () => {
      try {
        await toggleBookmark(id, !isBookmarked);
        router.refresh();
      } catch (err) {
        console.error("Failed to toggle bookmark:", err);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCompanion(id);
        router.refresh();
        setShowDeleteConfirm(false);
      } catch (err) {
        console.error("Failed to delete companion:", err);
        alert("Failed to delete companion. Please try again.");
      }
    });
  };

  return (
    <>
      <article className="companion-card" style={{ backgroundColor: color }}>
        <div className="flex justify-between items-center">
          <div className="subject-badge">{subject}</div>
          <div className="flex items-center gap-2">
            <button className="companion-bookmark" onClick={handleBookmark}>
              <Image
                src={
                  isBookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"
                }
                alt="bookmark"
                width={12.5}
                height={15}
              />
            </button>
            {showDeleteButton && (
              <button
                className="companion-bookmark bg-red-500 hover:bg-red-600"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
              >
                <Image
                  src="/icons/trash.svg"
                  alt="delete"
                  width={12.5}
                  height={15}
                  className="brightness-0 invert"
                />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm">{topic}</p>
        <div className="flex items-center gap-2">
          <Image
            src="/icons/clock.svg"
            alt="duration"
            width={13.5}
            height={13.5}
          />
          <p className="text-sm">{duration} minutes</p>
        </div>

        <Link href={`/companions/${id}`} className="w-full">
          <button className="btn-primary w-full justify-center">
            Launch Lesson
          </button>
        </Link>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Companion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{name}"? This action cannot be undone.
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

export default CompanionCard;
