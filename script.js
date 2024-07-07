document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    const restartButton = document.getElementById('restart-button');
    const timerElement = document.getElementById('timer');

    let firstClick = true; 
    let timerInterval;
    let timeElapsed = 0;
    let gameSize, mineCount;

    const difficultyButtons = {
        easy: { size: 10, mines: 10 },
        medium: { size: 12, mines: 20 },
        hard: { size: 16, mines: 40 }
    };

    Object.keys(difficultyButtons).forEach(level => {
        document.getElementById(level).addEventListener('click', () => {
            startGame(difficultyButtons[level].size, difficultyButtons[level].mines);
        });
    });

    function startGame(size, mines) {
        gameSize = size;
        mineCount = mines;
        firstClick = true;
        timeElapsed = 0;
        clearInterval(timerInterval);
        timerElement.textContent = `Time: 0s`;

        game.innerHTML = '';
        game.style.gridTemplateColumns = `repeat(${gameSize}, 40px)`;
        endScreen.classList.add('hidden');

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
                        startTimer();
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
            clearInterval(timerInterval);
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

        function startTimer() {
            timerInterval = setInterval(() => {
                timeElapsed++;
                timerElement.textContent = `Time: ${timeElapsed}s`;
            }, 1000);
        }

        restartButton.addEventListener('click', () => {
            location.reload();
        });
    }
});
