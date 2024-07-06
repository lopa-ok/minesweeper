document.addEventListener('DOMContentLoaded', () => {
    const gameSize = 10;  
    const mineCount = 10;  

    const game = document.getElementById('game');
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    const restartButton = document.getElementById('restart-button');

    game.style.gridTemplateColumns = `repeat(${gameSize}, 40px)`;

    let firstClick = true; 

    
    const board = Array(gameSize).fill().map(() => Array(gameSize).fill({}));

    
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * gameSize);
        const col = Math.floor(Math.random() * gameSize);
        if (!board[row][col].isMine) {
            board[row][col] = { isMine: true, isOpen: false, isFlagged: false };
            minesPlaced++;
        }
    }

    
    function calculateMines() {
        for (let row = 0; row < gameSize; row++) {
            for (let col = 0; col < gameSize; col++) {
                if (!board[row][col].isMine) {
                    let mineCount = 0;
                    for (let r = -1; r <= 1; r++) {
                        for (let c = -1; c <= 1; c++) {
                            if (row + r >= 0 && row + r < gameSize && col + c >= 0 && col + c < gameSize) {
                                if (board[row + r][col + c].isMine) {
                                    mineCount++;
                                }
                            }
                        }
                    }
                    board[row][col] = { isMine: false, isOpen: false, isFlagged: false, mineCount };
                }
            }
        }
    }

    calculateMines();

    
    for (let row = 0; row < gameSize; row++) {
        for (let col = 0; col < gameSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            game.appendChild(cell);

            cell.addEventListener('click', (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                if (firstClick) {
                    if (board[row][col].isMine) {
                        moveMine(row, col);
                    }
                    firstClick = false;
                }
                openCell(row, col);
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                toggleFlag(row, col);
            });
        }
    }

    function moveMine(row, col) {
        
        let newRow, newCol;
        do {
            newRow = Math.floor(Math.random() * gameSize);
            newCol = Math.floor(Math.random() * gameSize);
        } while (board[newRow][newCol].isMine || (newRow === row && newCol === col));

        board[row][col].isMine = false;
        board[newRow][newCol].isMine = true;

        calculateMines();
    }

    function openCell(row, col) {
        const cell = game.children[row * gameSize + col];
        if (board[row][col].isOpen || board[row][col].isFlagged) return;
        board[row][col].isOpen = true;

        if (board[row][col].isMine) {
            cell.classList.add('open');
            cell.textContent = '💣';
            revealMines();
            endGame(false);
        } else {
            cell.classList.add('open');
            cell.textContent = board[row][col].mineCount || '';
            if (board[row][col].mineCount === 0) {
                openEmptyCells(row, col);
            }
            checkWin();
        }
    }

    function openEmptyCells(row, col) {
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        directions.forEach(([r, c]) => {
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < gameSize && newCol >= 0 && newCol < gameSize) {
                if (!board[newRow][newCol].isOpen && !board[newRow][newCol].isMine) {
                    openCell(newRow, newCol);
                }
            }
        });
    }

    function toggleFlag(row, col) {
        const cell = game.children[row * gameSize + col];
        if (board[row][col].isOpen) return;
        board[row][col].isFlagged = !board[row][col].isFlagged;
        if (board[row][col].isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        } else {
            cell.classList.remove('flagged');
            cell.textContent = '';
        }
    }

    function revealMines() {
        for (let row = 0; row < gameSize; row++) {
            for (let col = 0; col < gameSize; col++) {
                if (board[row][col].isMine && !board[row][col].isFlagged) {
                    const cell = game.children[row * gameSize + col];
                    cell.classList.add('open');
                    cell.textContent = '💣';
                }
            }
        }
    }

    function endGame(win) {
        endMessage.textContent = win ? 'You Win!' : 'Game Over!';
        endScreen.classList.remove('hidden');
    }

    function checkWin() {
        let won = true;
        for (let row = 0; row < gameSize; row++) {
            for (let col = 0; col < gameSize; col++) {
                if (!board[row][col].isMine && !board[row][col].isOpen) {
                    won = false;
                    break;
                }
            }
        }
        if (won) endGame(true);
    }

    restartButton.addEventListener('click', () => {
        location.reload();
    });
});
