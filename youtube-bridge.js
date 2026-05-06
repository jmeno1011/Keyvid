(() => {
  if (window.__keyvidYouTubeBridgeInstalled) return;
  window.__keyvidYouTubeBridgeInstalled = true;

  function getPlayer() {
    return document.getElementById('movie_player');
  }

  function applyVolume(volumePercent, action) {
    const player = getPlayer();
    if (!player) return false;

    const percent = Math.max(0, Math.min(100, Math.round(volumePercent)));

    try {
      if (action === 'mute') {
        player.mute?.();
        player.setVolume?.(0);
        return true;
      }

      if (action === 'unmute') {
        player.unMute?.();
        player.setVolume?.(percent || 100);
        return true;
      }

      player.setVolume?.(percent);

      if (percent === 0) {
        player.mute?.();
      } else {
        player.unMute?.();
      }

      return true;
    } catch {
      return false;
    }
  }

  window.addEventListener('__keyvid_youtube_volume__', event => {
    const detail = event.detail || {};
    applyVolume(detail.volume, detail.action);
  });
})();
