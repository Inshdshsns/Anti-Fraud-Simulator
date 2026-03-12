import React from 'react';
import {
  CreditCard, Globe, Smartphone, Clock, User,
  TrendingUp, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { formatAmount, formatDateTime, formatAccountAge, getCountryTranslation } from '../utils/transactionGenerator';
import { getDecisionColor } from '../utils/rulesEngine';

// Переводы категорий мерчантов
const MERCHANT_CATEGORY_TRANSLATIONS = {
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

// Переводы для правил
const RULE_TRANSLATIONS = {
  ru: {
    high_amount: { name: 'Высокая сумма', explanation: (t) => `Сумма $${t.amount} превышает порог $1000` },
    country_mismatch: { name: 'Несоответствие стран', explanation: (t, lang) => `Транзакция в ${getCountryTranslation(t.country_name, lang)}, IP из ${getCountryTranslation(t.ip_country_name, lang)}` },
    new_device: { name: 'Новое устройство', explanation: () => 'Транзакция совершена с нового, ранее не известного устройства' },
    high_velocity: { name: 'Высокая скорость', explanation: (t) => `${t.velocity} транзакций за последние 10 минут` },
    high_risk_country: { name: 'Страна высокого риска', explanation: (t, lang) => {
      const countries = [];
      if (['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'].includes(t.country)) countries.push(getCountryTranslation(t.country_name, lang));
      if (['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'].includes(t.ip_country)) countries.push(getCountryTranslation(t.ip_country_name, lang));
      return `Транзакция связана со странами высокого риска: ${countries.join(', ')}`;
    }},
    new_account: { name: 'Новый аккаунт', explanation: (t) => `Возраст аккаунта всего ${t.account_age_days} дн.` },
    unusual_category: { name: 'Необычная категория', explanation: (t, lang) => `Категория "${getCountryTranslation(t.merchant_category_name, lang) || t.merchant_category_name}" имеет высокий риск (${t.merchant_risk}%)` },
    round_amount: { name: 'Круглая сумма', explanation: (t) => `Сумма $${t.amount} является круглым числом, что подозрительно` },
  },
  en: {
    high_amount: { name: 'High Amount', explanation: (t) => `Amount $${t.amount} exceeds threshold of $1000` },
    country_mismatch: { name: 'Country Mismatch', explanation: (t, lang) => `Transaction in ${getCountryTranslation(t.country_name, lang)}, IP from ${getCountryTranslation(t.ip_country_name, lang)}` },
    new_device: { name: 'New Device', explanation: () => 'Transaction from a new, previously unknown device' },
    high_velocity: { name: 'High Velocity', explanation: (t) => `${t.velocity} transactions in the last 10 minutes` },
    high_risk_country: { name: 'High Risk Country', explanation: (t, lang) => {
      const countries = [];
      if (['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'].includes(t.country)) countries.push(getCountryTranslation(t.country_name, lang));
      if (['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'].includes(t.ip_country)) countries.push(getCountryTranslation(t.ip_country_name, lang));
      return `Transaction linked to high-risk countries: ${countries.join(', ')}`;
    }},
    new_account: { name: 'New Account', explanation: (t) => `Account age is only ${t.account_age_days} days` },
    unusual_category: { name: 'Unusual Category', explanation: (t, lang) => `Category "${getCountryTranslation(t.merchant_category_name, lang) || t.merchant_category_name}" has high risk (${t.merchant_risk}%)` },
    round_amount: { name: 'Round Amount', explanation: (t) => `Amount $${t.amount} is a round number, which is suspicious` },
  },
};

const TransactionDetail = ({
  analysis,
  rulesConfig,
  thresholds,
  language
}) => {
  const { transaction, decision, totalScore, ruleResults } = analysis;
  const decisionColor = getDecisionColor(decision);

  const triggeredRules = ruleResults.filter(r => r.triggered);
  const riskPercentage = Math.min(totalScore, 100);

  const getRiskColor = (score) => {
    if (score <= 40) return '#52a87c';
    if (score <= 70) return '#bd9350';
    return '#bd6262';
  };

  const categoryTranslations = MERCHANT_CATEGORY_TRANSLATIONS[language] || MERCHANT_CATEGORY_TRANSLATIONS.ru;
  const categoryTranslation = categoryTranslations[transaction.merchant_category] || transaction.merchant_category_name;

  // Переводы стран
  const countryTranslation = getCountryTranslation(transaction.country_name, language);
  const ipCountryTranslation = getCountryTranslation(transaction.ip_country_name, language);
  const accountAgeFormatted = formatAccountAge(transaction.account_age_days, language);

  const t = {
    ru: {
      amount: 'Сумма',
      time: 'Время',
      country: 'Страна',
      ipCountry: 'Страна IP',
      device: 'Устройство',
      velocity: 'Velocity',
      account: 'Аккаунт',
      category: 'Категория',
      riskScore: 'Риск-скоринг',
      rules: 'Правила',
      triggered: 'сработало',
      decision: 'Решение',
      approved: 'Транзакция одобрена и будет обработана.',
      review: 'Транзакция отправлена на ручную проверку.',
      declined: 'Транзакция отклонена из-за высокого риска.',
      new: 'Новое',
      known: 'Известное',
      transactions10min: 'транзакций за 10 мин',
      newAccount: 'Новый аккаунт',
      existing: 'Существующий',
      riskCategory: 'Риск категории',
      points: 'баллов риска',
    },
    en: {
      amount: 'Amount',
      time: 'Time',
      country: 'Country',
      ipCountry: 'IP Country',
      device: 'Device',
      velocity: 'Velocity',
      account: 'Account',
      category: 'Category',
      riskScore: 'Risk Scoring',
      rules: 'Rules',
      triggered: 'triggered',
      decision: 'Decision',
      approved: 'Transaction approved and will be processed.',
      review: 'Transaction sent for manual review.',
      declined: 'Transaction declined due to high risk.',
      new: 'New',
      known: 'Known',
      transactions10min: 'transactions in 10 min',
      newAccount: 'New account',
      existing: 'Existing',
      riskCategory: 'Category risk',
      points: 'risk points',
    },
  }[language || 'ru'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Заголовок с решением */}
      <div
        className="p-4 border-b border-dark-border"
        style={{ backgroundColor: `${decisionColor}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{ backgroundColor: decisionColor, color: '#fff' }}
            >
              {getDecisionIcon(decision)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-text">{decision}</h2>
              <p className="text-sm text-dark-text-muted">{transaction.transaction_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-surface-alt/30">
        {/* Параметры транзакции */}
        <div className="grid grid-cols-2 gap-3">
          <DetailCard
            icon={<CreditCard size={18} />}
            label={t.amount}
            value={formatAmount(transaction.amount)}
            subValue={transaction.currency}
          />
          <DetailCard
            icon={<Clock size={18} />}
            label={t.time}
            value={formatDateTime(transaction.timestamp)}
            subValue={new Date(transaction.timestamp).toLocaleDateString('ru-RU')}
          />
          <DetailCard
            icon={<Globe size={18} />}
            label={t.country}
            value={countryTranslation}
            subValue={`${t.ipCountry}: ${ipCountryTranslation}`}
            warning={transaction.country !== transaction.ip_country}
          />
          <DetailCard
            icon={<Smartphone size={18} />}
            label={t.device}
            value={transaction.new_device ? t.new : t.known}
            subValue={transaction.device_id.slice(0, 15) + '...'}
            warning={transaction.new_device}
          />
          <DetailCard
            icon={<TrendingUp size={18} />}
            label={t.velocity}
            value={transaction.velocity}
            subValue={t.transactions10min}
            warning={transaction.velocity > 5}
          />
          <DetailCard
            icon={<User size={18} />}
            label={t.account}
            value={accountAgeFormatted}
            subValue={transaction.account_age_days < 7 ? t.newAccount : t.existing}
            warning={transaction.account_age_days < 7}
          />
          <DetailCard
            icon={<CreditCard size={18} />}
            label={t.category}
            value={categoryTranslation}
            subValue={`${t.riskCategory}: ${transaction.merchant_risk}%`}
            warning={transaction.merchant_risk >= 25}
          />
        </div>

        {/* Gauge скоринга */}
        <div className="p-4 bg-dark-surface rounded-xl border border-dark-border shadow-md">
          <h3 className="text-sm font-semibold text-dark-text mb-3">{t.riskScore}</h3>
          
          <div className="relative h-8 bg-dark-accent rounded-full overflow-hidden mb-3">
            {/* Зоны */}
            <div 
              className="absolute h-full bg-emerald-soft/30"
              style={{ width: `${(40 / 100) * 100}%`, left: 0 }}
            />
            <div 
              className="absolute h-full bg-amber-soft/30"
              style={{ width: `${(30 / 100) * 100}%`, left: `${(40 / 100) * 100}%` }}
            />
            <div 
              className="absolute h-full bg-risk-high/30"
              style={{ width: `${(30 / 100) * 100}%`, left: `${(70 / 100) * 100}%` }}
            />
            
            {/* Индикатор */}
            <div 
              className="absolute top-1 bottom-1 w-1 bg-dark-text rounded-full transition-all duration-500 shadow-md"
              style={{ left: `${riskPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-dark-text-muted mb-2">
            <span>0</span>
            <span className="text-emerald-soft">APPROVE ≤ 40</span>
            <span className="text-amber-soft">REVIEW ≤ 70</span>
            <span className="text-risk-high">DECLINE &gt; 70</span>
            <span>100+</span>
          </div>
          
          <div className="text-center">
            <span 
              className="text-4xl font-bold"
              style={{ color: getRiskColor(totalScore) }}
            >
              {totalScore}
            </span>
            <span className="text-dark-text-muted ml-2">{t.points}</span>
          </div>
        </div>

        {/* Правила */}
        <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border shadow-md">
          <div className="p-3 border-b border-dark-border">
            <h3 className="text-sm font-semibold text-dark-text">
              {t.rules} ({triggeredRules.length} {t.triggered})
            </h3>
          </div>
          <div className="divide-y divide-dark-border">
            {ruleResults.map((result) => (
              <RuleResultItem
                key={result.ruleId}
                result={result}
                config={rulesConfig.find(r => r.id === result.ruleId)}
                transaction={transaction}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Решение */}
        <div 
          className="p-4 rounded-xl border"
          style={{ backgroundColor: `${decisionColor}15`, borderColor: `${decisionColor}40` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: decisionColor, color: '#fff' }}
            >
              {getDecisionIcon(decision)}
            </div>
            <div>
              <h3 className="font-semibold text-dark-text">{t.decision}: {decision}</h3>
              <p className="text-sm text-dark-text-muted">
                {decision === 'APPROVE' && t.approved}
                {decision === 'REVIEW' && t.review}
                {decision === 'DECLINE' && t.declined}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value, subValue, warning }) => (
  <div className={`p-3 rounded-lg ${warning ? 'bg-amber-soft-bg border border-amber-soft/30' : 'bg-dark-surface border border-dark-border shadow-md'}`}>
    <div className="flex items-center gap-2 text-dark-text-muted text-xs mb-1">
      {icon}
      {label}
    </div>
    <div className="font-semibold text-dark-text">{value}</div>
    <div className="text-xs text-dark-text-muted">{subValue}</div>
  </div>
);

const RuleResultItem = ({ result, config, transaction, language }) => {
  const configScore = config?.score ?? 0;
  const isEnabled = config?.enabled ?? true;
  
  // Получаем перевод для правила из глобального объекта
  const ruleTrans = RULE_TRANSLATIONS[language]?.[result.ruleId];
  const ruleName = ruleTrans?.name || result.ruleName;
  const ruleExplanation = ruleTrans?.explanation ? ruleTrans.explanation(transaction, language) : result.explanation;

  return (
    <div className={`p-3 flex items-center justify-between ${!isEnabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
          result.triggered
            ? 'bg-risk-high-bg text-risk-high'
            : 'bg-dark-accent text-dark-text-muted'
        }`}>
          {result.triggered ? '!' : '✓'}
        </div>
        <div>
          <div className={`text-sm ${result.triggered ? 'text-dark-text font-medium' : 'text-dark-text-muted'}`}>
            {ruleName}
          </div>
          <div className="text-xs text-dark-text-muted">{ruleExplanation}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${
        result.triggered ? 'text-risk-high' : 'text-dark-text-muted'
      }`}>
        {result.triggered ? `+${result.score}` : '0'}
      </div>
    </div>
  );
};

const getDecisionIcon = (decision) => {
  switch (decision) {
    case 'APPROVE': return '✓';
    case 'REVIEW': return '!';
    case 'DECLINE': return '✕';
    default: return '?';
  }
};

export default TransactionDetail;
