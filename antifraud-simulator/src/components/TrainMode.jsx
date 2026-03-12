import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Trophy, Target, Award, Zap, Brain, AlertCircle,
  CheckCircle, XCircle, X, Play
} from 'lucide-react';
import { generateTrainingTransaction, calculateTrainingScore, formatTimeOfDay, formatPaymentMethod } from '../utils/trainingGenerator';
import { analyzeTransaction, getDecisionColor } from '../utils/rulesEngine';
import { getCountryTranslation, getMerchantCategoryTranslation } from '../utils/transactionGenerator';
import TrainingResults from './TrainingResults';

const TrainMode = ({ onClose, rulesConfig, thresholds, language }) => {
  // Состояния
  const [gameState, setGameState] = useState('menu'); // menu, training, results
  const [difficulty, setDifficulty] = useState('beginner');
  const [currentTx, setCurrentTx] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [results, setResults] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [txNumber, setTxNumber] = useState(1);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Переводы
  const t = useMemo(() => ({
    ru: {
      title: 'Режим тренировки',
      backToMenu: 'В меню',
      score: 'Счёт',
      streak: 'Серия',
      transaction: 'Транзакция',
      of: 'из',
      level: 'Уровень',
      amount: 'Сумма',
      country: 'Страна',
      ipCountry: 'IP Страна',
      device: 'Устройство',
      velocity: 'Velocity',
      velocityUnit: '/ 10мин',
      account: 'Аккаунт',
      days: 'дн.',
      category: 'Категория',
      payment: 'Оплата',
      time: 'Время',
      new: 'Новое',
      known: 'Известное',
      approve: 'APPROVE',
      review: 'REVIEW',
      decline: 'DECLINE',
      correct: 'Правильно!',
      incorrect: 'Неправильно',
      actualLabel: 'На самом деле',
      fraud: 'ФРОД',
      legit: 'ЛЕГИТ',
      scoreChange: 'Изменение счёта',
      continue: 'Продолжить',
      finish: 'Завершить',
      stepByStep: 'Пошаговый анализ',
      signals: 'Сигналы фрода',
      accuracy: 'Точность',
      recentDecisions: 'Последние решения',
      noDecisions: 'Нет решений',
      startTraining: 'Начать тренировку',
      difficulty: 'Сложность',
      beginner: 'Новичок',
      intermediate: 'Средний',
      expert: 'Эксперт',
      simplePatterns: 'Простые паттерны',
      combinations: 'Комбинации',
      complexSchemes: 'Сложные схемы',
      howItWorks: 'Как это работает:',
      analyze20: 'Проанализируй 20 транзакций',
      makeDecision: 'Прими решение: Approve / Review / Decline',
      getPoints: 'Получи очки за правильные решения',
      seeResults: 'Узнай результат в конце',
      rulesApplied: 'Применённые правила',
      totalRiskScore: 'Total Risk Score',
      points: 'баллов',
    },
    en: {
      title: 'Training Mode',
      backToMenu: 'Back to menu',
      score: 'Score',
      streak: 'Streak',
      transaction: 'Transaction',
      of: 'of',
      level: 'Level',
      amount: 'Amount',
      country: 'Country',
      ipCountry: 'IP Country',
      device: 'Device',
      velocity: 'Velocity',
      velocityUnit: '/ 10min',
      account: 'Account',
      days: 'days',
      category: 'Category',
      payment: 'Payment',
      time: 'Time',
      new: 'New',
      known: 'Known',
      approve: 'APPROVE',
      review: 'REVIEW',
      decline: 'DECLINE',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      actualLabel: 'Actual label',
      fraud: 'FRAUD',
      legit: 'LEGIT',
      scoreChange: 'Score change',
      continue: 'Continue',
      finish: 'Finish',
      stepByStep: 'Step-by-step analysis',
      signals: 'Fraud signals',
      accuracy: 'Accuracy',
      recentDecisions: 'Recent decisions',
      noDecisions: 'No decisions yet',
      startTraining: 'Start Training',
      difficulty: 'Difficulty',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      expert: 'Expert',
      simplePatterns: 'Simple patterns',
      combinations: 'Combinations',
      complexSchemes: 'Complex schemes',
      howItWorks: 'How it works:',
      analyze20: 'Analyze 20 transactions',
      makeDecision: 'Make decision: Approve / Review / Decline',
      getPoints: 'Get points for correct decisions',
      seeResults: 'See results at the end',
      rulesApplied: 'Rules applied',
      totalRiskScore: 'Total Risk Score',
      points: 'points',
    },
  })[language || 'ru'], [language]);

  // Вычисление уровня через useMemo
  const currentLevel = useMemo(() => {
    if (results.length === 0) {
      return { name: language === 'ru' ? 'Новичок' : 'Beginner', color: '#8c8680' };
    }
    const accuracy = Math.round((results.filter(r => r.isCorrect).length / results.length) * 100);
    if (accuracy >= 90) return { name: language === 'ru' ? 'Эксперт' : 'Expert', color: '#f59e0b' };
    if (accuracy >= 75) return { name: language === 'ru' ? 'Профи' : 'Pro', color: '#52a87c' };
    if (accuracy >= 60) return { name: language === 'ru' ? 'Аналитик' : 'Analyst', color: '#6b9ac4' };
    return { name: language === 'ru' ? 'Новичок' : 'Beginner', color: '#8c8680' };
  }, [results, language]);

  // Инициализация тренировки
  const initTraining = useCallback(() => {
    const transaction = generateTrainingTransaction(difficulty);
    const analysis = analyzeTransaction(transaction, rulesConfig, thresholds);
    
    setCurrentTx(transaction);
    setCurrentAnalysis(analysis);
    setResults([]);
    setCurrentScore(0);
    setStreak(0);
    setTxNumber(1);
    setShowExplanation(false);
    setShowStepByStep(false);
    setIsProcessing(false);
    setGameState('training');
  }, [difficulty, rulesConfig, thresholds]);

  // Принятие решения
  const handleDecision = useCallback((decision) => {
    if (!currentTx || !currentTx._label || isProcessing) return;
    
    setIsProcessing(true);
    
    const scoreChange = calculateTrainingScore(decision, currentTx._label);
    const isCorrect = scoreChange > 0;
    
    const result = {
      transactionId: currentTx.transaction_id,
      userDecision: decision,
      actualLabel: currentTx._label,
      scoreChange,
      isCorrect,
      patterns: currentTx._patterns || [],
    };
    
    // Обновляем результаты
    setResults(prev => [...prev, result]);
    setCurrentScore(prev => prev + scoreChange);
    setStreak(prev => isCorrect ? prev + 1 : 0);
    setShowExplanation(true);
    setIsProcessing(false);
  }, [currentTx, isProcessing]);

  // Следующая транзакция
  const handleNext = useCallback(() => {
    if (txNumber >= 20) {
      setGameState('results');
      return;
    }
    
    const transaction = generateTrainingTransaction(difficulty);
    const analysis = analyzeTransaction(transaction, rulesConfig, thresholds);
    
    setCurrentTx(transaction);
    setCurrentAnalysis(analysis);
    setTxNumber(prev => prev + 1);
    setShowExplanation(false);
    setShowStepByStep(false);
    setIsProcessing(false);
  }, [txNumber, difficulty, rulesConfig, thresholds]);

  // Переводы для текущей транзакции
  const translations = useMemo(() => {
    if (!currentTx) return null;
    return {
      country: getCountryTranslation(currentTx.country_name, language),
      ipCountry: getCountryTranslation(currentTx.ip_country_name, language),
      category: getMerchantCategoryTranslation(currentTx.merchant_category, language),
    };
  }, [currentTx, language]);

  // ========== РЕНДЕР МЕНЮ ==========
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-surface rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-dark-border">
          {/* Заголовок */}
          <div className="p-6 border-b border-dark-border bg-[#ff7f50]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={32} className="text-[#ff7f50]" />
                <div>
                  <h2 className="text-2xl font-bold text-dark-text">{t.title}</h2>
                  <p className="text-sm text-dark-text-muted">
                    {language === 'ru' ? 'Научись выявлять фрод' : 'Learn to detect fraud'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-dark-accent rounded-lg transition-all">
                <X size={20} className="text-dark-text" />
              </button>
            </div>
          </div>

          {/* Контент */}
          <div className="p-6 space-y-6">
            {/* Выбор сложности */}
            <div>
              <label className="text-sm font-semibold text-dark-text mb-3 block">{t.difficulty}</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: t.beginner, color: '#52a87c', desc: t.simplePatterns },
                  { id: 'intermediate', label: t.intermediate, color: '#bd9350', desc: t.combinations },
                  { id: 'expert', label: t.expert, color: '#bd6262', desc: t.complexSchemes },
                ].map(level => (
                  <button
                    key={level.id}
                    onClick={() => setDifficulty(level.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      difficulty === level.id 
                        ? 'border-opacity-100 shadow-lg' 
                        : 'border-opacity-30 hover:border-opacity-60'
                    }`}
                    style={{ 
                      borderColor: level.color,
                      backgroundColor: difficulty === level.id ? `${level.color}15` : 'transparent'
                    }}
                  >
                    <div className="font-bold mb-1" style={{ color: level.color }}>{level.label}</div>
                    <div className="text-xs text-dark-text-muted">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Информация */}
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold text-dark-text mb-2">{t.howItWorks}</h3>
              <ul className="text-sm text-dark-text-muted space-y-1">
                <li>• {t.analyze20}</li>
                <li>• {t.makeDecision}</li>
                <li>• {t.getPoints}</li>
                <li>• {t.seeResults}</li>
              </ul>
            </div>

            {/* Кнопка старта */}
            <button
              onClick={initTraining}
              className="w-full py-4 bg-[#ff7f50] rounded-xl font-bold text-white hover:bg-[#ff7f50]/90 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} />
              {t.startTraining}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== РЕНДЕР РЕЗУЛЬТАТОВ ==========
  if (gameState === 'results') {
    return (
      <TrainingResults 
        results={results} 
        onClose={onClose} 
        language={language}
      />
    );
  }

  // ========== РЕНДЕР ТРЕНИРОВКИ ==========
  const decisionColor = currentAnalysis ? getDecisionColor(currentAnalysis.decision) : '#52a87c';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      {/* Левая панель - Транзакция */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Хедер */}
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="flex items-center gap-2 text-dark-text-muted hover:text-dark-text">
              <ArrowLeft size={18} />
              {t.backToMenu}
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-soft-bg rounded-lg">
                <Award size={16} className="text-amber-soft" />
                <span className="text-sm text-amber-soft font-medium">{t.streak}: {streak}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-soft-bg rounded-lg">
                <Trophy size={16} className="text-blue-soft" />
                <span className="text-sm text-blue-soft font-medium">{t.score}: {currentScore}</span>
              </div>
            </div>
          </div>

          {/* Прогресс */}
          <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-text-muted">{t.transaction} {txNumber} {t.of} 20</span>
              <span className="text-sm" style={{ color: currentLevel.color }}>{t.level}: {currentLevel.name}</span>
            </div>
            <div className="h-2 bg-dark-accent rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ff7f50] transition-all"
                style={{ width: `${(txNumber / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Карточка транзакции */}
          {currentTx && translations && (
            <div className="bg-dark-surface rounded-xl p-6 border border-dark-border shadow-lg">
              <h3 className="text-lg font-bold text-dark-text mb-4">{currentTx.transaction_id}</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <DetailRow label={t.amount} value={`$${currentTx.amount}`} />
                <DetailRow label={t.country} value={translations.country} />
                <DetailRow label={t.ipCountry} value={translations.ipCountry} warning={currentTx.country !== currentTx.ip_country} />
                <DetailRow label={t.device} value={currentTx.new_device ? t.new : t.known} warning={currentTx.new_device} />
                <DetailRow label={t.velocity} value={`${currentTx.velocity} ${t.velocityUnit}`} warning={currentTx.velocity > 5} />
                <DetailRow label={t.account} value={`${currentTx.account_age_days} ${t.days}`} warning={currentTx.account_age_days < 7} />
                <DetailRow label={t.category} value={translations.category} />
                <DetailRow label={t.payment} value={formatPaymentMethod(currentTx.payment_method, language)} />
                <DetailRow label={t.time} value={formatTimeOfDay(currentTx.time_of_day, language)} />
              </div>
            </div>
          )}

          {/* Кнопки решений */}
          {!showExplanation && currentTx && !isProcessing && (
            <div className="grid grid-cols-3 gap-4">
              <DecisionButton label="APPROVE" color="#52a87c" onClick={() => handleDecision('APPROVE')} />
              <DecisionButton label="REVIEW" color="#bd9350" onClick={() => handleDecision('REVIEW')} />
              <DecisionButton label="DECLINE" color="#bd6262" onClick={() => handleDecision('DECLINE')} />
            </div>
          )}

          {/* Объяснение */}
          {showExplanation && results.length > 0 && (
            <ExplanationPanel
              lastResult={results[results.length - 1]}
              t={t}
              showStepByStep={showStepByStep}
              setShowStepByStep={setShowStepByStep}
              currentAnalysis={currentAnalysis}
              txNumber={txNumber}
              handleNext={handleNext}
            />
          )}
        </div>
      </div>

      {/* Правая панель - Статистика */}
      <div className="w-80 bg-dark-surface border-l border-dark-border p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-dark-text mb-6">{t.title}</h3>
        
        <div className="space-y-4">
          <StatCard label={t.score} value={currentScore} color="#9b7fbf" icon={<Trophy size={18} />} />
          <StatCard label={t.accuracy} value={`${currentLevel.name === 'Beginner' || currentLevel.name === 'Новичок' ? (results.length > 0 ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100) : 0) : currentLevel.name === 'Analyst' || currentLevel.name === 'Аналитик' ? '60-74' : currentLevel.name === 'Pro' || currentLevel.name === 'Профи' ? '75-89' : '90-100'}%`} color="#52a87c" icon={<Target size={18} />} />
          <StatCard label={t.streak} value={streak} color="#bd9350" icon={<Zap size={18} />} />
          <StatCard label={t.level} value={currentLevel.name} color={currentLevel.color} icon={<Award size={18} />} />

          <div className="pt-4 border-t border-dark-border">
            <h4 className="text-sm font-semibold text-dark-text mb-3">{t.recentDecisions}</h4>
            <div className="space-y-2">
              {results.length > 0 ? (
                results.slice(-5).reverse().map((r, i) => (
                  <div key={i} className={`p-2 rounded-lg text-xs ${
                    r.isCorrect ? 'bg-emerald-soft-bg text-emerald-soft' : 'bg-risk-high-bg text-risk-high'
                  }`}>
                    <div className="flex justify-between">
                      <span>{r.userDecision}</span>
                      <span>{r.isCorrect ? '✓' : '✕'}</span>
                    </div>
                    <div className="text-dark-text-muted mt-1">
                      {r.actualLabel === 'fraud' ? t.fraud : t.legit}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-dark-text-muted">{t.noDecisions}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ==========

const DetailRow = ({ label, value, warning }) => (
  <div className={`p-3 rounded-lg ${warning ? 'bg-amber-soft-bg border border-amber-soft/30' : 'bg-dark-surface-alt'}`}>
    <div className="text-xs text-dark-text-muted mb-1">{label}</div>
    <div className={`font-semibold ${warning ? 'text-amber-soft' : 'text-dark-text'}`}>{value}</div>
  </div>
);

const DecisionButton = ({ label, color, onClick }) => (
  <button
    onClick={onClick}
    className="py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
    style={{ backgroundColor: color }}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-dark-text-muted">{label}</span>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
  </div>
);

const ExplanationPanel = ({ lastResult, t, showStepByStep, setShowStepByStep, currentAnalysis, txNumber, handleNext }) => (
  <div className={`rounded-xl p-6 border-2 ${
    lastResult.isCorrect
      ? 'bg-emerald-soft-bg border-emerald-soft/30'
      : 'bg-risk-high-bg border-risk-high/30'
  }`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold ${
        lastResult.isCorrect ? 'bg-emerald-soft' : 'bg-risk-high'
      }`}>
        {lastResult.isCorrect ? '✓' : '✕'}
      </div>
      <div>
        <h3 className="text-lg font-bold text-dark-text">
          {lastResult.isCorrect ? t.correct : t.incorrect}
        </h3>
        <p className="text-sm text-dark-text-muted">
          {t.actualLabel}: <span className={lastResult.actualLabel === 'fraud' ? 'text-risk-high' : 'text-emerald-soft'} font-bold>
            {lastResult.actualLabel === 'fraud' ? t.fraud : t.legit}
          </span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-4 mb-4">
      <div className="px-4 py-2 bg-dark-surface rounded-lg">
        <span className="text-xs text-dark-text-muted">{t.scoreChange}:</span>
        <span className={`ml-2 font-bold ${
          lastResult.scoreChange > 0 ? 'text-emerald-soft' : 'text-risk-high'
        }`}>
          {lastResult.scoreChange > 0 ? '+' : ''}{lastResult.scoreChange}
        </span>
      </div>
    </div>

    {lastResult.patterns && lastResult.patterns.length > 0 && (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-dark-text mb-2 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-soft" />
          {t.signals}
        </h4>
        <div className="flex flex-wrap gap-2">
          {lastResult.patterns.map((pattern, i) => (
            <span key={i} className="px-2 py-1 bg-amber-soft-bg text-amber-soft text-xs rounded">
              {pattern.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    )}

    <div className="flex gap-3">
      <button
        onClick={() => setShowStepByStep(!showStepByStep)}
        className="px-4 py-2 bg-dark-accent hover:bg-dark-accent-hover rounded-lg text-dark-text text-sm transition-all flex items-center gap-2"
      >
        <Brain size={16} />
        {t.stepByStep}
      </button>
      {txNumber >= 20 ? (
        <button
          onClick={handleNext}
          className="flex-1 px-4 py-2 bg-[#ff7f50] rounded-lg text-white font-medium transition-all"
        >
          {t.finish}
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="flex-1 px-4 py-2 bg-[#ff7f50] rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
        >
          {t.continue}
        </button>
      )}
    </div>

    {showStepByStep && currentAnalysis && (
      <div className="mt-4 pt-4 border-t border-dark-border">
        <h4 className="text-sm font-semibold text-dark-text mb-3 flex items-center gap-2">
          <Brain size={16} className="text-blue-soft" />
          {t.rulesApplied}
        </h4>
        <div className="space-y-2">
          {currentAnalysis.ruleResults.filter(r => r.triggered).map((rule, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
              <span className="text-sm text-dark-text">{rule.ruleName}</span>
              <span className="text-sm font-bold text-risk-high">+{rule.score}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-dark-text">{t.totalRiskScore}</span>
            <span className="text-xl font-bold" style={{ color: currentAnalysis.totalScore <= 40 ? '#52a87c' : currentAnalysis.totalScore <= 70 ? '#bd9350' : '#bd6262' }}>
              {currentAnalysis.totalScore} {t.points}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default TrainMode;
