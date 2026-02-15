const gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'x',
    gameMode: null, 
    gameActive: true,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    stats: {
        player1Wins: 0,
        player2Wins: 0,
        draws: 0,
        gamesPlayed: 0
    }
};

const menuScreen = document.getElementById('menuScreen');
const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const resultModal = document.getElementById('resultModal');

const singlePlayerBtn = document.getElementById('singlePlayerBtn');
const twoPlayerBtn = document.getElementById('twoPlayerBtn');
const setupForm = document.getElementById('setupForm');
const backBtn = document.getElementById('backBtn');
const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const quitBtn = document.getElementById('quitBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');

const player1Label = document.getElementById('player1Label');
const player2Label = document.getElementById('player2Label');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const player2Group = document.getElementById('player2Group');

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

singlePlayerBtn.addEventListener('click', () => startSetup('single'));
twoPlayerBtn.addEventListener('click', () => startSetup('two-player'));
backBtn.addEventListener('click', goToMenu);
setupForm.addEventListener('submit', startGame);
quitBtn.addEventListener('click', goToMenu);
resetStatsBtn.addEventListener('click', resetStats);
playAgainBtn.addEventListener('click', resetBoard);
mainMenuBtn.addEventListener('click', goToMenu);

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function startSetup(mode) {
    gameState.gameMode = mode;
    
    if (mode === 'single') {
        player2Group.style.display = 'none';
        player2NameInput.value = 'Computer';
        player1NameInput.value = 'Player 1';
    } else {
        player2Group.style.display = 'block';
        player2NameInput.value = 'Player 2';
        player1NameInput.value = 'Player 1';
    }
    
    showScreen(setupScreen);
}

function startGame(e) {
    e.preventDefault();
    
    gameState.player1Name = player1NameInput.value.trim() || 'Player 1';
    gameState.player2Name = player2NameInput.value.trim() || 
        (gameState.gameMode === 'single' ? 'Computer' : 'Player 2');
    
    player1Label.textContent = gameState.player1Name;
    player2Label.textContent = gameState.player2Name;
    
    resetBoard();
    showScreen(gameScreen);
    updateCurrentPlayerDisplay();
}

function goToMenu() {
    showScreen(menuScreen);
    closeResultModal();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    if (gameState.board[index] !== null || !gameState.gameActive) {
        return;
    }
    
    gameState.board[index] = gameState.currentPlayer;
    cell.textContent = gameState.currentPlayer.toUpperCase();
    cell.classList.add(gameState.currentPlayer);
    
    if (checkWin()) {
        endGame(true);
        return;
    }
    
    if (checkDraw()) {
        endGame(false);
        return;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 'x' ? 'o' : 'x';
    updateCurrentPlayerDisplay();
    
    if (gameState.gameMode === 'single' && gameState.currentPlayer === 'o') {
        disableBoardInteraction();
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    const availableMoves = gameState.board
        .map((val, idx) => val === null ? idx : null)
        .filter(val => val !== null);
    
    if (availableMoves.length === 0) return;
    
    const bestMove = minimax(gameState.board, gameState.currentPlayer, true).index;
    gameState.board[bestMove] = gameState.currentPlayer;
    
    const cell = document.querySelector(`[data-index="${bestMove}"]`);
    cell.textContent = 'O';
    cell.classList.add('o');
    
    if (checkWin()) {
        enableBoardInteraction();
        endGame(true);
        return;
    }
    
    if (checkDraw()) {
        enableBoardInteraction();
        endGame(false);
        return;
    }
    
    gameState.currentPlayer = 'x';
    updateCurrentPlayerDisplay();
    enableBoardInteraction();
}

function minimax(board, player, isMaximizing) {
    const availableMoves = board
        .map((val, idx) => val === null ? idx : null)
        .filter(val => val !== null);
    
    if (checkWinForPlayer(board, 'o')) {
        return { score: 10 };
    }
    if (checkWinForPlayer(board, 'x')) {
        return { score: -10 };
    }
    if (availableMoves.length === 0) {
        return { score: 0 };
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let move of availableMoves) {
            board[move] = 'o';
            const score = minimax(board, 'o', false).score;
            board[move] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return { score: bestScore, index: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove = null;
        
        for (let move of availableMoves) {
            board[move] = 'x';
            const score = minimax(board, 'x', true).score;
            board[move] = null;
            
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return { score: bestScore, index: bestMove };
    }
}

function checkWinForPlayer(board, player) {
    return winningCombinations.some(combination => {
        return combination.every(idx => board[idx] === player);
    });
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(idx => gameState.board[idx] === gameState.currentPlayer);
    });
}

function checkDraw() {
    return gameState.board.every(cell => cell !== null);
}

function endGame(isWin) {
    gameState.gameActive = false;
    
    gameState.stats.gamesPlayed++;
    
    if (isWin) {
        if (gameState.gameMode === 'single') {
            if (gameState.currentPlayer === 'x') {
                gameState.stats.player1Wins++;
                showResultModal(`${gameState.player1Name} Wins!`, `Congratulations! You defeated the computer!`);
            } else {
                gameState.stats.player2Wins++;
                showResultModal('Computer Wins!', `Better luck next time!`);
            }
        } else {
            const winner = gameState.currentPlayer === 'x' ? gameState.player1Name : gameState.player2Name;
            if (gameState.currentPlayer === 'x') {
                gameState.stats.player1Wins++;
            } else {
                gameState.stats.player2Wins++;
            }
            showResultModal(`${winner} Wins!`, `Congratulations!`);
        }
    } else {
        gameState.stats.draws++;
        showResultModal('It\'s a Draw!', 'Well played both players!');
    }
    
    updateStats();
}

function updateCurrentPlayerDisplay() {
    const playerName = gameState.currentPlayer === 'x' ? gameState.player1Name : gameState.player2Name;
    const currentPlayerEl = document.getElementById('currentPlayer');
    currentPlayerEl.textContent = `${playerName}'s Turn`;
}

function updateStats() {
    document.getElementById('player1Wins').textContent = gameState.stats.player1Wins;
    document.getElementById('player2Wins').textContent = gameState.stats.player2Wins;
    document.getElementById('drawCount').textContent = gameState.stats.draws;
    document.getElementById('gamesPlayed').textContent = gameState.stats.gamesPlayed;
}

function showResultModal(title, message) {
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;
    resultModal.classList.add('active');
}

function closeResultModal() {
    resultModal.classList.remove('active');
}

function resetBoard() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = 'x';
    gameState.gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    
    closeResultModal();
    enableBoardInteraction();
}

function resetStats() {
    if (confirm('Are you sure you want to reset all stats?')) {
        gameState.stats = {
            player1Wins: 0,
            player2Wins: 0,
            draws: 0,
            gamesPlayed: 0
        };
        updateStats();
    }
}

function disableBoardInteraction() {
    cells.forEach(cell => cell.classList.add('disabled'));
}

function enableBoardInteraction() {
    cells.forEach(cell => cell.classList.remove('disabled'));
}

updateStats();
