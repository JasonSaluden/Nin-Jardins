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
    const submitBtn = document.getElementById('submit-btn');
    errorEl.textContent = '';
    successEl.textContent = '';

    const body = {
        pseudo: document.getElementById('login-pseudo').value.trim(),
        motDePasse: document.getElementById('login-mdp').value
    };

    if (!body.pseudo || !body.motDePasse) {
        errorEl.textContent = 'Veuillez remplir tous les champs.';
        return;
    }

    submitBtn.disabled = true;
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
        successEl.textContent = 'Connexion réussie. Redirection...';
        window.location.href = '/setup.html';
    } catch {
        errorEl.textContent = 'Impossible de joindre le serveur.';
    } finally {
        submitBtn.disabled = false;
    }
}

async function register(e) {
    e.preventDefault();
    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');
    const submitBtn = document.getElementById('submit-btn');
    errorEl.textContent = '';
    successEl.textContent = '';

    const body = {
        pseudo: document.getElementById('reg-pseudo').value.trim(),
        mail: document.getElementById('reg-mail').value.trim(),
        motDePasse: document.getElementById('reg-mdp').value
    };

    if (!body.pseudo || !body.mail || !body.motDePasse) {
        errorEl.textContent = 'Veuillez remplir tous les champs.';
        return;
    }

    submitBtn.disabled = true;
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
    } catch {
        errorEl.textContent = 'Impossible de joindre le serveur.';
    } finally {
        submitBtn.disabled = false;
    }
}

function playAsGuest() {
    sessionStorage.setItem('joueur', JSON.stringify({ pseudo: 'Invité', guest: true }));
    resetGameSetup();
    window.location.href = '/setup.html';
}

