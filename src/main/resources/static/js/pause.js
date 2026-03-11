function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildPauseBoard() {
    const board = document.getElementById('pause-board');
    if (!board) return;

    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'case';
        board.appendChild(cell);
    }
}

function loadPauseSnapshot() {
    try {
        const raw = sessionStorage.getItem('pauseGameSnapshot');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function renderPauseInfo() {
    const elapsed = Number(sessionStorage.getItem('gameElapsedSeconds') || '0');
    const snapshot = loadPauseSnapshot();

    const timerEl = document.getElementById('pause-timer');
    const scoreEl = document.getElementById('pause-score');
    const modeEl = document.getElementById('pause-mode');

    if (timerEl) {
        timerEl.textContent = `Temps : ${formatDuration(elapsed)}`;
    }

    if (scoreEl && snapshot) {
        scoreEl.textContent = `Score : Noir ${snapshot.scoreNoir} - Blanc ${snapshot.scoreBlanc}`;
    }

    if (modeEl && snapshot) {
        modeEl.textContent = snapshot.modeTexte;
    }
}

function wireActions() {
    const resumeBtn = document.getElementById('resume-button');
    const quitBtn = document.getElementById('quit-button');

    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            sessionStorage.setItem('resumeFromPause', 'true');
            window.location.href = '/grille.html';
        });
    }

    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            sessionStorage.removeItem('resumeFromPause');
        });
    }
}

buildPauseBoard();
renderPauseInfo();
wireActions();
