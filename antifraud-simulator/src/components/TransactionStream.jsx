import React from 'react';
import { formatDateTime, formatAmount } from '../utils/transactionGenerator';
import { getDecisionColor, getDecisionIcon } from '../utils/rulesEngine';

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

const TransactionStream = ({ transactions, selectedId, onSelect, language, t }) => {
  const categoryTranslations = MERCHANT_CATEGORY_TRANSLATIONS[language] || MERCHANT_CATEGORY_TRANSLATIONS.ru;

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-dark-text-muted text-sm">
          {t?.noTransactions || (language === 'en' ? 'No transactions' : 'Нет транзакций')}
        </div>
      ) : (
        transactions.map((analysis) => (
          <TransactionItem
            key={analysis.transaction.transaction_id}
            analysis={analysis}
            isSelected={analysis.transaction.transaction_id === selectedId}
            onClick={() => onSelect(analysis)}
            language={language}
            t={t}
            categoryTranslations={categoryTranslations}
          />
        ))
      )}
    </div>
  );
};

const TransactionItem = ({ analysis, isSelected, onClick, language, t, categoryTranslations }) => {
  const { transaction, decision, totalScore } = analysis;
  const decisionColor = getDecisionColor(decision);
  
  const riskLevelClass = 
    totalScore <= 40 ? 'border-emerald-soft/40' :
    totalScore <= 70 ? 'border-amber-soft/40' :
    'border-risk-high/40';

  // Перевод названия категории
  const categoryTranslation = categoryTranslations[transaction.merchant_category] || transaction.merchant_category_name;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all border ${
        isSelected 
          ? 'bg-blue-soft-bg border-blue-soft/50 shadow-md' 
          : `bg-dark-surface ${riskLevelClass} hover:bg-dark-surface-alt`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-dark-text-muted">
          {transaction.transaction_id.slice(0, 20)}...
        </span>
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{ 
            backgroundColor: decisionColor + '25',
            color: decisionColor 
          }}
        >
          {getDecisionIcon(decision)} {decision}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-dark-text">
          {formatAmount(transaction.amount)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-text-muted">
            {transaction.country_name}
          </span>
          <span className="text-xs text-dark-text-muted">
            {formatDateTime(transaction.timestamp)}
          </span>
        </div>
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-dark-accent rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(totalScore, 100)}%`,
              backgroundColor: totalScore <= 40 ? '#52a87c' : totalScore <= 70 ? '#bd9350' : '#bd6262'
            }}
          />
        </div>
        <span className={`text-xs font-medium ${
          totalScore <= 40 ? 'text-emerald-soft' :
          totalScore <= 70 ? 'text-amber-soft' :
          'text-risk-high'
        }`}>
          {totalScore}
        </span>
      </div>
      
      <div className="mt-2 flex items-center gap-2 text-xs text-dark-text-muted">
        <span>{categoryTranslation}</span>
        {transaction.new_device && (
          <span className="px-1.5 py-0.5 bg-purple-900/40 text-purple-300 rounded">
            {t?.newDevice || (language === 'en' ? 'New Device' : 'Новое устройство')}
          </span>
        )}
        {transaction.velocity > 3 && (
          <span className="px-1.5 py-0.5 bg-orange-900/40 text-orange-300 rounded">
            {t?.highVelocity || (language === 'en' ? 'High Velocity' : 'Высокая скорость')}
          </span>
        )}
      </div>
    </div>
  );
};

export default TransactionStream;
