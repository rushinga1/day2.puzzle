<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSlidingPuzzle } from './composables/useSlidingPuzzle';
import PuzzleBoard from './components/PuzzleBoard.vue';
import GameControls from './components/GameControls.vue';
import Leaderboard from './components/Leaderboard.vue';
import LandingPage from './components/LandingPage.vue';
import AuthView from './components/AuthView.vue';
import MultiplayerLobby from './components/MultiplayerLobby.vue';
import { useMultiplayer } from './composables/useMultiplayer';

const { board, size, moves, elapsedTime, isWon, showHint, hintsRemaining, initGame, moveTile, toggleHint } = useSlidingPuzzle();
const { 
  roomCode, opponent, opponentBoard, opponentStats, isMultiplayer, 
  gameStatus, winner, createRoom, joinRoom, sendMove, reportWin 
} = useMultiplayer();

const currentView = ref('landing'); // 'landing', 'auth', 'game', 'multiplayer'
const isLoggedIn = ref(!!localStorage.getItem('token'));
const currentUser = ref(localStorage.getItem('username') || '');
const isGuest = ref(false);
const difficulty = ref('Easy');
const playerName = ref('');
const showWinModal = ref(false);
const refreshLeaderboard = ref(0);

if (isLoggedIn.value) {
  currentView.value = 'game';
}

const sizeMap = {
  'Easy': 3,
  'Medium': 4,
  'Hard': 5
};

const handleDifficultyChange = (newDiff) => {
  difficulty.value = newDiff;
  initGame(sizeMap[newDiff]);
};

const handleRestart = () => {
  initGame(sizeMap[difficulty.value]);
};

const handleAuthSuccess = (data) => {
  isLoggedIn.value = true;
  currentUser.value = data.username;
  isGuest.value = false;
  currentView.value = 'game';
};

const handleNavigation = (view) => {
  if (view === 'guest') {
    isGuest.value = true;
    isLoggedIn.value = false;
    currentView.value = 'game';
  } else if (view === 'multiplayer') {
    currentView.value = 'multiplayer';
  } else {
    currentView.value = view;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  isLoggedIn.value = false;
  currentUser.value = '';
  currentView.value = 'landing';
};

const submitScore = async () => {
  const name = currentUser.value || playerName.value || 'Anonymous';
  if (!name.trim()) return;

  try {
    const response = await fetch('http://localhost:3005/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: name,
        time: elapsedTime.value,
        moves: moves.value,
        difficulty: difficulty.value
      })
    });

    if (response.ok) {
      showWinModal.value = false;
      refreshLeaderboard.value++;
      playerName.value = '';
    }
  } catch (err) {
    console.error('Failed to submit score:', err);
  }
};

onMounted(() => {
  initGame(3);
});

watch(isWon, (won) => {
  if (won) {
    showWinModal.value = true;
    if (isMultiplayer.value) {
      reportWin(currentUser.value || 'Anonymous', moves.value, elapsedTime.value);
    }
  }
});

// Multiplayer move sync
watch([board, moves, elapsedTime], () => {
  if (isMultiplayer.value && gameStatus.value === 'playing') {
    sendMove([...board.value], moves.value, elapsedTime.value);
  }
});

// Handle seed sync from socket
window.addEventListener('multiplayer-start', (e) => {
  const { seed } = e.detail;
  difficulty.value = 'Easy';
  initGame(3); // Reset internal state
  board.value = [...seed]; // Force seed
  currentView.value = 'game';
});
</script>

