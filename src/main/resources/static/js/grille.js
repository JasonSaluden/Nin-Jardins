
// Get all grid cases
const cases = document.querySelectorAll('.case');

// Define background styles for different states
const backgroundStyles = {
    empty: 'url(/img/empty.png)',
    white: 'url(/img/white-piece.png)',
    black: 'url(/img/black-piece.png)',
    playable: '#90EE90' // Light green for playable cases
};

// Current player (white or black)
let currentPlayer = 'black';

// Convert case ID (A1) to grid coordinates
function getCaseCoordinates(caseId) {
    const col = caseId.charCodeAt(0) - 65; // A=0, B=1, ..., H=7
    const row = parseInt(caseId.substring(1)) - 1; // 1-8 to 0-7
    return { row, col };
}

// Convert grid coordinates to case ID
function getCoordinatesToCaseId(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return String.fromCharCode(65 + col) + (row + 1);
}

// Get case element by coordinates
function getCaseByCoordinates(row, col) {
    const caseId = getCoordinatesToCaseId(row, col);
    return caseId ? document.getElementById(caseId) : null;
}

// Get piece state from a case
function getPieceState(caseElement) {
    return caseElement?.dataset?.state || 'empty';
}

// Check if a move is valid for current player at given coordinates
function isValidMove(row, col, playerColor) {
    const caseElement = getCaseByCoordinates(row, col);
    if (!caseElement || getPieceState(caseElement) !== 'empty') {
        return false;
    }

    const opponent = playerColor === 'white' ? 'black' : 'white';
    
    // Check all 8 directions
    const directions = [
        { dr: -1, dc: 0 },  // up
        { dr: 1, dc: 0 },   // down
        { dr: 0, dc: -1 },  // left
        { dr: 0, dc: 1 },   // right
        { dr: -1, dc: -1 }, // up-left
        { dr: -1, dc: 1 },  // up-right
        { dr: 1, dc: -1 },  // down-left
        { dr: 1, dc: 1 }    // down-right
    ];

    for (const dir of directions) {
        let r = row + dir.dr;
        let c = col + dir.dc;
        let hasOpponent = false;

        // Count consecutive opponent pieces
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const piece = getPieceState(getCaseByCoordinates(r, c));
            
            if (piece === 'empty') {
                break; // Empty space, direction is invalid
            } else if (piece === opponent) {
                hasOpponent = true;
            } else if (piece === playerColor) {
                // Found own piece after opponent pieces
                if (hasOpponent) {
                    return true; // Valid move
                }
                break;
            }

            r += dir.dr;
            c += dir.dc;
        }
    }

    return false;
}

// Highlight all valid moves for current player
function highlightValidMoves(playerColor) {
    // Clear previous highlights
    cases.forEach(caseEl => {
        if (caseEl.classList.contains('playable')) {
            caseEl.classList.remove('playable');
            caseEl.style.backgroundColor = '';
        }
    });

    // Check all empty cases
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col, playerColor)) {
                const caseElement = getCaseByCoordinates(row, col);
                caseElement.classList.add('playable');
                caseElement.style.backgroundColor = backgroundStyles.playable;
            }
        }
    }
}

// Add click event listener to each case
cases.forEach(caseElement => {
    caseElement.addEventListener('click', function() {
        const { row, col } = getCaseCoordinates(this.id);
        
        // Check if it's a valid move
        if (this.classList.contains('playable') && isValidMove(row, col, currentPlayer)) {
            // Place the current player's piece
            this.style.backgroundImage = backgroundStyles[currentPlayer];
            this.dataset.state = currentPlayer;
            this.classList.remove('playable');
            this.style.backgroundColor = '';

            // Switch player and highlight new valid moves
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            highlightValidMoves(currentPlayer);
        }
    });
});

// Initial highlight for starting player
highlightValidMoves(currentPlayer);
