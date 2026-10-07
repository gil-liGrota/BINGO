const MIN_LENGTH = 9;

export class WordList{
   
    constructor(words = [],title,authorId,id) { 
        this.words = [...words];
        this.authorId = authorId;
        this.title = title; 
        this.id = id;
    } 

    addWord(word) {
        this.words.push(word);
    }
    
    removeWord(word){
        let index = this.words.indexOf(word);
        if (index !== -1) {
            this.words.splice(index, 1);
        }
    }

    isValid() {
      return this.words.length >= MIN_LENGTH
    }
}
