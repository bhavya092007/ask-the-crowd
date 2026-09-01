
// ============================================
// ASK THE CROWD
// MAIN JAVASCRIPT
// ============================================


// ============================================
// FIREBASE
// ============================================

import { db } from "./firebase.js";


import {

    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    doc,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp

}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ============================================
// GET HTML ELEMENTS
// ============================================

const questionInput =
    document.getElementById("questionInput");


const askButton =
    document.getElementById("askButton");


const questionSection =
    document.getElementById("questionSection");


const questionText =
    document.getElementById("questionText");


const yesButton =
    document.getElementById("yesButton");


const noButton =
    document.getElementById("noButton");


const yesPercent =
    document.getElementById("yesPercent");


const noPercent =
    document.getElementById("noPercent");


const totalVotes =
    document.getElementById("totalVotes");


const explanationInput =
    document.getElementById("explanationInput");


const explanationButton =
    document.getElementById("explanationButton");


const explanationList =
    document.getElementById("explanationList");


const yesBar =
    document.getElementById("yesBar");


const noBar =
    document.getElementById("noBar");



// ============================================
// CURRENT QUESTION
// ============================================

let currentQuestionId = null;



// ============================================
// ASK BUTTON
// ============================================

askButton.addEventListener(
    "click",
    createQuestion
);



// ============================================
// CREATE QUESTION
// ============================================

async function createQuestion() {

    const question =
        questionInput.value.trim();


    if (question === "") {

        alert("Write a question first!");

        return;
    }


    try {

        const questionsRef =
            collection(
                db,
                "questions"
            );


        const newQuestion =
            await addDoc(
                questionsRef,
                {

                    text: question,

                    yesVotes: 0,

                    noVotes: 0,

                    createdAt:
                        serverTimestamp()

                }
            );


        // Save new question ID
        currentQuestionId =
            newQuestion.id;


        // ====================================
        // CLEAR OLD VOTE
        // ====================================

        localStorage.removeItem(
            "vote_" + currentQuestionId
        );


        // Reset buttons
        resetVoteButtons();


        // Show question
        questionText.textContent =
            question;


        questionSection.classList.remove(
            "hidden"
        );


        // Clear input
        questionInput.value = "";


        // Reset results
        yesPercent.textContent = "0%";

        noPercent.textContent = "0%";

        totalVotes.textContent = "0";


        yesBar.style.width = "0%";

        noBar.style.width = "0%";


        // Clear explanations
        explanationList.innerHTML = "";


    }
    catch (error) {

        console.error(
            "Create question error:",
            error
        );


        alert(
            "Could not create question."
        );

    }
}



// ============================================
// YES BUTTON
// ============================================

yesButton.addEventListener(
    "click",
    function () {

        vote("yes");

    }
);



// ============================================
// NO BUTTON
// ============================================

noButton.addEventListener(
    "click",
    function () {

        vote("no");

    }
);



// ============================================
// VOTE FUNCTION
// ============================================

async function vote(type) {

    if (!currentQuestionId) {

        return;
    }


    // ========================================
    // CHECK IF USER ALREADY VOTED
    // ========================================

    const savedVote =
        localStorage.getItem(
            "vote_" + currentQuestionId
        );


    if (savedVote) {

        return;
    }


    try {

        const questionRef =
            doc(
                db,
                "questions",
                currentQuestionId
            );


        // ====================================
        // UPDATE FIREBASE
        // ====================================

        if (type === "yes") {

            await updateDoc(
                questionRef,
                {

                    yesVotes:
                        increment(1)

                }
            );

        }

        else {

            await updateDoc(
                questionRef,
                {

                    noVotes:
                        increment(1)

                }
            );

        }


        // ====================================
        // SAVE VOTE IN BROWSER
        // ====================================

        localStorage.setItem(
            "vote_" + currentQuestionId,
            type
        );


        // ====================================
        // SHOW SELECTED BUTTON
        // ====================================

        showSelectedVote(type);


        // ====================================
        // UPDATE RESULTS
        // ====================================

        await loadResults();


    }
    catch (error) {

        console.error(
            "Vote error:",
            error
        );


        alert(
            "Could not submit vote."
        );

    }
}



// ============================================
// SHOW SELECTED VOTE
// ============================================

function showSelectedVote(type) {

    if (type === "yes") {

        yesButton.textContent =
            "✓ YES";

        noButton.textContent =
            "NO";


        yesButton.classList.add(
            "selected"
        );

        noButton.classList.remove(
            "selected"
        );

    }

    else {

        noButton.textContent =
            "✓ NO";

        yesButton.textContent =
            "YES";


        noButton.classList.add(
            "selected"
        );

        yesButton.classList.remove(
            "selected"
        );

    }
}



