import { HIGH_RISK_COUNTRIES } from '../types';

// Правила анти-фрод системы
const RULES = {
  // Высокая сумма транзакции
  high_amount: {
    id: 'high_amount',
    name: 'Высокая сумма',
    description: 'Транзакция превышает $1000',
    defaultScore: 30,
    check: (transaction) => transaction.amount > 1000,
    getExplanation: (transaction) => `Сумма $${transaction.amount} превышает порог $1000`,
  },

  // Несоответствие стран
  country_mismatch: {
    id: 'country_mismatch',
    name: 'Несоответствие стран',
    description: 'Страна транзакции ≠ стране IP',
    defaultScore: 25,
    check: (transaction) => transaction.country !== transaction.ip_country,
    getExplanation: (transaction) => 
      `Транзакция в ${transaction.country_name}, IP из ${transaction.ip_country_name}`,
  },

  // Новое устройство
  new_device: {
    id: 'new_device',
    name: 'Новое устройство',
    description: 'Первая транзакция с этого устройства',
    defaultScore: 15,
    check: (transaction) => transaction.new_device,
    getExplanation: () => 'Транзакция совершена с нового, ранее не известного устройства',
  },

  // Высокая скорость транзакций
  high_velocity: {
    id: 'high_velocity',
    name: 'Высокая скорость',
    description: 'Более 5 транзакций за последние 10 минут',
    defaultScore: 40,
    check: (transaction) => transaction.velocity > 5,
    getExplanation: (transaction) => 
      `${transaction.velocity} транзакций за последние 10 минут`,
  },

  // Страна высокого риска
  high_risk_country: {
    id: 'high_risk_country',
    name: 'Страна высокого риска',
    description: 'Транзакция из страны с высоким уровнем мошенничества',
    defaultScore: 35,
    check: (transaction) => 
      HIGH_RISK_COUNTRIES.includes(transaction.country) || 
      HIGH_RISK_COUNTRIES.includes(transaction.ip_country),
    getExplanation: (transaction) => {
      const riskyCountries = [];
      if (HIGH_RISK_COUNTRIES.includes(transaction.country)) {
        riskyCountries.push(transaction.country_name);
      }
      if (HIGH_RISK_COUNTRIES.includes(transaction.ip_country)) {
        riskyCountries.push(transaction.ip_country_name);
      }
      return `Транзакция связана со странами высокого риска: ${riskyCountries.join(', ')}`;
    },
  },

  // Новый аккаунт
  new_account: {
    id: 'new_account',
    name: 'Новый аккаунт',
    description: 'Аккаунт моложе 7 дней',
    defaultScore: 20,
    check: (transaction) => transaction.account_age_days < 7,
    getExplanation: (transaction) => 
      `Возраст аккаунта всего ${transaction.account_age_days} дн.`,
  },

  // Необычная категория мерчанта
  unusual_category: {
    id: 'unusual_category',
    name: 'Необычная категория',
    description: 'Транзакция в категории с высоким риском',
    defaultScore: 25,
    check: (transaction) => transaction.merchant_risk >= 25,
    getExplanation: (transaction) => 
      `Категория "${transaction.merchant_category_name}" имеет высокий риск (${transaction.merchant_risk}%)`,
  },

  // Круглая сумма
  round_amount: {
    id: 'round_amount',
    name: 'Круглая сумма',
    description: 'Сумма кратна 100 (может указывать на мошенничество)',
    defaultScore: 10,
    check: (transaction) => transaction.amount % 100 === 0 && transaction.amount >= 500,
    getExplanation: (transaction) => 
      `Сумма $${transaction.amount} является круглым числом, что подозрительно`,
  },
};

// Получить все правила
export const getAllRules = () => Object.values(RULES);

// Получить правило по ID
export const getRuleById = (id) => RULES[id];

// Проверить транзакцию по правилам
export const evaluateTransaction = (transaction, rulesConfig) => {
  const results = [];
  
  for (const rule of Object.values(RULES)) {
    const config = rulesConfig.find(r => r.id === rule.id);
    const isEnabled = config?.enabled ?? true;
    const score = config?.score ?? rule.defaultScore;
    
    if (!isEnabled) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        score: 0,
        enabled: false,
        explanation: rule.getExplanation(transaction),
      });
      continue;
    }
    
    const triggered = rule.check(transaction);
    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      triggered,
      score: triggered ? score : 0,
      enabled: true,
      explanation: rule.getExplanation(transaction),
    });
  }
  
  return results;
};

// Рассчитать общий риск
export const calculateTotalScore = (ruleResults) => {
  return ruleResults.reduce((sum, result) => sum + result.score, 0);
};

// Определить решение на основе скоринга
export const makeDecision = (totalScore, thresholds) => {
  if (totalScore <= thresholds.approve) {
    return 'APPROVE';
  } else if (totalScore <= thresholds.review) {
    return 'REVIEW';
  } else {
    return 'DECLINE';
  }
};

// Полный анализ транзакции
export const analyzeTransaction = (transaction, rulesConfig, thresholds) => {
  const ruleResults = evaluateTransaction(transaction, rulesConfig);
  const totalScore = calculateTotalScore(ruleResults);
  const decision = makeDecision(totalScore, thresholds);
  
  return {
    transaction,
    ruleResults,
    totalScore,
    decision,
    riskLevel: getRiskLevel(totalScore),
  };
};

// Получить уровень риска
export const getRiskLevel = (score) => {
  if (score <= 40) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
};

// Получить цвет для уровня риска
export const getRiskColor = (level) => {
  switch (level) {
    case 'LOW': return '#52a87c';
    case 'MEDIUM': return '#bd9350';
    case 'HIGH': return '#bd6262';
    default: return '#8c8a85';
  }
};

// Получить цвет для решения
export const getDecisionColor = (decision) => {
  switch (decision) {
    case 'APPROVE': return '#52a87c';
    case 'REVIEW': return '#bd9350';
    case 'DECLINE': return '#bd6262';
    default: return '#8c8a85';
  }
};

// Получить иконку для решения
export const getDecisionIcon = (decision) => {
  switch (decision) {
    case 'APPROVE': return '✓';
    case 'REVIEW': return '!';
    case 'DECLINE': return '✕';
    default: return '?';
  }
};
