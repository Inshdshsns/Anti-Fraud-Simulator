import React from 'react';
import { Shield, Activity, CheckCircle, AlertTriangle, XCircle, Languages } from 'lucide-react';

const Header = ({ stats, onToggleSettings, onExport, onImport, language, onToggleLanguage }) => {
  return (
    <header className="h-20 bg-dark-surface/80 backdrop-blur border-b border-dark-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Логотип с пастельным оранжевым цветом */}
          <div className="w-10 h-10 rounded-xl bg-[#ff7f50] flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-text">
              {language === 'ru' ? 'Анти-Фрод Симулятор' : 'Anti-Fraud Simulator'}
            </h1>
            <p className="text-xs text-dark-text-muted">
              {language === 'ru'
                ? 'Обучающая система обнаружения мошенничества'
                : 'Educational fraud detection system'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Статистика */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-soft-bg rounded-lg border border-emerald-soft/30">
            <CheckCircle size={16} className="text-emerald-soft" />
            <span className="text-sm text-emerald-soft font-medium">{stats.approve}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-soft-bg rounded-lg border border-amber-soft/30">
            <AlertTriangle size={16} className="text-amber-soft" />
            <span className="text-sm text-amber-soft font-medium">{stats.review}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-risk-high-bg rounded-lg border border-risk-high/30">
            <XCircle size={16} className="text-risk-high" />
            <span className="text-sm text-risk-high font-medium">{stats.decline}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-accent rounded-lg">
            <Activity size={16} className="text-dark-text-muted" />
            <span className="text-sm text-dark-text font-medium">{stats.total}</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-dark-accent hover:bg-dark-accent-hover rounded-lg text-dark-text transition-all"
            title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Languages size={16} />
            {language === 'ru' ? 'RU' : 'EN'}
          </button>
          <button
            onClick={onToggleSettings}
            className="px-3 py-1.5 text-sm bg-[#ff7f50]/20 hover:bg-[#ff7f50]/30 rounded-lg text-[#ff7f50] transition-all"
          >
            {language === 'ru' ? 'Настройки' : 'Settings'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
