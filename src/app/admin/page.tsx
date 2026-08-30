import type { Metadata } from "next";
import AdminUnlockForm from "@/components/AdminUnlockForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-16">
      <AdminUnlockForm />
    </main>
  );
}
