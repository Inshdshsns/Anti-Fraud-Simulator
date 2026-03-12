import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { Activity, Target, Shield, TrendingUp } from 'lucide-react';

// Светло-бежевый цвет для tooltip
const TOOLTIP_BG = '#3d3835';
const TOOLTIP_BORDER = '#4a4540';
const TOOLTIP_TEXT = '#e8e4df';

const Analytics = ({ analyzedTransactions, rulesConfig, language }) => {
  const t = {
    ru: {
      analytics: 'Аналитика',
      totalTransactions: 'Всего транзакций',
      detectionRate: 'Detection Rate',
      avgScore: 'Средний скор',
      reviewRate: 'На проверке',
      decisionDistribution: 'Распределение решений',
      riskDistribution: 'Распределение риска',
      topRules: 'Топ правил',
      dynamics: 'Динамика',
      avgScoreLabel: 'Средний скор',
      fraudPercent: 'Fraud %',
    },
    en: {
      analytics: 'Analytics',
      totalTransactions: 'Total transactions',
      detectionRate: 'Detection Rate',
      avgScore: 'Avg Score',
      reviewRate: 'In Review',
      decisionDistribution: 'Decision Distribution',
      riskDistribution: 'Risk Distribution',
      topRules: 'Top Rules',
      dynamics: 'Dynamics',
      avgScoreLabel: 'Avg Score',
      fraudPercent: 'Fraud %',
    },
  }[language || 'ru'];

  // Статистика решений
  const decisionStats = useMemo(() => {
    if (!analyzedTransactions || analyzedTransactions.length === 0) return [];
    
    const stats = {
      approve: 0,
      review: 0,
      decline: 0,
    };

    analyzedTransactions.forEach(t => {
      if (t?.decision) {
        stats[t.decision.toLowerCase()]++;
      }
    });

    return [
      { name: 'APPROVE', value: stats.approve, color: '#52a87c' },
      { name: 'REVIEW', value: stats.review, color: '#bd9350' },
      { name: 'DECLINE', value: stats.decline, color: '#bd6262' },
    ].filter(item => item.value > 0);
  }, [analyzedTransactions]);

  // Распределение скоринга
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20', count: 0, color: '#52a87c' },
      { range: '21-40', count: 0, color: '#7ec99f' },
      { range: '41-60', count: 0, color: '#bd9350' },
      { range: '61-80', count: 0, color: '#d4a96c' },
      { range: '81-100+', count: 0, color: '#bd6262' },
    ];

    if (!analyzedTransactions) return ranges;

    analyzedTransactions.forEach(t => {
      const score = t?.totalScore || 0;
      if (score <= 20) ranges[0].count++;
      else if (score <= 40) ranges[1].count++;
      else if (score <= 60) ranges[2].count++;
      else if (score <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [analyzedTransactions]);

  // Сработавшие правила
  const ruleStats = useMemo(() => {
    if (!rulesConfig || !analyzedTransactions || analyzedTransactions.length === 0) return [];
    
    const stats = {};

    rulesConfig.forEach(rule => {
      stats[rule.id] = { name: rule.name, count: 0, score: rule.score };
    });

    analyzedTransactions.forEach(t => {
      if (t?.ruleResults) {
        t.ruleResults.forEach(result => {
          if (result.triggered && stats[result.ruleId]) {
            stats[result.ruleId].count++;
          }
        });
      }
    });

    const result = Object.values(stats)
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return result;
  }, [analyzedTransactions, rulesConfig]);

  // Динамика по времени
  const timelineStats = useMemo(() => {
    if (!analyzedTransactions || analyzedTransactions.length < 2) return [];

    const reversed = [...analyzedTransactions].reverse();
    const batches = [];
    const batchSize = Math.max(5, Math.floor(reversed.length / 10));

    for (let i = 0; i < reversed.length; i += batchSize) {
      const batch = reversed.slice(i, i + batchSize);
      const avgScore = batch.reduce((sum, t) => sum + (t?.totalScore || 0), 0) / batch.length;
      const fraudRate = batch.filter(t => t?.decision === 'DECLINE').length / batch.length * 100;

      batches.push({
        name: `${Math.floor(i / batchSize) + 1}`,
        avgScore: Math.round(avgScore),
        fraudRate: Math.round(fraudRate),
      });
    }

    return batches;
  }, [analyzedTransactions]);

  // Общая статистика
  const totalStats = {
    total: analyzedTransactions?.length || 0,
    detectionRate: analyzedTransactions?.length > 0
      ? Math.round((analyzedTransactions.filter(t => t.decision === 'DECLINE').length / analyzedTransactions.length) * 100)
      : 0,
    avgScore: analyzedTransactions?.length > 0
      ? Math.round(analyzedTransactions.reduce((sum, t) => sum + t.totalScore, 0) / analyzedTransactions.length)
      : 0,
    reviewRate: analyzedTransactions?.length > 0
      ? Math.round((analyzedTransactions.filter(t => t.decision === 'REVIEW').length / analyzedTransactions.length) * 100)
      : 0,
  };

  // Кастомный Tooltip для графиков
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg border"
          style={{ 
            backgroundColor: TOOLTIP_BG, 
            borderColor: TOOLTIP_BORDER,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
        >
          {label && <p className="text-xs text-dark-text-muted mb-1">{label}</p>}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.fill || TOOLTIP_TEXT }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-dark-text flex items-center gap-2">
        <Activity size={20} className="text-blue-soft" />
        {t.analytics}
      </h2>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Target size={16} />}
          label={t.totalTransactions}
          value={totalStats.total}
          color="#6b9ac4"
        />
        <StatCard
          icon={<Shield size={16} />}
          label={t.detectionRate}
          value={`${totalStats.detectionRate}%`}
          color="#52a87c"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label={t.avgScore}
          value={totalStats.avgScore}
          color="#bd9350"
        />
        <StatCard
          icon={<Activity size={16} />}
          label={t.reviewRate}
          value={`${totalStats.reviewRate}%`}
          color="#9b7fbf"
        />
      </div>

      {/* Pie chart решений */}
      {decisionStats.length > 0 && (
        <div className="bg-dark-surface rounded-xl p-3 border border-dark-border shadow-md">
          <h3 className="text-sm font-semibold text-dark-text mb-2">{t.decisionDistribution}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  stroke="none"
                >
                  {decisionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Распределение скоринга */}
      {scoreDistribution.some(r => r.count > 0) && (
        <div className="bg-dark-surface rounded-xl p-3 border border-dark-border shadow-md">
          <h3 className="text-sm font-semibold text-dark-text mb-2">{t.riskDistribution}</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#8c8680', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Топ правил */}
      {ruleStats.length > 0 && (
        <div className="bg-dark-surface rounded-xl p-3 border border-dark-border shadow-md">
          <h3 className="text-sm font-semibold text-dark-text mb-2">{t.topRules}</h3>
          <div className="space-y-2">
            {(() => {
              const maxCount = Math.max(...ruleStats.map(r => r.count), 1);
              // Переводы названий правил
              const ruleNameTranslations = {
                'Высокая сумма': 'High Amount',
                'Несоответствие стран': 'Country Mismatch',
                'Новое устройство': 'New Device',
                'Высокая скорость': 'High Velocity',
                'Страна высокого риска': 'High Risk Country',
                'Новый аккаунт': 'New Account',
                'Необычная категория': 'Unusual Category',
                'Круглая сумма': 'Round Amount',
              };
              return ruleStats.map((rule, index) => {
                const translatedName = language === 'en' ? (ruleNameTranslations[rule.name] || rule.name) : rule.name;
                return (
                  <div key={rule.name} className="flex items-center gap-2">
                    <span className="text-xs text-dark-text-muted w-4">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark-text">{translatedName}</span>
                        <span className="text-dark-text-muted">{rule.count}</span>
                      </div>
                      <div className="h-1.5 bg-dark-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-risk-high to-amber-soft rounded-full"
                          style={{
                            width: `${Math.min((rule.count / maxCount) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Динамика */}
      {timelineStats.length > 2 && (
        <div className="bg-dark-surface rounded-xl p-3 border border-dark-border shadow-md">
          <h3 className="text-sm font-semibold text-dark-text mb-2">{t.dynamics}</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineStats}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#8c8680', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#6b9ac4" 
                  strokeWidth={2}
                  dot={false}
                  name={t.avgScoreLabel}
                />
                <Line 
                  type="monotone" 
                  dataKey="fraudRate" 
                  stroke="#bd6262" 
                  strokeWidth={2}
                  dot={false}
                  name={t.fraudPercent}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-dark-surface rounded-lg p-2 border border-dark-border shadow-md">
    <div className="flex items-center gap-1.5 text-dark-text-muted mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <div className="text-lg font-bold" style={{ color }}>
      {value}
    </div>
  </div>
);

export default Analytics;
