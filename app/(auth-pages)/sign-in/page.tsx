import { signInAction, signInWithGoogleAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GoogleIcon } from "@/icons";

export default async function SignIn(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Log in to your account</h2>
        <div className="text-muted-foreground mb-6">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>

        <div className="mb-4">
          <form action={signInWithGoogleAction}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-12 justify-start px-4"
            >
              <GoogleIcon /> Sign in with Google
            </Button>
          </form>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-md text-muted-foreground">OR</span>
          </div>
        </div>

        <form className="space-y-md" action={signInAction}>
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="h-12"
            />
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="h-12"
            />
          </div>

          <FormMessage message={searchParams} />

          <SubmitButton
            formAction={signInAction}
            pendingText="Signing in..."
            className="w-full h-12"
          >
            Sign in
          </SubmitButton>
        </form>

        <div className="text-muted-foreground text-sm mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="text-muted-foreground text-sm mt-6 text-center">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
