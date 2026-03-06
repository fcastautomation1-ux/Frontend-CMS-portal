import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to login - NextAuth will handle session check and redirect to dashboard if already logged in
  redirect("/login");
}
