function showTab(tab, btn) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('d-none'));
    document.querySelectorAll('#authTabs .nav-link').forEach(t => t.classList.remove('active'));

    document.getElementById(tab).classList.remove('d-none');
    btn.classList.add('active');

    const labels = { connexion: 'Se connecter', inscription: "S'inscrire" };
    document.getElementById('submit-btn').textContent = labels[tab];
}

function submitActiveForm() {
    const active = document.querySelector('.auth-form:not(.d-none)');
    if (active) active.requestSubmit();
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

function resetGameSetup() {
    sessionStorage.removeItem('joueurBlanc');
    sessionStorage.setItem('gameMode', 'human');
    sessionStorage.setItem('aiDifficulty', 'medium');
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
        resetGameSetup();
        successEl.textContent = 'Connexion réussie. Redirection vers la configuration...';
        window.location.href = '/setup.html';
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
    resetGameSetup();
    window.location.href = '/setup.html';
}

