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
    savePauseSnapshot(state);

    if (state.partieTerminee) {
        if (chronoIntervalId !== null) {
            clearInterval(chronoIntervalId);
            chronoIntervalId = null;
        }
        showEndModal(state);
    }
}

async function fetchHint() {
    const dialog = document.getElementById('hint-dialog');
    const textEl = document.getElementById('hint-text');
    const btn = document.getElementById('hint-btn');
    if (!dialog || !textEl) return;

    btn.disabled = true;
    textEl.textContent = "L'IA analyse la position...";
    dialog.showModal();

    try {
        const res = await fetch('/api/game/hint');
        textEl.textContent = await res.text();
    } catch {
        textEl.textContent = "Impossible de contacter l'IA pour le moment.";
    } finally {
        btn.disabled = false;
    }
}

function showPauseModal() {
    const dialog = document.getElementById('pause-dialog');
    if (!dialog) return;

    if (chronoIntervalId !== null) {
        clearInterval(chronoIntervalId);
        chronoIntervalId = null;
    }

    const snapshot = (() => {
        try {
            const raw = sessionStorage.getItem('pauseGameSnapshot');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    })();

    const timerEl = document.getElementById('pause-timer');
    const scoreEl = document.getElementById('pause-score');
    const modeEl = document.getElementById('pause-mode');
    const resumeBtn = document.getElementById('pause-resume-btn');

    if (timerEl) timerEl.textContent = `Temps : ${formatDuration(elapsedSeconds)}`;
    if (scoreEl && snapshot) scoreEl.textContent = `Noir : ${snapshot.scoreNoir}  —  Blanc : ${snapshot.scoreBlanc}`;
    if (modeEl && snapshot) modeEl.textContent = snapshot.modeTexte;

    if (resumeBtn) {
        resumeBtn.onclick = () => {
            dialog.close();
            startChrono();
        };
    }

    dialog.showModal();
}

function showEndModal(state) {
    const dialog = document.getElementById('end-dialog');
    if (!dialog) return;

    const player = getCurrentPlayer();
    const whitePlayer = getWhitePlayer();
    const blackName = player?.pseudo || 'Noirs';
    const whiteName = isAuthenticatedPlayer(whitePlayer)
        ? whitePlayer.pseudo
        : (sessionStorage.getItem('gameMode') === 'ai' ? 'IA Othello' : 'Blancs');

    const titleEl = document.getElementById('end-title');
    const scoreEl = document.getElementById('end-score');
    const modeEl = document.getElementById('end-mode');
    const statsBtn = document.getElementById('end-stats-btn');

    if (titleEl) {
        if (state.vainqueur === 0) {
            titleEl.textContent = 'Egalite !';
        } else if (state.vainqueur === 1) {
            titleEl.textContent = `${blackName} gagne !`;
        } else {
            titleEl.textContent = `${whiteName} gagne !`;
        }
    }

    if (scoreEl) scoreEl.textContent = `Noir : ${state.scoreNoir}  —  Blanc : ${state.scoreBlanc}`;
    if (modeEl) modeEl.textContent = getModeTexte(state);

    if (statsBtn) {
        if (isAuthenticatedPlayer(player)) {
            statsBtn.addEventListener('click', () => {
                sessionStorage.setItem('statsOrigin', 'game');
                window.location.href = '/stats.html';
            });
        } else {
            statsBtn.disabled = true;
            statsBtn.title = 'Connectez-vous pour voir votre historique';
        }
    }

    dialog.showModal();
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
    } catch {
        showGameError('Impossible de jouer ce coup pour le moment.');
    } finally {
        boardLocked = false;
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
    const ruleButton = document.getElementById('rule-link');
    const ruleDialog = document.getElementById('rule-dialog');
    const ruleDialogContent = document.getElementById('rule-dialog-content');

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
            showPauseModal();
        });
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', fetchHint);
    }

    const hintClose = document.getElementById('hint-close');
    if (hintClose) {
        hintClose.addEventListener('click', () => {
            document.getElementById('hint-dialog')?.close();
        });
    }

    if (ruleButton && ruleDialog && ruleDialogContent) {
        async function loadRules() {
            if (ruleDialogContent.innerHTML) return;
            try {
                const response = await fetch('/rule.html');
                const html = await response.text();
                ruleDialogContent.innerHTML = html;

                const closeBtn = document.createElement('button');
                closeBtn.id = 'rule-close';
                closeBtn.textContent = 'Fermer';
                closeBtn.addEventListener('click', () => {
                    ruleDialog.close();
                });
                ruleDialogContent.appendChild(closeBtn);
            } catch (error) {
                console.error('Error loading rules:', error);
                ruleDialogContent.innerHTML = '<p>Erreur lors du chargement des règles.</p>';
            }
        }

        ruleButton.addEventListener('click', async () => {
            await loadRules();
            ruleDialog.showModal();
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
