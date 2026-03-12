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

function bindEnterToSubmit() {
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;

        const activeForm = document.querySelector('.auth-form:not(.d-none)');
        const focused = document.activeElement;
        if (!activeForm || !focused || !activeForm.contains(focused)) return;

        event.preventDefault();
        submitActiveForm();
    });
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
        motDePasse: document.getElementById('reg-mdp').value
    };

    if (!body.pseudo || !body.motDePasse) {
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

function openHomeDialog(dialog) {
    if (!dialog) return;

    if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
            dialog.showModal();
        }
        return;
    }

    dialog.setAttribute('open', 'open');
}

function closeHomeDialog(dialog) {
    if (!dialog) return;

    if (typeof dialog.close === 'function') {
        if (dialog.open) {
            dialog.close();
        }
        return;
    }

    dialog.removeAttribute('open');
}

function initRuleDialog() {
    const ruleButton = document.getElementById('home-rule-link');
    const ruleDialog = document.getElementById('home-rule-dialog');
    const ruleDialogContent = document.getElementById('home-rule-dialog-content');

    if (!ruleButton || !ruleDialog || !ruleDialogContent) {
        return;
    }

    async function loadRules() {
        if (ruleDialogContent.innerHTML) return;

        try {
            const response = await fetch('/rule.html');
            const html = await response.text();
            ruleDialogContent.innerHTML = html;

            const closeBtn = document.createElement('button');
            closeBtn.id = 'home-rule-close';
            closeBtn.type = 'button';
            closeBtn.textContent = 'Fermer';
            closeBtn.addEventListener('click', () => {
                closeHomeDialog(ruleDialog);
            });
            ruleDialogContent.appendChild(closeBtn);
        } catch {
            ruleDialogContent.innerHTML = '<p>Erreur lors du chargement des règles.</p>';
        }
    }

    ruleButton.addEventListener('click', async () => {
        await loadRules();
        openHomeDialog(ruleDialog);
    });

    ruleDialog.addEventListener('click', (event) => {
        if (event.target === ruleDialog) {
            closeHomeDialog(ruleDialog);
        }
    });
}

bindEnterToSubmit();
initRuleDialog();

