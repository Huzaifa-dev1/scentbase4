import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const colRef = collection(db, "orders");

export function listenOrders(cb) {
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

function buildOrderNumberFromId(orderId) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const tail = String(orderId).slice(-6).toUpperCase();
  return `SB-${yyyy}${mm}${dd}-${tail}`;
}

// ✅ ONE STEP ORDER CREATE (NO UPDATE)
export async function createOrderOneStep(payload) {
  const ref = doc(colRef); // generates id client-side
  const orderNumber = buildOrderNumberFromId(ref.id);

  await setDoc(ref, {
    ...payload,
    orderNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: ref.id, orderNumber };
}

export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  return updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function removeOrder(orderId) {
  const ref = doc(db, "orders", orderId);
  return deleteDoc(ref);
}