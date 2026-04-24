import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useMultiplayer() {
  const socket = io('http://localhost:3005');
  const roomCode = ref('');
  const opponent = ref(null);
  const opponentBoard = ref([]);
  const opponentStats = ref({ moves: 0, time: 0 });
  const isMultiplayer = ref(false);
  const gameStatus = ref('idle'); // 'idle', 'waiting', 'playing', 'finished'
  const winner = ref('');

  const createRoom = (username) => {
    socket.emit('create-room', { username });
  };

  const joinRoom = (code, username) => {
    socket.emit('join-room', { roomCode: code, username });
  };

  const sendMove = (board, moves, time) => {
    if (roomCode.value) {
      socket.emit('move-tile', { roomCode: roomCode.value, board, moves, time });
    }
  };

  const reportWin = (username, moves, time) => {
    if (roomCode.value) {
      socket.emit('player-won', { roomCode: roomCode.value, username, moves, time });
    }
  };

  socket.on('room-created', (code) => {
    roomCode.value = code;
    gameStatus.value = 'waiting';
  });

  socket.on('game-start', ({ players, seed }) => {
    const me = socket.id;
    opponent.value = players.find(p => p.id !== me);
    opponentBoard.value = [...seed];
    isMultiplayer.value = true;
    gameStatus.value = 'playing';
    // emit an event that App.vue can listen to to sync local board
    window.dispatchEvent(new CustomEvent('multiplayer-start', { detail: { seed } }));
  });

  socket.on('opponent-moved', ({ board, moves, time }) => {
    opponentBoard.value = board;
    opponentStats.value = { moves, time };
  });

  socket.on('game-over', ({ winner: winName, moves, time }) => {
    winner.value = winName;
    gameStatus.value = 'finished';
  });

  socket.on('error', (msg) => {
    alert(msg);
  });

  onUnmounted(() => {
    socket.disconnect();
  });

  return {
    roomCode,
    opponent,
    opponentBoard,
    opponentStats,
    isMultiplayer,
    gameStatus,
    winner,
    createRoom,
    joinRoom,
    sendMove,
    reportWin
  };
}
