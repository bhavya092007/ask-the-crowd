
// ============================================
// FIREBASE CONNECTION
// ============================================


// Import Firebase
import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// Import Firestore
import {
    getFirestore
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ============================================
// FIREBASE CONFIG
// ============================================
//
// Go to:
//
// Firebase Console
// → Your Project
// → Project Settings
// → Your Apps
// → Web App
//
// Copy your Firebase configuration
// and paste it below.
//
// ============================================

 const firebaseConfig = {
    apiKey: "AIzaSyBxUDQGcVlcXqs3ubZk9PDK4rQeZvYATqk",
    authDomain: "ask-the-crowd-36861.firebaseapp.com",
    projectId: "ask-the-crowd-36861",
    storageBucket: "ask-the-crowd-36861.firebasestorage.app",
    messagingSenderId: "632637786573",
    appId: "1:632637786573:web:405be02de4f121c3449c84"
  };


// ============================================
// INITIALIZE FIREBASE
// ============================================

const app =
    initializeApp(firebaseConfig);



// ============================================
// INITIALIZE FIRESTORE
// ============================================

const db =
    getFirestore(app);



// ============================================
// EXPORT DATABASE
// ============================================
//
// script.js will import this:
//
// import { db } from "./firebase.js";
//
// ============================================

export { db };
