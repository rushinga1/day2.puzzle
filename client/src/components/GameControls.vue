<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  moves: Number,
  time: Number,
  difficulty: String,
  showHint: Boolean,
  isGuest: Boolean,
  hintsRemaining: Number,
  isSolving: Boolean
});

const emit = defineEmits(['restart', 'changeDifficulty', 'hint', 'solve']);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="game-controls">
    <div class="stats">
      <div class="stat-item">
        <span class="label">Moves</span>
        <span class="value" :key="moves">{{ moves }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Time</span>
        <span class="value" :key="time">{{ formatTime(time) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">Mode</span>
        <span class="value">{{ difficulty }}</span>
      </div>
    </div>

    <div class="actions">
      <div class="main-actions">
        <button @click="emit('restart')" class="btn primary">Restart</button>
        <button 
          @click="emit('solve')"
          class="btn solve-btn"
          :disabled="isSolving"
        >
          ⚡ SOLVE FAST
        </button>
        <button 
          v-if="!isGuest"
          @click="emit('hint')" 
          :class="['btn hint-btn', { active: showHint }]"
          :disabled="hintsRemaining === 0 || isSolving"
        >
          💡 Hint ({{ hintsRemaining }})
        </button>
        <div v-else class="guest-msg">
          Login for hints
        </div>
      </div>
      <div class="difficulty-picker">
        <button 
          v-for="diff in ['Easy', 'Medium', 'Hard']" 
          :key="diff"
          @click="emit('changeDifficulty', diff)"
          :class="['btn-small', { active: difficulty === diff }]"
        >
          {{ diff }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-controls {
  background: var(--card-bg);
  backdrop-filter: blur(25px);
  padding: 24px;
  border-radius: 32px;
  border: 1px solid var(--glass-border);
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.label {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  display: inline-block;
  animation: valueUpdate 0.3s ease-out;
}

@keyframes valueUpdate {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); color: #6366f1; }
  100% { transform: scale(1); }
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

.btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
}

.difficulty-picker {
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.2);
  padding: 5px;
  border-radius: 10px;
}

.btn-small {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-small.active {
  background: #6366f1;
  color: white;
}

.main-actions {
  display: flex;
  gap: 10px;
}

.hint-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hint-btn.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #10b981;
}

.hint-btn:disabled, .solve-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.solve-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 10px 15px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
}

.solve-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.guest-msg {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
  display: flex;
  align-items: center;
}
</style>
