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
  Check,
  Zap,
  MousePointer,
  SunMedium,
  Compass,
  FileCode
} from 'lucide-react';
import {
  THEME_PRESETS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  BUTTON_SHADOW_OPTIONS,
  BUTTON_HOVER_OPTIONS,
  QUICK_COLOR_PALETTES,
  PRESET_BACKGROUND_IMAGES
} from '../constants';
import { uploadBackgroundImage } from '../firebase';
import { applyCustomFont } from '../utils/fontLoader';

export function DesignEditor({ styling, setStyling, uid = '' }) {
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgUploadError, setBgUploadError] = useState('');
  const [fontUploadError, setFontUploadError] = useState('');
  const [fontSuccess, setFontSuccess] = useState('');

  const bgFileInputRef = useRef(null);
  const fontFileInputRef = useRef(null);

  const applyPreset = (preset) => {
    setStyling((prev) => ({
      ...prev,
      ...preset.styling
    }));
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

  // Custom Font Upload Handler
  const handleFontFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFontUploadError('');
    setFontSuccess('');

    // Validate font file extension
    const validExtensions = ['.woff2', '.woff', '.ttf', '.otf'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setFontUploadError('Bitte eine gültige Schriftart-Datei auswählen (.woff2, .woff, .ttf, .otf)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFontUploadError('Die Schriftart darf maximal 8 MB groß sein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rawFamily = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
        const customFontObj = {
          name: file.name.replace(/\.[^/.]+$/, ""),
          family: `CustomFont_${rawFamily}_${Date.now().toString().slice(-4)}`,
          dataUrl: reader.result
        };

        // Apply immediately
        applyCustomFont(customFontObj);

        setStyling((prev) => ({
          ...prev,
          customFont: customFontObj,
          font: 'custom'
        }));

        setFontSuccess(`Schriftart "${customFontObj.name}" erfolgreich geladen!`);
        setTimeout(() => setFontSuccess(''), 4000);
      } catch (err) {
        setFontUploadError('Schriftart konnte nicht verarbeitet werden.');
      }
    };

    reader.onerror = () => {
      setFontUploadError('Fehler beim Lesen der Schriftart-Datei.');
    };

    reader.readAsDataURL(file);
    if (fontFileInputRef.current) fontFileInputRef.current.value = '';
  };

  const handleRemoveCustomFont = () => {
    setStyling((prev) => ({
      ...prev,
      customFont: null,
      font: 'Inter'
    }));
    setFontSuccess('');
    setFontUploadError('');
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
        {/* 1. Curated Theme Presets */}
        <div className="form-group">
          <div className="label-with-hint">
            <label className="label-with-icon">
              <Sparkles size={14} className="text-amber-400" />
              <span>Design-Vorlagen</span>
            </label>
            <span className="text-muted text-xs">1-Klick Theme Wechsel</span>
          </div>

          <div className="presets-grid" id="theme-presets-list">
            {THEME_PRESETS.map((preset) => {
              const isSelected =
                styling.background === preset.styling.background &&
                styling.button === preset.styling.button &&
                styling.font === preset.styling.font;

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-card-pro ${isSelected ? 'active-preset-glow' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  <div
                    className="preset-preview-canvas"
                    style={{
                      background:
                        preset.styling.backgroundType === 'gradient'
                          ? `linear-gradient(${preset.styling.gradientAngle || 180}deg, ${preset.styling.gradientStart}, ${preset.styling.gradientEnd})`
                          : preset.styling.background
                    }}
                  >
                    <div
                      className="preset-mini-btn"
                      style={{
                        background: preset.styling.button,
                        color: preset.styling.buttonText,
                        border: `1px solid ${preset.styling.buttonBorder || 'transparent'}`,
                        borderRadius: `${preset.styling.radius || 8}px`
                      }}
                    >
                      <span>Aa</span>
                    </div>

                    {isSelected && (
                      <div className="preset-selected-badge">
                        <Check size={11} />
                      </div>
                    )}
                  </div>

                  <div className="preset-meta-info">
                    <span className="preset-meta-title">{preset.name}</span>
                    <span className="preset-meta-desc">{preset.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Background Mode Selector */}
        <div className="form-group mt-5">
          <label>Hintergrund-Modus</label>
          <div className="segmented-control-pro">
            <button
              type="button"
              className={`segment-btn-pro ${backgroundType === 'color' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'color')}
            >
              <span>Farbe</span>
            </button>
            <button
              type="button"
              className={`segment-btn-pro ${backgroundType === 'gradient' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'gradient')}
            >
              <span>Farbverlauf</span>
            </button>
            <button
              type="button"
              className={`segment-btn-pro ${backgroundType === 'image' ? 'active' : ''}`}
              onClick={() => updateField('backgroundType', 'image')}
            >
              <span>Hintergrundbild</span>
            </button>
          </div>
        </div>

        {/* 2.1 Solid Color Mode */}
        {backgroundType === 'color' && (
          <div className="bg-mode-container">
            <div className="form-group">
              <label>Hintergrundfarbe</label>
              <div className="color-picker-row-pro">
                <div className="color-preview-circle" style={{ backgroundColor: styling.background || '#090a0f' }}>
                  <input
                    type="color"
                    className="color-native-trigger"
                    value={styling.background || '#090a0f'}
                    onChange={(e) => updateField('background', e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="form-input color-hex-input font-mono"
                  value={styling.background || '#090a0f'}
                  onChange={(e) => updateField('background', e.target.value)}
                />
              </div>

              {/* Quick Color Swatches */}
              <div className="quick-swatches-row">
                {QUICK_COLOR_PALETTES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`quick-color-dot ${styling.background === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateField('background', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2.2 Gradient Mode */}
        {backgroundType === 'gradient' && (
          <div className="bg-mode-container">
            <div className="gradient-controls-grid-pro">
              <div className="form-group">
                <label>Verlauf Start</label>
                <div className="color-picker-row-pro">
                  <div className="color-preview-circle" style={{ backgroundColor: styling.gradientStart || '#090a0f' }}>
                    <input
                      type="color"
                      className="color-native-trigger"
                      value={styling.gradientStart || '#090a0f'}
                      onChange={(e) => updateField('gradientStart', e.target.value)}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input color-hex-input font-mono"
                    value={styling.gradientStart || '#090a0f'}
                    onChange={(e) => updateField('gradientStart', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Verlauf Ende</label>
                <div className="color-picker-row-pro">
                  <div className="color-preview-circle" style={{ backgroundColor: styling.gradientEnd || '#1e1b4b' }}>
                    <input
                      type="color"
                      className="color-native-trigger"
                      value={styling.gradientEnd || '#1e1b4b'}
                      onChange={(e) => updateField('gradientEnd', e.target.value)}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input color-hex-input font-mono"
                    value={styling.gradientEnd || '#1e1b4b'}
                    onChange={(e) => updateField('gradientEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group span-full">
                <div className="label-with-hint">
                  <label className="flex items-center gap-1.5">
                    <Compass size={14} className="text-blue-400" />
                    <span>Winkel & Richtung</span>
                  </label>
                  <span className="text-accent text-xs font-mono font-medium">{styling.gradientAngle || 180}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  className="form-range-pro"
                  value={styling.gradientAngle || 180}
                  onChange={(e) => updateField('gradientAngle', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2.3 Background Image Mode */}
        {backgroundType === 'image' && (
          <div className="bg-mode-container">
            {/* Curated Presets */}
            <div className="form-group">
              <div className="label-with-hint">
                <label>Vorgefertigte HD-Hintergründe</label>
                <span className="text-muted text-xs">1-Klick Auswahl</span>
              </div>
              <div className="bg-preset-grid">
                {PRESET_BACKGROUND_IMAGES.map((preset) => {
                  const isSelected = styling.backgroundImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`bg-preset-card-pro ${isSelected ? 'is-selected' : ''}`}
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
                placeholder="https://images.unsplash.com/..."
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
                className="form-range-pro"
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
                className="form-range-pro"
                value={styling.backgroundBlur ?? 0}
                onChange={(e) => updateField('backgroundBlur', Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* 3. Button & Link Styling */}
        <div className="section-divider-pro">
          <span>Buttons & Links</span>
        </div>

        <div className="grid-2-cols">
          <div className="form-group">
            <label>Button Hintergrund</label>
            <div className="color-picker-row-pro">
              <div className="color-preview-circle" style={{ backgroundColor: styling.button || '#ffffff' }}>
                <input
                  type="color"
                  className="color-native-trigger"
                  value={styling.button || '#ffffff'}
                  onChange={(e) => updateField('button', e.target.value)}
                />
              </div>
              <input
                type="text"
                className="form-input color-hex-input font-mono"
                value={styling.button || '#ffffff'}
                onChange={(e) => updateField('button', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Button Textfarbe</label>
            <div className="color-picker-row-pro">
              <div className="color-preview-circle" style={{ backgroundColor: styling.buttonText || '#000000' }}>
                <input
                  type="color"
                  className="color-native-trigger"
                  value={styling.buttonText || '#000000'}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                />
              </div>
              <input
                type="text"
                className="form-input color-hex-input font-mono"
                value={styling.buttonText || '#000000'}
                onChange={(e) => updateField('buttonText', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Button Style (Solid, Outline, Glass, Soft) */}
        <div className="form-group">
          <label>Button-Stil</label>
          <div className="button-styles-grid">
            {BUTTON_STYLE_OPTIONS.map((styleOpt) => {
              const isSelected = (styling.buttonStyle || 'solid') === styleOpt.id;
              return (
                <button
                  key={styleOpt.id}
                  type="button"
                  className={`btn-style-card ${isSelected ? 'active' : ''}`}
                  onClick={() => updateField('buttonStyle', styleOpt.id)}
                >
                  <span className="btn-style-title">{styleOpt.label}</span>
                  <span className="btn-style-desc">{styleOpt.desc}</span>
                </button>
              );
            })}
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

        {/* Button Shadow / Glow & Hover Effect */}
        <div className="grid-2-cols">
          <div className="form-group">
            <label className="flex items-center gap-1.5">
              <SunMedium size={14} className="text-amber-400" />
              <span>Schatten & Tiefe</span>
            </label>
            <select
              className="form-select-pro"
              value={styling.buttonShadow || 'subtle'}
              onChange={(e) => updateField('buttonShadow', e.target.value)}
            >
              {BUTTON_SHADOW_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-1.5">
              <MousePointer size={14} className="text-blue-400" />
              <span>Hover-Animation</span>
            </label>
            <select
              className="form-select-pro"
              value={styling.buttonHover || 'scale'}
              onChange={(e) => updateField('buttonHover', e.target.value)}
            >
              {BUTTON_HOVER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Typography & Custom Font Upload */}
        <div className="section-divider-pro">
          <span>Typografie & Schriftarten</span>
        </div>

        {/* Custom Font Upload Area */}
        <div className="custom-font-upload-card" id="custom-font-upload-box">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-slate-200 text-sm">
                <FileCode size={16} className="text-indigo-400" />
                <span>Eigene Schriftart hochladen</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unterstützt .woff2, .woff, .ttf, .otf Dateien von deinem Computer.
              </p>
            </div>

            <input
              type="file"
              ref={fontFileInputRef}
              onChange={handleFontFileUpload}
              accept=".woff2,.woff,.ttf,.otf"
              style={{ display: 'none' }}
              id="font-file-input"
            />

            <button
              type="button"
              className="btn btn-secondary btn-sm shrink-0"
              id="btn-upload-custom-font"
              onClick={() => fontFileInputRef.current?.click()}
            >
              <Upload size={14} />
              <span>Schriftart wählen</span>
            </button>
          </div>

          {/* Active Custom Font Badge */}
          {styling.customFont && (
            <div className="active-custom-font-badge mt-3">
              <div className="flex items-center gap-2">
                <div className="custom-font-pill-tag">Aktiv</div>
                <span className="font-medium text-xs text-slate-200">
                  {styling.customFont.name}
                </span>
              </div>
              <button
                type="button"
                className="btn-remove-custom-font"
                onClick={handleRemoveCustomFont}
                title="Eigene Schriftart entfernen"
              >
                <Trash2 size={13} />
                <span>Entfernen</span>
              </button>
            </div>
          )}

          {fontSuccess && <p className="text-xs text-emerald-400 mt-2 font-medium">{fontSuccess}</p>}
          {fontUploadError && <p className="text-xs text-rose-400 mt-2">{fontUploadError}</p>}
        </div>

        {/* Preset Google Fonts List */}
        <div className="form-group mt-4">
          <label>Oder aus kuratierten Schriftarten wählen</label>
          <div className="font-options-grid-pro">
            {FONT_OPTIONS.map((font) => {
              const isSelected = !styling.customFont && (styling.font || 'Inter') === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  className={`font-select-card-pro ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    if (styling.customFont) {
                      setStyling(prev => ({ ...prev, customFont: null, font: font.id }));
                    } else {
                      updateField('font', font.id);
                    }
                  }}
                >
                  <div className="font-card-top">
                    <span className="font-sample-pro" style={{ fontFamily: font.family }}>
                      Aa
                    </span>
                    {isSelected && (
                      <div className="font-check-badge">
                        <Check size={11} />
                      </div>
                    )}
                  </div>
                  <div className="font-card-info">
                    <span className="font-title-pro" style={{ fontFamily: font.family }}>
                      {font.name}
                    </span>
                    <span className="font-sub-pro">{font.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
