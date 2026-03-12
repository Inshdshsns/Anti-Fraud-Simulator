import React from 'react';
import { 
  CreditCard, Globe, Smartphone, Clock, User, 
  TrendingUp, X, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';
import { formatAmount, formatDateTime, formatAccountAge } from '../utils/transactionGenerator';
import { getDecisionColor } from '../utils/rulesEngine';

const TransactionModal = ({ analysis, rulesConfig, thresholds, onClose }) => {
  if (!analysis) return null;

  const { transaction, decision, totalScore, ruleResults } = analysis;
  const decisionColor = getDecisionColor(decision);
  const triggeredRules = ruleResults.filter(r => r.triggered);
  const riskPercentage = Math.min(totalScore, 100);

  const getRiskColor = (score) => {
    if (score <= 40) return '#22c55e';
    if (score <= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div 
          className="p-4 border-b border-slate-700 flex items-center justify-between"
          style={{ backgroundColor: `${decisionColor}15` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: decisionColor, color: '#0f172a' }}
            >
              {getDecisionIcon(decision)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{decision}</h2>
              <p className="text-sm text-slate-400">{transaction.transaction_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-3 gap-6">
            {/* Левая колонка - Параметры */}
            <div className="col-span-2 space-y-6">
              {/* Параметры транзакции */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-400" />
                  Параметры транзакции
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<CreditCard size={16} />}
                    label="Сумма"
                    value={formatAmount(transaction.amount)}
                    subValue={transaction.currency}
                  />
                  <DetailItem
                    icon={<Clock size={16} />}
                    label="Время"
                    value={formatDateTime(transaction.timestamp)}
                    subValue={new Date(transaction.timestamp).toLocaleDateString('ru-RU')}
                  />
                  <DetailItem
                    icon={<Globe size={16} />}
                    label="Страна транзакции"
                    value={transaction.country_name}
                    warning={transaction.country !== transaction.ip_country}
                  />
                  <DetailItem
                    icon={<Globe size={16} />}
                    label="Страна IP"
                    value={transaction.ip_country_name}
                    warning={transaction.country !== transaction.ip_country}
                  />
                  <DetailItem
                    icon={<Smartphone size={16} />}
                    label="Устройство"
                    value={transaction.new_device ? 'Новое' : 'Известное'}
                    subValue={transaction.device_id.slice(0, 20) + '...'}
                    warning={transaction.new_device}
                  />
                  <DetailItem
                    icon={<TrendingUp size={16} />}
                    label="Velocity"
                    value={`${transaction.velocity} транзакций`}
                    subValue="за последние 10 минут"
                    warning={transaction.velocity > 5}
                  />
                  <DetailItem
                    icon={<User size={16} />}
                    label="Возраст аккаунта"
                    value={formatAccountAge(transaction.account_age_days)}
                    warning={transaction.account_age_days < 7}
                  />
                  <DetailItem
                    icon={<CreditCard size={16} />}
                    label="Категория мерчанта"
                    value={transaction.merchant_category_name}
                    subValue={`Риск категории: ${transaction.merchant_risk}%`}
                    warning={transaction.merchant_risk >= 25}
                  />
                </div>
              </div>

              {/* Правила */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-amber-400" />
                  Правила ({triggeredRules.length} сработало из {ruleResults.length})
                </h3>
                <div className="space-y-2">
                  {ruleResults.map((result) => {
                    const config = rulesConfig?.find(r => r.id === result.ruleId);
                    const isEnabled = config?.enabled ?? true;
                    
                    return (
                      <div 
                        key={result.ruleId}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          result.triggered 
                            ? 'bg-red-500/10 border border-red-500/30' 
                            : 'bg-slate-800/50 border border-slate-700/50'
                        } ${!isEnabled ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-sm ${
                            result.triggered 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-slate-700 text-slate-500'
                          }`}>
                            {result.triggered ? '!' : '✓'}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${
                              result.triggered ? 'text-white' : 'text-slate-400'
                            }`}>
                              {result.ruleName}
                            </div>
                            <div className="text-xs text-slate-500">{result.explanation}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${
                          result.triggered ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {result.triggered ? `+${result.score}` : '0'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Правая колонка - Скоринг */}
            <div className="space-y-6">
              {/* Gauge скоринга */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Риск-скоринг</h3>
                
                <div className="relative h-10 bg-slate-700 rounded-full overflow-hidden mb-4">
                  {/* Зоны */}
                  <div 
                    className="absolute h-full bg-emerald-500/40"
                    style={{ width: `${((thresholds?.approve || 40) / 100) * 100}%` }}
                  />
                  <div 
                    className="absolute h-full bg-amber-500/40"
                    style={{ 
                      left: `${((thresholds?.approve || 40) / 100) * 100}%`,
                      width: `${(((thresholds?.review || 70) - (thresholds?.approve || 40)) / 100) * 100}%`
                    }}
                  />
                  <div 
                    className="absolute h-full bg-red-500/40"
                    style={{ 
                      left: `${((thresholds?.review || 70) / 100) * 100}%`,
                      width: `${((100 - (thresholds?.review || 70)) / 100) * 100}%`
                    }}
                  />
                  
                  {/* Индикатор */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white rounded-full transition-all duration-500 shadow-lg shadow-white/50"
                    style={{ left: `${riskPercentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-slate-400 mb-4">
                  <span>0</span>
                  <span className="text-emerald-400">≤ {thresholds?.approve || 40}</span>
                  <span className="text-amber-400">≤ {thresholds?.review || 70}</span>
                  <span className="text-red-400">&gt; {thresholds?.review || 70}</span>
                  <span>100+</span>
                </div>
                
                <div className="text-center p-4 bg-slate-800 rounded-xl">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: getRiskColor(totalScore) }}
                  >
                    {totalScore}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">баллов риска</p>
                </div>

                {/* Легенда */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-emerald-500/40" />
                    <span className="text-slate-300">APPROVE (≤ {thresholds?.approve || 40})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-amber-500/40" />
                    <span className="text-slate-300">REVIEW ({thresholds?.approve || 40}-{thresholds?.review || 70})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-red-500/40" />
                    <span className="text-slate-300">DECLINE (&gt; {thresholds?.review || 70})</span>
                  </div>
                </div>
              </div>

              {/* Итоговое решение */}
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${decisionColor}15`, border: `2px solid ${decisionColor}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: decisionColor }}
                  >
                    {getDecisionIcon(decision)}
                  </div>
                  <h3 className="text-lg font-bold text-white">Решение: {decision}</h3>
                </div>
                <p className="text-sm text-slate-300">
                  {decision === 'APPROVE' && (
                    <>
                      Транзакция <strong className="text-emerald-400">одобрена</strong> и будет 
                      обработана автоматически. Риск-скор {totalScore} ниже порога одобрения.
                    </>
                  )}
                  {decision === 'REVIEW' && (
                    <>
                      Транзакция отправлена на <strong className="text-amber-400">ручную проверку</strong>. 
                      Требуется дополнительное подтверждение от владельца карты.
                    </>
                  )}
                  {decision === 'DECLINE' && (
                    <>
                      Транзакция <strong className="text-red-400">отклонена</strong> из-за высокого 
                      риска мошенничества. Риск-скор {totalScore} превышает порог отклонения.
                    </>
                  )}
                </p>
              </div>

              {/* Статистика */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Статистика</h3>
                <div className="space-y-2">
                  <StatRow label="Всего правил" value={ruleResults.length} />
                  <StatRow label="Сработало правил" value={triggeredRules.length} />
                  <StatRow 
                    label="Вклад правил" 
                    value={`${Math.round((triggeredRules.length / ruleResults.length) * 100)}%`} 
                  />
                  <StatRow label="Средний вес правила" value={Math.round(totalScore / Math.max(triggeredRules.length, 1))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, subValue, warning }) => (
  <div className={`p-3 rounded-lg ${warning ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50'}`}>
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
      {icon}
      {label}
    </div>
    <div className="font-semibold text-white">{value}</div>
    {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const getDecisionIcon = (decision) => {
  switch (decision) {
    case 'APPROVE': return '✓';
    case 'REVIEW': return '!';
    case 'DECLINE': return '✕';
    default: return '?';
  }
};

export default TransactionModal;
