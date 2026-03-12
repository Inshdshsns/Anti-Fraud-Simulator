import React from 'react';
import { X } from 'lucide-react';

const SettingsPanel = ({ 
  rulesConfig, 
  thresholds, 
  onUpdateRule, 
  onUpdateThresholds, 
  onClose,
  language,
  t
}) => {
  const translations = {
    ru: {
      settings: 'Настройки системы',
      thresholdValues: 'Пороговые значения',
      approve: 'APPROVE (Одобрить)',
      approveDesc: 'Транзакции со скором ниже этого значения будут автоматически одобрены',
      review: 'REVIEW (Проверка)',
      reviewDesc: 'Транзакции со скором между APPROVE и этим значением требуют ручной проверки',
      visualization: 'Визуализация порогов',
      scoringRules: 'Правила скоринга',
      weight: 'Вес',
      points: 'баллов',
      resetToDefaults: 'Сбросить к defaults',
      close: 'Закрыть',
    },
    en: {
      settings: 'System Settings',
      thresholdValues: 'Threshold Values',
      approve: 'APPROVE',
      approveDesc: 'Transactions with score below this value will be automatically approved',
      review: 'REVIEW',
      reviewDesc: 'Transactions with score between APPROVE and this value require manual review',
      visualization: 'Thresholds Visualization',
      scoringRules: 'Scoring Rules',
      weight: 'Weight',
      points: 'points',
      resetToDefaults: 'Reset to defaults',
      close: 'Close',
    },
  };

  const trans = translations[language || 'ru'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-dark-border">
        {/* Заголовок */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-surface-alt">
          <h2 className="text-xl font-bold text-dark-text">{trans.settings}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-accent rounded-lg transition-all"
          >
            <X size={20} className="text-dark-text" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)] space-y-6 bg-dark-bg">
          {/* Пороговые значения */}
          <section>
            <h3 className="text-lg font-semibold text-dark-text mb-4">{trans.thresholdValues}</h3>
            <div className="bg-dark-surface rounded-xl p-4 border border-dark-border shadow-md space-y-4">
              <ThresholdSlider
                label={trans.approve}
                description={trans.approveDesc}
                value={thresholds.approve}
                min={0}
                max={60}
                color="emerald"
                onChange={(value) => onUpdateThresholds({ ...thresholds, approve: value })}
              />
              
              <ThresholdSlider
                label={trans.review}
                description={trans.reviewDesc}
                value={thresholds.review}
                min={thresholds.approve + 1}
                max={100}
                color="amber"
                onChange={(value) => onUpdateThresholds({ ...thresholds, review: value })}
              />
              
              <div className="pt-4 border-t border-dark-border">
                <p className="text-sm text-dark-text-muted mb-2">{trans.visualization}:</p>
                <div className="h-8 bg-dark-accent rounded-full overflow-hidden relative">
                  <div 
                    className="absolute h-full bg-emerald-soft/40"
                    style={{ width: `${(thresholds.approve / 100) * 100}%` }}
                  />
                  <div 
                    className="absolute h-full bg-amber-soft/40"
                    style={{ 
                      left: `${(thresholds.approve / 100) * 100}%`,
                      width: `${((thresholds.review - thresholds.approve) / 100) * 100}%`
                    }}
                  />
                  <div 
                    className="absolute h-full bg-risk-high/40"
                    style={{ 
                      left: `${(thresholds.review / 100) * 100}%`,
                      width: `${((100 - thresholds.review) / 100) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-dark-text-muted mt-1">
                  <span>0</span>
                  <span className="text-emerald-soft">APPROVE ≤ {thresholds.approve}</span>
                  <span className="text-amber-soft">REVIEW ≤ {thresholds.review}</span>
                  <span className="text-risk-high">DECLINE &gt; {thresholds.review}</span>
                  <span>100+</span>
                </div>
              </div>
            </div>
          </section>

          {/* Правила */}
          <section>
            <h3 className="text-lg font-semibold text-dark-text mb-4">{trans.scoringRules}</h3>
            <div className="space-y-3">
              {rulesConfig.map((rule) => (
                <RuleEditor
                  key={rule.id}
                  rule={rule}
                  onUpdate={onUpdateRule}
                  language={language}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-dark-border flex justify-end gap-3 bg-dark-surface-alt">
          <button
            onClick={() => {
              onUpdateThresholds({ approve: 40, review: 70 });
              rulesConfig.forEach(rule => {
                onUpdateRule(rule.id, { enabled: true, score: rule.defaultScore || 30 });
              });
            }}
            className="px-4 py-2 text-sm bg-dark-accent hover:bg-dark-accent-hover rounded-lg text-dark-text transition-all"
          >
            {trans.resetToDefaults}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-soft hover:bg-blue-soft/80 rounded-lg text-white transition-all"
          >
            {trans.close}
          </button>
        </div>
      </div>
    </div>
  );
};

const ThresholdSlider = ({ label, description, value, min, max, color, onChange }) => {
  const colorClasses = {
    emerald: 'accent-emerald-soft text-emerald-soft',
    amber: 'accent-amber-soft text-amber-soft',
    red: 'accent-risk-high text-risk-high',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <label className={`text-sm font-semibold ${colorClasses[color]}`}>
            {label}
          </label>
          <p className="text-xs text-dark-text-muted mt-0.5">{description}</p>
        </div>
        <span className="text-lg font-bold text-dark-text w-12 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${colorClasses[color].split(' ')[0]}`}
      />
    </div>
  );
};

