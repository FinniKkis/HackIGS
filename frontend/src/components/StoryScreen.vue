<template>
  <div id="story" class="screen">
    <div class="story-header">
      <button class="back-btn" @click="$emit('go-welcome')">←</button>
      <div class="progress-wrap">
        <div class="progress-info">
          <span>Шаг {{ currentScene + 1 }} из {{ scenario.scenes.length }}</span>
          <span>{{ scenario.name }}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
      <div class="money-badge" :class="{ good: totalLoss === 0 }">
        {{ totalLoss > 0 ? `💸 -${totalLoss.toLocaleString('ru')} ₽` : '✓ Под защитой' }}
      </div>
    </div>

    <div class="story-body" ref="storyBodyRef">
      <div class="story-scene" :key="currentScene">
        <div class="scene-illustration">{{ scene.emoji }}</div>
        <div class="scene-tag">{{ scene.tag }}</div>
        <h2 class="scene-title">{{ scene.title }}</h2>
        <p class="scene-text">{{ scene.text }}</p>

        <div class="choices-label">Что ты делаешь?</div>
        <div class="choices">
          <button
            v-for="(choice, i) in scene.choices"
            :key="i"
            class="choice-btn"
            :class="choiceClass(i)"
            :disabled="answered"
            :style="answered && selectedIndex !== i ? { opacity: '0.4' } : {}"
            @click="makeChoice(i)"
          >
            <span class="choice-icon">{{ choice.icon }}</span>
            <span class="choice-text">{{ choice.text }}</span>
          </button>
        </div>

        <div v-if="answered" class="result-panel" :class="isGood ? 'good' : 'bad'" ref="resultPanelRef">
          <div class="result-emoji">{{ isGood ? '✅' : '💸' }}</div>
          <div class="result-title" :class="isGood ? 'good' : 'bad'">{{ result.title }}</div>
          <div class="result-text">{{ result.text }}</div>
          <div class="money-impact" :class="result.impactType">{{ result.impact }}</div>
          <button class="next-btn" @click="nextScene">
            {{ currentScene < scenario.scenes.length - 1 ? 'Следующий шаг →' : 'Посмотреть итоги →' }}
          </button>
        </div>

        <div v-if="answered" class="factoid">
          {{ scene.factoid }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const props = defineProps({
  scenario: { type: Object, required: true },
  currentScene: { type: Number, required: true },
  totalLoss: { type: Number, required: true }
});

const emit = defineEmits(['go-welcome', 'choice-made', 'next-scene']);

const answered = ref(false);
const selectedIndex = ref(null);
const isGood = ref(false);
const result = ref(null);
const storyBodyRef = ref(null);
const resultPanelRef = ref(null);

const scene = computed(() => props.scenario.scenes[props.currentScene]);
const progressPct = computed(() => ((props.currentScene + 1) / props.scenario.scenes.length) * 100);

function choiceClass(i) {
  if (!answered.value || selectedIndex.value !== i) return '';
  return isGood.value ? 'selected-good' : 'selected-bad';
}

async function makeChoice(index) {
  if (answered.value) return;
  answered.value = true;
  selectedIndex.value = index;

  const choice = scene.value.choices[index];
  isGood.value = choice.type === 'good';
  result.value = isGood.value ? scene.value.goodResult : scene.value.badResult;

  emit('choice-made', { index, choice, scene: scene.value, isGood: isGood.value });

  await nextTick();
  setTimeout(() => {
    resultPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function nextScene() {
  answered.value = false;
  selectedIndex.value = null;
  isGood.value = false;
  result.value = null;

  if (storyBodyRef.value) storyBodyRef.value.scrollTo(0, 0);
  window.scrollTo(0, 0);

  emit('next-scene');
}
</script>
