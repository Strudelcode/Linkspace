import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Sparkles, ExternalLink, Globe, Sliders } from 'lucide-react';
import { Logo } from './Logo';

export function QrCodeModal({ username, displayName, avatarUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const [customOrigin, setCustomOrigin] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'https://linkspace.dev'
  );
  const [showDomainConfig, setShowDomainConfig] = useState(false);
  const canvasRef = useRef(null);

  const cleanBase = customOrigin.replace(/\/+$/, '');
  const profileUrl = cleanBase.includes('#') ? `${cleanBase}/${username}` : `${cleanBase}/#/${username}`;

  useEffect(() => {
    if (!username) return;

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        profileUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#090a0f',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [username, profileUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `linkspace-${username}-qr.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content qr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <h3 className="text-base font-semibold text-slate-100">QR-Code für @{username}</h3>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-box-wrapper">
            <canvas ref={canvasRef} className="qr-canvas" />
          </div>

          <div className="qr-profile-info">
            <h4 className="font-semibold text-sm text-slate-100">{displayName || username}</h4>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs text-indigo-400 font-mono break-all">{profileUrl}</span>
            </div>
          </div>

          {/* Domain configuration toggle */}
          <div className="w-full mt-2 flex justify-center">
            <button
              type="button"
              className="btn-domain-toggle"
              onClick={() => setShowDomainConfig(!showDomainConfig)}
            >
              <Globe size={13} className="text-indigo-400" />
              <span>{showDomainConfig ? 'Domain-Optionen verbergen' : 'Domain oder Host anpassen'}</span>
            </button>
          </div>

          {showDomainConfig && (
            <div className="w-full mt-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-left">
              <label className="text-xs text-slate-400 block mb-1">Ziel-Domain für QR-Code:</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-input text-xs font-mono py-1.5"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                  placeholder="https://strudelcode.github.io"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-xs py-1"
                  onClick={() => setCustomOrigin(window.location.origin)}
                  title="Auf aktuelle Browser-Domain zurücksetzen"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center mb-1">
                <span className="text-[11px] text-slate-400">Schnellauswahl:</span>
                <button
                  type="button"
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono transition-colors"
                  onClick={() => setCustomOrigin('https://strudelcode.github.io')}
                >
                  strudelcode.github.io
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  onClick={() => setCustomOrigin(window.location.origin)}
                >
                  Aktueller Host
                </button>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Der QR-Code und Link passen sich in Echtzeit an die angegebene Domain an.
              </span>
            </div>
          )}

          <div className="qr-actions-grid mt-4">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopy}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPng}
            >
              <Download size={14} />
              <span>QR als Bild (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
