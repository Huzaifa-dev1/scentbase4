// src/firebase/products.service.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const colRef = collection(db, "products");

// All products (admin usage)
export function listenProducts(cb, onErr) {
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(items);
    },
    (err) => {
      console.error("listenProducts error:", err);
      if (onErr) onErr(err);
    }
  );
}

// ✅ Active products only (frontend /products page)
export function listenActiveProducts(cb, onErr) {
  const q = query(
    colRef,
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(items);
    },
    (err) => {
      console.error("listenActiveProducts error:", err);
      if (onErr) onErr(err);
    }
  );
}

// ✅ Best sellers only (frontend best-selling section)
// - adds limit so home loads fast
// - supports error callback so UI won't hang if index missing
export function listenBestSellers(cb, onErr) {
  const q = query(
    colRef,
    where("isActive", "==", true),
    where("isBestSeller", "==", true),
    orderBy("createdAt", "desc"),
    limit(6)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(items);
    },
    (err) => {
      console.error("listenBestSellers error:", err);
      if (onErr) onErr(err);
    }
  );
}

// ✅ One-time fetch (fallback if listener fails or you want SSR-like fetch)
export async function getBestSellersOnce() {
  const q = query(
    colRef,
    where("isActive", "==", true),
    where("isBestSeller", "==", true),
    orderBy("createdAt", "desc"),
    limit(6)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Create
export async function createProduct(payload) {
  return addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Update
export async function updateProduct(id, payload) {
  const ref = doc(db, "products", id);
  return updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

// Delete
export async function removeProduct(id) {
  const ref = doc(db, "products", id);
  return deleteDoc(ref);
}