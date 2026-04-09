<template>
  <div id="loading-screen" class="screen">
    <div class="loading-inner">
      <div class="loading-orb">
        <div class="orb-ring"></div>
        <div class="orb-ring orb-ring-2"></div>
        <div class="orb-core">🤖</div>
      </div>
      <div class="loading-title">ИИ создаёт сценарий</div>
      <div class="loading-topic">«{{ topic }}»</div>
      <div class="loading-steps">
        <div class="loading-step" :class="{ done: step > 0, active: step === 0 }">
          <span class="step-icon">💭</span> Придумываю ситуацию
        </div>
        <div class="loading-step" :class="{ done: step > 1, active: step === 1 }">
          <span class="step-icon">⚖️</span> Создаю выборы
        </div>
        <div class="loading-step" :class="{ done: step > 2, active: step === 2 }">
          <span class="step-icon">📚</span> Добавляю факты
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({ topic: { type: String, default: '' } });

const step = ref(0);
let timer;

onMounted(() => {
  timer = setInterval(() => {
    step.value = (step.value + 1) % 3;
  }, 1500);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
#loading-screen {
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 340px;
  width: 100%;
}

.loading-orb {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--blue);
  animation: spin 1.2s linear infinite;
}

.orb-ring-2 {
  inset: 10px;
  border-top-color: var(--green);
  animation-duration: 0.8s;
  animation-direction: reverse;
}

.orb-core {
  font-size: 40px;
  animation: pulse-scale 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.loading-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
  text-align: center;
}

.loading-topic {
  font-size: 15px;
  color: var(--blue);
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
}

.loading-steps {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: white;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  border: 2px solid transparent;
  transition: all 0.4s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.loading-step.active {
  border-color: var(--blue);
  background: var(--blue-light);
  color: var(--blue);
}

.loading-step.done {
  border-color: var(--green);
  background: #F0FDF4;
  color: #15803D;
}

.step-icon {
  font-size: 18px;
}
</style>
