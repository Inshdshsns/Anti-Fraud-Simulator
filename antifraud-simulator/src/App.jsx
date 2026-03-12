import React, { useState, useEffect, useCallback } from 'react';
import { generateTransaction } from './utils/transactionGenerator';
import { analyzeTransaction, getAllRules, getDecisionColor } from './utils/rulesEngine';
import Header from './components/Header';
import TransactionStream from './components/TransactionStream';
import TransactionDetail from './components/TransactionDetail';
import RulesPanel from './components/RulesPanel';
import Analytics from './components/Analytics';
import SettingsPanel from './components/SettingsPanel';
import TrainMode from './components/TrainMode';
import RuleArchitect from './components/RuleArchitect';
import { Play, Pause, RotateCcw, StepForward, Brain, Settings } from 'lucide-react';

const DEFAULT_RULES_CONFIG = getAllRules().map(rule => ({
  id: rule.id,
  name: rule.name,
  description: rule.description,
  score: rule.defaultScore,
  enabled: true,
}));

const DEFAULT_THRESHOLDS = {
  approve: 40,
  review: 70,
};

// Словари переводов
const TRANSLATIONS = {
  ru: {
    pause: 'Пауза',
    start: 'Старт',
    step: 'Шаг',
    reset: 'Сброс',
    speed: 'Скорость',
    fraud: 'Фрод',
    transactions: 'Транзакции',
    last50: 'Последние 50',
    noTransaction: 'Нет выбранной транзакции',
    runOrSelect: 'Запустите симуляцию или выберите транзакцию из списка',
    rules: 'Правила',
    analytics: 'Аналитика',
    totalTransactions: 'Всего транзакций',
    detectionRate: 'Detection Rate',
    avgScore: 'Средний скор',
    reviewRate: 'На проверке',
    settings: 'Настройки системы',
    thresholdValues: 'Пороговые значения',
    approve: 'APPROVE (Одобрить)',
    review: 'REVIEW (Проверка)',
    decline: 'DECLINE (Отклонить)',
    approveDesc: 'Транзакции со скором ниже этого значения будут автоматически одобрены',
    reviewDesc: 'Транзакции со скором между APPROVE и этим значением требуют ручной проверки',
    visualization: 'Визуализация порогов',
    scoringRules: 'Правила скоринга',
    weight: 'Вес',
    points: 'баллов',
    resetToDefaults: 'Сбросить к defaults',
    close: 'Закрыть',
    noTransactions: 'Нет транзакций',
    newDevice: 'Новое устройство',
    highVelocity: 'Высокая скорость',
    // Категории мерчантов
    cat_retail: 'Розничная торговля',
    cat_grocery: 'Продукты',
    cat_restaurant: 'Рестораны',
    cat_gas: 'АЗС',
    cat_electronics: 'Электроника',
    cat_travel: 'Путешествия',
    cat_gambling: 'Азартные игры',
    cat_crypto: 'Криптовалюты',
    cat_jewelry: 'Ювелирные изделия',
    cat_charity: 'Благотворительность',
  },
  en: {
    pause: 'Pause',
    start: 'Start',
    step: 'Step',
    reset: 'Reset',
    speed: 'Speed',
    fraud: 'Fraud',
    transactions: 'Transactions',
    last50: 'Last 50',
    noTransaction: 'No transaction selected',
    runOrSelect: 'Start simulation or select a transaction from the list',
    rules: 'Rules',
    analytics: 'Analytics',
    totalTransactions: 'Total transactions',
    detectionRate: 'Detection Rate',
    avgScore: 'Avg Score',
    reviewRate: 'In Review',
    settings: 'System Settings',
    thresholdValues: 'Threshold Values',
    approve: 'APPROVE',
    review: 'REVIEW',
    decline: 'DECLINE',
    approveDesc: 'Transactions with score below this value will be automatically approved',
    reviewDesc: 'Transactions with score between APPROVE and this value require manual review',
    visualization: 'Thresholds Visualization',
    scoringRules: 'Scoring Rules',
    weight: 'Weight',
    points: 'points',
    resetToDefaults: 'Reset to defaults',
    close: 'Close',
    noTransactions: 'No transactions',
    newDevice: 'New Device',
    highVelocity: 'High Velocity',
    // Категории мерчантов
    cat_retail: 'Retail',
    cat_grocery: 'Grocery',
    cat_restaurant: 'Restaurant',
    cat_gas: 'Gas Station',
    cat_electronics: 'Electronics',
    cat_travel: 'Travel',
    cat_gambling: 'Gambling',
    cat_crypto: 'Crypto',
    cat_jewelry: 'Jewelry',
    cat_charity: 'Charity',
  },
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [analyzedTransactions, setAnalyzedTransactions] = useState([]);
  const [rulesConfig, setRulesConfig] = useState(() => {
    const saved = localStorage.getItem('antifraud_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES_CONFIG;
  });
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('antifraud_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [generationSpeed, setGenerationSpeed] = useState(2000);
  const [fraudProbability, setFraudProbability] = useState(0.3);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrainMode, setShowTrainMode] = useState(false);
  const [showRuleArchitect, setShowRuleArchitect] = useState(false);
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('antifraud_language');
    return saved || 'ru';
  });

  const t = TRANSLATIONS[language];

  // Сохранение конфигурации
  useEffect(() => {
    localStorage.setItem('antifraud_rules', JSON.stringify(rulesConfig));
  }, [rulesConfig]);

  useEffect(() => {
    localStorage.setItem('antifraud_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    localStorage.setItem('antifraud_language', language);
  }, [language]);

  // Генерация транзакций
  const generateNewTransaction = useCallback(() => {
    const transaction = generateTransaction(fraudProbability);
    const analysis = analyzeTransaction(transaction, rulesConfig, thresholds);

    setTransactions(prev => {
      const updated = [analysis, ...prev].slice(0, 50);
      return updated;
    });

    setAnalyzedTransactions(prev => [analysis, ...prev]);
  }, [fraudProbability, rulesConfig, thresholds]);

  // Авто-генерация
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(generateNewTransaction, generationSpeed);
    }
    return () => clearInterval(interval);
  }, [isRunning, generationSpeed, generateNewTransaction]);

  // Обработчики
  const handleToggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTransactions([]);
    setAnalyzedTransactions([]);
    setSelectedTransaction(null);
  };

  const handleStep = () => {
    generateNewTransaction();
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleUpdateRule = (ruleId, updates) => {
    setRulesConfig(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleUpdateThresholds = (newThresholds) => {
    setThresholds(newThresholds);
  };

  // Сброс правил и порогов к значениям по умолчанию
  const handleResetRules = () => {
    setRulesConfig(DEFAULT_RULES_CONFIG);
    setThresholds(DEFAULT_THRESHOLDS);
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'ru' ? 'en' : 'ru');
  };

  const handleExportConfig = () => {
    const config = {
      rules: rulesConfig,
      thresholds,
      version: '1.0',
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antifraud-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          if (config.rules) setRulesConfig(config.rules);
          if (config.thresholds) setThresholds(config.thresholds);
        } catch (err) {
          alert('Ошибка загрузки конфигурации');
        }
      };
      reader.readAsText(file);
    }
  };

  // Статистика
  const stats = {
    total: analyzedTransactions.length,
    approve: analyzedTransactions.filter(t => t.decision === 'APPROVE').length,
    review: analyzedTransactions.filter(t => t.decision === 'REVIEW').length,
    decline: analyzedTransactions.filter(t => t.decision === 'DECLINE').length,
    avgScore: analyzedTransactions.length > 0
      ? Math.round(analyzedTransactions.reduce((sum, t) => sum + t.totalScore, 0) / analyzedTransactions.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      <Header 
        stats={stats}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onExport={handleExportConfig}
        onImport={handleImportConfig}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Основная панель */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Контролы */}
          <div className="flex items-center gap-3 bg-dark-surface/80 backdrop-blur rounded-xl p-3 border border-dark-border shadow-md">
            <button
              onClick={handleToggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isRunning 
                  ? 'bg-amber-soft-bg text-amber-soft hover:bg-amber-soft/20' 
                  : 'bg-emerald-soft-bg text-emerald-soft hover:bg-emerald-soft/20'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? t.pause : t.start}
            </button>
            
            <button
              onClick={handleStep}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-dark-accent text-dark-text hover:bg-dark-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <StepForward size={18} />
              {t.step}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-dark-accent text-dark-text hover:bg-dark-accent-hover transition-all"
            >
              <RotateCcw size={18} />
              {t.reset}
            </button>

            <button
              onClick={() => setShowTrainMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[#ff7f50]/20 hover:bg-[#ff7f50]/30 text-[#ff7f50] transition-all"
            >
              <Brain size={18} />
              {language === 'ru' ? 'Тренировка' : 'Train'}
            </button>

            <button
              onClick={() => setShowRuleArchitect(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[#ff7f50]/20 hover:bg-[#ff7f50]/30 text-[#ff7f50] transition-all"
            >
              <Settings size={18} />
              {language === 'ru' ? 'Архитектор' : 'Architect'}
            </button>

            <div className="ml-auto flex items-center gap-4">
              <label className="text-sm text-dark-text-muted">
                {t.speed}: {generationSpeed / 1000}с
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={generationSpeed}
                onChange={(e) => setGenerationSpeed(Number(e.target.value))}
                className="w-32 accent-blue-soft"
              />

              <label className="text-sm text-dark-text-muted">
                {t.fraud}: {Math.round(fraudProbability * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={fraudProbability * 100}
                onChange={(e) => setFraudProbability(Number(e.target.value) / 100)}
                className="w-32 accent-risk-high"
              />
            </div>
          </div>

          {/* Контент */}
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Поток транзакций */}
            <div className="w-80 flex flex-col bg-dark-surface/80 backdrop-blur rounded-xl border border-dark-border shadow-md overflow-hidden">
              <div className="p-3 border-b border-dark-border bg-dark-surface-alt">
                <h3 className="font-semibold text-dark-text">{t.transactions}</h3>
                <p className="text-xs text-dark-text-muted">{t.last50}</p>
              </div>
              <TransactionStream
                transactions={transactions}
                selectedId={selectedTransaction?.transaction?.transaction_id}
                onSelect={handleSelectTransaction}
                language={language}
                t={t}
              />
            </div>

            {/* Детали транзакции */}
            <div className="flex-1 flex flex-col bg-dark-surface/80 backdrop-blur rounded-xl border border-dark-border shadow-md overflow-hidden">
              {selectedTransaction ? (
                <TransactionDetail
                  analysis={selectedTransaction}
                  rulesConfig={rulesConfig}
                  thresholds={thresholds}
                  language={language}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-dark-text-muted">
                  <div className="text-center">
                    <p className="text-lg mb-2">{t.noTransaction}</p>
                    <p className="text-sm">{t.runOrSelect}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Правила */}
            <div className="w-80 flex flex-col bg-dark-surface/80 backdrop-blur rounded-xl border border-dark-border shadow-md overflow-hidden">
              <RulesPanel
                rulesConfig={rulesConfig}
                thresholds={thresholds}
                onUpdateRule={handleUpdateRule}
                onUpdateThresholds={handleUpdateThresholds}
                onResetRules={handleResetRules}
                language={language}
                t={t}
              />
            </div>
          </div>
        </div>

        {/* Панель аналитики */}
        <div className="w-96 bg-dark-surface/80 backdrop-blur border-l border-dark-border overflow-y-auto shadow-md">
          <Analytics 
            analyzedTransactions={analyzedTransactions}
            rulesConfig={rulesConfig}
            language={language}
          />
        </div>

        {/* Панель настроек */}
        {showSettings && (
          <SettingsPanel
            rulesConfig={rulesConfig}
            thresholds={thresholds}
            onUpdateRule={handleUpdateRule}
            onUpdateThresholds={handleUpdateThresholds}
            onClose={() => setShowSettings(false)}
            language={language}
            t={t}
          />
        )}

        {/* Режим тренировки */}
        {showTrainMode && (
          <TrainMode
            onClose={() => setShowTrainMode(false)}
            rulesConfig={rulesConfig}
            thresholds={thresholds}
            language={language}
          />
        )}

        {/* Архитектор правил */}
        {showRuleArchitect && (
          <RuleArchitect
            onClose={() => setShowRuleArchitect(false)}
            language={language}
          />
        )}
      </div>
    </div>
  );
}

export default App;
