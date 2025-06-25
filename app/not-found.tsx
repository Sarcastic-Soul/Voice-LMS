import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <Ghost className="size-20 text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold">Page Not Found</h1>
            <p className="mt-2 text-muted-foreground text-lg max-w-md">
                Oops, the page you're looking for doesn’t exist or has been moved.
            </p>
            <Link href="/" className="mt-6">
                <Button className="btn-primary px-6 py-3 text-lg">Go Home</Button>
            </Link>
        </main>
    );
}
