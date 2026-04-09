<template>
  <div class="bottom-nav">
    <button class="nav-btn" :class="{ active: currentTab === 'welcome' }" @click="$emit('switch-tab', 'welcome')">
      <span class="nav-icon">📖</span>История
    </button>
    <button class="nav-btn" :class="{ active: currentTab === 'quiz' }" @click="$emit('switch-tab', 'quiz')">
      <span class="nav-icon">🧠</span>Квиз
    </button>
    <button class="nav-btn" :class="{ active: currentTab === 'swipe' }" @click="$emit('switch-tab', 'swipe')">
      <span class="nav-icon">👆</span>Свайп
    </button>
  </div>
</template>

<script setup>
defineProps({ currentTab: { type: String, required: true } });
defineEmits(['switch-tab']);
</script>
