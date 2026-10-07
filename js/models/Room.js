export class Room {
    
    constructor(roomCode, hostId, isFreeWill = false, gridSize, wordList, status , players = []) {
        this.roomCode = roomCode
        this.hostId = hostId
        this.isFreeWill = isFreeWill
        this.gridSize = gridSize
        this.wordList = wordList
        this.status = status
        this.players = [...players]
        
    }
        addPlayer(player) {
        this.players.push(player);
    }
    
    removePlayer(player){
        let index = this.players.indexOf(player);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

}
        if (index !== -1) {
            this.words.splice(index, 1);
        }
    