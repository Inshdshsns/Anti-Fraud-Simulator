import React, { useState, useMemo } from 'react';
import { X, Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { getDecisionColor, getDecisionIcon } from '../utils/rulesEngine';

const TrainingResults = ({ results, onClose, language }) => {
  const t = useMemo(() => ({
    ru: {
      title: 'Результаты тренировки',
      total: 'Всего транзакций',
      correct: 'Правильных решений',
      accuracy: 'Точность',
      precision: 'Прецизионность',
      recall: 'Полнота',
      fraudDetected: 'Обнаружено фрода',
      falsePositives: 'Ложные срабатывания',
      score: 'Общий счёт',
      close: 'Закрыть',
      legitCorrect: 'Legit правильно',
      fraudCorrect: 'Fraud правильно',
      legitAsFraud: 'Legit как Fraud',
      fraudAsLegit: 'Fraud как Legit',
      confusionMatrix: 'Confusion Matrix',
      predictedFraud: 'Predicted Fraud',
      predictedLegit: 'Predicted Legit',
      actualFraud: 'Actual Fraud',
      actualLegit: 'Actual Legit',
      truePositive: 'True Positive',
      falseNegative: 'False Negative',
      falsePositive: 'False Positive',
      trueNegative: 'True Negative',
      fromFrauds: 'из',
      frauds: 'фродовых',
      legitAsFraudDesc: 'легит как фрод',
    },
    en: {
      title: 'Training Results',
      total: 'Total transactions',
      correct: 'Correct decisions',
      accuracy: 'Accuracy',
      precision: 'Precision',
      recall: 'Recall',
      fraudDetected: 'Fraud detected',
      falsePositives: 'False positives',
      score: 'Total score',
      close: 'Close',
      legitCorrect: 'Legit correct',
      fraudCorrect: 'Fraud correct',
      legitAsFraud: 'Legit as Fraud',
      fraudAsLegit: 'Fraud as Legit',
      confusionMatrix: 'Confusion Matrix',
      predictedFraud: 'Predicted Fraud',
      predictedLegit: 'Predicted Legit',
      actualFraud: 'Actual Fraud',
      actualLegit: 'Actual Legit',
      truePositive: 'True Positive',
      falseNegative: 'False Negative',
      falsePositive: 'False Positive',
      trueNegative: 'True Negative',
      fromFrauds: 'out of',
      frauds: 'frauds',
      legitAsFraudDesc: 'legit as fraud',
    },
  })[language || 'ru'], [language]);

  // Подсчёт метрик
  const metrics = useMemo(() => {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    let totalScore = 0;

    results.forEach(r => {
      const isFraud = r.actualLabel === 'fraud';
      const predictedFraud = r.userDecision === 'DECLINE' || r.userDecision === 'REVIEW';

      if (isFraud && predictedFraud) tp++;
      else if (!isFraud && !predictedFraud) tn++;
      else if (!isFraud && predictedFraud) fp++;
      else if (isFraud && !predictedFraud) fn++;

      totalScore += r.scoreChange;
    });

    const accuracy = results.length > 0 ? ((tp + tn) / results.length) * 100 : 0;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;

    return { tp, tn, fp, fn, accuracy, precision, recall, totalScore };
  }, [results]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-dark-border" onClick={e => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-surface-alt">
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-amber-soft" />
            <h2 className="text-xl font-bold text-dark-text">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-accent rounded-lg transition-all">
            <X size={20} className="text-dark-text" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Основные метрики */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label={t.accuracy} value={`${Math.round(metrics.accuracy)}%`} color="#52a87c" />
            <MetricCard label={t.precision} value={`${Math.round(metrics.precision)}%`} color="#6b9ac4" />
            <MetricCard label={t.recall} value={`${Math.round(metrics.recall)}%`} color="#bd9350" />
            <MetricCard label={t.score} value={metrics.totalScore} color="#9b7fbf" icon={<Trophy size={16} />} />
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
                <div className="text-2xl font-bold text-emerald-soft">{metrics.tp}</div>
                <div className="text-xs text-emerald-soft">{t.truePositive}</div>
              </div>
              <div className="bg-risk-high-bg border border-risk-high/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-risk-high">{metrics.fn}</div>
                <div className="text-xs text-risk-high">{t.falseNegative}</div>
              </div>

              <div className="text-xs text-dark-text-muted flex items-center">{t.actualLegit}</div>
              <div className="bg-amber-soft-bg border border-amber-soft/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-soft">{metrics.fp}</div>
                <div className="text-xs text-amber-soft">{t.falsePositive}</div>
              </div>
              <div className="bg-emerald-soft-bg border border-emerald-soft/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-soft">{metrics.tn}</div>
                <div className="text-xs text-emerald-soft">{t.trueNegative}</div>
              </div>
            </div>
          </div>

          {/* Детали */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h4 className="text-sm font-semibold text-dark-text mb-3">{t.fraudDetected}</h4>
              <div className="text-3xl font-bold text-emerald-soft">{metrics.tp}</div>
              <p className="text-xs text-dark-text-muted mt-1">{t.fromFrauds} {metrics.tp + metrics.fn} {t.frauds}</p>
            </div>
            <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
              <h4 className="text-sm font-semibold text-dark-text mb-3">{t.falsePositives}</h4>
              <div className="text-3xl font-bold text-amber-soft">{metrics.fp}</div>
              <p className="text-xs text-dark-text-muted mt-1">{t.legitAsFraudDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }) => (
  <div className="bg-dark-surface-alt rounded-xl p-4 border border-dark-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-dark-text-muted">{label}</span>
      {icon && <span style={{ color }}>{icon}</span>}
    </div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
  </div>
);

export default TrainingResults;
