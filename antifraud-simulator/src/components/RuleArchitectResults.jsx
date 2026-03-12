import React, { useMemo } from 'react';
import { X, Trophy, Target, TrendingUp, Award, Shield, Zap, RotateCcw } from 'lucide-react';

const RuleArchitectResults = ({ results, rules, budget, spentBudget, onClose, onRestart, language }) => {
  const t = useMemo(() => ({
    ru: {
      title: 'Результаты симуляции',
      backToMenu: 'В меню',
      restart: 'Заново',
      totalTransactions: 'Всего транзакций',
      fraud: 'Фрод',
      legit: 'Легит',
      approved: 'Одобрено',
      reviewed: 'На проверке',
      declined: 'Отклонено',
      decisions: 'Решения',
      spent: 'Потрачено',
      remaining: 'Остаток',
      detectionRate: 'Detection Rate',
      falsePositiveRate: 'False Positive Rate',
      precision: 'Precision',
      recall: 'Recall',
      score: 'Оценка',
      budgetUsed: 'Использовано бюджета',
      rulesUsed: 'Правил использовано',
      confusionMatrix: 'Confusion Matrix',
      predictedFraud: 'Predicted Fraud',
      predictedLegit: 'Predicted Legit',
      actualFraud: 'Actual Fraud',
      actualLegit: 'Actual Legit',
      truePositive: 'True Positive',
      falseNegative: 'False Negative',
      falsePositive: 'False Positive',
      trueNegative: 'True Negative',
      rulesBreakdown: 'Детали правил',
      rule: 'Правило',
      triggered: 'Сработало',
      excellent: 'Отлично!',
      good: 'Хорошо',
      average: 'Средне',
      poor: 'Плохо',
      tryAgain: 'Попробуй ещё раз',
    },
    en: {
      title: 'Simulation Results',
      backToMenu: 'Back to menu',
      restart: 'Restart',
      totalTransactions: 'Total transactions',
      fraud: 'Fraud',
      legit: 'Legit',
      approved: 'Approved',
      reviewed: 'Reviewed',
      declined: 'Declined',
      decisions: 'Decisions',
      spent: 'Spent',
      remaining: 'Remaining',
      detectionRate: 'Detection Rate',
      falsePositiveRate: 'False Positive Rate',
      precision: 'Precision',
      recall: 'Recall',
      score: 'Score',
      budgetUsed: 'Budget used',
      rulesUsed: 'Rules used',
      confusionMatrix: 'Confusion Matrix',
      predictedFraud: 'Predicted Fraud',
      predictedLegit: 'Predicted Legit',
      actualFraud: 'Actual Fraud',
      actualLegit: 'Actual Legit',
      truePositive: 'True Positive',
      falseNegative: 'False Negative',
      falsePositive: 'False Positive',
      trueNegative: 'True Negative',
      rulesBreakdown: 'Rules breakdown',
      rule: 'Rule',
      triggered: 'Triggered',
      excellent: 'Excellent!',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
      tryAgain: 'Try again',
    },
  })[language || 'ru'], [language]);

  // Оценка результата
  const getResultGrade = useMemo(() => {
    if (results.score >= 80) return { label: t.excellent, color: '#52a87c' };
    if (results.score >= 60) return { label: t.good, color: '#6b9ac4' };
    if (results.score >= 40) return { label: t.average, color: '#bd9350' };
    return { label: t.poor, color: '#bd6262' };
  }, [results.score, t]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-surface rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-dark-border" onClick={e => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between bg-[#ff7f50]/20">
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-[#ff7f50]" />
            <div>
              <h2 className="text-xl font-bold text-dark-text">{t.title}</h2>
              <p className="text-xs text-dark-text-muted">{getResultGrade.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRestart} className="flex items-center gap-2 px-4 py-2 bg-[#ff7f50] rounded-lg text-white text-sm font-medium hover:bg-[#ff7f50]/90 transition-all">
              <RotateCcw size={16} />
              {t.restart}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-dark-accent rounded-lg transition-all">
              <X size={20} className="text-dark-text" />
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Основные метрики */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <MetricCard 
              label={t.score} 
              value={Math.round(results.score)} 
              color={getResultGrade.color}
              icon={<Award size={16} />}
              suffix="/100"
            />
            <MetricCard 
              label={t.detectionRate} 
              value={Math.round(results.detectionRate)} 
              color="#52a87c"
              icon={<Target size={16} />}
              suffix="%"
            />
            <MetricCard 
              label={t.falsePositiveRate} 
              value={Math.round(results.falsePositiveRate)} 
              color="#bd6262"
              icon={<TrendingUp size={16} />}
              suffix="%"
            />
            <MetricCard 
              label={t.precision} 
              value={Math.round(results.precision)} 
              color="#6b9ac4"
              icon={<Shield size={16} />}
              suffix="%"
            />
            <MetricCard 
              label={t.recall} 
              value={Math.round(results.recall)} 
              color="#9b7fbf"
              icon={<Zap size={16} />}
              suffix="%"
            />
          </div>

          {/* Статистика транзакций */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold text-dark-text mb-3">{t.totalTransactions}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.fraud}</span>
                  <span className="text-risk-high font-bold">{results.fraud}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.legit}</span>
                  <span className="text-emerald-soft font-bold">{results.legit}</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold text-dark-text mb-3">{t.decisions}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.approved}</span>
                  <span className="text-emerald-soft font-bold">{results.approved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.reviewed}</span>
                  <span className="text-amber-soft font-bold">{results.reviewed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.declined}</span>
                  <span className="text-risk-high font-bold">{results.declined}</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h3 className="text-sm font-semibold text-dark-text mb-3">{t.budgetUsed}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.rulesUsed}</span>
                  <span className="text-dark-text font-bold">{rules.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.spent}</span>
                  <span className="text-orange-400 font-bold">{spentBudget} / {budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-muted">{t.remaining}</span>
                  <span className={budget - spentBudget >= 0 ? 'text-emerald-soft font-bold' : 'text-risk-high font-bold'}>
                    {budget - spentBudget}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border mb-6">
            <h3 className="text-sm font-semibold text-dark-text mb-4 flex items-center gap-2">
              <Target size={16} className="text-blue-soft" />
              {t.confusionMatrix}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1"></div>
              <div className="text-center text-xs text-dark-text-muted">{t.predictedFraud}</div>
              <div className="text-center text-xs text-dark-text-muted">{t.predictedLegit}</div>

              <div className="text-xs text-dark-text-muted flex items-center">{t.actualFraud}</div>
              <div className="bg-emerald-soft-bg border border-emerald-soft/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-soft">{results.tp}</div>
                <div className="text-xs text-emerald-soft">{t.truePositive}</div>
              </div>
              <div className="bg-risk-high-bg border border-risk-high/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-risk-high">{results.fn}</div>
                <div className="text-xs text-risk-high">{t.falseNegative}</div>
              </div>

              <div className="text-xs text-dark-text-muted flex items-center">{t.actualLegit}</div>
              <div className="bg-amber-soft-bg border border-amber-soft/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-soft">{results.fp}</div>
                <div className="text-xs text-amber-soft">{t.falsePositive}</div>
              </div>
              <div className="bg-emerald-soft-bg border border-emerald-soft/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-soft">{results.tn}</div>
                <div className="text-xs text-emerald-soft">{t.trueNegative}</div>
              </div>
            </div>
          </div>

          {/* Детали правил */}
          <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
            <h3 className="text-sm font-semibold text-dark-text mb-4">{t.rulesBreakdown}</h3>
            <div className="space-y-2">
              {Object.entries(results.rulesTriggered).map(([ruleId, count]) => (
                <div key={ruleId} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                  <span className="text-sm text-dark-text">{t.rule} "{ruleId}"</span>
                  <span className="text-sm font-bold text-orange-400">{count} {t.triggered}</span>
                </div>
              ))}
              {Object.keys(results.rulesTriggered).length === 0 && (
                <p className="text-sm text-dark-text-muted text-center py-4">
                  {language === 'ru' ? 'Ни одно правило не сработало' : 'No rules triggered'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon, suffix }) => (
  <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-dark-text-muted">{label}</span>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {suffix && <div className="text-xs text-dark-text-muted">{suffix}</div>}
    </div>
  </div>
);

export default RuleArchitectResults;
