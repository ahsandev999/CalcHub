import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_STORAGE_KEY = 'calchub_pwa_prompt_dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_STORAGE_KEY)) {
      return;
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOSPrompt(true);
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-prompt-banner" role="dialog" aria-label="Install App">
      <div className="pwa-prompt-header">
        <div className="pwa-prompt-icon">◈</div>
        <div className="pwa-prompt-title-group">
          <h3 className="pwa-prompt-title">Install CalcHub App</h3>
          <p className="pwa-prompt-desc">Fast, offline access to all 30 calculators.</p>
        </div>
      </div>

      {showIOSPrompt ? (
        <div className="pwa-ios-instructions">
          To install on iOS: tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.
          <div className="pwa-prompt-actions" style={{ marginTop: 8 }}>
            <button className="pwa-btn-dismiss" onClick={handleDismiss}>Got it</button>
          </div>
        </div>
      ) : (
        <div className="pwa-prompt-actions">
          <button className="pwa-btn-dismiss" onClick={handleDismiss}>Not now</button>
          <button className="pwa-btn-install" onClick={handleInstallClick}>Install App</button>
        </div>
      )}
    </div>
  );
}
