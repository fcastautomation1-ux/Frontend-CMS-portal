import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  
  // If logged in, go to dashboard. Otherwise, go to login
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
