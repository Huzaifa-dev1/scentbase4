import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWyPKot-Y6wAlJ4Fsxl6Unavi8Sv-x9EE",
  authDomain: "scentbase4-fea0d.firebaseapp.com",
  projectId: "scentbase4-fea0d",
 storageBucket: "scentbase4-fea0d.appspot.com",
  messagingSenderId: "877055898331",
  appId: "1:877055898331:web:a4a38e688bebb6239bd2fe"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

