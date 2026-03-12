import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

const RulesPanel = ({ rulesConfig, thresholds, onUpdateRule, onUpdateThresholds, onResetRules, language, t }) => {
  const [expanded, setExpanded] = useState(true);
  
  const safeThresholds = thresholds || { approve: 40, review: 70 };

  // Обработчики для синхронизации ползунков
  const handleApproveChange = (value) => {
    const newApprove = Math.min(value, safeThresholds.review - 1);
    onUpdateThresholds && onUpdateThresholds({
      ...safeThresholds,
      approve: newApprove
    });
  };

  const handleReviewChange = (value) => {
    const newReview = Math.max(value, safeThresholds.approve + 1);
    onUpdateThresholds && onUpdateThresholds({
      ...safeThresholds,
      review: newReview
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        className="p-3 border-b border-dark-border cursor-pointer hover:bg-dark-surface-alt transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-dark-text-muted" />
            <h3 className="font-semibold text-dark-text">{t?.rules || 'Правила'}</h3>
          </div>
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Пороги */}
          <div className="p-3 border-b border-dark-border bg-dark-surface-alt">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-dark-text-muted">{t?.thresholdValues || 'Пороговые значения'}</h4>
              <button
                onClick={onResetRules}
                className="flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200 transition-all"
                title={language === 'ru' ? 'Сбросить пороги' : 'Reset thresholds'}
              >
                <RotateCcw size={12} />
                {language === 'ru' ? 'Сброс' : 'Reset'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-soft">APPROVE &le;</span>
                  <span className="text-dark-text font-medium">{safeThresholds.approve}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={safeThresholds.approve}
                  onChange={(e) => handleApproveChange(Number(e.target.value))}
                  className="w-full accent-emerald-soft"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-soft">REVIEW &le;</span>
                  <span className="text-dark-text font-medium">{safeThresholds.review}</span>
                </div>
                <input
                  type="range"
                  min={safeThresholds.approve + 1}
                  max="100"
                  value={safeThresholds.review}
                  onChange={(e) => handleReviewChange(Number(e.target.value))}
                  className="w-full accent-amber-soft"
                />
              </div>
            </div>
          </div>

          {/* Список правил */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-dark-bg/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-dark-text-muted">{t?.scoringRules || 'Правила скоринга'}</h4>
              <button
                onClick={onResetRules}
                className="flex items-center gap-1 text-xs text-orange-300 hover:text-orange-200 transition-all"
                title={language === 'ru' ? 'Сбросить правила' : 'Reset rules'}
              >
                <RotateCcw size={12} />
                {language === 'ru' ? 'Сброс' : 'Reset'}
              </button>
            </div>
            {rulesConfig?.map((rule) => (
              <RuleItem
                key={rule.id}
                rule={rule}
                onUpdate={onUpdateRule}
                language={language}
              />
            )) || []}
          </div>
        </>
      )}
    </div>
  );
};

const RuleItem = ({ rule, onUpdate, language }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg overflow-hidden transition-all ${
      rule.enabled ? 'bg-dark-surface border border-dark-border shadow-md' : 'bg-dark-accent opacity-60'
    }`}>
      <div 
        className="p-2 cursor-pointer hover:bg-dark-surface-alt transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) => onUpdate(rule.id, { enabled: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded accent-blue-soft"
            />
            <span className={`text-sm font-medium ${rule.enabled ? 'text-dark-text' : 'text-dark-text-muted'}`}>
              {language === 'en' && rule.id === 'high_amount' ? 'High Amount' :
               language === 'en' && rule.id === 'country_mismatch' ? 'Country Mismatch' :
               language === 'en' && rule.id === 'new_device' ? 'New Device' :
               language === 'en' && rule.id === 'high_velocity' ? 'High Velocity' :
               language === 'en' && rule.id === 'high_risk_country' ? 'High Risk Country' :
               language === 'en' && rule.id === 'new_account' ? 'New Account' :
               language === 'en' && rule.id === 'unusual_category' ? 'Unusual Category' :
               language === 'en' && rule.id === 'round_amount' ? 'Round Amount' :
               rule.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-risk-high-bg text-risk-high rounded">
              +{rule.score}
            </span>
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>
        <p className="text-xs text-dark-text-muted mt-1 ml-6">
          {language === 'en' && rule.id === 'high_amount' ? 'Transaction exceeds $1000' :
           language === 'en' && rule.id === 'country_mismatch' ? 'Transaction country ≠ IP country' :
           language === 'en' && rule.id === 'new_device' ? 'First transaction from device' :
           language === 'en' && rule.id === 'high_velocity' ? 'More than 5 transactions in 10 min' :
           language === 'en' && rule.id === 'high_risk_country' ? 'Transaction from high-risk country' :
           language === 'en' && rule.id === 'new_account' ? 'Account younger than 7 days' :
           language === 'en' && rule.id === 'unusual_category' ? 'Transaction in risky category' :
           language === 'en' && rule.id === 'round_amount' ? 'Round amount (suspicious)' :
           rule.description}
        </p>
      </div>

      {expanded && (
        <div className="px-2 pb-3 ml-6">
          <div className="pt-2 border-t border-dark-border">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-dark-text-muted">{language === 'en' ? 'Rule Weight' : 'Вес правила'}</span>
              <span className="text-dark-text font-medium">{rule.score} {language === 'en' ? 'points' : 'баллов'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={rule.score}
              onChange={(e) => onUpdate(rule.id, { score: Number(e.target.value) })}
              className="w-full accent-risk-high"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesPanel;
