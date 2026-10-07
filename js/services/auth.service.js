import { auth, db } from '../config/firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export class AuthService {
  static async register(username, password) {
    const cleanInput = username.trim().toLowerCase();
    const fakeEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@bingo.app`;

    const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      username: username,
      createdAt: Date.now()
    });

    return { uid: user.uid, username };
  }

  static async login(username, password) {
    const cleanInput = username.trim().toLowerCase();
    const fakeEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@bingo.app`;

    const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    const snapshot = await get(ref(db, `users/${user.uid}`));
    const userData = snapshot.val();

    return { uid: user.uid, username: userData?.username || username };
  }

  static async logout() {
    await signOut(auth);
  }

  static onAuthChange(callback) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snapshot = await get(ref(db, `users/${user.uid}`));
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  }
}