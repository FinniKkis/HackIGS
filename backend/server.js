process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { findFallback } = require('./fallbackScenarios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const GIGACHAT_API_KEY = process.env.GIGACHAT_CLIENT_API;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'СтрахоКвест API работает' });
});

async function getAccessToken() {
  const url = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  try {
    const response = await axios.post(url, 'scope=GIGACHAT_API_PERS', {
      headers: {
        'Authorization': `Basic ${GIGACHAT_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': uuidv4()
      },
      timeout: 10000
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Ошибка получения токена:', error.response?.data || error.message);
    throw new Error('Не удалось получить токен доступа');
  }
}

const SYSTEM_PROMPT = `Ты — создатель образовательных страховых сценариев для молодёжного приложения «СтрахоКвест».
Пользователь называет тему, ты создаёшь обучающий интерактивный сценарий из 5 шагов.

Отвечай ТОЛЬКО валидным JSON-объектом, без markdown-блоков и комментариев:
{
  "name": "Название (1-3 слова)",
  "scenes": [
    {
      "emoji": "один emoji",
      "tag": "Тег (1 слово)",
      "title": "Заголовок сцены",
      "text": "Описание ситуации, 2-3 предложения. Конкретная жизненная ситуация для молодёжи 16-25 лет.",
      "choices": [
        {
          "icon": "emoji",
          "text": "Плохой выбор — действие без страховки, с потерей денег",
          "type": "bad",
          "cost": 15000
        },
        {
          "icon": "🛡️",
          "text": "Правильный выбор — действие со страховкой",
          "type": "good",
          "cost": 500
        }
      ],
      "badResult": {
        "title": "Заголовок плохого исхода",
        "text": "Объяснение почему это плохо, 2 предложения.",
        "impact": "-15 000 ₽",
        "impactType": "loss"
      },
      "goodResult": {
        "title": "Заголовок хорошего исхода",
        "text": "Объяснение пользы страховки, 2 предложения.",
        "impact": "Текст о выгоде",
        "impactType": "save"
      },
      "factoid": "💡 Образовательный факт о виде страхования, связанном с темой сцены."
    }
  ]
}

Правила:
- Сцен строго 5, не больше и не меньше
- bad cost — реальные потери в рублях (от 1000 до 80000), число без пробелов
- good cost — небольшая франшиза (100-1000) или 0, число без пробелов
- Все тексты на русском
- Первая сцена — сама ситуация, вторая — оформление/действия, третья — вывод/урок
- Факты реально полезные и конкретные, не банальные`;

app.post('/api/generate-scenario', async (req, res) => {
  const { topic } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Укажи тему сценария' });
  }

  const cleanTopic = topic.trim();

  if (GIGACHAT_API_KEY) {
    try {
      let accessToken;
      try {
        accessToken = await getAccessToken();
      } catch (tokenError) {
        console.warn('Не удалось получить токен, переходим на fallback');
        return res.json({ scenario: findFallback(cleanTopic), demo: true, warning: 'token_failed' });
      }
      const response = await axios.post('https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
        {
          model: 'GigaChat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Создай страховой сценарий на тему: "${cleanTopic}"` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      let scenario;

      try {
        scenario = JSON.parse(content);
      } catch {
        console.warn('GIGACHAT JSON parse failed, using fallback');
        console.error('JSON parse error:', e.message);
        console.error('Content that failed:', content);
        return res.json({ scenario: findFallback(cleanTopic), demo: true });
      }

      if (!scenario.name || !Array.isArray(scenario.scenes) || scenario.scenes.length !== 5) {
        console.warn('GigaChat returned invalid structure, using fallback');
        return res.json({ scenario: findFallback(cleanTopic), demo: true });
      }

      return res.json({ scenario, demo: false });

    } catch (err) {
      const apiError = err.response?.data?.error;
      const status = err.response?.status;

      if (apiError?.message === 'Insufficient Balance' || status === 402) {
        console.warn('GigaChat: Insufficient Balance — используем fallback');
        return res.json({ scenario: findFallback(cleanTopic), demo: true, warning: 'insufficient_balance' });
      }

      if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
        console.warn('GigaChat: сеть недоступна — используем fallback');
        return res.json({ scenario: findFallback(cleanTopic), demo: true, warning: 'network' });
      }

      console.error('GigaChat API error:', status, apiError || err.message);
      return res.json({ scenario: findFallback(cleanTopic), demo: true, warning: 'api_error' });
    }
  }

  console.warn('GigaChat_API_KEY не задан — используем fallback');
  return res.json({ scenario: findFallback(cleanTopic), demo: true, warning: 'no_key' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  if (!GIGACHAT_API_KEY) {
    console.warn('⚠️  сценарии будут в демо-режиме');
  }
});

const path = require('path');

// Раздаём собранный фронтенд
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Все остальные запросы → index.html (для Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});