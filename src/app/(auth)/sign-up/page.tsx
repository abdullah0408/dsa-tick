import { SignUpForm } from "@/components/sign-up-form";
import { requireNoAuth } from "@/lib/auth.utils";

export default async function SignUpPage() {
  await requireNoAuth();
  return <SignUpForm />;
}
