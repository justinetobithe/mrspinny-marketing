import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAt7dm9medgqDVtwFUZmuFiEOfwRbaWKgM",
    authDomain: "mrspinny-8c399.firebaseapp.com",
    projectId: "mrspinny-8c399",
    storageBucket: "mrspinny-8c399.firebasestorage.app",
    messagingSenderId: "171807975544",
    appId: "1:171807975544:web:af7c942fbb6a60081a658d",
    measurementId: "G-BXZSDKNNRS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
