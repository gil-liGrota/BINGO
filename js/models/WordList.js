const MIN_LENGTH = 9;

export class WordList{
   
    constructor(words = [],title,authorId,id) { 
        this.words = [...words];
        this.authorId = authorId;
        this.title = title; 
        this.id = id;
    } 

    addWord(word) {
        const cleanWord = word.trim();
        if (cleanWord && !this.words.includes(cleanWord)) {
        this.words.push(cleanWord);
        return true;
        }
        return false;
    }
    
    removeWord(word){
        this.words = this.words.filter(w => w !== word);
    }

    isValid() {
      return (
        typeof this.title === 'string' &&
        this.title.trim().length > 0 &&
        Array.isArray(this.words) &&
        this.words.length >= WordList.MIN_WORDS
      );
    }
}
