export class Room {
    
    constructor(roomCode, hostId, isFreeWill, gridSize, wordList, status, players) {
        this.roomCode = roomCode
        this.hostId = hostId
        this.isFreeWill = isFreeWill
        this.gridSize = gridSize
        this.wordList = wordList
        this.status = status
        this.players = players
        
    }

}
