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
  const [dropTarget, setDropTarget] = useState(null); // { index: number, position: 'top' | 'bottom' }
  const [canDragId, setCanDragId] = useState(null);
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
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null) return;

    if (draggedIndex === index) {
      setDropTarget(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTop = e.clientY < midY;

    setDropTarget({ index, position: isTop ? 'top' : 'bottom' });
  };

  const handleDragLeave = (e) => {
    // Only reset if we left the list item boundary entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget((prev) => (prev?.index === draggedIndex ? null : prev));
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTop = e.clientY < midY;

    let targetIndex = index;
    if (!isTop) {
      targetIndex = index + 1;
    }

    // Adjust targetIndex if dragged from before target
    if (draggedIndex < targetIndex) {
      targetIndex -= 1;
    }

    if (draggedIndex !== targetIndex) {
      const updated = [...links];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      setLinks(updated);
    }

    setDraggedIndex(null);
    setDropTarget(null);
    setCanDragId(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTarget(null);
    setCanDragId(null);
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
          <div
            className="links-list"
            id="links-sortable-container"
            onDragLeave={() => setDropTarget(null)}
          >
            {links.map((link, index) => {
              const isDragging = draggedIndex === index;
              const isDropTop = dropTarget?.index === index && dropTarget?.position === 'top';
              const isDropBottom = dropTarget?.index === index && dropTarget?.position === 'bottom';
              const isDraggable = canDragId === link.id;

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
                    isDropTop ? 'drop-target-top' : ''
                  } ${isDropBottom ? 'drop-target-bottom' : ''} ${
                    link.active === false ? 'is-disabled' : ''
                  }`}
                  draggable={isDraggable}
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
                    onMouseDown={() => setCanDragId(link.id)}
                    onMouseUp={() => setCanDragId(null)}
                    onTouchStart={() => setCanDragId(link.id)}
                    onTouchEnd={() => setCanDragId(null)}
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
                    onMouseDown={(e) => e.stopPropagation()}
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
                  <div
                    className="link-content-fields"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="form-group-compact">
                      <input
                        type="text"
                        className="form-input form-input-title"
                        placeholder="Link Titel"
                        value={link.title}
                        draggable={false}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
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
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
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
                            onMouseDown={(e) => e.stopPropagation()}
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
                  <div
                    className="link-actions-group"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
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
