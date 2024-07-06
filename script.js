document.addEventListener('DOMContentLoaded', () => {
    const gameSize = 10;  
    const mineCount = 10;  

    const game = document.getElementById('game');
    game.style.gridTemplateColumns = `repeat(${gameSize}, 40px)`;

    
    const board = Array(gameSize).fill().map(() => Array(gameSize).fill({}));
    
    
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * gameSize);
        const col = Math.floor(Math.random() * gameSize);
        if (!board[row][col].isMine) {
            board[row][col] = { isMine: true, isOpen: false };
            minesPlaced++;
        }
    }

    
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
                board[row][col] = { isMine: false, isOpen: false, mineCount };
            }
        }
    }

    
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
                openCell(row, col);
            });
        }
    }

    function openCell(row, col) {
        const cell = game.children[row * gameSize + col];
        if (board[row][col].isOpen) return;
        board[row][col].isOpen = true;

        if (board[row][col].isMine) {
            cell.classList.add('open')
            cell.textContent = '💣';
            alert('Game Over!');
        } else {
            cell.classList.add('open');
            cell.textContent = board[row][col].mineCount || '';
            if (board[row][col].mineCount === 0) {
                for (let r = -1; r <= 1; r++) {
                    for (let c = -1; c <= 1; c++) {
                        if (row + r >= 0 && row + r < gameSize && col + c >= 0 && col + c < gameSize) {
                            openCell(row + r, col + c);
                        }
                    }
                }
            }
        }
    }
});
