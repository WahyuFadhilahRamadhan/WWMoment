import type { Metadata } from "next";
import GalleryView from "@/components/GalleryView";

export const metadata: Metadata = {
  title: "Live Gallery | WWMoment",
  description: "Real-time wedding photo gallery and slideshow.",
};

export default function GalleryPage() {
  return <GalleryView />;
}
