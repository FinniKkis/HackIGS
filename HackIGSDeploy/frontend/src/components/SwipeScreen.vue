<template>
  <div id="swipe-game" class="screen has-nav">
    <div class="swipe-inner">
      <div class="swipe-header">
        <div class="swipe-title">Застраховал бы?</div>
        <div class="swipe-sub">Свайпай вправо — ДА, влево — НЕТ</div>
        <div class="swipe-score-row">
          <div class="swipe-score yes">✓ <span>{{ yesCount }}</span></div>
          <div class="swipe-score no">✕ <span>{{ noCount }}</span></div>
        </div>
      </div>

      <div class="swipe-card-wrap">
        <div class="counter-stack"></div>
        <div class="counter-stack"></div>

        <div
          v-if="!done"
          class="swipe-card"
          :class="cardClass"
          ref="cardRef"
          @mousedown="onStart"
          @touchstart.passive="onStart"
        >
          <div class="swipe-hint-yes" :style="{ opacity: hintYesOpacity }">ДА ✓</div>
          <div class="swipe-hint-no" :style="{ opacity: hintNoOpacity }">НЕТ ✕</div>
          <div class="swipe-card-emoji">{{ card.emoji }}</div>
          <div class="swipe-card-text">{{ card.text }}</div>
        </div>

        <div v-else class="swipe-card">
          <div class="swipe-card-emoji">🎉</div>
          <div class="swipe-card-text">Молодец! Ты прошёл все карточки</div>
        </div>
      </div>

      <div v-if="!done" class="swipe-btns">
        <button class="swipe-btn no-btn" @click="swipe('no')">❌</button>
        <button class="swipe-btn yes-btn" @click="swipe('yes')">✅</button>
      </div>
      <div v-else class="swipe-btns">
        <button class="swipe-restart-btn" @click="reset">🔄 Заново</button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.visible" class="swipe-toast" :style="{ borderLeft: `4px solid ${toast.correct ? 'var(--green)' : 'var(--red)'}` }">
      <strong :style="{ color: toast.correct ? 'var(--green)' : 'var(--red)' }">
        {{ toast.correct ? '✅ Верно!' : '❌ Не совсем' }}
      </strong><br>{{ toast.reason }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { swipeCards } from '../data/swipeCards.js';

const props = defineProps({
  active: { type: Boolean, default: false }
});

const index = ref(0);
const yesCount = ref(0);
const noCount = ref(0);
const cardClass = ref('');
const hintYesOpacity = ref(0);
const hintNoOpacity = ref(0);
const done = ref(false);
const cardRef = ref(null);
const toast = ref({ visible: false, correct: false, reason: '' });

let isDragging = false;
let startX = 0;
let currentDeltaX = 0;
let toastTimer = null;

const card = computed(() => swipeCards[index.value] || {});

function swipe(direction) {
  if (done.value) return;
  const c = swipeCards[index.value];
  cardClass.value = direction === 'yes' ? 'exit-yes' : 'exit-no';

  if (direction === 'yes') yesCount.value++;
  else noCount.value++;

  showToast(direction === c.answer, c.reason);

  setTimeout(() => {
    index.value++;
    cardClass.value = '';
    hintYesOpacity.value = 0;
    hintNoOpacity.value = 0;
    if (index.value >= swipeCards.length) done.value = true;
  }, 400);
}

function showToast(correct, reason) {
  clearTimeout(toastTimer);
  toast.value = { visible: true, correct, reason };
  toastTimer = setTimeout(() => { toast.value.visible = false; }, 2500);
}

function onStart(e) {
  if (done.value) return;
  isDragging = true;
  startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  cardClass.value = 'dragging';
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

function onMove(e) {
  if (!isDragging) return;
  currentDeltaX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - startX;
  const rotate = currentDeltaX * 0.08;
  if (cardRef.value) {
    cardRef.value.style.transform = `translateX(${currentDeltaX}px) rotate(${rotate}deg)`;
  }
  if (currentDeltaX > 40) {
    hintYesOpacity.value = Math.min(1, (currentDeltaX - 40) / 60);
    hintNoOpacity.value = 0;
  } else if (currentDeltaX < -40) {
    hintNoOpacity.value = Math.min(1, (-currentDeltaX - 40) / 60);
    hintYesOpacity.value = 0;
  } else {
    hintYesOpacity.value = 0;
    hintNoOpacity.value = 0;
  }
}

function onEnd() {
  if (!isDragging) return;
  isDragging = false;
  removeListeners();
  cardClass.value = '';

  if (currentDeltaX > 80) {
    swipe('yes');
  } else if (currentDeltaX < -80) {
    swipe('no');
  } else {
    if (cardRef.value) cardRef.value.style.transform = '';
    hintYesOpacity.value = 0;
    hintNoOpacity.value = 0;
  }
  currentDeltaX = 0;
}

function removeListeners() {
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('touchmove', onMove);
  document.removeEventListener('mouseup', onEnd);
  document.removeEventListener('touchend', onEnd);
}

function reset() {
  index.value = 0;
  yesCount.value = 0;
  noCount.value = 0;
  done.value = false;
  cardClass.value = '';
  hintYesOpacity.value = 0;
  hintNoOpacity.value = 0;
  toast.value.visible = false;
}

watch(() => props.active, (val) => {
  if (val) reset();
});

onUnmounted(() => {
  removeListeners();
  clearTimeout(toastTimer);
});
</script>
