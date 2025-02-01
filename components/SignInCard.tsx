"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { FcGoogle } from "react-icons/fc";
import { FaCaretRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserStore, userInterface } from "@/state/users";
import { loginWithEmailAndPassword } from "@/actions/firebase.action";
import Image from "next/image";
import { removeFirstLast } from "@/lib/utils";

const SignInCard = () => {
  const [showPass, setShowPass] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [showPassInput, setShowPassInput] = useState(false);
  const [details, setDetails] = useState({
    email: "",
    pass: "",
  });
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const { toast } = useToast();
  const { update, login } = useUserStore();

  const handleSignIn = async () => {
    setSigningIn(true);

    if (!details.email.trim() || !details.pass.trim()) {
      toast({
        variant: "destructive",
        title: "Error while signing up",
        description: "Please fill in all fields",
      });

      setSigningIn(false);
      return;
    }

    const regResponse = await loginWithEmailAndPassword(
      details.email.trim(),
      details.pass.trim()
    );
    const { error, success, userInfo } = regResponse;
    if (success == true) {
      login();
      update(userInfo as userInterface);
      toast({
        variant: "success",
        title: "Sign-in successful",
      });
      if (redirectParam) {
        const url = decodeURIComponent(removeFirstLast(redirectParam));
        return router.push(`${url}`);
      }
      router.push("/");
    } else if (error === "Email in use") {
      toast({
        variant: "destructive",
        title: "Error while signing in",
        description: "Email already exists",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error while signing in",
        description: "Please check sign-in credentials",
      });
    }
    setSigningIn(false);
  };

  const signUpUrl = (): string => {
    if (redirectParam)
      return `/signup?redirect=${encodeURIComponent(redirectParam)}`;
    return "/signup";
  };

  return (
    <div className="rounded-xl shadow-black shadow text-white bg-dark-1 w-full md:w-[375px] mx-10">
      <div className="w-full h-full flex flex-col justify-center items-center p-10 border-b border-dark-3 rounded-b-xl">
        <h1 className="font-semibold text-base">Sign in to Talk</h1>
        <p className="text-slate-400">Welcome back! Sign in to continue</p>

        <Button
          className="w-full h-8 mt-6 shadow-sm shadow-black bg-dark-1 flex flex-row items-center"
          onClick={() => {}}
        >
          <FcGoogle /> <span className="text-xs ml-1">Sign in with Google</span>
        </Button>

        <div className="w-full mt-6 flex flex-row gap-2 items-center">
          <hr className="w-full border-dark-3" />
          <p className="text-slate-400">or</p>
          <hr className="w-full border-dark-3" />
        </div>

        <form className="flex flex-col w-full mt-6 gap-4">
          <div className="w-full">
            <p className="">Email address</p>
            <Input
              className="border-none h-8 mt-1.5 bg-dark-3 autofill:!bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-xs"
              onChange={(e) => {
                setDetails({ ...details, email: e.target.value });
              }}
              type="email"
              value={details.email}
            />
          </div>

          {showPassInput && (
            <div className="w-full">
              <p className="">Password</p>
              <div className="relative">
                <Input
                  className="border-none h-8 mt-1.5 bg-dark-3 autofill:!bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-xs"
                  onChange={(e) => {
                    setDetails({ ...details, pass: e.target.value });
                  }}
                  value={details.pass}
                  type={showPass ? "email" : "password"}
                />
                {showPass ? (
                  <FaEyeSlash
                    className="absolute right-2 h-full transform -translate-y-full flex items-center"
                    size={20}
                    color="#FFF"
                    onClick={() => setShowPass(false)}
                  />
                ) : (
                  <FaEye
                    className="absolute right-2 h-full transform -translate-y-full flex items-center"
                    size={20}
                    color="#FFF"
                    onClick={() => setShowPass(true)}
                  />
                )}
              </div>
            </div>
          )}

          {!showPassInput && (
            <Button
              className="w-full h-8 mt-6 text-white bg-blue-1 text-xs"
              onClick={(e) => {
                e.preventDefault();
                if (details.email.length > 0) setShowPassInput(true);
              }}
            >
              Continue
              <FaCaretRight className="ml-1" />
            </Button>
          )}
          {showPassInput && (
            <Button
              className="w-full h-8 mt-6 text-white bg-blue-1 text-xs"
              onClick={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
            >
              {signingIn && (
                <Image
                  src={"/icons/loading-circle.svg"}
                  alt="Loading"
                  width={18}
                  height={18}
                  className="mx-2"
                />
              )}
              {signingIn ? "Signing in" : "Sign in"}
            </Button>
          )}
        </form>
      </div>

      <div className="w-full p-4">
        <p className="text-center text-slate-400">
          Don't have an account?{" "}
          <Link href={signUpUrl()} className="text-blue-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInCard;
