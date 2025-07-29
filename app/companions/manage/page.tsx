import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompanions } from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/CompanionCard";
import { getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const ManageCompanions = async () => {
    const user = await currentUser();

    if (!user) redirect("/sign-in");

    const companions = await getUserCompanions(user.id);

    return (
        <main>
            <section className="flex justify-between items-center gap-4 max-sm:flex-col">
                <h1>My Companions ({companions.length})</h1>
                <Link href="/companions/new" className="btn-primary">
                    <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
                    <span>Create New Companion</span>
                </Link>
            </section>

            {companions.length === 0 ? (
                <section className="flex flex-col items-center justify-center py-16 text-center">
                    <Image src="/images/cta.svg" alt="No companions" width={300} height={200} />
                    <h2 className="text-2xl font-bold mt-6 mb-4">No Companions Yet</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        Create your first AI companion to start personalized voice learning sessions.
                    </p>
                    <Link href="/companions/new" className="btn-primary">
                        <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
                        <span>Create Your First Companion</span>
                    </Link>
                </section>
            ) : (
                <section className="companions-grid">
                    {companions.map((companion) => (
                        <CompanionCard
                            key={companion.id}
                            {...companion}
                            color={getSubjectColor(companion.subject)}
                            showDeleteButton={true}
                        />
                    ))}
                </section>
            )}
        </main>
    );
};

export default ManageCompanions;
