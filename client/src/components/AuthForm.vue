<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['auth-success']);

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const toggleMode = () => {
  error.value = '';
  isLogin.value = !isLogin.value;
};

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;
  
  const endpoint = isLogin.value ? 'login' : 'signup';
  try {
    const response = await fetch(`http://localhost:3005/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      emit('auth-success', data);
    } else {
      error.value = data.error || 'Something went wrong';
    }
  } catch (err) {
    error.value = 'Failed to connect to server';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-card-wrapper">
    <div class="glow-sphere sphere-1"></div>
    <div class="glow-sphere sphere-2"></div>
    
    <div class="auth-card">
      <div class="mesh-overlay"></div>
      
      <div class="mode-switch stagger-1">
        <button 
          @click="isLogin = true" 
          :class="{ active: isLogin }"
        >LOGIN</button>
        <button 
          @click="isLogin = false" 
          :class="{ active: !isLogin }"
        >SIGNUP</button>
      </div>

      <div class="card-content">
        <transition name="slide-fade" mode="out-in">
          <div :key="isLogin" class="form-wrapper">
            <div class="card-header">
              <div class="icon-box">
                <span v-if="isLogin">🔐</span>
                <span v-else>✨</span>
              </div>
              <h2>{{ isLogin ? 'Elite Access' : 'Create Legacy' }}</h2>
              <p>{{ isLogin ? 'Continue your puzzle mastery' : 'Join the elite global leaderboard' }}</p>
            </div>
            
            <form @submit.prevent="handleSubmit">
              <div class="input-group-elite" :class="{ filled: username }">
                <div class="input-icon">👤</div>
                <input v-model="username" type="text" placeholder="Username" required />
              </div>
              
              <div class="input-group-elite" :class="{ filled: password }">
                <div class="input-icon">🔑</div>
                <input v-model="password" type="password" placeholder="Password" required />
              </div>
              
              <transition name="shake">
                <div v-if="error" class="error-box">
                  <span class="error-icon">⚠️</span>
                  {{ error }}
                </div>
              </transition>
              
              <button type="submit" class="btn-submit-elite" :disabled="loading">
                <div v-if="!loading" class="btn-inner">
                  <span>{{ isLogin ? 'UNSEAL ACCESS' : 'RESERVE IDENTITY' }}</span>
                  <span class="arrow">→</span>
                </div>
                <span v-else class="loader"></span>
              </button>
            </form>
          </div>
        </transition>
      </div>

      <!-- Decorative Pieces -->
      <div class="deco-piece piece-1">🧩</div>
      <div class="deco-piece piece-2">⭐</div>
      <div class="deco-piece piece-3">🎯</div>
    </div>
  </div>
</template>

<style scoped>
.auth-card-wrapper {
  position: relative;
  width: 100%;
  perspective: 1000px;
}

.auth-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: cardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 5;
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.icon-box {
  font-size: 2.5rem;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 5px;
}

p {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* Mode Switch */
.mode-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px;
  border-radius: 100px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mode-switch button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-switch button.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.mesh-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  border-radius: 32px;
}

/* Elite Inputs */
.input-group-elite {
  position: relative;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 2px 12px;
  transition: all 0.3s;
}

.input-group-elite:focus-within {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.input-icon {
  font-size: 1rem;
  margin-right: 12px;
  opacity: 0.5;
}

.input-group-elite input {
  background: transparent;
  border: none;
  color: white;
  padding: 10px 0;
  font-size: 0.9rem;
  width: 100%;
  outline: none;
}

.input-group-elite input::placeholder {
  color: #475569;
}

/* Submit Button */
.btn-submit-elite {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.btn-inner .arrow {
  transition: transform 0.3s;
}

.btn-submit-elite:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.5);
}

.btn-submit-elite:hover .arrow {
  transform: translateX(5px);
}

/* Glow Spheres */
.glow-sphere {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  z-index: 1;
  pointer-events: none;
}

.sphere-1 {
  background: #6366f1;
  top: -100px;
  left: -100px;
  animation: move1 10s infinite alternate;
}

.sphere-2 {
  background: #a855f7;
  bottom: -100px;
  right: -100px;
  animation: move2 12s infinite alternate;
}

@keyframes move1 {
  from { transform: translate(0, 0); }
  to { transform: translate(50px, 50px); }
}

@keyframes move2 {
  from { transform: translate(0, 0); }
  to { transform: translate(-50px, -50px); }
}

@keyframes cardEntry {
  from { opacity: 0; transform: translateY(60px) rotateX(-10deg); }
  to { opacity: 1; transform: translateY(0) rotateX(0); }
}

/* Staggered Animations */
.stagger-1 { animation: slideIn 0.8s ease-out 0.1s both; }
.stagger-2 { animation: slideIn 0.8s ease-out 0.2s both; }
.stagger-3 { animation: slideIn 0.8s ease-out 0.3s both; }
.stagger-4 { animation: slideIn 0.8s ease-out 0.4s both; }
.stagger-5 { animation: slideIn 0.8s ease-out 0.5s both; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Decorative Pieces */
.deco-piece {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.2;
  z-index: -1;
  filter: blur(1px);
}

.piece-1 { top: -20px; right: -20px; animation: floatIcon 6s infinite ease-in-out; }
.piece-2 { bottom: 40px; left: -30px; animation: floatIcon 8s infinite ease-in-out 1s; }
.piece-3 { top: 100px; left: -40px; animation: floatIcon 7s infinite ease-in-out 0.5s; }

@keyframes floatIcon {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(10px, -20px) rotate(15deg); }
}

/* Loader */
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Shake Animation */
.shake-enter-active {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-5px); }
}
</style>