<template>
  <div class="app-wrapper">
    <!-- Animated Aurora Background -->
    <div class="aurora-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="currentView === 'landing'" key="landing" class="landing-container">
        <LandingPage @navigate="handleNavigation" />
      </div>

      <div v-else-if="currentView === 'auth'" key="auth" class="auth-view-container">
        <AuthView @auth-success="handleAuthSuccess" @back="currentView = 'landing'" />
      </div>

      <div v-else-if="currentView === 'multiplayer'" key="multiplayer" class="multiplayer-lobby-container">
        <MultiplayerLobby 
          :roomCode="roomCode" 
          :gameStatus="gameStatus"
          @create="createRoom(currentUser || 'Player 1')"
          @join="(code) => joinRoom(code, currentUser || 'Player 2')"
          @back="currentView = 'landing'"
        />
      </div>

      <div v-else-if="currentView === 'game'" key="game" class="game-container">
        <header class="game-header">
          <div class="top-nav">
            <button @click="currentView = 'landing'" class="btn-back-main">
              <span class="icon">🏠</span> Menu
            </button>
            <div class="user-info-pill">
              <template v-if="isLoggedIn">
                <span class="user-status online"></span>
                <span class="username"><strong>{{ currentUser }}</strong></span>
                <button @click="handleLogout" class="btn-logout">Logout</button>
              </template>
              <template v-else>
                <span class="user-status guest"></span>
                <span>Guest</span>
                <button @click="currentView = 'auth'" class="btn-login-cta">Login</button>
              </template>
            </div>
          </div>
          <h1 class="elite-title">MRDEV<span>PUZZLE</span></h1>
          <p class="elite-subtitle">MASTER THE ART OF MOTION</p>
        </header>

        <main class="game-main" :class="{ 'multiplayer-layout': isMultiplayer }">
          <div class="primary-play-area">
            <GameControls 
              class="stagger-1"
              :moves="moves" 
              :time="elapsedTime" 
              :difficulty="difficulty"
              :showHint="showHint"
              :hintsRemaining="hintsRemaining"
              :isGuest="isGuest"
              @restart="handleRestart"
              @changeDifficulty="handleDifficultyChange"
              @hint="toggleHint"
            />

            <PuzzleBoard 
              class="stagger-2"
              :board="board" 
              :size="size" 
              :isWon="isWon"
              :showHint="showHint"
              @move="moveTile"
            />
          </div>

          <div v-if="isMultiplayer" class="opponent-view stagger-3">
            <div class="opponent-header">
              <span class="vs-badge">VS</span>
              <h3>{{ opponent?.username }}</h3>
              <div class="opponent-stats">
                <span>Moves: {{ opponentStats.moves }}</span>
                <span>Time: {{ opponentStats.time }}s</span>
              </div>
            </div>
            <PuzzleBoard 
              :board="opponentBoard" 
              :size="3" 
              :readonly="true"
            />
            <div v-if="gameStatus === 'finished'" class="game-result">
              {{ winner === (currentUser || 'Anonymous') ? 'YOU WON!' : 'OPPONENT WON' }}
            </div>
          </div>

          <Leaderboard 
            v-if="!isMultiplayer"
            class="stagger-3"
            :difficulty="difficulty" 
            :refreshTrigger="refreshLeaderboard"
          />
        </main>

        <div v-if="showWinModal" class="modal-overlay">
          <div class="modal-content glass-premium">
            <div class="win-icon">🎉</div>
            <h2>VICTORY!</h2>
            <p>Puzzle mastered in <strong>{{ moves }}</strong> moves.</p>
            
            <div v-if="!isLoggedIn" class="input-group-elite">
              <input 
                v-model="playerName" 
                placeholder="YOUR NAME"
                @keyup.enter="submitScore"
              />
            </div>
            <div v-else class="win-msg">
              Recording score for <strong>{{ currentUser }}</strong>
            </div>

            <div class="modal-actions">
              <button @click="submitScore" class="btn-elite primary">SUBMIT SCORE</button>
              <button @click="showWinModal = false" class="btn-elite secondary">CLOSE</button>
            </div>
          </div>
        </div>

        <footer class="elite-footer">
          <p>&copy; 2026 MRDEV GAMES &bull; ENGINEERED FOR EXCELLENCE</p>
          <p class="dev-name">DEVELOPED BY MUGISHA RUSHINGA GUEVARA</p>
        </footer>
      </div>
    </transition>
  </div>
</template>

<style>
:root {
  --primary: #6366f1;
  --secondary: #a855f7;
  --bg: #0f172a;
  --text: #f8fafc;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent),
              radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.1), transparent);
}

header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -2px;
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h1 span {
  font-weight: 300;
  color: white;
  -webkit-text-fill-color: white;
}

.subtitle {
  color: #94a3b8;
  margin-top: 5px;
}

