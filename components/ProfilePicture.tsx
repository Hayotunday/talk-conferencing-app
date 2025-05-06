"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUserStore } from "@/data/users";
import { usePathname } from "next/navigation";

const ProfilePicture = ({ profile }: { profile?: boolean }) => {
  const pathname = usePathname();
  const {
    user: { image, username },
  } = useUserStore();
  return (
    <Avatar
      className={`bg-slate-300 ${
        profile ? "block" : pathname === "/profile" && "hidden"
      } ${profile && "size-32"}`}
    >
      <AvatarImage src={image!} className={`${profile && "size-32"}`} />
      <AvatarFallback className={`${profile && "text-7xl"}`}>
        {username?.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePicture;
