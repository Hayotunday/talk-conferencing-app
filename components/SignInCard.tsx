"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaCaretRight, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

const SignInCard = () => {
  const [showPass, setShowPass] = useState(false);
  const [showPassInput, setShowPassInput] = useState(false);
  const [details, setDetails] = useState({
    user: "",
    pass: "",
  });

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

        <form className="flex flex-col w-full mt-6">
          <div className="w-full">
            <p className="">Email address or username</p>
            <Input
              className="border-none h-8 mt-1.5 bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-xs"
              onChange={(e) => {
                setDetails({ ...details, user: e.target.value });
              }}
              value={details.user}
            />
          </div>

          {showPassInput && (
            <div className="w-full mt-4">
              <p className="">Password</p>
              <div className="relative">
                <Input
                  className="border-none h-8 mt-1.5 bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-xs"
                  onChange={(e) => {
                    setDetails({ ...details, pass: e.target.value });
                  }}
                  value={details.pass}
                  type={showPass ? "text" : "password"}
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
                if (details.user.length > 0) setShowPassInput(true);
              }}
            >
              Continue
              <FaCaretRight className="ml-1" />
            </Button>
          )}
          {showPassInput && (
            <Button
              className="w-full h-8 mt-6 text-white bg-blue-1 text-xs"
              onClick={() => {}}
            >
              Sign in
            </Button>
          )}
        </form>
      </div>

      <div className="w-full p-4">
        <p className="text-center text-slate-400">
          Don't have an account?{" "}
          <Link href={"/signup"} className="text-blue-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInCard;
