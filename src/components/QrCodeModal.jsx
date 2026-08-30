import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check } from 'lucide-react';
import { Logo } from './Logo';
import { getPublicProfileUrl } from '../utils/urlHelper';

export function QrCodeModal({ username, displayName, onClose }) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const profileUrl = getPublicProfileUrl(username);

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

          <div className="qr-actions-grid mt-2">
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
