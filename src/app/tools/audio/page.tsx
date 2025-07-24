import { AudioProcessor } from "@/components/AudioProcessor";
import { BackButton } from "@/components/BackButton";

export default function AudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <AudioProcessor />
      </div>
    </div>
  );
} 