(function () {
  const SRC = '/assets/music.mp3';
  const KEY_START  = 'bgMusicStart';   // timestamp Date.now() du début
  const KEY_MUTED  = 'bgMusicMuted';

  const audio = new Audio(SRC);
  audio.loop   = true;
  audio.volume = 0.5;
  audio.muted  = sessionStorage.getItem(KEY_MUTED) === 'true';

  // Une fois les métadonnées chargées, on calcule la position exacte
  // via le temps écoulé depuis le démarrage initial → pas de retour à 0
  audio.addEventListener('loadedmetadata', function () {
    const start = parseInt(sessionStorage.getItem(KEY_START), 10);
    if (!isNaN(start) && audio.duration) {
      const elapsed = (Date.now() - start) / 1000;
      audio.currentTime = elapsed % audio.duration;
    }
  });

  function tryPlay() {
    // Enregistrer le timestamp de démarrage la première fois seulement
    if (!sessionStorage.getItem(KEY_START)) {
      sessionStorage.setItem(KEY_START, Date.now());
    }
    audio.play().catch(() => {
      document.addEventListener('click', function onFirstClick() {
        // L'utilisateur vient d'interagir : on fixe le timestamp maintenant
        if (!sessionStorage.getItem(KEY_START)) {
          sessionStorage.setItem(KEY_START, Date.now());
        }
        audio.play();
      }, { once: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay);
  } else {
    tryPlay();
  }

  window.bgMusic = {
    toggleMute() {
      audio.muted = !audio.muted;
      sessionStorage.setItem(KEY_MUTED, audio.muted);
      return audio.muted;
    },
    isMuted() { return audio.muted; }
  };
})();
