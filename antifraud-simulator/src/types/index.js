// Типы данных для анти-фрод симулятора

export const DECISION = {
  APPROVE: 'APPROVE',
  REVIEW: 'REVIEW',
  DECLINE: 'DECLINE',
};

export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

// Правило анти-фрод системы
export const createRule = (id, name, description, score, enabled = true) => ({
  id,
  name,
  description,
  score,
  enabled,
});

// Транзакция
export const createTransaction = (overrides = {}) => ({
  transaction_id: '',
  amount: 0,
  currency: 'USD',
  country: '',
  ip_country: '',
  device_id: '',
  new_device: false,
  velocity: 0,
  merchant_category: '',
  account_age_days: 0,
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Результат применения правила
export const createRuleResult = (ruleId, ruleName, triggered, score) => ({
  ruleId,
  ruleName,
  triggered,
  score,
});

// Решение системы
export const createDecision = (transactionId, decision, totalScore, ruleResults) => ({
  transactionId,
  decision,
  totalScore,
  ruleResults,
  timestamp: new Date().toISOString(),
});

// Пороговые значения
export const DEFAULT_THRESHOLDS = {
  approve: 40,
  review: 70,
};

// Стандартные правила
export const DEFAULT_RULES = [
  createRule('high_amount', 'Высокая сумма', 'Транзакция превышает $1000', 30, true),
  createRule('country_mismatch', 'Несоответствие стран', 'Страна транзакции ≠ стране IP', 25, true),
  createRule('new_device', 'Новое устройство', 'Первая транзакция с устройства', 15, true),
  createRule('high_velocity', 'Высокая скорость', 'Более 5 транзакций за 10 минут', 40, true),
  createRule('high_risk_country', 'Страна высокого риска', 'Транзакция из страны с высоким риском', 35, true),
  createRule('new_account', 'Новый аккаунт', 'Аккаунт моложе 7 дней', 20, true),
  createRule('unusual_category', 'Необычная категория', 'Транзакция в рискованной категории', 25, true),
  createRule('round_amount', 'Круглая сумма', 'Сумма кратна 100 (подозрительно)', 10, true),
];

// Страны высокого риска
export const HIGH_RISK_COUNTRIES = ['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'];

// Категории мерчантов
export const MERCHANT_CATEGORIES = [
  { id: 'retail', name: 'Розничная торговля', risk: 0 },
  { id: 'grocery', name: 'Продукты', risk: 0 },
  { id: 'restaurant', name: 'Рестораны', risk: 5 },
  { id: 'gas', name: 'АЗС', risk: 10 },
  { id: 'electronics', name: 'Электроника', risk: 15 },
  { id: 'travel', name: 'Путешествия', risk: 20 },
  { id: 'gambling', name: 'Азартные игры', risk: 40 },
  { id: 'crypto', name: 'Криптовалюты', risk: 35 },
  { id: 'jewelry', name: 'Ювелирные изделия', risk: 30 },
  { id: 'charity', name: 'Благотворительность', risk: 25 },
];

// Страны
export const COUNTRIES = [
  { code: 'US', name: 'США' },
  { code: 'GB', name: 'Великобритания' },
  { code: 'DE', name: 'Германия' },
  { code: 'FR', name: 'Франция' },
  { code: 'CA', name: 'Канада' },
  { code: 'AU', name: 'Австралия' },
  { code: 'JP', name: 'Япония' },
  { code: 'CN', name: 'Китай' },
  { code: 'BR', name: 'Бразилия' },
  { code: 'IN', name: 'Индия' },
  { code: 'RU', name: 'Россия' },
  { code: 'NG', name: 'Нигерия' },
  { code: 'VN', name: 'Вьетнам' },
  { code: 'ID', name: 'Индонезия' },
  { code: 'UA', name: 'Украина' },
];
