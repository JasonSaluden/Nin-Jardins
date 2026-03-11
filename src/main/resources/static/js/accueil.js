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
        });
    });

    if (difficultySelect) {
        difficultySelect.addEventListener('change', saveSelectedAIDifficulty);
    }

    saveSelectedGameMode();
    saveSelectedAIDifficulty();
    syncDifficultyAvailability();
}

async function login(e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

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
        saveSelectedGameMode();
        window.location.href = '/grille.html';
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
    saveSelectedGameMode();
    window.location.href = '/grille.html';
}

initGameModeSelector();
