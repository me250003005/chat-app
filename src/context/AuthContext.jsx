// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, { displayName });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      username: displayName,
      email: email,
      createdAt: serverTimestamp(),
      status: "online",
      photoURL: "",
    });

    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserProfile(newUsername, imageFile) {
    if (!currentUser) return;

    let photoURL = currentUser.photoURL || "";

    // Upload to ImgBB if there is a new image
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      const data = await response.json();
      if (data.success) {
        photoURL = data.data.url; // Get the hosted image URL
      } else {
        throw new Error("Image upload failed");
      }
    }

    // Update Firebase Auth profile
    await updateProfile(currentUser, {
      displayName: newUsername,
      photoURL: photoURL,
    });

    // Update Firestore user document
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      username: newUsername,
      photoURL: photoURL,
    });

    // Force a re-render
    setCurrentUser({ ...currentUser, displayName: newUsername, photoURL });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}