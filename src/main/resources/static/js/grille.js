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

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

    const modeTexte = getModeTexte(state);

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

// ─── Appels API ───────────────────────────────────────────────────────────────

async function applyState(state) {
    renderBoard(state.plateau);
    renderValidMoves(state.coupsValides);
    renderInfo(state);
    savePauseSnapshot(state);

    if (state.partieTerminee && chronoIntervalId !== null) {
        clearInterval(chronoIntervalId);
        chronoIntervalId = null;
    }
}

function getModeTexte(state) {
    const difficultyLabels = {
        easy: 'Facile',
        medium: 'Moyen',
        hard: 'Difficile'
    };

    return state.contreIA
        ? `Mode : vs IA (${difficultyLabels[state.difficulteIA] || 'Moyen'})`
        : 'Mode : 2 joueurs';
}

function savePauseSnapshot(state) {
    const snapshot = {
        scoreNoir: state.scoreNoir,
        scoreBlanc: state.scoreBlanc,
        modeTexte: getModeTexte(state)
    };
    sessionStorage.setItem('pauseGameSnapshot', JSON.stringify(snapshot));
}

function getAIDelayMs(difficulteIA) {
    return 2000;
}

function iaDoitJouer(state) {
    return Boolean(state && state.contreIA && !state.partieTerminee && state.joueurCourant === 2);
}

let iaMovePending = false;
let elapsedSeconds = Number(sessionStorage.getItem('gameElapsedSeconds') || '0');
let chronoIntervalId = null;

function renderChrono() {
    const timerEl = document.getElementById('timer-display');
    if (!timerEl) return;
    timerEl.textContent = `Temps : ${formatDuration(elapsedSeconds)}`;
}

function startChrono() {
    renderChrono();
    if (chronoIntervalId !== null) {
        clearInterval(chronoIntervalId);
    }
    chronoIntervalId = setInterval(() => {
        elapsedSeconds += 1;
        sessionStorage.setItem('gameElapsedSeconds', String(elapsedSeconds));
        renderChrono();
    }, 1000);
}

async function fetchGameState() {
    const res = await fetch('/api/game/state');
    if (!res.ok) {
        throw new Error('Impossible de recuperer l\'etat de la partie');
    }
    return res.json();
}

async function startGame() {
    const mode = sessionStorage.getItem('gameMode') || 'human';
    const difficulty = sessionStorage.getItem('aiDifficulty') || 'medium';
    const player = getCurrentPlayer();
    const whitePlayer = getWhitePlayer();
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

    if (iaDoitJouer(state)) {
        iaMovePending = true;
        setTimeout(async () => {
            const aiRes = await fetch('/api/game/ai-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            iaMovePending = false;
            if (!aiRes.ok) return;

            const aiState = await aiRes.json();
            applyState(aiState);
        }, getAIDelayMs(state.difficulteIA));
    }
}

// ─── Interactions ─────────────────────────────────────────────────────────────

document.querySelectorAll('.case').forEach(el => {
    el.addEventListener('click', function () {
        if (iaMovePending) return;
        if (!this.classList.contains('playable')) return;
        const { row, col } = caseIdToCoords(this.id);
        playMove(row, col);
    });
});

function initPageHeader() {
    const player = getCurrentPlayer();
    const whitePlayer = getWhitePlayer();
    const playerInfo = document.getElementById('player-info');
    const statsButton = document.getElementById('stats-link');
    const pauseButton = document.getElementById('pause-link');

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
                sessionStorage.setItem('resumeFromPause', 'true');
                sessionStorage.setItem('statsOrigin', 'game');
                window.location.href = '/stats.html';
            });
        } else {
            statsButton.disabled = true;
            statsButton.title = 'Connectez-vous pour voir votre historique';
        }
    }

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            sessionStorage.setItem('resumeFromPause', 'true');
            window.location.href = '/pause.html';
        });
    }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

async function initGamePage() {
    initPageHeader();

    const resumeFromPause = sessionStorage.getItem('resumeFromPause') === 'true';
    try {
        if (resumeFromPause) {
            const state = await fetchGameState();
            applyState(state);
            sessionStorage.removeItem('resumeFromPause');
        } else {
            elapsedSeconds = 0;
            sessionStorage.setItem('gameElapsedSeconds', '0');
            await startGame();
        }
    } catch {
        elapsedSeconds = 0;
        sessionStorage.setItem('gameElapsedSeconds', '0');
        await startGame();
    }

    startChrono();
}

initGamePage();
