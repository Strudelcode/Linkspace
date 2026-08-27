import React, { useRef, useState } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  Type,
  Square,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  Layers,
  Eye,
  Check
} from 'lucide-react';
import { THEME_PRESETS, FONT_OPTIONS, RADIUS_OPTIONS, PRESET_BACKGROUND_IMAGES } from '../constants';
import { uploadBackgroundImage } from '../firebase';

export function DesignEditor({ styling, setStyling, uid = '' }) {
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgUploadError, setBgUploadError] = useState('');
  const bgFileInputRef = useRef(null);

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

  const handleBgFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBgUploadError('');
    setUploadingBg(true);

    try {
      const url = await uploadBackgroundImage(file, uid || 'anonymous');
      setStyling((prev) => ({
        ...prev,
        backgroundType: 'image',
        backgroundImage: url
      }));
    } catch (err) {
      setBgUploadError(err.message || 'Fehler beim Hochladen des Hintergrundbilds.');
    } finally {
      setUploadingBg(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const handleSelectPresetImage = (preset) => {
    setStyling((prev) => ({
      ...prev,
      backgroundType: 'image',
      backgroundImage: preset.url
    }));
  };

  const handleRemoveBgImage = () => {
    setStyling((prev) => ({
      ...prev,
      backgroundImage: '',
      backgroundType: 'color'
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
        {/* Preset Themes */}
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

        {/* Background Mode Selector */}
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

        {/* 1. Solid Color Mode */}
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

        {/* 2. Gradient Mode */}
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

        {/* 3. Background Image Mode */}
        {backgroundType === 'image' && (
          <div className="bg-image-section">
            {/* Curated Presets */}
            <div className="form-group">
              <div className="label-with-hint">
                <label>Vorgefertigte Hintergrundbilder</label>
                <span className="text-muted text-xs">1-Klick Auswahl</span>
              </div>
              <div className="bg-preset-grid">
                {PRESET_BACKGROUND_IMAGES.map((preset) => {
                  const isSelected = styling.backgroundImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`bg-preset-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectPresetImage(preset)}
                      title={preset.name}
                    >
                      <img src={preset.thumb} alt={preset.name} className="bg-preset-thumb" />
                      <span className="bg-preset-label">{preset.name}</span>
                      {isSelected && (
                        <div className="bg-preset-check">
                          <Check size={11} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom File Upload & URL */}
            <div className="form-group">
              <label>Eigenes Hintergrundbild hochladen</label>
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={handleBgFileUpload}
                accept="image/png, image/jpeg, image/webp, image/gif"
                style={{ display: 'none' }}
                id="bg-file-input"
              />

              <div className="bg-upload-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  id="btn-upload-bg-image"
                  onClick={() => bgFileInputRef.current?.click()}
                  disabled={uploadingBg}
                >
                  {uploadingBg ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Wird hochgeladen …</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Bild vom Gerät wählen</span>
                    </>
                  )}
                </button>

                {styling.backgroundImage && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={handleRemoveBgImage}
                    title="Hintergrundbild entfernen"
                  >
                    <Trash2 size={14} />
                    <span>Entfernen</span>
                  </button>
                )}
              </div>
              {bgUploadError && <p className="form-error-msg">{bgUploadError}</p>}
            </div>

            {/* Direct URL */}
            <div className="form-group">
              <label>Oder direkte Bild-URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={styling.backgroundImage || ''}
                onChange={(e) => updateField('backgroundImage', e.target.value)}
              />
            </div>

            {/* Background Effects: Overlay / Darkness and Blur */}
            <div className="form-group">
              <div className="label-with-hint">
                <label>Hintergrund-Abdunkelung (Overlay)</label>
                <span className="text-muted text-xs">{styling.backgroundOverlay ?? 35}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="5"
                className="form-range"
                value={styling.backgroundOverlay ?? 35}
                onChange={(e) => updateField('backgroundOverlay', Number(e.target.value))}
              />
              <span className="text-muted text-xs">
                Sorgt für optimale Lesbarkeit von Profiltext und Buttons über Fotos.
              </span>
            </div>

            <div className="form-group">
              <div className="label-with-hint">
                <label>Hintergrund-Unschärfe (Blur)</label>
                <span className="text-muted text-xs">{styling.backgroundBlur ?? 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                className="form-range"
                value={styling.backgroundBlur ?? 0}
                onChange={(e) => updateField('backgroundBlur', Number(e.target.value))}
              />
            </div>
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
