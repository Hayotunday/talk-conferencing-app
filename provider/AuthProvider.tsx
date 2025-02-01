"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUserStore } from "@/state/users";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RedirectModal from "@/components/RedirectModal";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useUserStore();
  const [loggedin, setLoggedin] = useState(isLoggedIn);
  const [showRedirect, setShowRedirect] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();

  const { user } = useUserStore();

  const url = params.size > 0 ? `"${pathname}?${params}"` : `"${pathname}"`;
  const encodedUrl = encodeURIComponent(url);

  useEffect(() => {
    if (!loggedin) setShowRedirect(true);
  }, []);

  useEffect(() => {
    console.log("user : ", user);
  }, [pathname]);

  return (
    <main>
      {children}
      <RedirectModal isOpen={showRedirect} redirectPath={encodedUrl} />
    </main>
  );
};

export default AuthProvider;
