"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { userInterface, useUserStore } from "@/data/users";
import { Button } from "./ui/button";
import { isBase64Image } from "@/lib/utils";
import ImageInput from "./ImageInput";
import { updateProfile } from "@/actions/firebase.action";
import { TbLoader2 } from "react-icons/tb";

interface ProfileModalProps {
  isOpen: boolean;
  isUpdate?: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose, isUpdate }: ProfileModalProps) => {
  const [imageChange, setImageChange] = useState(false);
  const [textChange, setTextChange] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const {
    user: { username, image, email, userid },
    update,
  } = useUserStore();
  const [values, setValues] = useState({
    profile_photo: image!,
    name: username,
  });

  const { toast } = useToast();

  const resetAll = () => {
    setImageChange(false);
    setTextChange(false);
    setUpdating(false);
    setFiles([]);
  };

  useEffect(() => {
    if (isOpen) {
      setValues({ profile_photo: image!, name: username });
      resetAll();
    }
  }, [isOpen, image, username]);

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";

        fieldChange(imageDataUrl);
        setImageChange(true);
      };

      fileReader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    setUpdating(true);
    const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);

    if (!hasImageChanged) return;

    if (hasImageChanged) {
      const reader = new FileReader();

      reader.readAsDataURL(files[0]);
      reader.onload = async () => {
        const result = reader.result;

        try {
          const response = await fetch(`/api/upload`, {
            method: "POST",
            body: JSON.stringify({ path: result }),
          });
          const imageUrl = await response.json();
          values.profile_photo = imageUrl.url;
          const userUpdate = updateProfile({
            userid,
            email,
            username: values.name?.trim()!,
            image: values.profile_photo || "",
          });

          update((await userUpdate).user as userInterface);
        } catch (error) {
          console.log(error);
        } finally {
          resetAll();

          toast({
            variant: "success",
            title: "Profile updated successfully",
          });
          onClose();
        }
      };
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        resetAll();
      }}
    >
      <DialogContent className="flex w-full max-w-[400px] md:max-w-[520px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white rounded-md">
        {!isUpdate ? (
          <div className="w-full text-center">
            <p className="text-wrap text-base font-normal">
              Please complete your profile now to use Talk
            </p>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-wrap text-base font-normal">
              Update your Talk profile
            </p>
          </div>
        )}

        <ImageInput
          image={image}
          newImage={values.profile_photo}
          change={imageChange}
          onChange={(e) =>
            handleImage(e, (value) =>
              setValues({ ...values, profile_photo: value })
            )
          }
          onReset={() => {
            setValues({ ...values, profile_photo: image! });
            setImageChange(false);
          }}
        />

        <Input
          placeholder="change name"
          value={values.name!}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          type="text"
          onChange={(e) => {
            setValues({ ...values, name: e.target.value });
            setTextChange(e.target.value !== username && e.target.value !== "");
          }}
        />
        <div className="flex flex-row gap-2 justify-end">
          <Button
            onClick={onClose}
            className="text-white rounded-full text-center bg-red-500"
          >
            cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!textChange && !imageChange}
            className="text-white rounded-full text-center bg-green-500"
          >
            {updating ? (
              <div className="flex items-center">
                <TbLoader2 className="animate-spin h-5 w-5 mr-1" />
                <span>updating...</span>
              </div>
            ) : (
              "update"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
