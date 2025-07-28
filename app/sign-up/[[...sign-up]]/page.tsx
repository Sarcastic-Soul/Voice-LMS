import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-6xl flex rounded-4xl border border-black bg-white shadow-xl overflow-hidden">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 text-white">
                            <Image
                                src="/images/logo.svg"
                                alt="logo"
                                width={46}
                                height={44}
                                className="brightness-0 invert"
                            />
                            <span className="text-2xl font-bold">Voice LMS</span>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            Start your AI-powered learning adventure
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Join thousands of learners using voice-based AI tutors to master new skills.
                            Learn naturally through conversation.
                        </p>

                        <div className="space-y-3 pt-6">
                            <div className="flex items-center gap-3">
                                <Image src="/icons/check.svg" alt="check" width={20} height={20} className="brightness-0 invert" />
                                <span className="text-white">Personalized AI tutors for every subject</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Image src="/icons/check.svg" alt="check" width={20} height={20} className="brightness-0 invert" />
                                <span className="text-white">Learn through natural conversation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Image src="/icons/check.svg" alt="check" width={20} height={20} className="brightness-0 invert" />
                                <span className="text-white">Track your progress and achievements</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-white/70 text-sm">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-white font-semibold hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>

                {/* Right Side - Sign Up Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="text-center mb-8 lg:hidden">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <Image
                                    src="/images/logo.svg"
                                    alt="logo"
                                    width={40}
                                    height={38}
                                />
                                <span className="text-2xl font-bold">Voice LMS</span>
                            </Link>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                            <p className="text-gray-600">Join our community of learners today</p>
                        </div>

                        <SignUp
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none border-none p-0 bg-transparent",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "border border-black rounded-xl hover:bg-gray-50 text-black font-medium py-3",
                                    socialButtonsBlockButtonText: "font-medium",
                                    dividerRow: "my-6",
                                    dividerText: "text-gray-500 text-sm",
                                    formFieldInput: "border border-black rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary",
                                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold",
                                    footerAction: "hidden",
                                    identityPreviewText: "text-gray-700",
                                    formResendCodeLink: "text-primary hover:text-primary/80",
                                    otpCodeFieldInput: "border border-black rounded-xl"
                                },
                            }}
                            path="/sign-up"
                            routing="path"
                            signInUrl="/sign-in"
                            afterSignUpUrl="/dashboard"
                        />

                        <div className="text-center mt-6 lg:hidden">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{" "}
                                <Link href="/sign-in" className="text-primary font-semibold hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
