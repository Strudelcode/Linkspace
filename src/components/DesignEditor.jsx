import React from 'react';
import { Palette, Sparkles, Sliders, Type, Square, Image as ImageIcon } from 'lucide-react';
import { THEME_PRESETS, FONT_OPTIONS, RADIUS_OPTIONS } from '../constants';

export function DesignEditor({ styling, setStyling }) {
  const applyPreset = (preset) => {
    setStyling({
      ...preset.styling
    });
  };

  const updateField = (key, value) => {
    setStyling((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const backgroundType = styling.backgroundType || 'color';

  return (
    <div className="panel" id="panel-design-editor">
      <div className="panel-header">
        <div className="panel-title-group">
          <Palette size={18} className="panel-icon" />
          <h3>Design & Erscheinungsbild</h3>
        </div>
      </div>

      <div className="panel-body">
        {/* Preset Cards */}
        <div className="form-group">
          <label className="label-with-icon">
            <Sparkles size={14} />
            <span>Design-Vorlagen</span>
          </label>
          <div className="presets-grid" id="theme-presets-list">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="preset-card"
                onClick={() => applyPreset(preset)}
                style={{
                  background:
                    preset.styling.backgroundType === 'gradient'
                      ? `linear-gradient(${preset.styling.gradientAngle || 180}deg, ${preset.styling.gradientStart}, ${preset.styling.gradientEnd})`
                      : preset.styling.background
                }}
              >
                <div
                  className="preset-preview-btn"
                  style={{
                    background: preset.styling.button,
                    color: preset.styling.buttonText,
                    borderRadius: `${preset.styling.radius || 8}px`
                  }}
                >
                  Aa
                </div>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background Configuration */}
        <div className="form-group">
          <label>Hintergrund-Modus</label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${backgroundType === 'color' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'color')}
            >
              Farbe
            </button>
            <button
              type="button"
              className={`segment-btn ${backgroundType === 'gradient' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'gradient')}
            >
              Farbverlauf
            </button>
            <button
              type="button"
              className={`segment-btn ${backgroundType === 'image' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'image')}
            >
              Hintergrundbild
            </button>
          </div>
        </div>

        {backgroundType === 'color' && (
          <div className="form-group">
            <label>Hintergrundfarbe</label>
            <div className="color-picker-row">
              <input
                type="color"
                className="color-input"
                value={styling.background || '#090a0f'}
                onChange={(e) => updateField('background', e.target.value)}
              />
              <input
                type="text"
                className="form-input color-hex-text"
                value={styling.background || '#090a0f'}
                onChange={(e) => updateField('background', e.target.value)}
              />
            </div>
          </div>
        )}

        {backgroundType === 'gradient' && (
          <div className="gradient-controls-grid">
            <div className="form-group">
              <label>Verlauf Start</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  className="color-input"
                  value={styling.gradientStart || '#090a0f'}
                  onChange={(e) => updateField('gradientStart', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input color-hex-text"
                  value={styling.gradientStart || '#090a0f'}
                  onChange={(e) => updateField('gradientStart', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Verlauf Ende</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  className="color-input"
                  value={styling.gradientEnd || '#1e1b4b'}
                  onChange={(e) => updateField('gradientEnd', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input color-hex-text"
                  value={styling.gradientEnd || '#1e1b4b'}
                  onChange={(e) => updateField('gradientEnd', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group span-full">
              <div className="label-with-hint">
                <label>Winkel</label>
                <span className="text-muted text-xs">{styling.gradientAngle || 180}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                className="form-range"
                value={styling.gradientAngle || 180}
                onChange={(e) => updateField('gradientAngle', Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {backgroundType === 'image' && (
          <div className="form-group">
            <label>Hintergrundbild URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={styling.backgroundImage || ''}
              onChange={(e) => updateField('backgroundImage', e.target.value)}
            />
            <span className="text-muted text-xs">
              Gib eine direkte Bild-URL ein (z.B. von Unsplash).
            </span>
          </div>
        )}

        {/* Button Customization */}
        <div className="section-divider">
          <span>Buttons & Links</span>
        </div>

        <div className="grid-2-cols">
          <div className="form-group">
            <label>Button Hintergrund</label>
            <div className="color-picker-row">
              <input
                type="color"
                className="color-input"
                value={styling.button || '#ffffff'}
                onChange={(e) => updateField('button', e.target.value)}
              />
              <input
                type="text"
                className="form-input color-hex-text"
                value={styling.button || '#ffffff'}
                onChange={(e) => updateField('button', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Button Textfarbe</label>
            <div className="color-picker-row">
              <input
                type="color"
                className="color-input"
                value={styling.buttonText || '#000000'}
                onChange={(e) => updateField('buttonText', e.target.value)}
              />
              <input
                type="text"
                className="form-input color-hex-text"
                value={styling.buttonText || '#000000'}
                onChange={(e) => updateField('buttonText', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Button Corner Radius */}
        <div className="form-group">
          <label>Button Rundung (Radius)</label>
          <div className="radius-pills-row">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`radius-pill-btn ${
                  (styling.radius ?? 12) === opt.value ? 'active' : ''
                }`}
                onClick={() => updateField('radius', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography / Fonts */}
        <div className="section-divider">
          <span>Typografie</span>
        </div>

        <div className="form-group">
          <label>Schriftart</label>
          <div className="font-options-grid">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={`font-select-card ${
                  (styling.font || 'Inter') === font.id ? 'active' : ''
                }`}
                style={{ fontFamily: font.family }}
                onClick={() => updateField('font', font.id)}
              >
                <span className="font-sample">Aa</span>
                <span className="font-title">{font.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
