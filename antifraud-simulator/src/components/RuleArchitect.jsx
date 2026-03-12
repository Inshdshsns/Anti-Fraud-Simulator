import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Settings, Save, Play, RotateCcw, 
  TrendingUp, AlertCircle, CheckCircle, X, DollarSign,
  Target, Shield, Zap, Award
} from 'lucide-react';
import { generateTrainingDataset } from '../utils/trainingGenerator';
import { evaluateTransaction, calculateTotalScore, makeDecision } from '../utils/rulesEngine';
import { getCountryTranslation, getMerchantCategoryTranslation } from '../utils/transactionGenerator';
import RuleArchitectResults from './RuleArchitectResults';

const RuleArchitect = ({ onClose, language }) => {
  const [gameState, setGameState] = useState('menu'); // menu, setup, playing, results
  const [dataset, setDataset] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [budget, setBudget] = useState(100);
  const [spentBudget, setSpentBudget] = useState(0);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('rules'); // rules, dataset, analytics

  // Переводы
  const t = useMemo(() => ({
    ru: {
      title: 'Архитектор правил',
      subtitle: 'Rule Engine Challenge',
      backToMenu: 'В меню',
      budget: 'Бюджет',
      spent: 'Потрачено',
      remaining: 'Остаток',
      addRule: 'Добавить правило',
      removeRule: 'Удалить',
      ruleName: 'Название',
      condition: 'Условие',
      weight: 'Вес',
      cost: 'Стоимость',
      enabled: 'Вкл',
      runSimulation: 'Запустить симуляцию',
      processing: 'Обработка...',
      rules: 'Правила',
      dataset: 'Датасет',
      analytics: 'Аналитика',
      totalTransactions: 'Всего транзакций',
      fraudCount: 'Фродовых',
      legitCount: 'Легитимных',
      detectionRate: 'Detection Rate',
      falsePositiveRate: 'False Positive Rate',
      precision: 'Precision',
      recall: 'Recall',
      score: 'Оценка',
      ruleCost: 'Стоимость правила',
      budgetWarning: 'Недостаточно бюджета!',
      addMoreRules: 'Добавьте правила',
      runAtLeastOne: 'Запустите хотя бы одно правило',
      condition_amount: 'Сумма >',
      condition_velocity: 'Velocity >',
      condition_accountAge: 'Возраст аккаунта <',
      condition_newDevice: 'Новое устройство',
      condition_countryMismatch: 'Несоответствие стран',
      condition_highRiskCountry: 'Страна высокого риска',
      condition_merchantRisk: 'Риск мерчанта >=',
      condition_roundAmount: 'Круглая сумма',
      amount: 'Сумма',
      velocity: 'Velocity',
      accountAge: 'Возраст (дн)',
      merchantRisk: 'Риск мерчанта',
      selectCondition: 'Выберите условие',
      howItWorks: 'Как это работает:',
      dataset1000: 'Датасет из 1000 транзакций',
      createRules: 'Создай набор правил для детекции фрода',
      eachRuleCost: 'У каждого правила есть стоимость',
      yourBudget: 'Твой бюджет',
      goal: 'Цель: максимизируй Detection Rate, минимизируй False Positive',
      decisions: 'Решения',
      approved: 'Одобрено',
      reviewed: 'На проверке',
      declined: 'Отклонено',
      fraud: 'Фрод',
      legit: 'Легит',
      rulesUsed: 'Правил использовано',
      rule: 'Правило',
      triggered: 'Сработало',
      availableRules: 'Доступные правила',
      goal_title: 'Цель',
      goal_desc: 'Максимальный Detection Rate при минимальном False Positive',
      budget_title: 'Бюджет',
      budget_desc: 'У тебя 100 единиц бюджета. Каждое правило стоит от 5 до 20.',
      rules_title: 'Правила',
      rules_desc: 'Настрой вес и порог для каждого правила',
    },
    en: {
      title: 'Rule Architect',
      subtitle: 'Rule Engine Challenge',
      backToMenu: 'Back to menu',
      budget: 'Budget',
      spent: 'Spent',
      remaining: 'Remaining',
      addRule: 'Add Rule',
      removeRule: 'Remove',
      ruleName: 'Name',
      condition: 'Condition',
      weight: 'Weight',
      cost: 'Cost',
      enabled: 'On',
      runSimulation: 'Run Simulation',
      processing: 'Processing...',
      rules: 'Rules',
      dataset: 'Dataset',
      analytics: 'Analytics',
      totalTransactions: 'Total transactions',
      fraudCount: 'Fraud',
      legitCount: 'Legit',
      detectionRate: 'Detection Rate',
      falsePositiveRate: 'False Positive Rate',
      precision: 'Precision',
      recall: 'Recall',
      score: 'Score',
      ruleCost: 'Rule cost',
      budgetWarning: 'Insufficient budget!',
      addMoreRules: 'Add more rules',
      runAtLeastOne: 'Run at least one rule',
      condition_amount: 'Amount >',
      condition_velocity: 'Velocity >',
      condition_accountAge: 'Account age <',
      condition_newDevice: 'New device',
      condition_countryMismatch: 'Country mismatch',
      condition_highRiskCountry: 'High risk country',
      condition_merchantRisk: 'Merchant risk >=',
      condition_roundAmount: 'Round amount',
      amount: 'Amount',
      velocity: 'Velocity',
      accountAge: 'Account age',
      merchantRisk: 'Merchant risk',
      selectCondition: 'Select condition',
      howItWorks: 'How it works:',
      dataset1000: 'Dataset of 1000 transactions',
      createRules: 'Create ruleset for fraud detection',
      eachRuleCost: 'Each rule has a cost',
      yourBudget: 'Your budget',
      goal: 'Goal: maximize Detection Rate, minimize False Positive',
      decisions: 'Decisions',
      approved: 'Approved',
      reviewed: 'Reviewed',
      declined: 'Declined',
      fraud: 'Fraud',
      legit: 'Legit',
      rulesUsed: 'Rules used',
      rule: 'Rule',
      triggered: 'Triggered',
      availableRules: 'Available Rules',
      goal_title: 'Goal',
      goal_desc: 'Max Detection Rate with minimal False Positive',
      budget_title: 'Budget',
      budget_desc: 'You have 100 budget units. Each rule costs 5-20.',
      rules_title: 'Rules',
      rules_desc: 'Configure weight and threshold for each rule',
    },
  })[language || 'ru'], [language]);

  // Доступные условия для правил
  const availableConditions = useMemo(() => [
    { id: 'amount', label: t.condition_amount, defaultWeight: 30, cost: 15, defaultThreshold: 1000 },
    { id: 'velocity', label: t.condition_velocity, defaultWeight: 40, cost: 20, defaultThreshold: 5 },
    { id: 'accountAge', label: t.condition_accountAge, defaultWeight: 20, cost: 10, defaultThreshold: 7 },
    { id: 'newDevice', label: t.condition_newDevice, defaultWeight: 15, cost: 10, defaultThreshold: null },
    { id: 'countryMismatch', label: t.condition_countryMismatch, defaultWeight: 25, cost: 15, defaultThreshold: null },
    { id: 'highRiskCountry', label: t.condition_highRiskCountry, defaultWeight: 35, cost: 20, defaultThreshold: null },
    { id: 'merchantRisk', label: t.condition_merchantRisk, defaultWeight: 25, cost: 15, defaultThreshold: 25 },
    { id: 'roundAmount', label: t.condition_roundAmount, defaultWeight: 10, cost: 5, defaultThreshold: null },
  ], [t]);

  // Начало игры
  const startGame = useCallback(() => {
    const newDataset = generateTrainingDataset(1000, 'intermediate');
    setDataset(newDataset);
    
    // Стартовые правила (3 базовых)
    const starterRules = [
      { id: Date.now(), conditionId: 'amount', weight: 30, threshold: 1000, enabled: true },
      { id: Date.now() + 1, conditionId: 'countryMismatch', weight: 25, threshold: null, enabled: true },
      { id: Date.now() + 2, conditionId: 'newDevice', weight: 15, threshold: null, enabled: true },
    ];
    setCustomRules(starterRules);
    
    // Считаем бюджет
    const starterCost = starterRules.reduce((sum, rule) => {
      const cond = availableConditions.find(c => c.id === rule.conditionId);
      return sum + (cond?.cost || 0);
    }, 0);
    setSpentBudget(starterCost);
    setBudget(100);
    
    setGameState('playing');
    setActiveTab('rules');
  }, [availableConditions]);

  // Добавление правила
  const addRule = useCallback(() => {
    const newRule = {
      id: Date.now(),
      conditionId: 'amount',
      weight: 30,
      threshold: 1000,
      enabled: true,
    };
    setCustomRules(prev => [...prev, newRule]);
  }, []);

  // Обновление правила
  const updateRule = useCallback((ruleId, updates) => {
    setCustomRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, []);

  // Удаление правила
  const removeRule = useCallback((ruleId) => {
    setCustomRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  // Подсчёт потраченного бюджета
  useEffect(() => {
    const total = customRules.reduce((sum, rule) => {
      const cond = availableConditions.find(c => c.id === rule.conditionId);
      return sum + (cond?.cost || 0);
    }, 0);
    setSpentBudget(total);
  }, [customRules, availableConditions]);

  // Запуск симуляции
  const runSimulation = useCallback(() => {
    if (customRules.length === 0) return;
    if (spentBudget > budget) return;
    
    setIsProcessing(true);
    
    // Фильтруем только включенные правила
    const enabledRules = customRules.filter(r => r.enabled);
    
    // Небольшая задержка для UI
    setTimeout(() => {
      const simResults = {
        total: dataset.length,
        fraud: 0,
        legit: 0,
        approved: 0,
        reviewed: 0,
        declined: 0,
        tp: 0, tn: 0, fp: 0, fn: 0,
        rulesTriggered: {},
      };
      
      const thresholds = { approve: 40, review: 70 };
      const HIGH_RISK_COUNTRIES = ['NG', 'VN', 'ID', 'PK', 'BD', 'VE', 'IR'];
      
      dataset.forEach(tx => {
        const isFraud = tx._label === 'fraud';
        if (isFraud) simResults.fraud++;
        else simResults.legit++;
        
        // Применяем каждое включенное правило
        let totalScore = 0;
        
        enabledRules.forEach(rule => {
          let triggered = false;
          
          switch (rule.conditionId) {
            case 'amount':
              triggered = tx.amount > (rule.threshold || 1000);
              break;
            case 'velocity':
              triggered = tx.velocity > (rule.threshold || 5);
              break;
            case 'accountAge':
              triggered = tx.account_age_days < (rule.threshold || 7);
              break;
            case 'newDevice':
              triggered = tx.new_device === true;
              break;
            case 'countryMismatch':
              triggered = tx.country !== tx.ip_country;
              break;
            case 'highRiskCountry':
              triggered = HIGH_RISK_COUNTRIES.includes(tx.country) || HIGH_RISK_COUNTRIES.includes(tx.ip_country);
              break;
            case 'merchantRisk':
              triggered = tx.merchant_risk >= (rule.threshold || 25);
              break;
            case 'roundAmount':
              triggered = tx.amount % 100 === 0 && tx.amount >= 500;
              break;
            default:
              triggered = false;
          }
          
          if (triggered) {
            totalScore += rule.weight;
            // Считаем триггеры по имени условия
            const conditionName = rule.conditionId;
            simResults.rulesTriggered[conditionName] = (simResults.rulesTriggered[conditionName] || 0) + 1;
          }
        });
        
        // Определяем решение
        let decision;
        if (totalScore <= thresholds.approve) decision = 'APPROVE';
        else if (totalScore <= thresholds.review) decision = 'REVIEW';
        else decision = 'DECLINE';
        
        if (decision === 'APPROVE') simResults.approved++;
        else if (decision === 'REVIEW') simResults.reviewed++;
        else simResults.declined++;
        
        // Confusion matrix
        const predictedFraud = decision === 'DECLINE' || decision === 'REVIEW';
        if (isFraud && predictedFraud) simResults.tp++;
        else if (!isFraud && !predictedFraud) simResults.tn++;
        else if (!isFraud && predictedFraud) simResults.fp++;
        else if (isFraud && !predictedFraud) simResults.fn++;
      });
      
      // Метрики
      simResults.detectionRate = simResults.fraud > 0 ? (simResults.tp / simResults.fraud) * 100 : 0;
      simResults.falsePositiveRate = simResults.legit > 0 ? (simResults.fp / simResults.legit) * 100 : 0;
      simResults.precision = (simResults.tp + simResults.fp) > 0 ? (simResults.tp / (simResults.tp + simResults.fp)) * 100 : 0;
      simResults.recall = simResults.detectionRate;
      
      // Оценка (0-100)
      const detectionScore = simResults.detectionRate * 0.5;
      const fpPenalty = simResults.falsePositiveRate * 0.3;
      const budgetEfficiency = ((budget - spentBudget) / budget) * 20;
      simResults.score = Math.max(0, Math.min(100, detectionScore + (100 - fpPenalty) * 0.2 + budgetEfficiency));
      
      setResults(simResults);
      setGameState('results');
      setIsProcessing(false);
    }, 500);
  }, [customRules, dataset, budget, spentBudget]);

  // ========== РЕНДЕР МЕНЮ ==========
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-surface rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-dark-border">
          <div className="p-6 border-b border-dark-border bg-[#ff7f50]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={32} className="text-[#ff7f50]" />
                <div>
                  <h2 className="text-2xl font-bold text-dark-text">{t.title}</h2>
                  <p className="text-sm text-dark-text-muted">{t.subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-dark-accent rounded-lg transition-all">
                <X size={20} className="text-dark-text" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold text-dark-text mb-3">{t.howItWorks}</h3>
              <ul className="text-sm text-dark-text-muted space-y-2">
                <li>• {t.dataset1000}</li>
                <li>• {t.createRules}</li>
                <li>• {t.eachRuleCost}</li>
                <li>• {t.yourBudget}: <strong className="text-emerald-soft">{budget}</strong></li>
                <li>• {t.goal}</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-[#ff7f50] rounded-xl font-bold text-white hover:bg-[#ff7f50]/90 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} />
              {language === 'ru' ? 'Начать' : 'Start'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== РЕНДЕР РЕЗУЛЬТАТОВ ==========
  if (gameState === 'results' && results) {
    return (
      <RuleArchitectResults
        results={results}
        rules={customRules}
        budget={budget}
        spentBudget={spentBudget}
        onClose={() => setGameState('menu')}
        onRestart={startGame}
        language={language}
      />
    );
  }

  // ========== РЕНДЕР ИГРЫ ==========
  const remainingBudget = budget - spentBudget;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      {/* Левая панель - Правила */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Хедер */}
          <div className="flex items-center justify-between">
            <button onClick={() => setGameState('menu')} className="flex items-center gap-2 text-dark-text-muted hover:text-dark-text">
              <ArrowLeft size={18} />
              {t.backToMenu}
            </button>
            <div className="flex items-center gap-6">
              <BudgetDisplay label={t.budget} value={budget} color="#8c8680" icon={<DollarSign size={16} />} />
              <BudgetDisplay label={t.spent} value={spentBudget} color="#bd6262" icon={<TrendingUp size={16} />} />
              <BudgetDisplay label={t.remaining} value={remainingBudget} color={remainingBudget >= 0 ? '#52a87c' : '#bd6262'} icon={<Shield size={16} />} />
            </div>
          </div>

          {/* Табы */}
          <div className="flex gap-2 border-b border-dark-border">
            <TabButton active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} label={t.rules} />
            <TabButton active={activeTab === 'dataset'} onClick={() => setActiveTab('dataset')} label={`${t.dataset} (${dataset.length})`} />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label={t.analytics} />
          </div>

          {/* Контент табов */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-text">{t.rules}</h3>
                <button
                  onClick={addRule}
                  disabled={remainingBudget <= 0}
                  className="px-4 py-2 bg-[#ff7f50] rounded-lg text-white text-sm font-medium hover:bg-[#ff7f50]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {t.addRule}
                </button>
              </div>

              <div className="space-y-3">
                {customRules.map((rule, index) => (
                  <RuleEditor
                    key={rule.id}
                    rule={rule}
                    index={index + 1}
                    conditions={availableConditions}
                    onUpdate={updateRule}
                    onRemove={removeRule}
                    language={language}
                    t={t}
                  />
                ))}
              </div>

              {customRules.length === 0 && (
                <div className="text-center py-12 text-dark-text-muted">
                  <Settings size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t.addMoreRules}</p>
                </div>
              )}

              <button
                onClick={runSimulation}
                disabled={isProcessing || customRules.length === 0 || remainingBudget < 0}
                className="w-full py-4 bg-[#ff7f50] rounded-xl font-bold text-white hover:bg-[#ff7f50]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? <RotateCcw size={20} className="animate-spin" /> : <Play size={20} />}
                {isProcessing ? t.processing : t.runSimulation}
              </button>
            </div>
          )}

          {activeTab === 'dataset' && (
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <StatCard label={t.totalTransactions} value={dataset.length} color="#6b9ac4" />
                <StatCard label={t.fraudCount} value={dataset.filter(tx => tx._label === 'fraud').length} color="#bd6262" />
                <StatCard label={t.legitCount} value={dataset.filter(tx => tx._label === 'legit').length} color="#52a87c" />
              </div>
              <div className="text-sm text-dark-text-muted">
                {language === 'ru' ? 'Показаны первые 10 транзакций:' : 'Showing first 10 transactions:'}
              </div>
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {dataset.slice(0, 10).map((tx, i) => {
                  const countryName = getCountryTranslation(tx.country_name, language);
                  const categoryName = getMerchantCategoryTranslation(tx.merchant_category, language);
                  return (
                    <div key={i} className="p-3 bg-dark-surface rounded-lg text-xs">
                      <div className="flex justify-between">
                        <span className="font-mono text-dark-text-muted">{tx.transaction_id}</span>
                        <span className={tx._label === 'fraud' ? 'text-risk-high' : 'text-emerald-soft'}>
                          {tx._label.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-dark-text-muted mt-1">
                        ${tx.amount} | {countryName} | {categoryName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-lg font-bold text-dark-text mb-4">{t.analytics}</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.rules}</span>
                  <span className="text-dark-text">{customRules.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.budget}</span>
                  <span className="text-dark-text">{budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.spent}</span>
                  <span className={remainingBudget >= 0 ? 'text-emerald-soft' : 'text-risk-high'}>{spentBudget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.remaining}</span>
                  <span className={remainingBudget >= 0 ? 'text-emerald-soft' : 'text-risk-high'}>{remainingBudget}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Правая панель - Информация */}
      <div className="w-80 bg-dark-surface border-l border-dark-border p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-dark-text mb-6">{t.title}</h3>
        
        <div className="space-y-4">
          <InfoCard 
            icon={<Target size={18} />}
            title={t.goal_title}
            description={t.goal_desc}
          />
          <InfoCard 
            icon={<DollarSign size={18} />}
            title={t.budget_title}
            description={t.budget_desc}
          />
          <InfoCard 
            icon={<Settings size={18} />}
            title={t.rules_title}
            description={t.rules_desc}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-dark-border">
          <h4 className="text-sm font-semibold text-dark-text mb-3">{t.availableRules}</h4>
          <div className="space-y-2">
            {availableConditions.map(cond => (
              <div key={cond.id} className="flex justify-between text-xs">
                <span className="text-dark-text-muted">{cond.label}</span>
                <span className="text-orange-400">-{cond.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ==========

const BudgetDisplay = ({ label, value, color, icon }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface-alt rounded-lg">
    <span style={{ color }}>{icon}</span>
    <div>
      <div className="text-xs text-dark-text-muted">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-all ${
      active 
        ? 'text-orange-400 border-b-2 border-orange-400' 
        : 'text-dark-text-muted hover:text-dark-text'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
    <div className="text-xs text-dark-text-muted mb-1">{label}</div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
  </div>
);

const InfoCard = ({ icon, title, description }) => (
  <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-orange-400">{icon}</span>
      <span className="text-sm font-semibold text-dark-text">{title}</span>
    </div>
    <p className="text-xs text-dark-text-muted">{description}</p>
  </div>
);

const RuleEditor = ({ rule, index, conditions, onUpdate, onRemove, language, t }) => {
  const condition = conditions.find(c => c.id === rule.conditionId);
  
  return (
    <div className="bg-dark-surface rounded-xl p-4 border border-dark-border">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-sm">
          {index}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {/* Условие */}
            <div>
              <label className="text-xs text-dark-text-muted mb-1 block">{t.condition}</label>
              <select
                value={rule.conditionId}
                onChange={(e) => onUpdate(rule.id, { conditionId: e.target.value })}
                className="w-full bg-dark-surface-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text"
              >
                {conditions.map(cond => (
                  <option key={cond.id} value={cond.id}>{cond.label}</option>
                ))}
              </select>
            </div>
            
            {/* Вес */}
            <div>
              <label className="text-xs text-dark-text-muted mb-1 block">{t.weight}</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rule.weight}
                onChange={(e) => onUpdate(rule.id, { weight: Number(e.target.value) })}
                className="w-full bg-dark-surface-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text"
              />
            </div>
            
            {/* Порог */}
            {condition?.defaultThreshold !== null && (
              <div>
                <label className="text-xs text-dark-text-muted mb-1 block">
                  {condition.id === 'amount' ? t.amount : condition.id === 'velocity' ? t.velocity : condition.id === 'accountAge' ? t.accountAge : t.merchantRisk}
                </label>
                <input
                  type="number"
                  value={rule.threshold || ''}
                  onChange={(e) => onUpdate(rule.id, { threshold: Number(e.target.value) })}
                  className="w-full bg-dark-surface-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text"
                  placeholder="Threshold"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-dark-border">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-dark-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => onUpdate(rule.id, { enabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                {t.enabled}
              </label>
              <span className="text-xs text-dark-text-muted">
                {t.ruleCost}: <span className="text-orange-400">{condition?.cost || 0}</span>
              </span>
            </div>
            
            <button
              onClick={() => onRemove(rule.id)}
              className="px-3 py-1.5 text-sm text-risk-high hover:bg-risk-high/10 rounded-lg transition-all"
            >
              {t.removeRule}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleArchitect;
