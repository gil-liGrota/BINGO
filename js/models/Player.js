export class BlockedState {

  constructor(isBlocked = false, blockedByUid = null, targetWord = null) {
    this.isBlocked = isBlocked;
    this.blockedByUid = blockedByUid;
    this.targetWord = targetWord;
    this.isResolved = !isBlocked;
  }
  
}

export class Player {

  constructor(uid, username) {
    this.uid = uid;
    this.username = username;
    this.board = [];
    this.markedIndices = [];
    this.isBoardReady = false;
    this.hasUsedBlock = false;
    this.blockedState = new BlockedState(); 
    this.isFinished = false;
    this.finishTime = null;
  }

}
