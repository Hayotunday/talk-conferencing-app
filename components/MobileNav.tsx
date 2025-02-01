"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useUserStore } from "@/state/users";
import { signout } from "@/actions/firebase.action";

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUserStore();

  const handleSignout = async () => {
    logout();
    await signout();
    router.push("/signin");
  };

  return (
    <section className="w-full max-w-[264px">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src={"/icons/hamburger.svg"}
            width={36}
            height={36}
            alt="hamburger icon"
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>
        <SheetContent side={"left"} className="border-none bg-dark-1">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src={"/icons/logo.svg"}
              width={32}
              height={32}
              alt="Talk logo"
              className="max-sm:size-10"
            />
            <p className="text-[26px] font-extrabold text-white">Talk</p>
          </Link>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((link) => {
                  const isActive =
                    pathname === link.route ||
                    pathname.startsWith(`${link.route}/`);

                  return (
                    <SheetClose asChild key={link.route}>
                      {link.action ? (
                        <Button
                          onClick={handleSignout}
                          key={link.label}
                          className={cn(
                            "flex gap-4 items-center p-3 my-2 rounded-lg w-full max-w-60 justify-start outline-none border-none focus:outline-none focus:border-none focus-visible:outline-none focus-visible:border-none",
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
                          <p className="font-semibold">{link.label}</p>
                        </Button>
                      ) : (
                        <Link
                          href={link.route!}
                          key={link.label}
                          className={cn(
                            "flex gap-4 items-center p-4 rounded-lg w-full max-w-60 justify-start",
                            {
                              "bg-blue-1": isActive,
                            }
                          )}
                        >
                          <Image
                            src={link.imgUrl}
                            alt={link.label}
                            width={20}
                            height={20}
                          />
                          <p className="font-semibold">{link.label}</p>
                        </Link>
                      )}
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
