const PowerCalculator = require('./PowerCalculator');
const { GAME_DURATION_MS, TICK_RATE_MS, BATTLE_LINE_LERP_SPEED } = require('./constants');

class GameRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.players = []; // Array of { id, name, powerData }
    this.phase = 'waiting'; // waiting, countdown, playing, finished
    
    this.battleLinePos = 50; // 50 is center. 0 is P1 edge, 100 is P2 edge
    this.startTime = 0;
    this.loopInterval = null;
  }

  addPlayer(socketId, name) {
    if (this.isFull()) return false;
    
    this.players.push({
      id: socketId,
      name,
      powerData: { volume: 0, sustain: 1.0, totalPower: 0 }
    });
    
    // Broadcast updated player list
    this.io.to(this.roomId).emit('room:updated', { 
      players: this.players.map(p => ({ id: p.id, name: p.name })) 
    });
    
    return true;
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.id !== socketId);
    if (this.players.length === 0) {
      this.stopLoop();
      this.phase = 'finished';
    }
  }

  hasPlayer(socketId) {
    return this.players.some(p => p.id === socketId);
  }

  isFull() {
    return this.players.length >= 2;
  }

  isEmpty() {
    return this.players.length === 0;
  }

  startCountdown() {
    if (this.phase !== 'waiting') return;
    this.phase = 'countdown';
    
    const config = {
      p1: { id: this.players[0].id, name: this.players[0].name },
      p2: { id: this.players[1].id, name: this.players[1].name },
      duration: GAME_DURATION_MS
    };

    this.io.to(this.roomId).emit('room:ready', config);

    let count = 3;
    const countInterval = setInterval(() => {
      if (count > 0) {
        this.io.to(this.roomId).emit('game:countdown', { count });
        count--;
      } else {
        clearInterval(countInterval);
        this.io.to(this.roomId).emit('game:countdown', { count: 'BARK!' });
        this.startGame();
      }
    }, 1000);
  }

  startGame() {
    this.phase = 'playing';
    this.startTime = Date.now();
    this.battleLinePos = 50;
    
    this.io.to(this.roomId).emit('game:start', { 
      startTime: this.startTime,
      duration: GAME_DURATION_MS
    });

    this.loopInterval = setInterval(() => this.gameTick(), TICK_RATE_MS);
  }

  stopLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  handlePowerUpdate(socketId, rawData) {
    if (this.phase !== 'playing') return;
    
    const playerIndex = this.players.findIndex(p => p.id === socketId);
    if (playerIndex === -1) return;

    this.players[playerIndex].powerData = PowerCalculator.validate(rawData);
  }

  gameTick() {
    if (this.phase !== 'playing') return;

    const p1Power = this.players[0]?.powerData?.totalPower || 0;
    const p2Power = this.players[1]?.powerData?.totalPower || 0;
    
    const maxPossibleDiff = 300; // 100 * 3.0
    const powerDiff = p2Power - p1Power; // Positive means P2 pushing left (towards 0), Negative means P1 pushing right (towards 100)
    
    // If P1 is stronger, line moves towards 100. If P2 is stronger, line moves towards 0.
    const targetMovement = (powerDiff / maxPossibleDiff) * -10; // Speed multiplier
    
    const targetPos = Math.max(0, Math.min(100, this.battleLinePos + targetMovement));
    
    // Lerp
    this.battleLinePos += (targetPos - this.battleLinePos) * BATTLE_LINE_LERP_SPEED;

    const scaleFactor = (this.battleLinePos - 50) / 50; // -1 to 1
    const p1Scale = 1.0 + scaleFactor * 0.5; // P1 grows when line is > 50
    const p2Scale = 1.0 - scaleFactor * 0.5; // P2 grows when line is < 50

    const elapsed = Date.now() - this.startTime;
    const timeLeft = Math.max(0, Math.floor((GAME_DURATION_MS - elapsed) / 1000));

    // Check Win Conditions
    let winnerIndex = null;
    let reason = '';

    if (this.battleLinePos >= 99.5) {
      winnerIndex = 0; // P1 Knockout
      reason = 'Knockout!';
    } else if (this.battleLinePos <= 0.5) {
      winnerIndex = 1; // P2 Knockout
      reason = 'Knockout!';
    } else if (timeLeft <= 0) {
      // Time up
      if (this.battleLinePos > 50) winnerIndex = 0;
      else if (this.battleLinePos < 50) winnerIndex = 1;
      else winnerIndex = -1; // Tie
      reason = 'Time Up!';
    }

    if (winnerIndex !== null) {
      this.endGame(winnerIndex, reason);
    } else {
      // Broadcast state
      this.io.to(this.roomId).emit('game:state', {
        p1Power,
        p2Power,
        battleLinePos: this.battleLinePos,
        p1Scale,
        p2Scale,
        timeLeft
      });
    }
  }

  endGame(winnerIndex, reason) {
    this.phase = 'finished';
    this.stopLoop();

    let winnerName = 'Tie';
    if (winnerIndex === 0) winnerName = this.players[0].name;
    if (winnerIndex === 1) winnerName = this.players[1].name;

    this.io.to(this.roomId).emit('game:end', {
      winner: winnerName,
      winnerIndex: winnerIndex + 1, // 1 or 2, or 0 for tie
      reason,
      finalPos: this.battleLinePos
    });
  }
}

module.exports = GameRoom;
