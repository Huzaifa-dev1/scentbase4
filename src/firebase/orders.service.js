// src/firebase/orders.service.js
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
} from "firebase/firestore";
import { db } from "./firebase";

const colRef = collection(db, "orders");

// Admin: realtime orders (latest first)
export function listenOrders(cb) {
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

// Checkout: create order (returns doc id)
export async function createOrder(payload) {
  const ref = await addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// After create: set orderNumber using doc id (avoids duplicates)
export async function setOrderNumber(orderId, orderNumber) {
  const ref = doc(db, "orders", orderId);
  return updateDoc(ref, { orderNumber, updatedAt: serverTimestamp() });
}

// Admin: update status
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  return updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

// Admin: delete order
export async function removeOrder(orderId) {
  const ref = doc(db, "orders", orderId);
  return deleteDoc(ref);
}