import Integrations from "@/modules/integrations";
import { Suspense } from "react";

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Integrations />
    </Suspense>
  );
}
