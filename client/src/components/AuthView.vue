<script setup>
import { defineEmits } from 'vue';
import AuthForm from './AuthForm.vue';

const emit = defineEmits(['auth-success', 'back']);
</script>

<template>
  <div class="auth-view">
    <header class="auth-header">
      <button @click="emit('back')" class="btn-back-main">
        <span class="icon">🏠</span> Back to Landing
      </button>
    </header>
    
    <div class="auth-container">
      <AuthForm @auth-success="(data) => emit('auth-success', data)" />
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  width: 450px;
  max-width: 450px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.auth-header {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 100;
}

.btn-back-main {
  background: var(--primary);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 10px 20px;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-back-main:hover {
  background: var(--secondary);
  transform: translateX(-5px) scale(1.05);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
}

.auth-container {
  width: 100%;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
