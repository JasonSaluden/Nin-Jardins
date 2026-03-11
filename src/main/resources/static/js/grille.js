// ─── Conversion coordonnées ───────────────────────────────────────────────────

function getCurrentPlayer() {
    try {
        const raw = sessionStorage.getItem('joueur');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getWhitePlayer() {
    try {
        const raw = sessionStorage.getItem('joueurBlanc');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function isAuthenticatedPlayer(player) {
    return Boolean(player && Number.isInteger(player.id) && !player.guest);
}

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

/** Met à jour toutes les cases d'après le plateau (int[][] 0=vide,1=noir,2=blanc) */
function renderBoard(plateau) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const el = document.getElementById(coordsToCaseId(row, col));
            if (!el) continue;
            const val = plateau[row][col];
            el.classList.remove('black', 'white', 'playable');
            if (val === 1) el.classList.add('black');
            else if (val === 2) el.classList.add('white');
        }
    }
}

/** Surligne les coups valides (liste de [row, col]) */
function renderValidMoves(coupsValides) {
    coupsValides.forEach(([row, col]) => {
        const el = document.getElementById(coordsToCaseId(row, col));
        if (!el) return;
        el.classList.add('playable');
    });
}

/** Affiche le score et l'indicateur de tour */
function renderInfo(state) {
    const infoEl = document.getElementById('game-info');
    if (!infoEl) return;

    const difficultyLabels = {
        easy: 'Facile',
        medium: 'Moyen',
        hard: 'Difficile'
    };

    const modeTexte = state.contreIA
        ? `Mode : vs IA (${difficultyLabels[state.difficulteIA] || 'Moyen'})`
        : 'Mode : 2 joueurs';

    if (state.partieTerminee) {
        const msg = state.vainqueur === 0 ? 'Égalité !'
                  : state.vainqueur === 1 ? 'Victoire des Noirs !'
                  : 'Victoire des Blancs !';
        infoEl.textContent = `${msg}  (Noir: ${state.scoreNoir} | Blanc: ${state.scoreBlanc})  -  ${modeTexte}`;
    } else {
        const tour = state.joueurCourant === 1 ? 'Noirs' : 'Blancs';
        infoEl.textContent = `Tour : ${tour}  -  Noir: ${state.scoreNoir} | Blanc: ${state.scoreBlanc}  -  ${modeTexte}`;
    }
}

// ─── Verrou plateau ───────────────────────────────────────────────────────────

let boardLocked = false;

function showGameError(message) {
    const el = document.getElementById('game-error');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
}

function clearGameError() {
    const el = document.getElementById('game-error');
    if (!el) return;
    el.textContent = '';
    el.classList.add('hidden');
}

// ─── Appels API ───────────────────────────────────────────────────────────────

async function applyState(state) {
    renderBoard(state.plateau);
    renderValidMoves(state.coupsValides);
    renderInfo(state);
}

async function startGame() {
    const player = getCurrentPlayer();
    if (!player) {
        window.location.href = '/';
        return;
    }

    boardLocked = true;
    const mode = sessionStorage.getItem('gameMode') || 'human';
    const difficulty = sessionStorage.getItem('aiDifficulty') || 'medium';
    const whitePlayer = getWhitePlayer();

    try {
        const res = await fetch('/api/game/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contreIA: mode === 'ai',
                difficulteIA: difficulty,
                joueurId: isAuthenticatedPlayer(player) ? player.id : null,
                joueurBlancId: isAuthenticatedPlayer(whitePlayer) ? whitePlayer.id : null
            })
        });

        if (!res.ok) {
            showGameError('Impossible de démarrer la partie. Vérifiez votre connexion et réessayez.');
            return;
        }

        const state = await res.json();
        clearGameError();
        applyState(state);
    } catch {
        showGameError('Impossible de joindre le serveur. Vérifiez votre connexion.');
    } finally {
        boardLocked = false;
    }
}

async function playMove(row, col) {
    if (boardLocked) return;
    boardLocked = true;

    try {
        const res = await fetch('/api/game/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ligne: row, colonne: col })
        });

        if (!res.ok) return; // coup invalide ignoré silencieusement

        const state = await res.json();
        clearGameError();
        applyState(state);
    } catch {
        showGameError('Erreur réseau lors du coup. Réessayez.');
    } finally {
        boardLocked = false;
    }
}

// ─── Interactions ─────────────────────────────────────────────────────────────

document.querySelectorAll('.case').forEach(el => {
    el.addEventListener('click', function () {
        if (boardLocked || !this.classList.contains('playable')) return;
        const { row, col } = caseIdToCoords(this.id);
        playMove(row, col);
    });
});

function initPageHeader() {
    const player = getCurrentPlayer();
    const whitePlayer = getWhitePlayer();
    const playerInfo = document.getElementById('player-info');
    const statsButton = document.getElementById('stats-link');

    if (playerInfo) {
        const blackName = player?.pseudo || 'Invité';
        const whiteName = isAuthenticatedPlayer(whitePlayer)
            ? whitePlayer.pseudo
            : (sessionStorage.getItem('gameMode') === 'ai' ? 'IA Othello' : 'Joueur local');
        playerInfo.textContent = `Noir : ${blackName}  |  Blanc : ${whiteName}`;
    }

    if (statsButton) {
        if (isAuthenticatedPlayer(player)) {
            statsButton.addEventListener('click', () => {
                window.location.href = '/stats.html';
            });
        } else {
            statsButton.disabled = true;
            statsButton.title = 'Connectez-vous pour voir votre historique';
        }
    }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

initPageHeader();
startGame();
