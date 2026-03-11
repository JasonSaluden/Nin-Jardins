function readCurrentPlayer() {
    try {
        const raw = sessionStorage.getItem('joueur');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function hasRegisteredPlayer(player) {
    return Boolean(player && Number.isInteger(player.id) && !player.guest);
}

function initBackButton() {
    const link = document.getElementById('back-to-game-link');
    if (!link) {
        return;
    }

    const statsOrigin = sessionStorage.getItem('statsOrigin');
    const fromGame = statsOrigin === 'game' && sessionStorage.getItem('resumeFromPause') === 'true';

    if (fromGame) {
        link.href = '/pause.html';
        link.textContent = 'Retour à la partie';
        return;
    }

    link.href = '/setup.html';
    link.textContent = 'Configurer une partie';
}

let currentStats = null;

function readCandidatePlayers() {
    return ['joueur', 'joueurBlanc']
        .map(key => readCurrentPlayerByKey(key))
        .filter((player, index, array) => hasRegisteredPlayer(player)
            && array.findIndex(candidate => candidate.id === player.id) === index);
}

function readCurrentPlayerByKey(key) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function showGuestState() {
    document.getElementById('guest-state')?.classList.remove('hidden');
    document.getElementById('stats-content')?.classList.add('hidden');
    document.getElementById('stats-subtitle').textContent = 'Connectez-vous pour débloquer votre historique.';
}

function fillText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatResultLabel(resultat) {
    if (resultat === 'victoire') return 'Victoire';
    if (resultat === 'defaite') return 'Défaite';
    return 'Égalité';
}

function renderHistory(items) {
    const body = document.getElementById('history-body');
    const empty = document.getElementById('history-empty');
    const count = document.getElementById('history-count');
    if (!body || !empty) return;

    body.innerHTML = '';

    if (!items.length) {
        empty.classList.remove('hidden');
        if (count) {
            count.textContent = '0 partie visible avec les filtres actifs.';
        }
        return;
    }

    empty.classList.add('hidden');
    if (count) {
        count.textContent = `${items.length} partie(s) visible(s) avec les filtres actifs.`;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.datePartie || '-'}</td>
            <td>${item.mode} <span class="muted">${item.difficulte}</span></td>
            <td>${item.adversaire}</td>
            <td>${item.couleur}</td>
            <td><span class="badge ${item.resultat}">${formatResultLabel(item.resultat)}</span></td>
            <td>${item.scoreJoueur} - ${item.scoreAdversaire}</td>
            <td>${item.duree}</td>
        `;
        body.appendChild(row);
    });
}

function renderStats(stats) {
    currentStats = stats;
    fillText('stats-title', `Statistiques de ${stats.pseudo}`);
    fillText('stats-subtitle', `${stats.totalParties} partie(s) enregistrée(s).`);
    fillText('metric-total', stats.totalParties);
    fillText('metric-rate', `${stats.tauxVictoire} %`);
    fillText('metric-average', stats.scoreMoyen);
    fillText('metric-best', stats.meilleurScore);
    fillText('summary-wins', stats.victoires);
    fillText('summary-losses', stats.defaites);
    fillText('summary-draws', stats.egalites);
    fillText('summary-black', stats.victoiresNoir);
    fillText('summary-white', stats.victoiresBlanc);
    applyHistoryFilters();

    document.getElementById('guest-state')?.classList.add('hidden');
    document.getElementById('stats-content')?.classList.remove('hidden');
}

function applyHistoryFilters() {
    if (!currentStats) {
        return;
    }

    const mode = document.getElementById('filter-mode')?.value || 'all';
    const result = document.getElementById('filter-result')?.value || 'all';
    const difficulty = document.getElementById('filter-difficulty')?.value || 'all';

    const filtered = (currentStats.historique || []).filter(item => {
        const modeMatch = mode === 'all' || item.mode === mode;
        const resultMatch = result === 'all' || item.resultat === result;
        const difficultyMatch = difficulty === 'all' || item.difficulte === difficulty;
        return modeMatch && resultMatch && difficultyMatch;
    });

    renderHistory(filtered);
}

function populatePlayerSelect() {
    const select = document.getElementById('player-select');
    if (!select) {
        return;
    }

    const players = readCandidatePlayers();
    select.innerHTML = '';

    players.forEach(player => {
        const option = document.createElement('option');
        option.value = String(player.id);
        option.textContent = player.pseudo;
        select.appendChild(option);
    });

    select.disabled = players.length <= 1;
}

async function loadStats(playerId) {
    const player = readCurrentPlayer();
    const candidatePlayers = readCandidatePlayers();
    if (!hasRegisteredPlayer(player)) {
        showGuestState();
        return;
    }

    try {
        const idToLoad = playerId || candidatePlayers[0]?.id || player.id;
        const response = await fetch(`/api/players/${idToLoad}/stats`);
        if (!response.ok) {
            throw new Error(await response.text());
        }

        const stats = await response.json();
        const select = document.getElementById('player-select');
        if (select) {
            select.value = String(idToLoad);
        }
        renderStats(stats);
    } catch (error) {
        showGuestState();
        fillText('stats-subtitle', 'Impossible de charger les statistiques pour le moment.');
    }
}

function initFilters() {
    ['filter-mode', 'filter-result', 'filter-difficulty'].forEach(id => {
        const element = document.getElementById(id);
        element?.addEventListener('change', applyHistoryFilters);
    });

    document.getElementById('player-select')?.addEventListener('change', event => {
        loadStats(Number(event.target.value));
    });
}

populatePlayerSelect();
initFilters();
initBackButton();
loadStats();