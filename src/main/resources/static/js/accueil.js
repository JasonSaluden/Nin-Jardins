function showTab(tab, btn) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('d-none'));
    document.querySelectorAll('#authTabs .nav-link').forEach(t => t.classList.remove('active'));

    document.getElementById(tab).classList.remove('d-none');
    btn.classList.add('active');
}

function getSelectedGameMode() {
    const checked = document.querySelector('input[name="game-mode"]:checked');
    return checked ? checked.value : 'human';
}

function saveSelectedGameMode() {
    sessionStorage.setItem('gameMode', getSelectedGameMode());
}

function readStoredPlayer(key = 'joueur') {
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

function getSelectedAIDifficulty() {
    const select = document.getElementById('ai-difficulty');
    return select ? select.value : 'medium';
}

function saveSelectedAIDifficulty() {
    sessionStorage.setItem('aiDifficulty', getSelectedAIDifficulty());
}

function syncDifficultyAvailability() {
    const select = document.getElementById('ai-difficulty');
    const wrapper = document.getElementById('difficulty-wrapper');
    if (!select || !wrapper) return;

    const vsAI = getSelectedGameMode() === 'ai';
    select.disabled = !vsAI;
    wrapper.classList.toggle('opacity-50', !vsAI);
}

function syncSessionPanel() {
    const primary = readStoredPlayer('joueur');
    const secondary = readStoredPlayer('joueurBlanc');
    const humanMode = getSelectedGameMode() === 'human';

    const playerOneName = document.getElementById('player-one-name');
    const playerOneMeta = document.getElementById('player-one-meta');
    const logoutPrimaryButton = document.getElementById('logout-primary');
    if (playerOneName && playerOneMeta && logoutPrimaryButton) {
        if (isRegisteredPlayer(primary)) {
            playerOneName.textContent = primary.pseudo;
            playerOneMeta.textContent = primary.mail || 'Compte connecté';
            logoutPrimaryButton.classList.remove('d-none');
        } else {
            playerOneName.textContent = 'Aucun joueur connecté';
            playerOneMeta.textContent = 'Connectez-vous pour enregistrer vos parties.';
            logoutPrimaryButton.classList.add('d-none');
        }
    }

    const secondPanel = document.getElementById('second-player-panel');
    const playerTwoName = document.getElementById('player-two-name');
    const playerTwoMeta = document.getElementById('player-two-meta');
    const logoutSecondaryButton = document.getElementById('logout-secondary');
    const secondForm = document.getElementById('second-player-form');

    if (secondPanel) {
        secondPanel.classList.toggle('d-none', !humanMode || !isRegisteredPlayer(primary));
    }

    if (playerTwoName && playerTwoMeta && logoutSecondaryButton && secondForm) {
        if (humanMode && isRegisteredPlayer(secondary)) {
            playerTwoName.textContent = secondary.pseudo;
            playerTwoMeta.textContent = secondary.mail || 'Compte connecté';
            logoutSecondaryButton.classList.remove('d-none');
            secondForm.classList.add('d-none');
        } else {
            playerTwoName.textContent = 'Aucun joueur connecté';
            playerTwoMeta.textContent = 'Connectez le second joueur pour enregistrer l\'historique des deux côtés.';
            logoutSecondaryButton.classList.add('d-none');
            secondForm.classList.remove('d-none');
        }
    }
}

function initGameModeSelector() {
    const savedMode = sessionStorage.getItem('gameMode') || 'human';
    const savedDifficulty = sessionStorage.getItem('aiDifficulty') || 'medium';

    const modeInput = document.querySelector(`input[name="game-mode"][value="${savedMode}"]`);
    if (modeInput) modeInput.checked = true;

    const difficultySelect = document.getElementById('ai-difficulty');
    if (difficultySelect) difficultySelect.value = savedDifficulty;

    document.querySelectorAll('input[name="game-mode"]').forEach(input => {
        input.addEventListener('change', () => {
            saveSelectedGameMode();
            syncDifficultyAvailability();
            if (getSelectedGameMode() === 'ai') {
                sessionStorage.removeItem('joueurBlanc');
            }
            syncSessionPanel();
        });
    });

    if (difficultySelect) {
        difficultySelect.addEventListener('change', saveSelectedAIDifficulty);
    }

    saveSelectedGameMode();
    saveSelectedAIDifficulty();
    syncDifficultyAvailability();
    syncSessionPanel();
}

async function login(e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');
    errorEl.textContent = '';
    successEl.textContent = '';

    const body = {
        pseudo: document.getElementById('login-pseudo').value,
        motDePasse: document.getElementById('login-mdp').value
    };

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            errorEl.textContent = await res.text();
            return;
        }

        const joueur = await res.json();
        sessionStorage.setItem('joueur', JSON.stringify(joueur));
        if (readStoredPlayer('joueurBlanc')?.id === joueur.id) {
            sessionStorage.removeItem('joueurBlanc');
        }
        saveSelectedGameMode();
        successEl.textContent = 'Joueur noir connecté. Vous pouvez lancer une partie.';
        syncSessionPanel();
    } catch (err) {
        errorEl.textContent = 'Erreur de connexion au serveur.';
    }
}

