import type { Metadata } from "next";
import React, { ReactNode } from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Talk",
  description: "Video Conferencing App",
  icons: {
    icon: "/icons/logo.svg",
  },
};

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative">
      <Navbar />

      <div className="flex relative">
        <div className="size-fit max-sm:hidden p-0 m-0 sticky top-0 left-0">
          <Sidebar />
        </div>

        <section className="flex min-h-screen flex-auto flex-col px-6 pb-6 pt-22 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
