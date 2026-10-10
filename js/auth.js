import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const errorContainer = document.getElementById('error-container');

let isRegisterMode = false;

let usernameInput = document.getElementById('username');
if (!usernameInput) {
    usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'שם משתמש';
    usernameInput.style.display = 'none';
    authForm.insertBefore(usernameInput, emailInput);
}

toggleAuthModeBtn.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    if(isRegisterMode) {
        submitBtn.textContent = 'הרשמה';
        toggleAuthModeBtn.textContent = 'כבר יש לך חשבון? התחבר';
        usernameInput.style.display = 'block';
        usernameInput.required = true;
    } else {
        submitBtn.textContent = 'התחברות';
        toggleAuthModeBtn.textContent = 'אין לך חשבון? הירשם';
        usernameInput.style.display = 'none';
        usernameInput.required = false;
    }
    errorContainer.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.textContent = '';

    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;

    if(isRegisterMode) {
        await registerUser(email, password, username);
    } else {
        await loginUser(email, password);
    }
});

export async function registerUser(email, password, username) {
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            username: username,
            createdAt: new Date().toISOString()
        });

        console.log("User registered and data saved:", user.uid);

        window.location.href = "lobby.html";

    } catch (error) {
        console.error("Error registering user:", error);
        errorContainer.textContent = "שגיאה ביצירת המשתמש.";
    }
}

export async function loginUser(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("התחברות הצליחה!");
        window.location.href = 'lobby.html';
    } catch (error) {
        console.error("שגיאה בהתחברות:", error.message);
        errorContainer.innerText = "שגיאה: פרטי ההתחברות שגויים או שהמשתמש אינו קיים.";
    }
}