async function loginSecondPlayer(e) {
    e.preventDefault();
    const errorEl = document.getElementById('second-error');
    const successEl = document.getElementById('second-success');
    const primary = readStoredPlayer('joueur');
    errorEl.textContent = '';
    successEl.textContent = '';

    if (!isRegisteredPlayer(primary)) {
        errorEl.textContent = 'Connectez d\'abord le joueur noir.';
        return;
    }

    const body = {
        pseudo: document.getElementById('second-pseudo').value,
        motDePasse: document.getElementById('second-mdp').value
    };

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            errorEl.textContent = await res.text();
            return;
        }

        const joueur = await res.json();
        if (joueur.id === primary.id) {
            errorEl.textContent = 'Le joueur blanc doit être différent du joueur noir.';
            return;
        }

        sessionStorage.setItem('joueurBlanc', JSON.stringify(joueur));
        document.getElementById('second-player-form').reset();
        successEl.textContent = 'Joueur blanc connecté.';
        syncSessionPanel();
    } catch (err) {
        errorEl.textContent = 'Erreur de connexion au serveur.';
    }
}

async function register(e) {
    e.preventDefault();
    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');
    errorEl.textContent = '';
    successEl.textContent = '';

    const body = {
        pseudo: document.getElementById('reg-pseudo').value,
        mail: document.getElementById('reg-mail').value,
        motDePasse: document.getElementById('reg-mdp').value
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            errorEl.textContent = await res.text();
            return;
        }

        successEl.textContent = 'Compte créé ! Vous pouvez vous connecter.';
        document.getElementById('inscription').reset();
    } catch (err) {
        errorEl.textContent = 'Erreur de connexion au serveur.';
    }
}

function playAsGuest() {
    sessionStorage.setItem('joueur', JSON.stringify({ pseudo: 'Invité', guest: true }));
    sessionStorage.removeItem('joueurBlanc');
    saveSelectedGameMode();
    window.location.href = '/grille.html';
}

function logoutPrimary() {
    sessionStorage.removeItem('joueur');
    sessionStorage.removeItem('joueurBlanc');
    const successEl = document.getElementById('login-success');
    const errorEl = document.getElementById('login-error');
    if (successEl) successEl.textContent = '';
    if (errorEl) errorEl.textContent = '';
    syncSessionPanel();
}

function logoutSecondary() {
    sessionStorage.removeItem('joueurBlanc');
    const successEl = document.getElementById('second-success');
    const errorEl = document.getElementById('second-error');
    if (successEl) successEl.textContent = '';
    if (errorEl) errorEl.textContent = '';
    syncSessionPanel();
}

function startSelectedGame() {
    const primary = readStoredPlayer('joueur');
    const secondary = readStoredPlayer('joueurBlanc');
    const launchError = document.getElementById('launch-error');
    if (launchError) {
        launchError.textContent = '';
    }

    if (!isRegisteredPlayer(primary)) {
        if (launchError) {
            launchError.textContent = 'Connectez le joueur noir pour lancer une partie enregistrée.';
        }
        return;
    }

    if (getSelectedGameMode() === 'human' && !isRegisteredPlayer(secondary)) {
        if (launchError) {
            launchError.textContent = 'Connectez aussi le joueur blanc pour enregistrer l\'historique des deux joueurs.';
        }
        return;
    }

    saveSelectedGameMode();
    saveSelectedAIDifficulty();
    window.location.href = '/grille.html';
}

initGameModeSelector();
