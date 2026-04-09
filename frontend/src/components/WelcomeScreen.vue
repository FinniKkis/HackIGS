<template>
  <div id="welcome" class="screen has-nav">
    <div class="hero-badge">🤖 ИИ · Страхоквест</div>

    <h1 class="hero-title">Страхо<span>Квест</span></h1>
    <p class="hero-sub">Введи любую ситуацию — ИИ создаст для тебя уникальный страховой сценарий</p>

    <div class="ai-input-wrap">
      <div class="ai-input-box" :class="{ focused: focused, error: !!error }">
        <span class="ai-input-icon">✨</span>
        <input
          ref="inputRef"
          class="ai-input"
          type="text"
          placeholder="Например: разбил телефон..."
          maxlength="80"
          v-model="topic"
          @focus="focused = true; error = ''"
          @blur="focused = false"
          @keydown.enter="generate"
        />
        <button class="ai-go-btn" :disabled="!topic.trim()" @click="generate">
          {{ topic.trim() ? 'Играть →' : '→' }}
        </button>
      </div>
      <div v-if="error" class="ai-error">{{ error }}</div>
    </div>

    <!-- Suggestions -->
    <div class="suggestions-label">Или выбери готовую идею</div>
    <div class="suggestions-grid">
      <div
        v-for="s in suggestions"
        :key="s.text"
        class="suggestion-chip"
        @click="pickSuggestion(s.text)"
      >
        <span class="chip-emoji">{{ s.emoji }}</span>
        <span class="chip-text">{{ s.text }}</span>
        <span class="chip-tag">{{ s.tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['generate']);

const topic = ref('');
const focused = ref(false);
const error = ref('');
const inputRef = ref(null);

const suggestions = [
  { emoji: '🚗', text: 'Попал в ДТП', tag: 'Авто' },
  { emoji: '🏠', text: 'Затопили соседи', tag: 'Жильё' },
  { emoji: '💻', text: 'Украли ноутбук', tag: 'Гаджеты' },
  { emoji: '🦷', text: 'Заболел в другом городе', tag: 'Здоровье' },
  { emoji: '🐕', text: 'Питомец заболел', tag: 'Животные' },
  { emoji: '🏄', text: 'Травма на отдыхе', tag: 'Спорт' },
];

function pickSuggestion(text) {
  topic.value = text;
  generate();
}

function generate() {
  const t = topic.value.trim();
  if (!t) {
    error.value = 'Введи тему сценария';
    inputRef.value?.focus();
    return;
  }
  emit('generate', t);
}
</script>

<style scoped>
#welcome {
  align-items: center;
  justify-content: center;
  padding: 40px 20px 60px;
  gap: 0;
}

.ai-input-wrap {
  width: 100%;
  max-width: 480px;
  margin-bottom: 36px;
  animation: fadeDown 0.6s 0.2s ease both;
}

.ai-input-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2.5px solid #E5E7EB;
  border-radius: 20px;
  padding: 8px 8px 8px 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.ai-input-box.focused {
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(0,112,243,0.1);
}

.ai-input-box.error {
  border-color: var(--red);
}

.ai-input-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.ai-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Nunito', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  background: transparent;
  min-width: 0;
}

.ai-input::placeholder {
  color: var(--muted);
  font-weight: 500;
}

.ai-go-btn {
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 10px 18px;
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
  white-space: nowrap;
  flex-shrink: 0;
}

.ai-go-btn:hover:not(:disabled) {
  background: var(--blue-dark);
  transform: scale(1.05);
}

.ai-go-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.ai-error {
  margin-top: 8px;
  padding-left: 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--red);
}

.suggestions-label {
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 14px;
  animation: fadeDown 0.6s 0.3s ease both;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 480px;
  animation: fadeDown 0.6s 0.4s ease both;
}

.suggestion-chip {
  background: white;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 14px 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
}

.suggestion-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--blue-light);
  opacity: 0;
  transition: opacity 0.2s;
}

.suggestion-chip:hover {
  border-color: var(--blue);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0,112,243,0.12);
}

.suggestion-chip:hover::before { opacity: 1; }

.chip-emoji {
  font-size: 28px;
  position: relative;
  z-index: 1;
}

.chip-text {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  position: relative;
  z-index: 1;
}

.chip-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: var(--blue);
  background: var(--blue-light);
  padding: 2px 8px;
  border-radius: 100px;
  position: relative;
  z-index: 1;
  width: fit-content;
}

@media (max-width: 380px) {
  .suggestions-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
}
</style>
