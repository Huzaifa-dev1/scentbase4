import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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
export function listenProducts(cb) {
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

// ✅ Active products only (frontend /products page)
export function listenActiveProducts(cb) {
  const q = query(colRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

// ✅ Best sellers only (frontend best-selling section)
export function listenBestSellers(cb) {
  const q = query(
    colRef,
    where("isActive", "==", true),
    where("isBestSeller", "==", true),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
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
