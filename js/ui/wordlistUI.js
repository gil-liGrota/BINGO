import { WordListService } from '../services/wordList.service.js';
import { WordList } from '../models/WordList.js';

export class WordListUI {
  constructor() {
    this.titleInput = document.getElementById('listTitleInput');
    this.wordInput = document.getElementById('wordInput');
    this.btnAddWord = document.getElementById('btnAddWord');
    this.btnSaveList = document.getElementById('btnSaveList');
    this.wordsContainer = document.getElementById('wordsContainer');
    this.savedListsContainer = document.getElementById('savedListsContainer');
    this.validationMsg = document.getElementById('validationMsg');

    this.currentWorkingList = new WordList();
    this.currentUser = null;
    this.onSelectCallback = null;
  }

  init(options = {}) {
    if (typeof options.onSelect === 'function') {
      this.onSelectCallback = options.onSelect;
    }
    this.bindEvents();
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      this.currentWorkingList.authorId = user.uid;
      this.loadUserLists();
    }
  }

  bindEvents() {
    if (this.btnAddWord) {
      this.btnAddWord.onclick = () => this.handleAddWord();
    }
    if (this.wordInput) {
      this.wordInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAddWord();
        }
      };
    }
    if (this.btnSaveList) {
      this.btnSaveList.onclick = () => this.handleSaveList();
    }
  }

  handleAddWord() {
    if (!this.wordInput) return;
    const word = this.wordInput.value.trim();

    if (!word) return;

    if (this.currentWorkingList.addWord(word)) {
      this.wordInput.value = '';
      this.renderCurrentWords();
      this.updateValidationUI();
    } else {
      alert('המילה כבר קיימת ברשימה!');
    }
  }

  async handleSaveList() {
    if (!this.currentUser) {
      alert('יש להתחבר כדי לשמור רשימה!');
      return;
    }

    const title = this.titleInput ? this.titleInput.value.trim() : '';

    try {
      if (this.currentWorkingList.id) {
        this.currentWorkingList.title = title;
        await WordListService.updateWordList(this.currentWorkingList);
        alert('הרשימה עודכנה בהצלחה!');
      } else {
        await WordListService.createWordList(
          this.currentUser.uid,
          title,
          this.currentWorkingList.words
        );
        alert('הרשימה נשמרה בהצלחה!');
      }

      this.resetForm();
      this.loadUserLists();
    } catch (error) {
      console.error('שגיאה בשמירת הרשימה:', error);
      alert(error.message || 'שגיאה בשמירת הרשימה');
    }
  }

  async loadUserLists() {
    if (!this.currentUser) return;

    try {
      const lists = await WordListService.getUserWordLists(this.currentUser.uid);
      this.renderSavedLists(lists);
    } catch (error) {
      console.error('שגיאה שטעינת הרשימות:', error);
    }
  }

  renderCurrentWords() {
    if (!this.wordsContainer) return;
    this.wordsContainer.innerHTML = '';

    this.currentWorkingList.words.forEach((word) => {
      const tag = document.createElement('span');
      tag.className = 'word-tag';
      tag.innerHTML = `
        ${word}
        <button class="btn-remove" data-word="${word}">&times;</button>
      `;

      tag.querySelector('.btn-remove').onclick = () => {
        this.currentWorkingList.removeWord(word);
        this.renderCurrentWords();
        this.updateValidationUI();
      };

      this.wordsContainer.appendChild(tag);
    });
  }

  renderSavedLists(lists) {
    if (!this.savedListsContainer) return;
    this.savedListsContainer.innerHTML = '';

    if (!lists || lists.length === 0) {
      this.savedListsContainer.innerHTML = '<p>אין רשימות שמורות עדיין.</p>';
      return;
    }

    lists.forEach((list) => {
      const card = document.createElement('div');
      card.className = 'list-card';
      card.innerHTML = `
        <h4>${list.title}</h4>
        <p>${list.words.length} מילים</p>
        <button class="btn-select-list">בחר רשימה זו</button>
      `;

      card.querySelector('.btn-select-list').onclick = () => {
        if (typeof this.onSelectCallback === 'function') {
          this.onSelectCallback(list);
        }
      };

      this.savedListsContainer.appendChild(card);
    });
  }

  updateValidationUI() {
    const isValid = this.currentWorkingList.isValid();

    if (this.btnSaveList) {
      this.btnSaveList.disabled = !isValid;
    }

    if (this.validationMsg) {
      if (isValid) {
        this.validationMsg.textContent = 'הרשימה תקינה ומוכנה לשמירה!';
        this.validationMsg.style.color = 'var(--success, green)';
      } else {
        this.validationMsg.textContent = `יש להזין לפחות ${WordList.MIN_WORDS || 25} מילים תקינות.`;
        this.validationMsg.style.color = 'var(--danger, red)';
      }
    }
  }

  resetForm() {
    this.currentWorkingList = new WordList([], '', this.currentUser?.uid || null);
    if (this.titleInput) this.titleInput.value = '';
    if (this.wordInput) this.wordInput.value = '';
    this.renderCurrentWords();
    this.updateValidationUI();
  }
}