"use client";

import React from "react";
import { sidebarLinks } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { useUserStore } from "@/data/users";
import { signout } from "@/actions/firebase.action";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUserStore();

  const handleSignout = async () => {
    logout();
    await signout();
    router.push("/signin");
  };

  return (
    <section className="flex h-screen w-fit flex-col justify-between bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-col gap-6">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || pathname.startsWith(`${link.route}/`);

          return link.action ? (
            <Button
              onClick={handleSignout}
              key={link.label}
              className={cn(
                "flex gap-4 items-center p-3 my-2 rounded-lg justify-start",
                {
                  "bg-blue-1": isActive,
                }
              )}
            >
              <Image
                src={link.imgUrl}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {link.label}
              </p>
            </Button>
          ) : (
            <Link
              href={link.route!}
              key={link.label}
              className={cn(
                "flex gap-4 items-center p-4 rounded-lg justify-start",
                {
                  "bg-blue-1": isActive,
                }
              )}
            >
              <Image
                src={link.imgUrl}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
