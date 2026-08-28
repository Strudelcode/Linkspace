import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  subscribeToAuth,
  logoutUser,
  getUserProfile,
  saveUserProfileTransaction
} from './firebase';
import { DEFAULT_PROFILE, DISCORD_SUPPORT_URL } from './constants';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { SaveGuestModal } from './components/SaveGuestModal';
import { ProfileEditor } from './components/ProfileEditor';
import { LinksEditor } from './components/LinksEditor';
import { DesignEditor } from './components/DesignEditor';
import { PhonePreview } from './components/PhonePreview';
import { PublicProfile } from './pages/PublicProfile';
import { Smartphone, Edit3, Loader2, MessageSquare, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { getAppBasename } from './utils/urlHelper';
import './styles.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Profile data states
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [initialUsername, setInitialUsername] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showGuestSaveModal, setShowGuestSaveModal] = useState(false);

  // Mobile tab switch (editor vs live preview)
  const [mobileTab, setMobileTab] = useState('editor');

  // Track auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        setProfileLoading(true);
        try {
          const remoteProfile = await getUserProfile(currentUser.uid);
          if (remoteProfile) {
            setProfile({
              ...DEFAULT_PROFILE,
              ...remoteProfile,
              links: remoteProfile.links || DEFAULT_PROFILE.links,
              styling: { ...DEFAULT_PROFILE.styling, ...(remoteProfile.styling || {}) }
            });
            setInitialUsername(remoteProfile.username || '');
          } else {
            // First time setup: seed with user's info
            const generatedUsername = (currentUser.displayName || currentUser.email?.split('@')[0] || 'creator')
              .toLowerCase()
              .replace(/[^a-z0-9_.-]/g, '')
              .slice(0, 20);

            const initial = {
              ...DEFAULT_PROFILE,
              displayName: currentUser.displayName || 'Mein Name',
              username: generatedUsername || 'creator',
              avatarUrl: currentUser.photoURL || ''
            };
            setProfile(initial);
            setInitialUsername('');
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        } finally {
          setProfileLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const executeSave = async (targetUid = user?.uid) => {
    if (!targetUid) return;
    setIsSaving(true);
    setSaveError('');

    try {
      const savedUsername = await saveUserProfileTransaction(
        targetUid,
        profile,
        initialUsername
      );
      setInitialUsername(savedUsername);
      setIsSaved(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error("Save error:", err);
      setSaveError(err.message || 'Fehler beim Speichern.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    // In a guest account, clicking save prompts to secure/create a permanent account
    if (user && (user.isGuest || user.isAnonymous || user.uid?.startsWith('guest_'))) {
      setShowGuestSaveModal(true);
      return;
    }
    executeSave();
  };

  const handleAuthenticatedAndSave = async (authenticatedUser) => {
    setUser(authenticatedUser);
    await executeSave(authenticatedUser.uid);
  };

  const handleLinksChange = (newLinks) => {
    setProfile((prev) => ({ ...prev, links: newLinks }));
    setHasUnsavedChanges(true);
  };

  const handleStylingChange = (newStyling) => {
    setProfile((prev) => ({
      ...prev,
      styling: typeof newStyling === 'function' ? newStyling(prev.styling) : newStyling
    }));
    setHasUnsavedChanges(true);
  };

  const handleProfileStateChange = (updater) => {
    setProfile(updater);
    setHasUnsavedChanges(true);
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="center-loader" id="app-loading-spinner">
        <Loader2 size={32} className="spin text-primary" />
        <span className="text-muted text-sm mt-3">Linkspace wird initialisiert …</span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal onAuthSuccess={() => {}} />;
  }

  return (
    <div className="app-layout" id="dashboard-app-root">
      <Header
        profile={profile}
        isSaving={isSaving}
        isSaved={isSaved}
        saveError={saveError}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveClick}
        user={user}
        onLogout={logoutUser}
      />

      {/* Mobile Tab Switcher */}
      <div className="mobile-tab-bar" id="mobile-tab-switch">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <Edit3 size={15} />
          <span>Editor</span>
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          <Smartphone size={15} />
          <span>Vorschau</span>
        </button>
      </div>

      <main className="dashboard-grid" id="main-workspace-grid">
        {/* Editor Column */}
        <section
          className={`editor-column ${mobileTab === 'editor' ? 'mobile-visible' : 'mobile-hidden'}`}
          id="editor-panels-section"
        >
          <ProfileEditor
            profile={profile}
            setProfile={handleProfileStateChange}
            uid={user.uid}
            initialUsername={initialUsername}
          />

          <LinksEditor
            links={profile.links || []}
            setLinks={handleLinksChange}
            userAvatarUrl={profile.avatarUrl}
            userDisplayName={profile.displayName}
            uid={user.uid}
          />

          <DesignEditor
            styling={profile.styling || DEFAULT_PROFILE.styling}
            setStyling={handleStylingChange}
            uid={user.uid}
          />

          {/* Discord Community Support Card */}
          <div className="discord-support-card" id="discord-support-banner">
            <div className="discord-support-inner">
              <div className="discord-icon-badge">
                <MessageSquare size={20} className="text-indigo-400" />
              </div>
              <div className="discord-support-content">
                <h4>Brauchst du Hilfe oder hast Feedback?</h4>
                <p>
                  Tritt unserem offiziellen Discord Server bei für schnellen Support, Feature-Wünsche und Updates.
                </p>
              </div>
              <a
                href={DISCORD_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-discord"
                id="btn-join-discord"
              >
                <span>Discord beitreten</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Live Smartphone Preview Column */}
        <section
          className={`preview-column ${mobileTab === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`}
          id="preview-sticky-section"
        >
          <PhonePreview profile={profile} />
        </section>
      </main>

      {/* Guest Save / Account Protection Modal */}
      {showGuestSaveModal && (
        <SaveGuestModal
          profile={profile}
          onAuthenticatedAndSave={handleAuthenticatedAndSave}
          onClose={() => setShowGuestSaveModal(false)}
        />
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Linkspace App Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="center-loader p-6 text-center max-w-md mx-auto" id="error-boundary-screen">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Ein unerwarteter Anzeigefehler ist aufgetreten</h3>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'Die Ansicht konnte nicht geladen werden.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-primary text-xs py-2 px-4"
              >
                Seite neu laden
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-secondary text-xs py-2 px-4"
              >
                Cache leeren & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/:username" element={<PublicProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const appBasename = getAppBasename();

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter basename={appBasename}>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

