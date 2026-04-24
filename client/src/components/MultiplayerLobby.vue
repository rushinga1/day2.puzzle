<script setup>
import { ref } from 'vue';

const props = defineProps({
  roomCode: String,
  gameStatus: String
});

const emit = defineEmits(['create', 'join', 'back']);
const joinCode = ref('');

const handleJoin = () => {
  if (joinCode.value) {
    emit('join', joinCode.value);
  }
};
</script>

<template>
  <div class="lobby-card glass-premium">
    <button @click="emit('back')" class="btn-back">← Back</button>
    
    <div class="lobby-header">
      <h2>MULTIPLAYER</h2>
      <p>Challenge a friend in real-time</p>
    </div>

    <div v-if="gameStatus === 'idle'" class="lobby-actions">
      <div class="action-section">
        <h3>Create a Room</h3>
        <button @click="emit('create')" class="btn-elite primary">CREATE ROOM</button>
      </div>

      <div class="divider"><span>OR</span></div>

      <div class="action-section">
        <h3>Join a Room</h3>
        <input v-model="joinCode" placeholder="ENTER CODE" class="input-elite" @keyup.enter="handleJoin" />
        <button @click="handleJoin" class="btn-elite secondary">JOIN ROOM</button>
      </div>
    </div>

    <div v-else-if="gameStatus === 'waiting'" class="waiting-area">
      <div class="code-box">
        <label>YOUR ROOM CODE</label>
        <div class="code">{{ roomCode }}</div>
      </div>
      <div class="status-msg">
        <span class="loader"></span>
        Waiting for opponent...
      </div>
      <p class="share-tip">Share this code with your friend</p>
    </div>
  </div>
</template>

<style scoped>
.lobby-card {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  padding: 40px;
  position: relative;
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  position: absolute;
  top: 20px;
  left: 20px;
}

.lobby-header {
  text-align: center;
  margin-bottom: 40px;
}

.lobby-header h2 {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 5px;
  background: linear-gradient(to right, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-section h3 {
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: var(--text-dim);
  text-align: center;
}

.divider {
  margin: 30px 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.1);
}

.divider span {
  position: relative;
  background: var(--bg);
  padding: 0 15px;
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 700;
}

.input-elite {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 12px;
  color: white;
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 5px;
  outline: none;
}

.waiting-area {
  text-align: center;
}

.code-box {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 30px;
}

.code-box label {
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: var(--text-dim);
}

.code {
  font-size: 3rem;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 10px;
}

.status-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  font-weight: 600;
  color: var(--primary);
}

.share-tip {
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-dim);
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
