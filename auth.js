
// ============================================
// AUTH.JS — Ask The Crowd Authentication
// ============================================


// ============================================
// FIREBASE IMPORTS
// ============================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================
// DOM ELEMENTS
// ============================================

const authLoading  = document.getElementById("authLoading");
const authWrapper  = document.getElementById("authWrapper");
const authMessage  = document.getElementById("authMessage");

// Tabs
const tabLogin     = document.getElementById("tabLogin");
const tabSignup    = document.getElementById("tabSignup");

// Forms
const loginForm    = document.getElementById("loginForm");
const signupForm   = document.getElementById("signupForm");
const forgotForm   = document.getElementById("forgotForm");

// Login fields
const loginEmail    = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmit   = document.getElementById("loginSubmit");

// Signup fields
const signupName    = document.getElementById("signupName");
const signupEmail   = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirm  = document.getElementById("signupConfirm");
const signupSubmit   = document.getElementById("signupSubmit");

// Forgot password
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotBack        = document.getElementById("forgotBack");
const forgotEmail       = document.getElementById("forgotEmail");
const forgotSubmit      = document.getElementById("forgotSubmit");


// ============================================
// AUTH STATE — Redirect if already logged in
// ============================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        // User is signed in — go to main app
        window.location.replace("index.html");

    } else {

        // Not signed in — show auth UI
        authLoading.classList.add("hidden");
        authWrapper.classList.remove("hidden");

    }

});


// ============================================
// TAB SWITCHING
// ============================================

tabLogin.addEventListener("click", () => showTab("login"));
tabSignup.addEventListener("click", () => showTab("signup"));


function showTab(tab) {

    clearMessage();

    if (tab === "login") {

        tabLogin.classList.add("active");
        tabSignup.classList.remove("active");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        forgotForm.classList.add("hidden");

    } else {

        tabSignup.classList.add("active");
        tabLogin.classList.remove("active");
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        forgotForm.classList.add("hidden");

    }
}


// ============================================
// FORGOT PASSWORD TOGGLE
// ============================================

forgotPasswordBtn.addEventListener("click", () => {

    clearMessage();

    loginForm.classList.add("hidden");
    signupForm.classList.add("hidden");
    forgotForm.classList.remove("hidden");

    tabLogin.classList.remove("active");
    tabSignup.classList.remove("active");

});


forgotBack.addEventListener("click", () => {

    showTab("login");

});


// ============================================
// SHOW / HIDE PASSWORD (Eye Buttons)
// ============================================

document.querySelectorAll(".auth-eye").forEach((btn) => {

    btn.addEventListener("click", () => {

        const targetId = btn.dataset.target;
        const input    = document.getElementById(targetId);

        if (!input) return;

        if (input.type === "password") {

            input.type = "text";
            btn.textContent = "🙈";

        } else {

            input.type = "password";
            btn.textContent = "👁";

        }

    });

});


// ============================================
// LOGIN FORM SUBMIT
// ============================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email    = loginEmail.value.trim();
    const password = loginPassword.value;


    if (!email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }


    setLoading(loginSubmit, true);
    clearMessage();


    try {

        await signInWithEmailAndPassword(auth, email, password);

        // onAuthStateChanged will handle redirect

    } catch (error) {

        setLoading(loginSubmit, false);
        showMessage(friendlyError(error.code), "error");

    }

});


// ============================================
// SIGNUP FORM SUBMIT
// ============================================

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name     = signupName.value.trim();
    const email    = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirm  = signupConfirm.value;


    // — Validation —

    if (!name || !email || !password || !confirm) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    if (name.length < 2) {
        showMessage("Full name must be at least 2 characters.", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.", "error");
        return;
    }

    if (password !== confirm) {
        showMessage("Passwords do not match.", "error");
        markError(signupConfirm);
        return;
    }


    setLoading(signupSubmit, true);
    clearMessage();


    try {

        // Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;


        // Save profile to Firestore (users collection)
        await setDoc(doc(db, "users", user.uid), {
            uid:       user.uid,
            fullName:  name,
            email:     email,
            createdAt: serverTimestamp()
        });


        // onAuthStateChanged will handle redirect

    } catch (error) {

        setLoading(signupSubmit, false);
        showMessage(friendlyError(error.code), "error");

    }

});


// ============================================
// FORGOT PASSWORD FORM SUBMIT
// ============================================

forgotForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = forgotEmail.value.trim();


    if (!email) {
        showMessage("Please enter your email address.", "error");
        return;
    }


    setLoading(forgotSubmit, true);
    clearMessage();


    try {

        await sendPasswordResetEmail(auth, email);

        setLoading(forgotSubmit, false);

        showMessage(
            "Password reset email sent! Check your inbox.",
            "success"
        );

        forgotEmail.value = "";

    } catch (error) {

        setLoading(forgotSubmit, false);
        showMessage(friendlyError(error.code), "error");

    }

});


// ============================================
// HELPERS
// ============================================

function showMessage(text, type) {

    authMessage.textContent = text;
    authMessage.className   = "auth-message " + type;
    authMessage.classList.remove("hidden");

}


function clearMessage() {

    authMessage.classList.add("hidden");
    authMessage.textContent = "";

    // Clear any error outlines
    document.querySelectorAll(".input-error").forEach((el) => {
        el.classList.remove("input-error");
    });

}


function markError(input) {

    input.classList.add("input-error");

    input.addEventListener(
        "input",
        () => input.classList.remove("input-error"),
        { once: true }
    );

}


function setLoading(btn, isLoading) {

    btn.disabled = isLoading;

    if (isLoading) {
        btn.classList.add("loading");
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "";
    } else {
        btn.classList.remove("loading");
        btn.textContent = btn.dataset.originalText || btn.textContent;
    }

}


function friendlyError(code) {

    const errors = {
        "auth/invalid-email":            "Please enter a valid email address.",
        "auth/user-not-found":           "No account found with this email.",
        "auth/wrong-password":           "Incorrect password. Please try again.",
        "auth/email-already-in-use":     "An account with this email already exists.",
        "auth/weak-password":            "Password must be at least 6 characters.",
        "auth/too-many-requests":        "Too many attempts. Please try again later.",
        "auth/network-request-failed":   "Network error. Check your connection.",
        "auth/invalid-credential":       "Incorrect email or password. Please try again.",
        "auth/user-disabled":            "This account has been disabled.",
        "auth/operation-not-allowed":    "Email/password sign-in is not enabled.",
    };

    return errors[code] || "Something went wrong. Please try again.";

}

