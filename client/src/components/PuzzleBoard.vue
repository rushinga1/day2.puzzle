<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  board: Array,
  size: Number,
  isWon: Boolean,
  showHint: Boolean,
  readonly: Boolean
});

const emit = defineEmits(['move']);

const isAdjacentToEmpty = (index) => {
  const emptyIndex = props.board.indexOf(0);
  const row = Math.floor(index / props.size);
  const col = index % props.size;
  const emptyRow = Math.floor(emptyIndex / props.size);
  const emptyCol = emptyIndex % props.size;

  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  );
};

const handleTileClick = (index) => {
  if (props.readonly) return;
  emit('move', index);
};
</script>

<template>
  <div 
    class="puzzle-container"
    :class="{ 'readonly-board': readonly }"
    :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
  >
    <transition-group name="tile-move">
      <div
        v-for="(tile, index) in board"
        :key="tile"
        class="puzzle-tile"
        :class="{ 
          'empty': tile === 0, 
          'won': isWon, 
          'suggested': showHint && tile !== 0 && isAdjacentToEmpty(index)
        }"
        @click="handleTileClick(index)"
      >
        <span v-if="tile !== 0">{{ tile }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.puzzle-container {
  display: grid;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7);
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  position: relative;
}

.puzzle-tile {
  background: linear-gradient(135deg, hsl(245, 80%, 65%) 0%, hsl(280, 80%, 65%) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  border-radius: 16px;
  cursor: pointer;
  user-select: none;
  box-shadow: inset 0 2px 5px rgba(255,255,255,0.2), 
              0 10px 20px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.puzzle-tile:not(.empty)::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  20%, 100% { transform: translateX(100%) rotate(45deg); }
}

.puzzle-tile:not(.empty):hover {
  transform: scale(1.02);
  filter: brightness(1.1);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
}

.puzzle-tile:not(.empty):active {
  transform: scale(0.95);
}

.puzzle-tile.empty {
  background: transparent;
  cursor: default;
  box-shadow: none;
}

.puzzle-tile.suggested {
  border: 2px solid var(--accent);
  box-shadow: 0 0 20px var(--accent);
  animation: pulseSuggested 1.5s infinite ease-in-out;
  z-index: 10;
}

@keyframes pulseSuggested {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.3); }
}

.puzzle-tile.won {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  animation: winPulse 1s ease-out both;
}

@keyframes winPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.tile-move-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Readonly / Opponent Styles */
.readonly-board {
  max-width: 250px;
  padding: 10px;
  gap: 6px;
  border-radius: 16px;
}

.readonly-board .puzzle-tile {
  font-size: 1rem;
  border-radius: 8px;
  cursor: default;
  pointer-events: none;
}

.readonly-board .puzzle-tile::after {
  display: none;
}
</style>
