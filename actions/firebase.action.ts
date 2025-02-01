"use client";

import { auth, db } from "../config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDoc, doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { userInterface, useUserStore } from "@/state/users";
import { FirebaseError } from "firebase/app";
// import bcrypt from "bcrypt";

// Authentication functions
const registerWithEmailAndPassword = async (
  name: string,
  email: string,
  password: string
) => {
  // const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const userResponse = res.user;
    const userDbRef = doc(db, "users", userResponse.uid);
    await setDoc(userDbRef, {
      uid: userResponse.uid,
      email,
      password,
      username: name,
      image: "",
      createdAt: Timestamp.fromDate(new Date()),
    });
    return {
      userInfo: {
        userid: userResponse.uid,
        email,
        username: name,
        image: null,
      },
      success: true,
    };
  } catch (error) {
    console.error(error);
    if ((error as FirebaseError).code === "auth/email-already-in-use") {
      return { success: false, error: "Email already in use" };
    }
    return {
      success: false,
      error,
    };
  }
};

const loginWithEmailAndPassword = async (email: string, password: string) => {
  // const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userId = res.user.uid;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return {
      userInfo: {
        userid: userDoc.data()?.uid,
        email: userDoc.data()?.email,
        username: userDoc.data()?.username,
        image: userDoc.data()?.image != "" ? userDoc.data()?.image : null,
      },
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      user: null,
      error,
    };
  }
};

const signinWithGoogle = async (email: string, password: string) => {
  try {
  } catch (err) {
    console.error(err);
    return {
      success: false,
      user: null,
      err,
    };
  }
};

const signout = async () => {
  await signOut(auth);
  return { success: true };
};

// Update profile functions
const updateProfile = async (userObj: userInterface) => {
  if (!userObj.userid) {
    return {
      success: false,
      user: null,
      error: "User ID is required",
    };
  }

  try {
    const userRef = doc(db, "users", userObj.userid);

    // Update Firestore document
    await updateDoc(userRef, {
      username: userObj.username,
      image: userObj.image || "", // Convert null to empty string
    });

    // Fetch updated document
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return {
        success: false,
        user: null,
        error: "User not found",
      };
    }

    const userData = userDoc.data();

    return {
      success: true,
      user: {
        userid: userObj.userid, // Use provided `userid` instead of fetching it
        email: userData?.email || null,
        username: userData?.username || null,
        image: userData?.image || null, // Ensures empty string is converted to null
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      user: null,
      error: error || "An error occurred",
    };
  }
};

// Update password functions
const updatePassword = async () => {
  try {
    // const userRef = doc(db, "users");
    // const userDoc = await getDoc(userRef);
    // return {
    //   success: true,
    //   user: userDoc.data(),
    // };
  } catch (error) {
    return {
      success: false,
      user: null,
      error,
    };
  }
};

export {
  loginWithEmailAndPassword,
  signout,
  registerWithEmailAndPassword,
  signinWithGoogle,
  updatePassword,
  updateProfile,
};

// id
// name
// email
// username
// no_of_login
