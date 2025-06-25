"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
} from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";

export default function LandingPage() {
    const [loadingSignIn, setLoadingSignIn] = useState(false);
    const [loadingSignUp, setLoadingSignUp] = useState(false);
    const [loadingDashboard, setLoadingDashboard] = useState(false);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in">
            <section className="mb-6 space-y-4 flex flex-col items-center text-center">
                <Image src="images/logo.svg" alt="cta" width={250} height={100} />
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight max-w-3xl text-balance">
                    Learn Smarter, Speak Louder
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                    Voice-powered LMS that lets you teach, learn, and ask — hands-free. Powered by AI, designed for flow.
                </p>
            </section>

            <div className="flex flex-wrap gap-4 mt-6">
                <SignedOut>
                    <SignUpButton>
                        <Button
                            className="btn-primary text-lg px-6 py-3"
                            onClick={() => setLoadingSignUp(true)}
                            disabled={loadingSignUp}
                        >
                            {loadingSignUp ? (
                                <>
                                    <Loader2 className="mr-2 size-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="ml-2 size-5" />
                                </>
                            )}
                        </Button>
                    </SignUpButton>

                    <SignInButton>
                        <Button
                            variant="outline"
                            className="border border-black text-lg px-6 py-3"
                            onClick={() => setLoadingSignIn(true)}
                            disabled={loadingSignIn}
                        >
                            {loadingSignIn ? (
                                <>
                                    <Loader2 className="mr-2 size-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    <Link href="/dashboard">
                        <Button
                            className="btn-secondary text-lg px-6 py-3"
                            onClick={() => setLoadingDashboard(true)}
                            disabled={loadingDashboard}
                        >
                            {loadingDashboard ? (
                                <>
                                    <Loader2 className="mr-2 size-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Go to Dashboard"
                            )}
                            <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </Link>
                </SignedIn>
            </div>

            <div className="mt-14 max-w-4xl text-left text-muted-foreground">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                    <li className="flex gap-3 items-start">
                        <span className="text-primary">•</span> Voice-enabled lectures & assessments
                    </li>
                    <li className="flex gap-3 items-start">
                        <span className="text-primary">•</span> Interactive transcripts with instant feedback
                    </li>
                    <li className="flex gap-3 items-start">
                        <span className="text-primary">•</span> AI-powered tutoring and note-taking
                    </li>
                    <li className="flex gap-3 items-start">
                        <span className="text-primary">•</span> Minimalist, accessible interface
                    </li>
                </ul>
            </div>
        </main>
    );
}