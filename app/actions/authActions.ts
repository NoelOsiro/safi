import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  "use server"; // <-- required for server action
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}