const RuleEditor = ({ rule, onUpdate, language }) => {
  const ruleNames = {
    high_amount: language === 'en' ? 'High Amount' : 'Высокая сумма',
    country_mismatch: language === 'en' ? 'Country Mismatch' : 'Несоответствие стран',
    new_device: language === 'en' ? 'New Device' : 'Новое устройство',
    high_velocity: language === 'en' ? 'High Velocity' : 'Высокая скорость',
    high_risk_country: language === 'en' ? 'High Risk Country' : 'Страна высокого риска',
    new_account: language === 'en' ? 'New Account' : 'Новый аккаунт',
    unusual_category: language === 'en' ? 'Unusual Category' : 'Необычная категория',
    round_amount: language === 'en' ? 'Round Amount' : 'Круглая сумма',
  };

  const ruleDescs = {
    high_amount: language === 'en' ? 'Transaction exceeds $1000' : 'Транзакция превышает $1000',
    country_mismatch: language === 'en' ? 'Transaction country ≠ IP country' : 'Страна транзакции ≠ стране IP',
    new_device: language === 'en' ? 'First transaction from this device' : 'Первая транзакция с этого устройства',
    high_velocity: language === 'en' ? 'More than 5 transactions in 10 minutes' : 'Более 5 транзакций за последние 10 минут',
    high_risk_country: language === 'en' ? 'Transaction from high-risk country' : 'Транзакция из страны с высоким уровнем мошенничества',
    new_account: language === 'en' ? 'Account younger than 7 days' : 'Аккаунт моложе 7 дней',
    unusual_category: language === 'en' ? 'Transaction in high-risk category' : 'Транзакция в категории с высоким риском',
    round_amount: language === 'en' ? 'Round amount (may indicate fraud)' : 'Сумма кратна 100 (может указывать на мошенничество)',
  };

  return (
    <div className={`bg-dark-surface rounded-xl p-3 border border-dark-border transition-all shadow-md ${
      rule.enabled ? 'opacity-100' : 'opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onUpdate(rule.id, { enabled: e.target.checked })}
            className="mt-1 w-4 h-4 rounded accent-blue-soft"
          />
          <div>
            <h4 className={`text-sm font-semibold ${rule.enabled ? 'text-dark-text' : 'text-dark-text-muted'}`}>
              {ruleNames[rule.id]}
            </h4>
            <p className="text-xs text-dark-text-muted mt-0.5">{ruleDescs[rule.id]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-text-muted">{language === 'en' ? 'Weight:' : 'Вес:'}</span>
          <input
            type="number"
            min="0"
            max="50"
            value={rule.score}
            onChange={(e) => onUpdate(rule.id, { score: Number(e.target.value) })}
            disabled={!rule.enabled}
            className="w-14 px-2 py-1 bg-dark-bg border border-dark-border rounded text-sm text-dark-text text-center disabled:opacity-50"
          />
        </div>
      </div>
      
      {rule.enabled && (
        <div className="ml-7">
          <input
            type="range"
            min="0"
            max="50"
            value={rule.score}
            onChange={(e) => onUpdate(rule.id, { score: Number(e.target.value) })}
            className="w-full accent-risk-high"
          />
          <div className="flex justify-between text-xs text-dark-text-muted mt-1">
            <span>0</span>
            <span className="text-risk-high">+{rule.score} {language === 'en' ? 'points' : 'баллов'}</span>
            <span>50</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
