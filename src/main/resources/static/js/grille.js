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
    textEl.textContent = '';
    if (chronoIntervalId !== null) {
        clearInterval(chronoIntervalId);
        chronoIntervalId = null;
    }
    dialog.showModal();

    let fullText = '';
    let sentenceDone = false;

    const source = new EventSource('/api/game/hint/stream');

    source.onmessage = (event) => {
        if (sentenceDone) return;
        fullText += event.data;

        const stripped = fullText.replace(/[Pp]hrase\s*\d+\s*:\s*/g, '').trim();

        // Attend que la Phrase 2 soit présente ET terminée par une ponctuation
        const hasPhrase2 = /[Pp]hrase\s*2/.test(fullText);
        if (hasPhrase2) {
            const phrase2Start = fullText.search(/[Pp]hrase\s*2/);
            const afterPhrase2 = fullText.substring(phrase2Start);
            const endInPhrase2 = afterPhrase2.search(/[.!?]/);
            if (endInPhrase2 !== -1) {
                const cutRaw = fullText.substring(0, phrase2Start + endInPhrase2 + 1);
                textEl.textContent = cutRaw.replace(/[Pp]hrase\s*\d+\s*:\s*/g, '').trim();
                sentenceDone = true;
                source.close();
                btn.disabled = false;
                return;
            }
        }
        textEl.textContent = stripped;
    };

    source.addEventListener('done', () => {
        source.close();
        btn.disabled = false;
    });

    source.addEventListener('error', (event) => {
        textEl.textContent = event.data || "Impossible de contacter l'IA pour le moment.";
        source.close();
        btn.disabled = false;
    });

    source.onerror = () => {
        source.close();
        if (!fullText) textEl.textContent = "Impossible de contacter l'IA pour le moment.";
        btn.disabled = false;
    };
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

function togglePauseFromKeyboard() {
    const pauseDialog = document.getElementById('pause-dialog');
    const endDialog = document.getElementById('end-dialog');
    if (!pauseDialog || endDialog?.open) return;

    if (pauseDialog.open) {
        pauseDialog.close();
        if (chronoIntervalId === null) {
            startChrono();
        }
        return;
    }

    showPauseModal();
}

function bindPauseShortcut() {
    document.addEventListener('keydown', (event) => {
        if (event.repeat || event.key.toLowerCase() !== 'p') {
            return;
        }

        const target = event.target;
        const isTyping = target && (
            target.tagName === 'INPUT'
            || target.tagName === 'TEXTAREA'
            || target.isContentEditable
        );
        if (isTyping) {
            return;
        }

        event.preventDefault();
        togglePauseFromKeyboard();
    });
}

function showEndModal(state) {
    const dialog = document.getElementById('end-dialog');
    if (!dialog) return;

    const player = getCurrentPlayer();
    const whitePlayer = getWhitePlayer();
    const mode = sessionStorage.getItem('gameMode') || 'human';
    const selectedColor = sessionStorage.getItem('playerColor') || 'black';
    const playerColor = selectedColor === 'white' ? 2 : 1;

    const opponentName = isAuthenticatedPlayer(whitePlayer)
        ? whitePlayer.pseudo
        : (mode === 'ai' ? 'IA Othello' : 'Joueur local');

    const blackName = selectedColor === 'white' ? opponentName : (player?.pseudo || 'Invité');
    const whiteName = selectedColor === 'white' ? (player?.pseudo || 'Invité') : opponentName;

    const titleEl = document.getElementById('end-title');
    const scoreEl = document.getElementById('end-score');
    const modeEl = document.getElementById('end-mode');
    const statsBtn = document.getElementById('end-stats-btn');

    if (titleEl) {
        if (state.vainqueur === 0) {
            titleEl.textContent = 'Egalite !';
        } else if (state.vainqueur === playerColor) {
            titleEl.textContent = isAuthenticatedPlayer(player)
                ? `${player.pseudo} gagne !`
                : 'Vous avez gagne !';
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
    if (!state || !state.contreIA || state.partieTerminee) {
        return false;
    }

    const selectedColor = sessionStorage.getItem('playerColor') || 'black';
    const aiColor = selectedColor === 'white' ? 1 : 2;
    return state.joueurCourant === aiColor;
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
    const selectedColor = sessionStorage.getItem('playerColor') || 'black';
    const whitePlayer = getWhitePlayer();

    let joueurNoirId = null;
    let joueurBlancId = null;
    if (selectedColor === 'white') {
        joueurBlancId = isAuthenticatedPlayer(player) ? player.id : null;
        if (mode === 'human' && isAuthenticatedPlayer(whitePlayer)) {
            joueurNoirId = whitePlayer.id;
        }
    } else {
        joueurNoirId = isAuthenticatedPlayer(player) ? player.id : null;
        if (mode === 'human' && isAuthenticatedPlayer(whitePlayer)) {
            joueurBlancId = whitePlayer.id;
        }
    }

    try {
        const res = await fetch('/api/game/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contreIA: mode === 'ai',
                difficulteIA: difficulty,
                couleurJoueur: selectedColor,
                joueurId: joueurNoirId,
                joueurBlancId: joueurBlancId
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

        scheduleAIMoveIfNeeded(state);
    } catch {
        showGameError('Impossible de jouer ce coup pour le moment.');
    } finally {
        boardLocked = false;
    }
}

function scheduleAIMoveIfNeeded(state) {
    if (!iaDoitJouer(state) || iaMovePending) {
        return;
    }

    iaMovePending = true;
    setTimeout(async () => {
        try {
            const aiRes = await fetch('/api/game/ai-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!aiRes.ok) return;

            const aiState = await aiRes.json();
            applyState(aiState);
        } finally {
            iaMovePending = false;
        }
    }, getAIDelayMs(state.difficulteIA));
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
    const mode = sessionStorage.getItem('gameMode') || 'human';
    const selectedColor = sessionStorage.getItem('playerColor') || 'black';
    const playerInfo = document.getElementById('player-info');
    const statsButton = document.getElementById('stats-link');
    const pauseButton = document.getElementById('pause-link');
    const ruleButton = document.getElementById('rule-link');
    const ruleDialog = document.getElementById('rule-dialog');
    const ruleDialogContent = document.getElementById('rule-dialog-content');

    if (playerInfo) {
        const opponentName = isAuthenticatedPlayer(whitePlayer)
            ? whitePlayer.pseudo
            : (mode === 'ai' ? 'IA Othello' : 'Joueur local');

        const blackName = selectedColor === 'white' ? opponentName : (player?.pseudo || 'Invité');
        const whiteName = selectedColor === 'white' ? (player?.pseudo || 'Invité') : opponentName;
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
            if (chronoIntervalId === null) {
                startChrono();
            }
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
    bindPauseShortcut();

    const resumeFromPause = sessionStorage.getItem('resumeFromPause') === 'true';
    try {
        if (resumeFromPause) {
            const state = await fetchGameState();
            applyState(state);
            scheduleAIMoveIfNeeded(state);
            sessionStorage.removeItem('resumeFromPause');
        } else {
            elapsedSeconds = 0;
            sessionStorage.setItem('gameElapsedSeconds', '0');
            await startGame();
            const state = await fetchGameState();
            scheduleAIMoveIfNeeded(state);
        }
    } catch {
        elapsedSeconds = 0;
        sessionStorage.setItem('gameElapsedSeconds', '0');
        await startGame();
        const state = await fetchGameState();
        scheduleAIMoveIfNeeded(state);
    }

    startChrono();
}

initGamePage();
