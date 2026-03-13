(function () {
  const SRC       = '/assets/music.mp3';
  const KEY_START = 'bgMusicStart';
  const KEY_MUTED = 'bgMusicMuted';
  const KEY_VOL   = 'bgMusicVolume';

  const audio = new Audio(SRC);
  audio.loop   = true;
  audio.volume = parseFloat(sessionStorage.getItem(KEY_VOL) ?? '0.5') || 0.5;
  audio.muted  = sessionStorage.getItem(KEY_MUTED) === 'true';

  audio.addEventListener('loadedmetadata', function () {
    const start = parseInt(sessionStorage.getItem(KEY_START), 10);
    if (!isNaN(start) && audio.duration) {
      const elapsed = (Date.now() - start) / 1000;
      audio.currentTime = elapsed % audio.duration;
    }
  });

  function tryPlay() {
    if (!sessionStorage.getItem(KEY_START)) {
      sessionStorage.setItem(KEY_START, Date.now());
    }
    audio.play().catch(() => {
      document.addEventListener('click', function onFirstClick() {
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
    isMuted()  { return audio.muted; },
    setVolume(v) {
      audio.volume = Math.max(0, Math.min(1, v));
      audio.muted  = audio.volume === 0;
      sessionStorage.setItem(KEY_VOL,   audio.volume);
      sessionStorage.setItem(KEY_MUTED, audio.muted);
    },
    getVolume() { return audio.volume; }
  };

  // ── Bouton volume flottant (toutes les pages) ──────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #bg-volume-wrap {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    #bg-volume-popup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background: #fff;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.13);
      padding: 10px 12px 8px;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
    }
    #bg-volume-wrap:hover #bg-volume-popup {
      max-height: 160px;
      opacity: 1;
      pointer-events: auto;
    }
    #bg-volume-popup span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #d5072f;
      font-family: sans-serif;
    }
    #bg-volume-range {
      -webkit-appearance: slider-vertical;
      writing-mode: vertical-lr;
      direction: rtl;
      appearance: none;
      width: 4px;
      height: 80px;
      border-radius: 99px;
      background: linear-gradient(to top, #d5072f var(--vol, 50%), #ddd var(--vol, 50%));
      outline: none;
      cursor: pointer;
    }
    #bg-volume-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d5072f;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      cursor: pointer;
    }
    #bg-volume-range::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #d5072f;
      border: none;
      cursor: pointer;
    }
    #bg-volume-fab {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: #d5072f !important;
      box-shadow: 0 4px 14px rgba(213,7,47,0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      flex-shrink: 0;
    }
    #bg-volume-fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(213,7,47,0.5);
    }
    #bg-volume-fab img {
      width: 22px;
      height: 22px;
      display: block;
      filter: brightness(0) invert(1);
    }
  `;
  document.head.appendChild(style);

  function buildVolumeWidget() {
    const existing = document.getElementById('bg-volume-fab');

    const popup = document.createElement('div');
    popup.id = 'bg-volume-popup';
    popup.classList.add('hidden');

    const initVol = Math.round(audio.volume * 100);
    popup.innerHTML = `
      <input id="bg-volume-range" type="range" min="0" max="100" value="${initVol}"
             aria-label="Volume de la musique">
      <span id="bg-volume-pct">${initVol}%</span>
    `;

    let btn;
    if (existing) {
      // Bouton déjà dans la page (ex: toolbar grille) — on l'utilise tel quel
      btn = existing;
      // Sync icône initiale
      btn.querySelector('img').src = `/img/icones/${audio.muted ? 'volume-mute' : 'volume'}.svg`;
      // Le popup se positionne par rapport au bouton
      btn.parentElement.style.position = 'relative';
      popup.style.cssText = 'position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);';
      btn.parentElement.appendChild(popup);
      // Hover géré en JS (pas de #bg-volume-wrap disponible)
      let hideTimer;
      const showPopup = () => { clearTimeout(hideTimer); popup.classList.remove('hidden'); };
      const hidePopup = () => { hideTimer = setTimeout(() => popup.classList.add('hidden'), 120); };
      btn.addEventListener('mouseenter', showPopup);
      btn.addEventListener('mouseleave', hidePopup);
      popup.addEventListener('mouseenter', showPopup);
      popup.addEventListener('mouseleave', hidePopup);
    } else {
      // Aucun bouton dans la page — on crée le widget flottant
      const wrap = document.createElement('div');
      wrap.id = 'bg-volume-wrap';
      btn = document.createElement('button');
      btn.id = 'bg-volume-fab';
      btn.setAttribute('aria-label', audio.muted ? 'Activer le son' : 'Couper le son');
      btn.innerHTML = `<img src="/img/icones/${audio.muted ? 'volume-mute' : 'volume'}.svg" alt="Volume">`;
      wrap.appendChild(popup);
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
    }

    const range = popup.querySelector('#bg-volume-range');
    const pct   = popup.querySelector('#bg-volume-pct');

    function syncSlider(v) {
      range.value = v;
      pct.textContent = v + '%';
      range.style.setProperty('--vol', v + '%');
    }
    syncSlider(initVol);

    function syncIcon() {
      const muted = audio.muted || audio.volume === 0;
      btn.querySelector('img').src = `/img/icones/${muted ? 'volume-mute' : 'volume'}.svg`;
      btn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
    }

    btn.addEventListener('click', () => {
      window.bgMusic.toggleMute();
      syncIcon();
    });

    range.addEventListener('input', () => {
      const v = parseInt(range.value, 10);
      syncSlider(v);
      window.bgMusic.setVolume(v / 100);
      syncIcon();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildVolumeWidget);
  } else {
    buildVolumeWidget();
  }
})();
