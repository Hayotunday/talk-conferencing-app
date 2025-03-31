"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MeetingModalPrpos {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  buttonText?: string;
  handleClick?: () => void;
  image?: string;
  buttonIcon?: string;
  instantAction?: () => void;
  instantText?: string;
  isInstantMeeting?: boolean;
  instantHandleClick?: () => void;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  buttonText,
  handleClick,
  image,
  buttonIcon,
  isInstantMeeting,
  instantText,
  instantAction,
  instantHandleClick,
}: MeetingModalPrpos) => {
  const [generated, setGenerated] = useState(false);
  const generatelink = () => {
    if (instantAction) {
      instantAction();
    }
    setGenerated(true);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white rounded-md">
        <div className="flex flex-col gap-6">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt="image" width={72} height={72} />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          {children}

          {!isInstantMeeting && (
            <Button
              className="bg-blue-1 focus-visible:ring-0 focus-visible::ring-offset-0"
              onClick={handleClick}
            >
              {buttonIcon && (
                <Image
                  src={buttonIcon}
                  alt="button icon"
                  width={13}
                  height={13}
                />
              )}{" "}
              &nbsp;
              {buttonText || "Schedule Meeting"}
            </Button>
          )}

          {isInstantMeeting && (
            <>
              <Button
                className="bg-blue-1 focus-visible:ring-0 focus-visible::ring-offset-0"
                onClick={!generated ? generatelink : handleClick}
              >
                {buttonIcon && (
                  <Image
                    src={buttonIcon}
                    alt="button icon"
                    width={13}
                    height={13}
                  />
                )}{" "}
                &nbsp;
                {!generated ? "Generate Meeting Link" : buttonText}
              </Button>

              {generated && (
                <Button
                  className="bg-blue-1 focus-visible:ring-0 focus-visible::ring-offset-0"
                  onClick={instantHandleClick}
                >
                  <Image
                    src={"/icons/copy.svg"}
                    alt="button icon"
                    width={13}
                    height={13}
                  />{" "}
                  &nbsp;
                  {"Copy Meeting Link"}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
