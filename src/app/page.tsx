import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