main {
  width: 100%;
  max-width: 600px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: #1e293b;
  padding: 40px;
  border-radius: 24px;
  max-width: 450px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.modal-content h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.modal-content p {
  color: #94a3b8;
  margin-bottom: 25px;
}

.input-group {
  text-align: left;
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, #0a0e1a, #050811);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: blobMove 20s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
}

.blob-1 { width: 600px; height: 600px; background: var(--primary); top: -200px; left: -200px; }
.blob-2 { width: 500px; height: 500px; background: var(--secondary); bottom: -100px; right: -100px; animation-delay: -5s; }
.blob-3 { width: 400px; height: 400px; background: var(--accent); top: 40%; left: 60%; animation-delay: -10s; }
.blob-4 { width: 300px; height: 300px; background: #ff3366; bottom: 20%; left: 10%; animation-delay: -15s; }

@keyframes blobMove {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(100px, 100px) scale(1.2); }
}

/* Top Navigation */
.top-nav {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.btn-back-main {
  background: var(--primary);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 8px 18px;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-back-main:hover {
  background: var(--secondary);
  transform: translateX(-5px) scale(1.05);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
}

.user-info-pill {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  padding: 6px 6px 6px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
}

.user-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.user-status.online { background: #10b981; box-shadow: 0 0 10px #10b981; }
.user-status.guest { background: #64748b; }

.btn-logout, .btn-login-cta {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 6px 12px;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-login-cta {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--primary);
}

.btn-logout:hover, .btn-login-cta:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

/* Header Styling */
.game-header {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;
}

.elite-title {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: 15px;
  margin-left: 15px; /* Offset spacing */
  background: linear-gradient(to right, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
}

.elite-title span {
  font-weight: 300;
  color: white;
  -webkit-text-fill-color: white;
}

.elite-subtitle {
  color: var(--accent);
  letter-spacing: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 5px;
  opacity: 0.8;
}

/* Premium Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.glass-premium {
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 50px;
  border-radius: 40px;
  text-align: center;
  box-shadow: 0 40px 100px rgba(0,0,0,0.8);
  max-width: 500px;
  width: 90%;
}

.win-icon { font-size: 4rem; margin-bottom: 20px; }
.glass-premium h2 { font-size: 3rem; font-weight: 900; margin-bottom: 10px; }

.input-group-elite input {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 16px;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 30px;
  outline: none;
  letter-spacing: 2px;
}

.btn-elite {
  padding: 16px 32px;
  border-radius: 16px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  margin-bottom: 10px;
}

.btn-elite.primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-elite.secondary {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
}

.btn-elite:hover {
  transform: translateY(-5px);
  filter: brightness(1.1);
}

.elite-footer {
  margin-top: 60px;
  padding: 40px;
  color: rgba(255,255,255,0.2);
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dev-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 3px;
}

/* Utility Animations */
.stagger-1 { animation: eliteUp 1s ease-out 0.1s both; }
.stagger-2 { animation: eliteUp 1s ease-out 0.2s both; }
.stagger-3 { animation: eliteUp 1s ease-out 0.3s both; }

@keyframes eliteUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: all 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.98); }

/* Multiplayer Layout */
.multiplayer-layout {
  display: flex;
  max-width: 1000px;
  gap: 40px;
  align-items: flex-start;
}

.primary-play-area {
  flex: 1;
}

.opponent-view {
  width: 300px;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 30px;
  border: 1px solid var(--glass-border);
  text-align: center;
}

.opponent-header {
  margin-bottom: 20px;
}

.vs-badge {
  background: var(--accent);
  color: black;
  padding: 4px 12px;
  border-radius: 100px;
  font-weight: 900;
  font-size: 0.7rem;
  margin-bottom: 10px;
  display: inline-block;
}

.opponent-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 5px;
}

.game-result {
  margin-top: 20px;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary);
  text-shadow: 0 0 10px var(--primary);
}

@media (max-width: 900px) {
  .multiplayer-layout {
    flex-direction: column;
    align-items: center;
  }
  .opponent-view {
    width: 100%;
    max-width: 500px;
  }
}
</style>
