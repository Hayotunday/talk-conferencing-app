"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUserStore } from "@/data/users";
import { usePathname, useSearchParams } from "next/navigation";
import RedirectModal from "@/components/RedirectModal";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useUserStore();
  const [showRedirect, setShowRedirect] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();

  const url = params.size > 0 ? `"${pathname}?${params}"` : `"${pathname}"`;
  const encodedUrl = encodeURIComponent(url);

  useEffect(() => {
    // if (!true) setShowRedirect(true);
    if (!isLoggedIn) setShowRedirect(true);
  }, []);

  return (
    <main>
      {children}
      <RedirectModal isOpen={showRedirect} redirectPath={encodedUrl} />
    </main>
  );
};

export default AuthProvider;
