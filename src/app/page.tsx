import { cookies } from "next/headers";
import UploadForm from "@/components/UploadForm";
import LocationGate from "@/components/LocationGate";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";

export default async function Home() {
  const cookieStore = await cookies();
  const isAdmin = isValidAdminCookie(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  return (
    <main className="flex-1 flex flex-col">
      <LocationGate bypass={isAdmin}>
        <UploadForm />
      </LocationGate>
    </main>
  );
}
