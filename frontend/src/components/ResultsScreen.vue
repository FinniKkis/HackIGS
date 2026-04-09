<template>
  <div id="results" class="screen">
    <div class="results-inner">
      <div class="results-badge" :class="badgeClass">{{ badge }}</div>
      <h2 class="results-title">{{ title }}</h2>
      <p class="results-sub">{{ sub }}</p>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number green">{{ totalSave > 0 ? `${totalSave.toLocaleString('ru')} ₽` : '0 ₽' }}</div>
          <div class="stat-label">Сэкономил бы со страховкой</div>
        </div>
        <div class="stat-card">
          <div class="stat-number red">{{ totalLoss > 0 ? `${totalLoss.toLocaleString('ru')} ₽` : '0 ₽' }}</div>
          <div class="stat-label">Потерял без страховки</div>
        </div>
      </div>

      <div class="learnings">
        <div class="learnings-title">📚 Что ты узнал</div>
        <div v-for="(item, i) in learningsList.slice(0, 4)" :key="i" class="learning-item">
          <span class="learning-dot">📌</span>
          <span>{{ item }}</span>
        </div>
      </div>

      <button class="restart-btn" @click="$emit('go-welcome')">🔄 Попробовать другой сценарий</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  goodChoices: { type: Number, default: 0 },
  badChoices: { type: Number, default: 0 },
  totalSave: { type: Number, default: 0 },
  totalLoss: { type: Number, default: 0 },
  learningsList: { type: Array, default: () => [] }
});

defineEmits(['go-welcome']);

const pct = computed(() => {
  const total = props.goodChoices + props.badChoices;
  return total > 0 ? props.goodChoices / total : 0;
});

const badgeClass = computed(() => {
  if (pct.value >= 0.8) return 'great';
  if (pct.value >= 0.5) return 'ok';
  return 'bad';
});

const badge = computed(() => {
  if (pct.value >= 0.8) return '🏆 Страховой эксперт!';
  if (pct.value >= 0.5) return '📚 Хороший старт';
  return '💡 Время учиться';
});

const title = computed(() => {
  if (pct.value >= 0.8) return 'Ты отлично разбираешься!';
  if (pct.value >= 0.5) return 'Есть над чем поработать';
  return 'Страхование поможет тебе!';
});

const sub = computed(() => {
  if (pct.value >= 0.8) return 'Принимал правильные решения почти всегда';
  if (pct.value >= 0.5) return 'Половину ситуаций ты решил верно';
  return 'Прочитай объяснения и попробуй снова';
});
</script>
