import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function AdminProtectedRoute({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn && user?.id) {
        try {
          const userRef = doc(db, "users", user.id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setIsAdmin(userSnap.data().role === "admin");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isSignedIn, user, isLoaded]);

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;