import { db } from '../config/firebase.js';
import { WordList } from '../models/WordList.js';
import { ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export class WordListService {
  static async createWordList(authorId, title, words = []) {
    if (!title || title.trim().length === 0) {
      throw new Error("חובה להזין שם לרשימה!");
    }

    const wordList = new WordList(words, title.trim(), authorId);

    if (!wordList.isValid()) {
      throw new Error("רשימת המילים אינה תקינה (אורך מינימלי לא מושג)!");
    }

    const wordListRef = push(ref(db, 'wordLists'));
    const listId = wordListRef.key;
    wordList.id = listId;

    await set(wordListRef, {
      id: wordList.id,
      authorId: wordList.authorId,
      title: wordList.title,
      words: wordList.words,
      createdAt: Date.now()
    });

    return wordList;
  }

  static async getUserWordLists(authorId) {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'wordLists'));

    if (!snapshot.exists()) {
      return [];
    }

    const allLists = snapshot.val();
    const userLists = [];

    Object.values(allLists).forEach(listData => {
      if (listData.authorId === authorId) {
        const wordList = new WordList(
          listData.words || [],
          listData.title,
          listData.authorId,
          listData.id
        );
        userLists.push(wordList);
      }
    });

    return userLists;
  }

  static async getWordListById(listId) {
    const snapshot = await get(ref(db, `wordLists/${listId}`));

    if (!snapshot.exists()) {
      throw new Error("רשימת המילים לא נמצאה!");
    }

    const data = snapshot.val();
    return new WordList(
      data.words || [],
      data.title,
      data.authorId,
      data.id
    );
  }

  static async updateWordList(wordList) {
    if (!wordList.id) {
      throw new Error("לא ניתן לעדכן רשימה ללא מזהה (ID)!");
    }

    if (!wordList.isValid()) {
      throw new Error("המידע ברשימה אינו תקין לבדיקה!");
    }

    await set(ref(db, `wordLists/${wordList.id}`), {
      id: wordList.id,
      authorId: wordList.authorId,
      title: wordList.title,
      words: wordList.words,
      updatedAt: Date.now()
    });
  }
}