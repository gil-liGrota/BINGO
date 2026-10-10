import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const wordsInput = document.getElementById('words-input');
const saveWordsBtn = document.getElementById('save-words-btn');
const errorMsg = document.getElementById('error-msg');
let currentUser = null;

function checkAuthState(){
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log("משתמש מחובר:", user.uid, user.email);
    
        } else {
            window.location.href = 'index.html';
        }
    });
}

checkAuthState();

saveWordsBtn.addEventListener('click', async () => {
    errorMsg.textContent = '';
    const rawText = wordsInput.value;

    try {
        const wordsArray = parseAndValidateWords(rawText);
        await saveWordsToFirestore(currentUser.uid, wordsArray);
        alert('רשימת המילים נשמרה בהצלחה!');
        window.location.href = 'lobby.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});

function parseAndValidateWords(rawText) {
    const words = rawText
        .split(/[\n,]+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);

    if (words.length < 9) {
        throw new Error('אנא הכנס לפחות 9 מילים.');
    }
    return words;
}

async function saveWordsToFirestore(userId, wordsArray) {
    await setDoc(doc(db, "wordLists", userId),{
        words: wordsArray,
        updateAt: new Date().toISOString()
    });
}