// ============================================
// RESET VOTE BUTTONS
// ============================================

function resetVoteButtons() {

    yesButton.textContent =
        "YES";

    noButton.textContent =
        "NO";


    yesButton.classList.remove(
        "selected"
    );

    noButton.classList.remove(
        "selected"
    );
}



// ============================================
// LOAD RESULTS
// ============================================

async function loadResults() {

    if (!currentQuestionId) {

        return;
    }


    try {

        const questionRef =
            doc(
                db,
                "questions",
                currentQuestionId
            );


        const snapshot =
            await getDoc(
                questionRef
            );


        if (!snapshot.exists()) {

            return;
        }


        const data =
            snapshot.data();


        const yes =
            data.yesVotes || 0;


        const no =
            data.noVotes || 0;


        const total =
            yes + no;


        // ====================================
        // CALCULATE PERCENTAGES
        // ====================================

        let yesPercentage = 0;

        let noPercentage = 0;


        if (total > 0) {

            yesPercentage =
                Math.round(
                    (yes / total) * 100
                );


            noPercentage =
                100 - yesPercentage;

        }


        // ====================================
        // UPDATE TEXT
        // ====================================

        yesPercent.textContent =
            yesPercentage + "%";


        noPercent.textContent =
            noPercentage + "%";


        totalVotes.textContent =
            total;


        // ====================================
        // UPDATE BARS
        // ====================================

        yesBar.style.width =
            yesPercentage + "%";


        noBar.style.width =
            noPercentage + "%";


    }
    catch (error) {

        console.error(
            "Load results error:",
            error
        );

    }
}



// ============================================
// EXPLANATION BUTTON
// ============================================

explanationButton.addEventListener(
    "click",
    addExplanation
);



// ============================================
// ADD EXPLANATION
// ============================================

async function addExplanation() {

    if (!currentQuestionId) {

        return;
    }


    const text =
        explanationInput.value.trim();


    if (text === "") {

        alert(
            "Write an explanation first!"
        );

        return;
    }


    try {

        const explanationsRef =
            collection(
                db,
                "questions",
                currentQuestionId,
                "explanations"
            );


        await addDoc(
            explanationsRef,
            {

                text: text,

                createdAt:
                    serverTimestamp()

            }
        );


        // Clear input
        explanationInput.value = "";


        // Reload explanations
        loadExplanations();

    }
    catch (error) {

        console.error(
            "Add explanation error:",
            error
        );


        alert(
            "Could not add explanation."
        );

    }
}



// ============================================
// LOAD EXPLANATIONS
// ============================================

async function loadExplanations() {

    if (!currentQuestionId) {

        return;
    }


    try {

        const explanationsRef =
            collection(
                db,
                "questions",
                currentQuestionId,
                "explanations"
            );


        const snapshot =
            await getDocs(
                explanationsRef
            );


        explanationList.innerHTML = "";


        if (snapshot.empty) {

            explanationList.innerHTML =
                "<p>No explanations yet.</p>";

            return;
        }


        snapshot.forEach(
            (explanationDoc) => {

                const data =
                    explanationDoc.data();


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "explanation";


                div.textContent =
                    data.text;


                explanationList.appendChild(
                    div
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Load explanations error:",
            error
        );

    }
}



// ============================================
// INITIAL LOAD
// ============================================

async function initialLoad() {

    try {

        const questionsRef =
            collection(
                db,
                "questions"
            );


        const latestQuestion =
            query(

                questionsRef,

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(1)

            );


        const snapshot =
            await getDocs(
                latestQuestion
            );


        if (snapshot.empty) {

            return;
        }


        const questionDoc =
            snapshot.docs[0];


        const data =
            questionDoc.data();


        // Save question ID
        currentQuestionId =
            questionDoc.id;


        // Show question
        questionText.textContent =
            data.text;


        questionSection.classList.remove(
            "hidden"
        );


        // ====================================
        // RESTORE USER'S VOTE
        // ====================================

        const savedVote =
            localStorage.getItem(
                "vote_" + currentQuestionId
            );


        if (savedVote) {

            showSelectedVote(
                savedVote
            );

        }


        // Load results
        loadResults();


        // Load explanations
        loadExplanations();

    }
    catch (error) {

        console.error(
            "Initial load error:",
            error
        );

    }
}



// ============================================
// START APP
// ============================================

initialLoad();