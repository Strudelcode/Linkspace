import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Smile,
  Edit2
} from 'lucide-react';
import { LinkIcon, detectIconFromUrl } from './LinkIcon';
import { IconPickerModal } from './IconPickerModal';

export function LinksEditor({
  links,
  setLinks,
  userAvatarUrl = '',
  userDisplayName = '',
  uid = ''
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingIconLinkId, setEditingIconLinkId] = useState(null);

  const activeModalLink = links.find((l) => l.id === editingIconLinkId);

  const addLink = () => {
    const newId = 'link_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newLink = {
      id: newId,
      title: 'Neuer Link',
      url: 'https://',
      active: true,
      iconType: 'standard',
      icon: 'globe'
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id, field, value) => {
    setLinks(
      links.map((link) => {
        if (link.id !== id) return link;

        const updated = { ...link, [field]: value };

        // If user changed URL and hasn't explicitly set a custom/avatar icon or specific icon,
        // auto-detect matching standard platform icon!
        if (field === 'url') {
          if (!link.iconType || link.iconType === 'standard') {
            const detected = detectIconFromUrl(value);
            if (detected) {
              updated.icon = detected;
            }
          }
        }

        return updated;
      })
    );
  };

  const handleUrlBlur = (id, currentUrl) => {
    const trimmed = currentUrl.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
      updateLink(id, 'url', 'https://' + trimmed);
    }
  };

  const handleSelectIconForLink = (iconConfig) => {
    if (!editingIconLinkId) return;
    setLinks(
      links.map((l) => (l.id === editingIconLinkId ? { ...l, ...iconConfig } : l))
    );
  };

  const removeLink = (id) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const toggleLinkActive = (id) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, active: l.active === false ? true : false } : l))
    );
  };

  const moveLink = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= links.length) return;
    const updated = [...links];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setLinks(updated);
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    moveLink(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="panel" id="panel-links-editor">
      <div className="panel-header">
        <div className="panel-title-group">
          <Link2 size={18} className="panel-icon" />
          <h3>Links ({links.length})</h3>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          id="btn-add-new-link"
          onClick={addLink}
        >
          <Plus size={15} />
          <span>Link hinzufügen</span>
        </button>
      </div>

      <div className="panel-body">
        {links.length === 0 ? (
          <div className="empty-links-state" id="empty-links-placeholder">
            <Link2 size={32} className="text-muted" />
            <p>Noch keine Links vorhanden.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addLink}
            >
              Ersten Link erstellen
            </button>
          </div>
        ) : (
          <div className="links-list" id="links-sortable-container">
            {links.map((link, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;
              const isValidUrl =
                !link.url ||
                link.url === 'https://' ||
                /^https?:\/\/.+\..+/i.test(link.url) ||
                /^mailto:.+/i.test(link.url);

              return (
                <div
                  key={link.id}
                  id={`link-item-${link.id}`}
                  className={`link-card ${isDragging ? 'is-dragging' : ''} ${
                    isOver ? 'is-drag-over' : ''
                  } ${link.active === false ? 'is-disabled' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag Handle */}
                  <div
                    className="drag-handle"
                    title="Gedrückt halten zum Verschieben"
                    aria-label="Reihenfolge ändern"
                  >
                    <GripVertical size={16} />
                  </div>

                  {/* Icon Selector Button */}
                  <button
                    type="button"
                    className="link-icon-picker-btn"
                    title="Icon oder Bild für diesen Link anpassen"
                    onClick={() => setEditingIconLinkId(link.id)}
                    id={`btn-edit-icon-${link.id}`}
                  >
                    <div className="link-icon-badge">
                      <LinkIcon
                        link={link}
                        userAvatarUrl={userAvatarUrl}
                        userDisplayName={userDisplayName}
                        size={16}
                      />
                    </div>
                    <span className="icon-edit-pencil">
                      <Edit2 size={9} />
                    </span>
                  </button>

                  {/* Link Details Fields */}
                  <div className="link-content-fields">
                    <div className="form-group-compact">
                      <input
                        type="text"
                        className="form-input form-input-title"
                        placeholder="Link Titel"
                        value={link.title}
                        onChange={(e) =>
                          updateLink(link.id, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group-compact">
                      <div className="url-input-wrapper">
                        <input
                          type="text"
                          className={`form-input form-input-url ${
                            !isValidUrl ? 'input-warning' : ''
                          }`}
                          placeholder="https://deine-webseite.de"
                          value={link.url}
                          onChange={(e) =>
                            updateLink(link.id, 'url', e.target.value)
                          }
                          onBlur={(e) => handleUrlBlur(link.id, e.target.value)}
                        />
                        {link.url && link.url !== 'https://' && isValidUrl && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="url-test-link"
                            title="Link im neuen Tab testen"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      {!isValidUrl && (
                        <span className="url-warning-hint">
                          <AlertCircle size={12} /> Bitte gültige URL eingeben (z.B. https://example.com)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="link-actions-group">
                    <div className="order-steppers">
                      <button
                        type="button"
                        className="btn-stepper"
                        disabled={index === 0}
                        onClick={() => moveLink(index, index - 1)}
                        title="Nach oben verschieben"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-stepper"
                        disabled={index === links.length - 1}
                        onClick={() => moveLink(index, index + 1)}
                        title="Nach unten verschieben"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`btn-icon-toggle ${
                        link.active !== false ? 'active' : 'inactive'
                      }`}
                      onClick={() => toggleLinkActive(link.id)}
                      title={
                        link.active !== false ? 'Link aktiv' : 'Link ausgeblendet'
                      }
                    >
                      {link.active !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => removeLink(link.id)}
                      title="Link löschen"
                      id={`btn-delete-link-${link.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Icon Picker Dialog Modal */}
      {activeModalLink && (
        <IconPickerModal
          isOpen={!!activeModalLink}
          onClose={() => setEditingIconLinkId(null)}
          link={activeModalLink}
          onSelectIcon={handleSelectIconForLink}
          userAvatarUrl={userAvatarUrl}
          userDisplayName={userDisplayName}
          uid={uid}
        />
      )}
    </div>
  );
}
