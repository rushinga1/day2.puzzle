<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['navigate']);
</script>

<template>
  <div class="landing-page">
    <div class="animated-bg">
      <div class="cube" v-for="n in 5" :key="n"></div>
    </div>
    
    <div class="hero">
      <div class="logo-wrapper">
        <div class="logo-icon">🧩</div>
      </div>
      <h1 class="fade-in">Mrdev<span> puzzle game</span></h1>
      <p class="description slide-up">
        Challenge your mind with the ultimate sliding puzzle. 
        Track your progress, unlock achievements, and compete globally.
      </p>
      
      <div class="cta-group fade-in-delay">
        <button @click="emit('navigate', 'multiplayer')" class="btn primary pulse">
          Multiplayer Challenge
        </button>
        <button @click="emit('navigate', 'auth')" class="btn secondary">
          Login / Signup
        </button>
        <button @click="emit('navigate', 'guest')" class="btn secondary">
          Play as Guest
        </button>
      </div>
    </div>
    
    <div class="features-floating">
      <div class="feature-card" v-for="(f, i) in features" :key="i">
        <span class="icon">{{ f.icon }}</span>
        <h4>{{ f.title }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      features: [
        { icon: '⏱️', title: 'Fast Play' },
        { icon: '🏆', title: 'Global Ranks' },
        { icon: '💡', title: 'Pro Hints' }
      ]
    }
  }
}
</script>

<style scoped>
.landing-page {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
}

.hero {
  z-index: 10;
  text-align: center;
}

.logo-wrapper {
  animation: float 4s ease-in-out infinite;
}

.logo-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
}

h1 {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

h1 span {
  color: white;
  -webkit-text-fill-color: white;
  font-weight: 300;
}

.description {
  color: #94a3b8;
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.cta-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn.primary {
  background: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}

.btn.primary:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 20px 35px -5px rgba(99, 102, 241, 0.5);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.pulse {
  animation: pulse 2s infinite;
}

.fade-in {
  animation: fadeIn 1s ease-out;
}

.fade-in-delay {
  animation: fadeIn 1s ease-out 0.5s both;
}

.slide-up {
  animation: slideUp 1s ease-out 0.2s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Floating BG Elements */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cube {
  position: absolute;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 12px;
  animation: bgFloat 20s linear infinite;
}

.cube:nth-child(1) { top: 20%; left: 10%; animation-duration: 25s; }
.cube:nth-child(2) { top: 60%; left: 80%; width: 100px; height: 100px; animation-duration: 30s; }
.cube:nth-child(3) { top: 80%; left: 20%; animation-duration: 22s; }
.cube:nth-child(4) { top: 10%; left: 70%; animation-duration: 28s; }
.cube:nth-child(5) { top: 40%; left: 40%; width: 40px; height: 40px; animation-duration: 20s; }

@keyframes bgFloat {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(100px, 100px) rotate(360deg); }
}

.features-floating {
  display: flex;
  gap: 30px;
  margin-top: 80px;
  animation: fadeIn 1s ease-out 0.8s both;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 20px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-card .icon { font-size: 1.2rem; }
.feature-card h4 { font-size: 0.9rem; color: #94a3b8; font-weight: 500; }
</style>
