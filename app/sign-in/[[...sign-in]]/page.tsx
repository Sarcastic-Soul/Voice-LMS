import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <SignIn
                appearance={{
                    elements: {
                        card: "shadow-lg border border-black rounded-xl p-6",
                        headerTitle: "text-2xl font-bold",
                        formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
                    },
                }}
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
            />
        </main>
    );
}
