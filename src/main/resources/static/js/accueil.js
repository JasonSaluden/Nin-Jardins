function showTab(tab, btn) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('d-none'));
    document.querySelectorAll('#authTabs .nav-link').forEach(t => t.classList.remove('active'));

    document.getElementById(tab).classList.remove('d-none');
    btn.classList.add('active');
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
    window.location.href = '/grille.html';
}
