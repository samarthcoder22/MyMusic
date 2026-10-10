import {
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./firebase";

export async function signInUser() {
  try {
    const result = await signInAnonymously(auth);

    console.log("✅ MyMusic user signed in");
    console.log("User ID:", result.user.uid);

    return result.user;
  } catch (error) {
    console.error("❌ Anonymous sign-in failed:", error);
    throw error;
  }
}

export function listenToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}