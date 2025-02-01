import React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader } from "./ui/dialog";
import Link from "next/link";
import { Button } from "./ui/button";

interface RedirectModalProps {
  isOpen: boolean;
  redirectPath?: string;
}

const RedirectModal = ({ isOpen, redirectPath }: RedirectModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="flex w-full max-w-[200px] md:max-w-[250px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white rounded-md">
        <div className="w-full text-center mb-5">
          <p className="text-wrap text-base font-semibold">Welcome To Talk</p>
          <p className="text-wrap text-sm font-normal text-slate-400">
            No account detected. Please sign in or sign up to continue!
          </p>
        </div>

        <div className="flex flex-row gap-3 justify-center">
          <Link
            href={`/signin?redirect=${redirectPath}`}
            className="text-white rounded-full text-center bg-blue-1 text-xs p-3"
          >
            Sign In
          </Link>
          <Link
            href={`/signup?redirect=${redirectPath}`}
            className="text-white rounded-full text-center bg-blue-1 text-xs p-3"
          >
            Sign Up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedirectModal;
