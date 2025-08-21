"use client";

import Integrations from "@/modules/integrations";
import { Suspense, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export default function IntegrationsPage() {
  const { isAdmin, principal } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is not admin, redirect to dashboard
    if (principal && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, principal, router]);

  // Show loading while checking admin status
  if (!principal) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not admin, don't render the page (will redirect)
  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Integrations />
    </Suspense>
  );
}
