import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { isAdmin } from "../../firebase/admin.service";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setAllowed(false);
          setChecking(false);
          return;
        }

        const ok = await isAdmin(user.uid);
        setAllowed(ok);
        setChecking(false);
      } catch (e) {
        setAllowed(false);
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.loader} />
          <p style={styles.text}>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#070b14",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    background: "#0e1628",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 14,
    padding: 20,
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 10px 35px rgba(0,0,0,.35)",
  },
  text: { margin: 0, opacity: 0.85 },
  loader: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,.2)",
    borderTop: "3px solid rgba(255,255,255,.9)",
    margin: "0 auto 12px",
    animation: "spin 1s linear infinite",
  },
};
