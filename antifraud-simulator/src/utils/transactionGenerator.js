import { COUNTRIES, HIGH_RISK_COUNTRIES, MERCHANT_CATEGORIES } from '../types';

// Генерация случайного числа в диапазоне
export const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Генерация случайного элемента из массива
export const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Генерация UUID
export const generateId = () => {
  return 'txn_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Генерация случайного device ID
export const generateDeviceId = () => {
  return 'dev_' + Math.random().toString(36).substr(2, 12);
};

// Генерация случайной транзакции
export const generateTransaction = (fraudProbability = 0.3) => {
  const isFraudAttempt = Math.random() < fraudProbability;
  
  const country = randomChoice(COUNTRIES);
  let ipCountry = country;
  
  // При мошенничестве чаще несовпадение стран
  if (isFraudAttempt && Math.random() < 0.6) {
    do {
      ipCountry = randomChoice(COUNTRIES);
    } while (ipCountry.code === country.code);
  }
  
  // Генерация суммы
  let amount;
  if (isFraudAttempt && Math.random() < 0.5) {
    // Мошеннические транзакции часто крупные
    amount = randomInRange(500, 5000);
  } else {
    // Обычные транзакции
    amount = randomInRange(10, 800);
  }
  
  // Округление суммы (подозрительно)
  if (isFraudAttempt && Math.random() < 0.3) {
    amount = Math.round(amount / 100) * 100;
  }
  
  // Категория мерчанта
  let merchantCategory;
  if (isFraudAttempt && Math.random() < 0.4) {
    // При мошенничестве чаще рискованные категории
    const riskyCategories = MERCHANT_CATEGORIES.filter(c => c.risk >= 20);
    merchantCategory = randomChoice(riskyCategories);
  } else {
    merchantCategory = randomChoice(MERCHANT_CATEGORIES);
  }
  
  // Новое устройство
  let newDevice = Math.random() < 0.2;
  if (isFraudAttempt) {
    newDevice = Math.random() < 0.5;
  }
  
  // Velocity (количество транзакций за последние 10 минут)
  let velocity = randomInRange(0, 3);
  if (isFraudAttempt) {
    velocity = randomInRange(2, 8);
  }
  
  // Возраст аккаунта
  let accountAgeDays;
  if (isFraudAttempt && Math.random() < 0.4) {
    // Новые аккаунты чаще мошенничают
    accountAgeDays = randomInRange(0, 14);
  } else {
    accountAgeDays = randomInRange(30, 1000);
  }
  
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
    timestamp: new Date().toISOString(),
    is_fraud_attempt: isFraudAttempt, // Для образовательных целей
  };
};

// Генерация серии транзакций
export const generateTransactions = (count, fraudProbability = 0.3) => {
  return Array.from({ length: count }, () => generateTransaction(fraudProbability));
};

// Форматирование суммы
export const formatAmount = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Форматирование даты
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Форматирование возраста аккаунта
export const formatAccountAge = (days, language = 'ru') => {
  if (language === 'en') {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  }
  if (days < 30) return `${days} дн.`;
  if (days < 365) return `${Math.round(days / 30)} мес.`;
  return `${Math.round(days / 365)} лет`;
};

// Переводы стран
export const COUNTRY_TRANSLATIONS = {
  ru: {
    'США': 'США',
    'Великобритания': 'Великобритания',
    'Германия': 'Германия',
    'Франция': 'Франция',
    'Канада': 'Канада',
    'Австралия': 'Австралия',
    'Япония': 'Япония',
    'Китай': 'Китай',
    'Бразилия': 'Бразилия',
    'Индия': 'Индия',
    'Россия': 'Россия',
    'Нигерия': 'Нигерия',
    'Вьетнам': 'Вьетнам',
    'Индонезия': 'Индонезия',
    'Украина': 'Украина',
  },
  en: {
    'США': 'USA',
    'Великобритания': 'United Kingdom',
    'Германия': 'Germany',
    'Франция': 'France',
    'Канада': 'Canada',
    'Австралия': 'Australia',
    'Япония': 'Japan',
    'Китай': 'China',
    'Бразилия': 'Brazil',
    'Индия': 'India',
    'Россия': 'Russia',
    'Нигерия': 'Nigeria',
    'Вьетнам': 'Vietnam',
    'Индонезия': 'Indonesia',
    'Украина': 'Ukraine',
  },
};

// Переводы категорий мерчантов
export const MERCHANT_CATEGORY_TRANSLATIONS = {
  ru: {
    retail: 'Розничная торговля',
    grocery: 'Продукты',
    restaurant: 'Рестораны',
    gas: 'АЗС',
    electronics: 'Электроника',
    travel: 'Путешествия',
    gambling: 'Азартные игры',
    crypto: 'Криптовалюты',
    jewelry: 'Ювелирные изделия',
    charity: 'Благотворительность',
  },
  en: {
    retail: 'Retail',
    grocery: 'Grocery',
    restaurant: 'Restaurant',
    gas: 'Gas Station',
    electronics: 'Electronics',
    travel: 'Travel',
    gambling: 'Gambling',
    crypto: 'Crypto',
    jewelry: 'Jewelry',
    charity: 'Charity',
  },
};

// Получить перевод страны
export const getCountryTranslation = (countryName, language = 'ru') => {
  return COUNTRY_TRANSLATIONS[language]?.[countryName] || countryName;
};

// Получить перевод категории мерчанта
export const getMerchantCategoryTranslation = (categoryId, language = 'ru') => {
  return MERCHANT_CATEGORY_TRANSLATIONS[language]?.[categoryId] || categoryId;
};
