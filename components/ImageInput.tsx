"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import { MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import ProfilePicture from "./ProfilePicture";

interface ImageInputProps {
  image: string | null;
  newImage: string;
  change: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

const ImageInput = ({
  image,
  newImage,
  change,
  onChange,
  onReset,
}: ImageInputProps) => {
  const imageRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative">
        {!change ? (
          <ProfilePicture profile />
        ) : (
          <div className="h-32 w-32">
            <Image
              src={newImage!}
              alt="Profile Picture"
              fill
              className="rounded-full border object-cover w-auto h-auto"
            />
          </div>
        )}
        <div className="">
          <Button
            className="absolute bottom-0 right-0 border-0 outline-0 rounded-3xl size-6 p-0 text-white bg-green-400 flex items-center justify-center"
            onClick={() => {
              imageRef.current?.click();
            }}
          >
            <MdEdit size={15} className="" />
          </Button>
          {change && (
            <Button
              className="absolute bottom-0 -right-8 border-0 outline-0 rounded-3xl size-6 p-0 text-white bg-red-400 rotate-45 flex items-center justify-center"
              onClick={onReset}
            >
              <FaPlus size={15} className="" />
            </Button>
          )}
        </div>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
          multiple={false}
        />
      </div>
    </div>
  );
};

export default ImageInput;
