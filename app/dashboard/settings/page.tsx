import { SecuritySection } from "@/components/settings/security-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { DangerSection } from "@/components/settings/danger-section";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 p-4 md:p-6">
      <SecuritySection />
      <AppearanceSection />
      <DangerSection />
    </div>
  );
}
