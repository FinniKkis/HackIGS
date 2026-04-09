<template>
  <div id="quiz" class="screen has-nav">
    <div class="quiz-inner">
      <div class="quiz-header">
        <div class="quiz-progress">Вопрос {{ current + 1 }}/{{ questions.length }}</div>
        <div class="quiz-dots">
          <div
            v-for="(_, i) in questions"
            :key="i"
            class="quiz-dot"
            :class="{ done: i < current, current: i === current }"
          ></div>
        </div>
      </div>

      <div class="quiz-card" v-if="!finished">
        <div class="quiz-q-num">Вопрос {{ current + 1 }}</div>
        <div class="quiz-question">{{ q.q }}</div>
        <div class="quiz-hint">{{ q.hint }}</div>
        <div class="quiz-options">
          <button
            v-for="(opt, i) in q.options"
            :key="i"
            class="quiz-option"
            :class="optionClass(i)"
            :disabled="answered"
            @click="answer(i)"
          >
            <span class="option-letter">{{ letters[i] }}</span>
            {{ opt }}
          </button>
        </div>
      </div>

      <div class="quiz-card" v-else>
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:60px;margin-bottom:16px">{{ finishEmoji }}</div>
          <div class="quiz-q-num">{{ finishMsg }}</div>
          <div class="quiz-question" style="margin:12px 0">{{ score }} из {{ questions.length }}</div>
          <div class="quiz-hint">Ты ответил правильно на {{ Math.round((score / questions.length) * 100) }}% вопросов</div>
        </div>
      </div>

      <div v-if="answered && !finished" class="quiz-feedback" :class="lastCorrect ? 'correct-fb' : 'wrong-fb'">
        <div class="quiz-fb-title" :class="lastCorrect ? 'c' : 'w'">{{ lastCorrect ? '✅ Правильно!' : '❌ Не совсем' }}</div>
        <div class="quiz-fb-text">{{ q.explanation }}</div>
      </div>

      <button v-if="answered" class="quiz-next-btn" @click="next">
        {{ finished ? '🔄 Пройти снова' : nextBtnLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { quizQuestions } from '../data/quizQuestions.js';

const props = defineProps({
  active: { type: Boolean, default: false }
});

const questions = quizQuestions;
const letters = ['А', 'Б', 'В', 'Г'];

const current = ref(0);
const score = ref(0);
const answered = ref(false);
const lastCorrect = ref(false);
const selectedIdx = ref(null);
const finished = ref(false);

const q = computed(() => questions[current.value]);

const nextBtnLabel = computed(() =>
  current.value < questions.length - 1
    ? 'Следующий вопрос →'
    : `Завершить (${score.value}/${questions.length}) →`
);

const finishEmoji = computed(() => {
  const pct = score.value / questions.length;
  return pct >= 0.75 ? '🏆' : pct >= 0.5 ? '📚' : '💡';
});

const finishMsg = computed(() => {
  const pct = score.value / questions.length;
  return pct >= 0.75 ? '🏆 Отличный результат!' : pct >= 0.5 ? '📚 Неплохо!' : '💡 Повтори теорию!';
});

function optionClass(i) {
  if (!answered.value) return '';
  if (i === selectedIdx.value && lastCorrect.value) return 'correct';
  if (i === selectedIdx.value && !lastCorrect.value) return 'wrong';
  if (i === q.value.correct && !lastCorrect.value) return 'reveal-correct';
  return '';
}

function answer(index) {
  if (answered.value) return;
  answered.value = true;
  selectedIdx.value = index;
  lastCorrect.value = index === q.value.correct;
  if (lastCorrect.value) score.value++;
}

function next() {
  if (finished.value) {
    reset();
    return;
  }
  current.value++;
  if (current.value >= questions.length) {
    finished.value = true;
    answered.value = true;
  } else {
    answered.value = false;
    selectedIdx.value = null;
  }
}

function reset() {
  current.value = 0;
  score.value = 0;
  answered.value = false;
  selectedIdx.value = null;
  finished.value = false;
  lastCorrect.value = false;
}

watch(() => props.active, (val) => {
  if (val) reset();
});
</script>
