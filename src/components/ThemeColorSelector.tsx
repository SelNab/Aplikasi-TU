import React from 'react';
import { ThemeColor } from '../types';
import { THEMES, getThemeConfig } from '../utils/themeHelper';
import { Palette, Check, Sparkles } from 'lucide-react';

interface ThemeColorSelectorProps {
  currentColor?: ThemeColor;
  onSelectColor: (color: ThemeColor) => void;
  notifyMessage?: (msg: string) => void;
}

export const ThemeColorSelector: React.FC<ThemeColorSelectorProps> = ({
  currentColor = 'emerald',
  onSelectColor,
  notifyMessage
}) => {
  const activeTheme = getThemeConfig(currentColor);

  const themeList = Object.values(THEMES);

  const handleSelect = (id: ThemeColor) => {
    onSelectColor(id);
    if (notifyMessage) {
      notifyMessage(`Warna Aplikasi Diubah ke: ${THEMES[id].name}`);
    }
  };

  return (
    <div id="theme-color-selector" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
              Pengaturan Tema Warna Aplikasi
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                8 Nuansa Khas
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih warna nuansa aplikasi sesuai selera, kenyamanan mata saat mencetak, atau identitas seragam sekolah
            </p>
          </div>
        </div>

        {/* Current Active Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
            style={{ backgroundColor: activeTheme.primaryHex }}
          />
          <span className="font-bold text-slate-800">
            {activeTheme.name}
          </span>
          <span className="text-[10px] text-slate-500">(Aktif)</span>
        </div>
      </div>

      {/* Theme Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
        {themeList.map((t) => {
          const isSelected = currentColor === t.id;
          return (
            <button
              key={t.id}
              type="button"
              id={`theme-btn-${t.id}`}
              onClick={() => handleSelect(t.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full shadow-xs border border-white flex-shrink-0"
                      style={{ backgroundColor: t.primaryHex }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-xs border border-white flex-shrink-0 -ml-1"
                      style={{ backgroundColor: t.accentHex }}
                    />
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {t.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="p-0.5 rounded-full bg-emerald-700 text-white flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-[10.5px] text-slate-600 leading-snug">
                  {t.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Contoh:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: t.primaryHex }}
                  >
                    Tombol
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                    style={{
                      borderColor: t.accentHex,
                      color: t.primaryHex,
                      backgroundColor: '#ffffff'
                    }}
                  >
                    Label
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
