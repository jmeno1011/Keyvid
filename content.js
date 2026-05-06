// KeyVid - content.js
// Adds keyboard shortcut support to video players

const SEEK_SECONDS = 5;
const VOLUME_STEP = 0.05;

let activeVideo = null;
let indicator = null;
let indicatorTimeout = null;
let youtubeBridgeReady = false;
let keyvidEnabled = false;
let videoObserver = null;

const STORAGE_KEY = 'allowedSites';

// ─── On-screen feedback indicator ──────────────────────────────────────────────

function createIndicator() {
  if (indicator) return;
  indicator = document.createElement('div');
  indicator.id = '__keyvid_indicator__';
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(9,13,11,0.78);
    color: #63e58d;
    font-family: -apple-system, sans-serif;
    font-size: 22px;
    font-weight: 600;
    padding: 14px 26px;
    border-radius: 12px;
    pointer-events: none;
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.15s ease;
    letter-spacing: -0.3px;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(99,229,141,0.24);
    box-shadow: 0 16px 42px rgba(0,0,0,0.36), 0 0 24px rgba(74,222,128,0.16);
  `;
  document.body.appendChild(indicator);
}

function showIndicator(text) {
  createIndicator();
  indicator.textContent = text;
  indicator.style.opacity = '1';
  clearTimeout(indicatorTimeout);
  indicatorTimeout = setTimeout(() => {
    if (indicator) indicator.style.opacity = '0';
  }, 800);
}

function formatTime(seconds) {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.floor(Math.abs(seconds) % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function clampVolume(volume) {
  return Math.min(1, Math.max(0, volume));
}

function isYouTubePage() {
  return /(^|\.)youtube\.com$/.test(location.hostname) || location.hostname === 'youtu.be';
}

function ensureYouTubeBridge() {
  if (!isYouTubePage() || youtubeBridgeReady) return;
  const existing = document.getElementById('__keyvid_youtube_bridge__');
  if (existing) {
    youtubeBridgeReady = true;
    return;
  }

  const script = document.createElement('script');
  script.id = '__keyvid_youtube_bridge__';
  script.src = chrome.runtime.getURL('youtube-bridge.js');
  script.onload = () => {
    youtubeBridgeReady = true;
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

function normalizeHost(host) {
  return String(host || '')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '');
}

function isCurrentSiteAllowed(sites) {
  const host = normalizeHost(location.hostname);
  return Array.isArray(sites) && sites.some(site => {
    const allowedHost = normalizeHost(site);
    return allowedHost && (host === allowedHost || host.endsWith(`.${allowedHost}`));
  });
}

function removeRestrictiveVideoTabIndex() {
  document.querySelectorAll('video[tabindex="-1"]').forEach(v => {
    v.removeAttribute('tabindex');
  });
}

function startVideoObserver() {
  if (videoObserver || !document.body) return;

  videoObserver = new MutationObserver(() => {
    removeRestrictiveVideoTabIndex();
  });
  videoObserver.observe(document.body, { childList: true, subtree: true });
}

function stopVideoObserver() {
  videoObserver?.disconnect();
  videoObserver = null;
}

function setKeyVidEnabled(enabled) {
  if (keyvidEnabled === enabled) return;
  keyvidEnabled = enabled;

  if (enabled) {
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    ensureYouTubeBridge();
    removeRestrictiveVideoTabIndex();
    startVideoObserver();
    console.log('[KeyVid] Activated on registered site');
    return;
  }

  document.removeEventListener('keydown', handleKeyDown, { capture: true });
  stopVideoObserver();
  if (indicator) indicator.style.opacity = '0';
  console.log('[KeyVid] Disabled on unregistered site');
}

function refreshSiteAccess() {
  chrome.storage.local.get({ [STORAGE_KEY]: [] }, result => {
    if (chrome.runtime.lastError) {
      setKeyVidEnabled(false);
      return;
    }

    setKeyVidEnabled(isCurrentSiteAllowed(result[STORAGE_KEY]));
  });
}

function requestYouTubeVolumeChange(action, volumePercent) {
  if (!isYouTubePage()) return false;
  ensureYouTubeBridge();
  window.dispatchEvent(new CustomEvent('__keyvid_youtube_volume__', {
    detail: {
      action,
      volume: volumePercent,
    },
  }));
  return true;
}

function syncVolumeWithPlayer(video, nextVolume) {
  const volume = clampVolume(Math.round(nextVolume * 100) / 100);
  const percent = Math.round(volume * 100);

  video.volume = volume;
  video.muted = volume === 0;

  if (isYouTubePage()) {
    requestYouTubeVolumeChange('setVolume', percent);
  } else {
    const player = document.getElementById('movie_player');
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(percent);
        if (volume === 0) {
          player.mute?.();
        } else {
          player.unMute?.();
        }
      } catch {
        // Ignore player API failures and fall back to the media element state.
      }
    }
  }

  video.dispatchEvent(new Event('volumechange', { bubbles: true }));
  return volume;
}

// ─── Video detection ───────────────────────────────────────────────────────────

function findBestVideo() {
  const videos = [...document.querySelectorAll('video')];
  if (!videos.length) return null;

  // Prefer the largest video, with playback state weighted higher
  return videos
    .filter(v => v.readyState >= 1 && !v.error)
    .sort((a, b) => {
      const aScore = (a.paused ? 0 : 10) + a.offsetWidth * a.offsetHeight;
      const bScore = (b.paused ? 0 : 10) + b.offsetWidth * b.offsetHeight;
      return bScore - aScore;
    })[0] || videos[0];
}

// ─── Keyboard handling ────────────────────────────────────────────────────────

function handleKeyDown(e) {
  // Do not interfere with form fields or editable content
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag)) return;
  if (document.activeElement?.isContentEditable) return;

  const video = findBestVideo();
  if (!video) return;

  switch (e.code) {
    case 'ArrowRight': {
      e.preventDefault();
      e.stopPropagation();
      const seekTo = Math.min(video.currentTime + SEEK_SECONDS, video.duration || Infinity);
      video.currentTime = seekTo;
      showIndicator(`▶▶  +${SEEK_SECONDS}s  (${formatTime(seekTo)})`);
      break;
    }
    case 'ArrowLeft': {
      e.preventDefault();
      e.stopPropagation();
      const seekTo = Math.max(video.currentTime - SEEK_SECONDS, 0);
      video.currentTime = seekTo;
      showIndicator(`◀◀  -${SEEK_SECONDS}s  (${formatTime(seekTo)})`);
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      e.stopPropagation();
      const newVol = syncVolumeWithPlayer(video, video.volume + VOLUME_STEP);
      if (newVol > 0) {
        video.muted = false;
      }
      showIndicator(`🔊  Volume ${Math.round(video.volume * 100)}%`);
      break;
    }
    case 'ArrowDown': {
      e.preventDefault();
      e.stopPropagation();
      const newVol = syncVolumeWithPlayer(video, video.volume - VOLUME_STEP);
      if (newVol === 0) video.muted = true;
      showIndicator(`🔈  Volume ${Math.round(video.volume * 100)}%`);
      break;
    }
    case 'Space': {
      // Space toggles play/pause only when nothing editable is focused
      if (document.activeElement === document.body || !document.activeElement) {
        e.preventDefault();
        e.stopPropagation();
        if (video.paused) {
          video.play();
          showIndicator('▶  Play');
        } else {
          video.pause();
          showIndicator('⏸  Pause');
        }
      }
      break;
    }
    case 'KeyF': {
      // F toggles fullscreen
      if (!document.activeElement || document.activeElement === document.body) {
        e.preventDefault();
        if (!document.fullscreenElement) {
          video.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }
      break;
    }
    case 'KeyM': {
      // M toggles mute
      if (!document.activeElement || document.activeElement === document.body) {
        e.preventDefault();
        video.muted = !video.muted;
        if (isYouTubePage()) {
          requestYouTubeVolumeChange(video.muted ? 'mute' : 'unmute', Math.round(clampVolume(video.volume || 1) * 100));
        } else {
          const player = document.getElementById('movie_player');
          if (player && typeof player.setVolume === 'function') {
            try {
              if (video.muted) {
                player.mute?.();
                player.setVolume?.(0);
              } else {
                player.unMute?.();
                player.setVolume?.(Math.round(clampVolume(video.volume || 1) * 100));
              }
            } catch {
              // Ignore player API failures and fall back to the media element state.
            }
          }
        }
        showIndicator(video.muted ? '🔇  Muted' : '🔊  Unmuted');
      }
      break;
    }
  }
}

// ─── Initialization ───────────────────────────────────────────────────────────

refreshSiteAccess();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
  setKeyVidEnabled(isCurrentSiteAllowed(changes[STORAGE_KEY].newValue));
});
