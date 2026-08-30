import UploadForm from "@/components/UploadForm";
import LocationGate from "@/components/LocationGate";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <LocationGate>
        <UploadForm />
      </LocationGate>
    </main>
  );
}
