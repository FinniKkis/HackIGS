<template>
  <template v-if="currentScreen === 'hub'">
    <WelcomeScreen
      v-show="hubTab === 'welcome'"
      @generate="onGenerate"
    />
    <QuizScreen
      v-show="hubTab === 'quiz'"
      :active="hubTab === 'quiz'"
    />
    <SwipeScreen
      v-show="hubTab === 'swipe'"
      :active="hubTab === 'swipe'"
    />
    <BottomNav :current-tab="hubTab" @switch-tab="hubTab = $event" />
  </template>

  <LoadingScreen
    v-if="currentScreen === 'loading'"
    :topic="generatingTopic"
  />

  <div v-if="currentScreen === 'error'" id="error-screen" class="screen">
    <div class="error-inner">
      <div class="error-emoji">😵</div>
      <div class="error-title">Не удалось создать сценарий</div>
      <div class="error-text">{{ errorMessage }}</div>
      <button class="error-retry-btn" @click="retryGenerate">🔄 Попробовать снова</button>
      <button class="error-back-btn" @click="goToHub">← На главную</button>
    </div>
  </div>

  <template v-if="currentScreen === 'story'">
    <div v-if="isDemoMode" class="demo-banner">
      <span>🎭 Демо-режим</span>
      <span class="demo-hint">ИИ временно не отвечает</span>
    </div>
    <StoryScreen
      v-if="currentScenario"
      :scenario="currentScenario"
      :current-scene="currentScene"
      :total-loss="totalLoss"
      @go-welcome="goToHub"
      @choice-made="onChoiceMade"
      @next-scene="onNextScene"
    />
  </template>

  <ResultsScreen
    v-if="currentScreen === 'results'"
    :good-choices="goodChoices"
    :bad-choices="badChoices"
    :total-save="totalSave"
    :total-loss="totalLoss"
    :learnings-list="learningsList"
    @go-welcome="goToHub"
  />

</template>

<script setup>
import { ref } from 'vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import LoadingScreen from './components/LoadingScreen.vue';
import StoryScreen from './components/StoryScreen.vue';
import QuizScreen from './components/QuizScreen.vue';
import SwipeScreen from './components/SwipeScreen.vue';
import ResultsScreen from './components/ResultsScreen.vue';
import BottomNav from './components/BottomNav.vue';

const currentScreen = ref('hub');
const hubTab = ref('welcome');

const currentScenario = ref(null);
const currentScene = ref(0);
const totalLoss = ref(0);
const totalSave = ref(0);
const goodChoices = ref(0);
const badChoices = ref(0);
const learningsList = ref([]);

const generatingTopic = ref('');
const errorMessage = ref('');
const lastTopic = ref('');
const isDemoMode = ref(false);

async function onGenerate(topic) {
  lastTopic.value = topic;
  generatingTopic.value = topic;
  currentScreen.value = 'loading';

  try {
    const res = await fetch('/api/generate-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || `Ошибка сервера: ${res.status}`);
    }

    isDemoMode.value = !!data.demo;
    startScenario(data.scenario);
  } catch (err) {
    errorMessage.value = err.message || 'Неизвестная ошибка';
    currentScreen.value = 'error';
  }
}

function retryGenerate() {
  if (lastTopic.value) onGenerate(lastTopic.value);
}

function startScenario(scenario) {
  currentScenario.value = scenario;
  currentScene.value = 0;
  totalLoss.value = 0;
  totalSave.value = 0;
  goodChoices.value = 0;
  badChoices.value = 0;
  learningsList.value = [];
  currentScreen.value = 'story';
}

function goToHub() {
  currentScreen.value = 'hub';
  hubTab.value = 'welcome';
  currentScenario.value = null;
  currentScene.value = 0;
  totalLoss.value = 0;
  totalSave.value = 0;
  goodChoices.value = 0;
  badChoices.value = 0;
  learningsList.value = [];
}

function onChoiceMade({ choice, scene, isGood }) {
  if (isGood) {
    goodChoices.value++;
    const saved = scene.choices[0].cost - choice.cost;
    if (saved > 0) totalSave.value += saved;
  } else {
    badChoices.value++;
    totalLoss.value += choice.cost;
  }
  learningsList.value.push(isGood ? scene.goodResult.text : scene.badResult.text);
}

function onNextScene() {
  if (currentScene.value >= currentScenario.value.scenes.length - 1) {
    currentScreen.value = 'results';
  } else {
    currentScene.value++;
  }
}
</script>

<style>
#error-screen {
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.error-inner {
  max-width: 380px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-emoji { font-size: 64px; margin-bottom: 20px; }

.error-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 12px;
}

.error-text {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 32px;
  padding: 0 8px;
}

.error-retry-btn {
  width: 100%;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-family: 'Unbounded', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.2s;
}
.error-retry-btn:hover { background: var(--blue-dark); transform: translateY(-2px); }

.error-back-btn {
  width: 100%;
  background: transparent;
  color: var(--muted);
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  padding: 14px;
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.error-back-btn:hover { border-color: var(--blue); color: var(--blue); }

.demo-banner {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: linear-gradient(90deg, #7C3AED, #5B21B6);
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 700;
  z-index: 999;
}

.demo-hint {
  opacity: 0.75;
  font-weight: 400;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
}
</style>
