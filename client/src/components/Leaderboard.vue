<script setup>
import { ref, onMounted, watch, defineProps } from 'vue';

const props = defineProps({
  difficulty: String,
  refreshTrigger: Number
});

const scores = ref([]);
const loading = ref(false);

const fetchScores = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3005/api/scores?difficulty=${props.difficulty}`);
    if (response.ok) {
      scores.value = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch scores:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchScores);
watch(() => props.difficulty, fetchScores);
watch(() => props.refreshTrigger, fetchScores);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="leaderboard">
    <h2 class="title">Global Leaderboard</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="scores.length === 0" class="no-scores">No scores yet.</div>
    <div v-else class="score-list">
      <transition-group name="list-slide">
        <div v-for="(score, index) in scores" :key="score._id" class="score-row" :style="{ transitionDelay: `${index * 50}ms` }">
          <div class="rank">{{ index + 1 }}</div>
          <div class="player">{{ score.playerName }}</div>
          <div class="metrics">
            <span class="time">{{ formatTime(score.time) }}</span>
            <span class="moves">{{ score.moves }} moves</span>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  background: var(--card-bg);
  backdrop-filter: blur(25px);
  padding: 30px;
  border-radius: 32px;
  border: 1px solid var(--glass-border);
  margin-top: 30px;
  width: 100%;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 15px;
  text-align: center;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.rank {
  font-weight: 900;
  color: var(--accent);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  font-size: 0.8rem;
}

.player {
  flex: 1;
}

.metrics {
  font-size: 0.9rem;
  color: #94a3b8;
}

.time {
  color: #10b981;
  margin-right: 10px;
}

/* List Animations */
.list-slide-enter-active {
  transition: all 0.5s ease;
}

.list-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
