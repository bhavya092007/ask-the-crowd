
// ============================================
// ASK THE CROWD
// V1.1
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
    doc,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp

}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ============================================
// HTML ELEMENTS
// ============================================

const questionInput =
    document.getElementById("questionInput");


const askButton =
    document.getElementById("askButton");


const questionsList =
    document.getElementById("questionsList");


const questionCount =
    document.getElementById("questionCount");


const questionsSection =
    document.querySelector(".questions-section");


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


const yesBar =
    document.getElementById("yesBar");


const noBar =
    document.getElementById("noBar");


const explanationInput =
    document.getElementById("explanationInput");


const explanationButton =
    document.getElementById("explanationButton");


const explanationList =
    document.getElementById("explanationList");


const backButton =
    document.getElementById("backButton");



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

        alert(
            "Write a question first!"
        );

        return;
    }


    try {

        const questionsRef =
            collection(
                db,
                "questions"
            );


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


        // Clear input

        questionInput.value = "";


        // Reload all questions

        loadQuestions();

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not create question."
        );

    }
}



// ============================================
// LOAD ALL QUESTIONS
// ============================================

async function loadQuestions() {

    try {

        const questionsRef =
            collection(
                db,
                "questions"
            );


        const questionsQuery =
            query(

                questionsRef,

                orderBy(
                    "createdAt",
                    "desc"
                )

            );


        const snapshot =
            await getDocs(
                questionsQuery
            );


        // Clear list

        questionsList.innerHTML = "";


        // Show count

        questionCount.textContent =
            snapshot.size;


        // No questions

        if (snapshot.empty) {

            questionsList.innerHTML =
                `
                <div class="empty-state">
                    No questions yet.
                    Be the first one.
                </div>
                `;

            return;
        }


        // ====================================
        // CREATE QUESTION CARDS
        // ====================================

        snapshot.forEach(
            (questionDoc) => {

                const data =
                    questionDoc.data();


                const yes =
                    data.yesVotes || 0;


                const no =
                    data.noVotes || 0;


                const total =
                    yes + no;


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


                // Create card

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "question-card";


                card.innerHTML = `

                    <div class="card-question">
                        ${escapeHTML(data.text)}
                    </div>

                    <div class="card-result">

                        <span>
                            YES ${yesPercentage}%
                        </span>

                        <span>
                            ${total} votes
                        </span>

                    </div>

                    <div class="mini-bar">

                        <div
                            class="mini-bar-fill"
                            style="width: ${yesPercentage}%"
                        ></div>

                    </div>

                    <div class="card-footer">

                        <span>
                            NO ${noPercentage}%
                        </span>

                        <span>
                            View →
                        </span>

                    </div>

                `;


                // Click card

                card.addEventListener(
                    "click",
                    () => {

                        openQuestion(
                            questionDoc.id
                        );

                    }
                );


                questionsList.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(error);

    }
}



// ============================================
// OPEN QUESTION
// ============================================

async function openQuestion(questionId) {

    try {

        const questionRef =
            doc(
                db,
                "questions",
                questionId
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


        // Save ID

        currentQuestionId =
            questionId;


        // Show question

        questionText.textContent =
            data.text;


        // Switch sections

        questionsSection.classList.add(
            "hidden"
        );


        questionSection.classList.remove(
            "hidden"
        );


        // Restore vote

        resetVoteButtons();


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

        console.error(error);

    }
}



// ============================================
// BACK BUTTON
// ============================================

backButton.addEventListener(
    "click",
    function () {

        questionSection.classList.add(
            "hidden"
        );


        questionsSection.classList.remove(
            "hidden"
        );


        currentQuestionId = null;


        loadQuestions();

    }
);



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
// VOTE
// ============================================

async function vote(type) {

    if (!currentQuestionId) {

        return;
    }


    // Check previous vote

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


        // Save vote locally

        localStorage.setItem(
            "vote_" + currentQuestionId,
            type
        );


        // Show selected button

        showSelectedVote(type);


        // Update results

        await loadResults();


    }
    catch (error) {

        console.error(error);

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
// RESET BUTTONS
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


        yesPercent.textContent =
            yesPercentage + "%";


        noPercent.textContent =
            noPercentage + "%";


        totalVotes.textContent =
            total;


        yesBar.style.width =
            yesPercentage + "%";


        noBar.style.width =
            noPercentage + "%";

    }
    catch (error) {

        console.error(error);

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


        explanationInput.value = "";


        loadExplanations();

    }
    catch (error) {

        console.error(error);

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

        console.error(error);

    }
}



// ============================================
// ESCAPE HTML
// ============================================
//
// Protect question cards from HTML injection.
//
// ============================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}



// ============================================
// START APP
// ============================================

loadQuestions();
