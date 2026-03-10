// ─── Conversion coordonnées ───────────────────────────────────────────────────

// "D4" → { row: 3, col: 3 }  (row = chiffre-1, col = lettre-'A')
function caseIdToCoords(caseId) {
    const col = caseId.charCodeAt(0) - 65;
    const row = parseInt(caseId.substring(1)) - 1;
    return { row, col };
}

// { row: 3, col: 3 } → "D4"
function coordsToCaseId(row, col) {
    return String.fromCharCode(65 + col) + (row + 1);
}

// ─── Rendu du plateau ─────────────────────────────────────────────────────────

const STYLES = {
    empty:    { backgroundImage: 'url(/img/empty.png)',        backgroundColor: '' },
    black:    { backgroundImage: 'url(/img/black-piece.png)',  backgroundColor: '' },
    white:    { backgroundImage: 'url(/img/white-piece.png)',  backgroundColor: '' },
    playable: { backgroundImage: '',                           backgroundColor: '#90EE90' }
};

function applyStyle(el, style) {
    el.style.backgroundImage  = style.backgroundImage;
    el.style.backgroundColor  = style.backgroundColor;
}

/** Met à jour toutes les cases d'après le plateau (int[][] 0=vide,1=noir,2=blanc) */
function renderBoard(plateau) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const el = document.getElementById(coordsToCaseId(row, col));
            if (!el) continue;
            const val = plateau[row][col];
            el.dataset.state = val === 1 ? 'black' : val === 2 ? 'white' : 'empty';
            el.classList.remove('playable');
            applyStyle(el, val === 1 ? STYLES.black : val === 2 ? STYLES.white : STYLES.empty);
        }
    }
}

/** Surligne les coups valides (liste de [row, col]) */
function renderValidMoves(coupsValides) {
    coupsValides.forEach(([row, col]) => {
        const el = document.getElementById(coordsToCaseId(row, col));
        if (!el) return;
        el.classList.add('playable');
        applyStyle(el, STYLES.playable);
    });
}

/** Affiche le score et l'indicateur de tour */
function renderInfo(state) {
    const infoEl = document.getElementById('game-info');
    if (!infoEl) return;

    if (state.partieTerminee) {
        const msg = state.vainqueur === 0 ? 'Égalité !'
                  : state.vainqueur === 1 ? 'Victoire des Noirs !'
                  : 'Victoire des Blancs !';
        infoEl.textContent = `${msg}  (Noir: ${state.scoreNoir} | Blanc: ${state.scoreBlanc})`;
    } else {
        const tour = state.joueurCourant === 1 ? 'Noirs' : 'Blancs';
        infoEl.textContent = `Tour : ${tour}  —  Noir: ${state.scoreNoir} | Blanc: ${state.scoreBlanc}`;
    }
}

// ─── Appels API ───────────────────────────────────────────────────────────────

async function applyState(state) {
    renderBoard(state.plateau);
    renderValidMoves(state.coupsValides);
    renderInfo(state);
}

async function startGame() {
    const res = await fetch('/api/game/start', { method: 'POST' });
    const state = await res.json();
    applyState(state);
}

async function playMove(row, col) {
    const res = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ligne: row, colonne: col })
    });

    if (!res.ok) return; // coup invalide ignoré

    const state = await res.json();
    applyState(state);
}

// ─── Interactions ─────────────────────────────────────────────────────────────

document.querySelectorAll('.case').forEach(el => {
    el.addEventListener('click', function () {
        if (!this.classList.contains('playable')) return;
        const { row, col } = caseIdToCoords(this.id);
        playMove(row, col);
    });
});

// ─── Initialisation ───────────────────────────────────────────────────────────

startGame();
