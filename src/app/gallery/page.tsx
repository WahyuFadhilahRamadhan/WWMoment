import type { Metadata } from "next";
import { cookies } from "next/headers";
import GalleryView from "@/components/GalleryView";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Live Gallery | WWMoment",
  description: "Real-time wedding photo gallery and slideshow.",
};

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const initialIsAdmin = isValidAdminCookie(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  return <GalleryView initialIsAdmin={initialIsAdmin} />;
}
