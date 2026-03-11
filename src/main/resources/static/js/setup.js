function readPlayer(key = 'joueur') {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function isRegisteredPlayer(player) {
    return Boolean(player && Number.isInteger(player.id) && !player.guest);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function clearSecondPlayerState() {
    sessionStorage.removeItem('joueurBlanc');
    const form = document.getElementById('second-player-form');
    if (form) {
        form.reset();
    }
    setText('second-error', '');
    setText('second-success', '');
}

function syncOpponentOptions(playerOne) {
    const select = document.getElementById('player-two-type');
    const connectedOption = select?.querySelector('option[value="connected"]');
    if (!select || !connectedOption) {
        return;
    }

    const allowConnectedOpponent = isRegisteredPlayer(playerOne);

    // En mode invite, on masque completement l'option au lieu de la laisser visible desactivee.
    connectedOption.hidden = !allowConnectedOpponent;
    connectedOption.disabled = !allowConnectedOpponent;

    if (!allowConnectedOpponent && select.value === 'connected') {
        select.value = 'local';
    }
}

function updateScreen() {
    const playerOne = readPlayer('joueur');
    syncOpponentOptions(playerOne);
    const playerTwo = readPlayer('joueurBlanc');
    const opponentType = document.getElementById('player-two-type')?.value || 'local';
    const secondPlayerPanel = document.getElementById('second-player-panel');
    const difficultyPanel = document.getElementById('difficulty-panel');
    const secondSummary = document.getElementById('second-player-summary');
    const clearSecondPlayer = document.getElementById('clear-second-player');
    const help = document.getElementById('player-two-help');
    const statsButton = document.getElementById('setup-stats-link');
    const authButton = document.getElementById('setup-logout-link');
    const colorSelect = document.getElementById('player-color');
    const selectedColor = colorSelect?.value || 'black';

    const blackRole = selectedColor === 'black' ? '(Noir)' : '(Blanc)';
    setText('player-one-label', `${playerOne?.pseudo || 'Invité'} ${blackRole}`);
    setText('setup-subtitle', playerOne?.guest
        ? 'Choisissez un adversaire local ou une IA pour lancer la partie.'
        : 'Choisissez maintenant qui joue en blanc et le niveau de l’IA si besoin.');

    if (help) {
        if (opponentType === 'connected') {
            help.textContent = playerOne?.guest
                ? 'Le mode invité ne permet pas de rattacher un second compte.'
                : 'Connectez le compte qui jouera avec les pions blancs.';
        } else if (opponentType === 'ai') {
            help.textContent = 'Choisissez la difficulté avant de lancer la partie.';
        } else {
            help.textContent = 'Le joueur 2 sera joué localement sur le même écran.';
        }
    }

    if (secondPlayerPanel) {
        secondPlayerPanel.classList.toggle('hidden', opponentType !== 'connected');
    }
    if (difficultyPanel) {
        difficultyPanel.classList.toggle('hidden', opponentType !== 'ai');
    }

    if (secondSummary && clearSecondPlayer) {
        const hasPlayerTwo = isRegisteredPlayer(playerTwo);
        secondSummary.classList.toggle('hidden', !hasPlayerTwo);
        clearSecondPlayer.classList.toggle('hidden', !hasPlayerTwo);
        setText('player-two-label', hasPlayerTwo ? playerTwo.pseudo : '');
    }

    if (statsButton) {
        statsButton.classList.toggle('hidden', !isRegisteredPlayer(playerOne));
    }

    if (authButton) {
        authButton.textContent = playerOne?.guest ? "Se connecter/S'inscrire" : 'Se déconnecter';
    }
}

function initSetup() {
    const playerOne = readPlayer('joueur');
    if (!playerOne) {
        window.location.href = '/';
        return;
    }

    const select = document.getElementById('player-two-type');
    syncOpponentOptions(playerOne);

    const savedMode = sessionStorage.getItem('gameMode') || 'human';
    if (select) {
        if (savedMode === 'ai') {
            select.value = 'ai';
        } else if (isRegisteredPlayer(readPlayer('joueurBlanc'))) {
            select.value = 'connected';
        } else {
            select.value = 'local';
        }
        select.addEventListener('change', () => {
            setText('setup-error', '');
            if (select.value !== 'connected') {
                clearSecondPlayerState();
            }
            updateScreen();
        });
    }

    const difficulty = document.getElementById('ai-difficulty');
    if (difficulty) {
        difficulty.value = sessionStorage.getItem('aiDifficulty') || 'medium';
    }

    const colorSelect = document.getElementById('player-color');
    if (colorSelect) {
        colorSelect.value = sessionStorage.getItem('playerColor') || 'black';
        colorSelect.addEventListener('change', () => {
            setText('setup-error', '');
            updateScreen();
        });
    }

    document.getElementById('clear-second-player')?.addEventListener('click', () => {
        clearSecondPlayerState();
        updateScreen();
    });

    document.getElementById('setup-stats-link')?.addEventListener('click', () => {
        sessionStorage.setItem('statsOrigin', 'setup');
        window.location.href = '/stats.html';
    });

    document.getElementById('setup-logout-link')?.addEventListener('click', () => {
        const playerOne = readPlayer('joueur');
        if (playerOne?.guest) {
            sessionStorage.removeItem('joueur');
            sessionStorage.removeItem('joueurBlanc');
            sessionStorage.removeItem('gameMode');
            sessionStorage.removeItem('aiDifficulty');
            sessionStorage.removeItem('playerColor');
        } else {
            sessionStorage.clear();
        }
        window.location.href = '/';
    });

    updateScreen();
}

async function loginSecondPlayer(event) {
    event.preventDefault();
    setText('second-error', '');
    setText('second-success', '');
    const primary = readPlayer('joueur');

    if (!isRegisteredPlayer(primary)) {
        setText('second-error', 'Le joueur 1 doit être connecté pour utiliser un second compte.');
        return;
    }

    const body = {
        pseudo: document.getElementById('second-pseudo').value,
        motDePasse: document.getElementById('second-mdp').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            setText('second-error', await response.text());
            return;
        }

        const playerTwo = await response.json();
        if (playerTwo.id === primary.id) {
            setText('second-error', 'Le joueur 2 doit être différent du joueur 1.');
            return;
        }

        sessionStorage.setItem('joueurBlanc', JSON.stringify(playerTwo));
        setText('second-success', 'Joueur 2 connecté.');
        updateScreen();
    } catch {
        setText('second-error', 'Erreur de connexion au serveur.');
    }
}

function startConfiguredGame() {
    const opponentType = document.getElementById('player-two-type')?.value || 'local';
    const selectedColor = document.getElementById('player-color')?.value || 'black';
    const playerOne = readPlayer('joueur');
    const playerTwo = readPlayer('joueurBlanc');
    setText('setup-error', '');

    if (!playerOne) {
        window.location.href = '/';
        return;
    }

    if (opponentType === 'connected') {
        if (!isRegisteredPlayer(playerOne)) {
            setText('setup-error', 'Le mode invité ne permet pas un second joueur connecté.');
            return;
        }
        if (!isRegisteredPlayer(playerTwo)) {
            setText('setup-error', 'Connectez le joueur 2 avant de continuer.');
            return;
        }
        sessionStorage.setItem('gameMode', 'human');
    } else if (opponentType === 'ai') {
        sessionStorage.setItem('gameMode', 'ai');
        sessionStorage.setItem('aiDifficulty', document.getElementById('ai-difficulty')?.value || 'medium');
        sessionStorage.removeItem('joueurBlanc');
    } else {
        sessionStorage.setItem('gameMode', 'human');
        sessionStorage.removeItem('joueurBlanc');
    }

    sessionStorage.setItem('playerColor', selectedColor);
    // En quittant setup pour lancer une nouvelle partie, on annule tout contexte de reprise.
    sessionStorage.removeItem('resumeFromPause');
    sessionStorage.removeItem('pauseGameSnapshot');
    sessionStorage.removeItem('statsOrigin');
    sessionStorage.setItem('gameElapsedSeconds', '0');

    window.location.href = '/grille.html';
}

initSetup();