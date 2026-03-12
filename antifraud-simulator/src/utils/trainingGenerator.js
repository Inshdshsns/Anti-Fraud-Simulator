// Генератор тренировочных транзакций с метками

import { randomInRange, randomChoice, generateId, generateDeviceId } from './transactionGenerator';
import { COUNTRIES, MERCHANT_CATEGORIES, HIGH_RISK_COUNTRIES } from '../types';

const PAYMENT_METHODS = ['card', 'crypto', 'bank_transfer', 'e_wallet'];
const TIME_PERIODS = ['morning', 'afternoon', 'evening', 'night'];

export const generateTrainingTransaction = (difficulty = 'beginner') => {
  // Определяем вероятность фрода на основе сложности
  const fraudProbability = difficulty === 'expert' ? 0.5 : difficulty === 'intermediate' ? 0.35 : 0.25;
  const isFraud = Math.random() < fraudProbability;
  
  const country = randomChoice(COUNTRIES);
  let ipCountry = country;
  
  // Паттерны мошенничества в зависимости от сложности
  let fraudPatterns = [];
  
  if (isFraud) {
    // Генерируем паттерны мошенничества
    if (difficulty === 'beginner') {
      // Простые паттерны - явные признаки
      const pattern = randomChoice(['high_amount', 'country_mismatch', 'high_risk_country']);
      fraudPatterns.push(pattern);
    } else if (difficulty === 'intermediate') {
      // Средние паттерны - комбинации
      const numPatterns = randomInRange(1, 3);
      const availablePatterns = ['high_amount', 'country_mismatch', 'new_device', 'high_velocity', 'new_account'];
      for (let i = 0; i < numPatterns; i++) {
        const pattern = randomChoice(availablePatterns);
        if (!fraudPatterns.includes(pattern)) fraudPatterns.push(pattern);
      }
    } else {
      // Экспертные паттерны - тонкие признаки
      const numPatterns = randomInRange(2, 4);
      const availablePatterns = ['country_mismatch', 'new_device', 'high_velocity', 'unusual_category', 'round_amount', 'night_time'];
      for (let i = 0; i < numPatterns; i++) {
        const pattern = randomChoice(availablePatterns);
        if (!fraudPatterns.includes(pattern)) fraudPatterns.push(pattern);
      }
    }
  }
  
  // Применяем паттерны
  let amount, newDevice, velocity, accountAgeDays, merchantCategory, timeOfDay;
  
  if (fraudPatterns.includes('high_amount')) {
    amount = randomInRange(800, 5000);
    if (Math.random() < 0.5) amount = Math.round(amount / 100) * 100;
  } else {
    amount = randomInRange(10, 500);
  }
  
  if (fraudPatterns.includes('country_mismatch') || (isFraud && Math.random() < 0.4)) {
    do {
      ipCountry = randomChoice(COUNTRIES);
    } while (ipCountry.code === country.code);
  }
  
  if (fraudPatterns.includes('high_risk_country')) {
    const riskyCountry = randomChoice(COUNTRIES.filter(c => HIGH_RISK_COUNTRIES.includes(c.code)));
    country = riskyCountry;
    if (Math.random() < 0.5) ipCountry = riskyCountry;
  }
  
  if (fraudPatterns.includes('new_device')) {
    newDevice = true;
  } else {
    newDevice = Math.random() < 0.15;
  }
  
  if (fraudPatterns.includes('high_velocity')) {
    velocity = randomInRange(5, 10);
  } else {
    velocity = randomInRange(0, 3);
  }
  
  if (fraudPatterns.includes('new_account')) {
    accountAgeDays = randomInRange(0, 5);
  } else {
    accountAgeDays = randomInRange(30, 500);
  }
  
  if (fraudPatterns.includes('unusual_category')) {
    merchantCategory = randomChoice(MERCHANT_CATEGORIES.filter(c => c.risk >= 25));
  } else {
    merchantCategory = randomChoice(MERCHANT_CATEGORIES);
  }
  
  if (fraudPatterns.includes('round_amount')) {
    amount = randomInRange(5, 50) * 100;
  }
  
  if (fraudPatterns.includes('night_time')) {
    timeOfDay = 'night';
  } else {
    timeOfDay = randomChoice(TIME_PERIODS);
  }
  
  const paymentMethod = randomChoice(PAYMENT_METHODS);

  return {
    transaction_id: generateId(),
    amount,
    currency: 'USD',
    country: country.code,
    country_name: country.name,
    ip_country: ipCountry.code,
    ip_country_name: ipCountry.name,
    device_id: generateDeviceId(),
    new_device: newDevice,
    velocity,
    merchant_category: merchantCategory.id,
    merchant_category_name: merchantCategory.name,
    merchant_risk: merchantCategory.risk,
    account_age_days: accountAgeDays,
    payment_method: paymentMethod,
    time_of_day: timeOfDay,
    timestamp: new Date().toISOString(),
    // Скрытая метка (не показывается пользователю до решения)
    _label: isFraud ? 'fraud' : 'legit',
    _patterns: fraudPatterns || [],
  };
};

// Генерация тренировочного датасета
export const generateTrainingDataset = (count = 100, difficulty = 'beginner') => {
  return Array.from({ length: count }, () => generateTrainingTransaction(difficulty));
};

// Подсчёт очков за решение
export const calculateTrainingScore = (userDecision, actualLabel) => {
  const scoring = {
    // Правильно approve legit
    legit: { APPROVE: 5, REVIEW: 2, DECLINE: -10 },
    // Правильно decline fraud
    fraud: { DECLINE: 10, REVIEW: 5, APPROVE: -15 },
  };
  
  return scoring[actualLabel]?.[userDecision] || 0;
};

// Форматирование времени суток
export const formatTimeOfDay = (timeOfDay, language = 'ru') => {
  const translations = {
    ru: {
      morning: 'Утро (6-12)',
      afternoon: 'День (12-18)',
      evening: 'Вечер (18-24)',
      night: 'Ночь (0-6)',
    },
    en: {
      morning: 'Morning (6-12)',
      afternoon: 'Afternoon (12-18)',
      evening: 'Evening (18-24)',
      night: 'Night (0-6)',
    },
  };
  
  return translations[language]?.[timeOfDay] || timeOfDay;
};

// Форматирование метода оплаты
export const formatPaymentMethod = (method, language = 'ru') => {
  const translations = {
    ru: {
      card: 'Банковская карта',
      crypto: 'Криптовалюта',
      bank_transfer: 'Банковский перевод',
      e_wallet: 'Электронный кошелёк',
    },
    en: {
      card: 'Bank Card',
      crypto: 'Cryptocurrency',
      bank_transfer: 'Bank Transfer',
      e_wallet: 'E-Wallet',
    },
  };
  
  return translations[language]?.[method] || method;
};
