import { signUpAction, signInWithGoogleAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { GoogleIcon } from "@/icons";

export default async function Signup(props: {
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
    <div className="w-full max-w-md mx-auto p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Create an account</h2>
        <div className="text-muted-foreground mb-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Log in
          </Link>
        </div>

        <div className="mb-4">
          <form>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-12 justify-start px-4"
            >
              <GoogleIcon /> Sign up with Google
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

        <form className="space-y-md" action={signUpAction}>
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
              minLength={6}
              required
              className="h-12"
            />
          </div>

          <div>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              minLength={6}
              required
              className="h-12"
            />
          </div>

          <FormMessage message={searchParams} />

          <SubmitButton
            formAction={signUpAction}
            pendingText="Creating account..."
            className="w-full h-12"
          >
            Create new account
          </SubmitButton>
        </form>

        <div className="text-muted-foreground text-sm mt-6 text-center">
          By signing up, you agree to our{" "}
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
