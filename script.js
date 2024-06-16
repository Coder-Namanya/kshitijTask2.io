document.addEventListener("DOMContentLoaded", () => {
    const boardSizes = [3, 4, 5, 6, 7, 8, 9, 10];
    let currentBoardSize = 3;
    let currentPlayer = "X";
    let player1Name = "Player 1"; // Default names
    let player2Name = "Player 2";
    let gameState = [];
    let isGameActive = true;
    let resetTimeoutId;
    let player1Score = 0; // Initialize scores
    let player2Score = 0;
    let soloMode = false; // Flag for solo mode

    const board = document.querySelector("#board");
    const status = document.querySelector("#status");
    const turnIndicator = document.querySelector("#turnIndicator");
    const resetButton = document.querySelector("#resetButton");
    const resetModal = document.querySelector("#resetModal");
    const closeModal = document.querySelector(".close");
    const confirmResetButton = document.querySelector("#confirmResetButton");
    const cancelResetButton = document.querySelector("#cancelResetButton");
    const boardSizeSelector = document.querySelector("#boardSizeSelector");
    const player1ScoreDisplay = document.querySelector("#player1Score"); // Display elements for scores
    const player2ScoreDisplay = document.querySelector("#player2Score");
    const resetScoresButton = document.querySelector("#resetScoresButton");
    const toggleModeButton = document.querySelector("#toggleModeButton");
    const modeIndicator = document.querySelector("#modeIndicator");

    // Load scores from localStorage on page load
    initializeScores();

    // Initialize the game with default board size
    initializeGame(currentBoardSize);

    // Function to initialize the game with a specific board size
    function initializeGame(size) {
        currentBoardSize = size;
        gameState = Array.from({ length: currentBoardSize * currentBoardSize }, () => "");
        isGameActive = true;
        renderBoard();
        currentPlayer = "X"; // Reset current player to "X"
        turnIndicator.innerText = `${player1Name}'s turn`; // Update turn indicator with player's name
        status.innerText = ""; // Clear status message
        document.body.style.backgroundColor = "#09011e"; // Reset background color
    }

    // Function to render the game board
    function renderBoard() {
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${currentBoardSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${currentBoardSize}, 1fr)`;

        for (let i = 0; i < currentBoardSize * currentBoardSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.setAttribute("data-index", i);
            cell.innerText = gameState[i];
            cell.addEventListener("click", handleCellClick);
            board.appendChild(cell);
        }
    }

    // Event listener for cell clicks
    function handleCellClick(event) {
        const clickedCell = event.target;
        const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[cellIndex] !== "" || !isGameActive) {
            return;
        }

        if (!soloMode) {
            // Normal mode: Human vs Human
            gameState[cellIndex] = currentPlayer;
            clickedCell.innerText = currentPlayer;
            clickedCell.classList.add(currentPlayer === "X" ? "x-cell" : "o-cell");

            if (checkWin()) {
                handleGameEnd();
            } else if (checkTie()) {
                handleGameTie();
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                turnIndicator.innerText = `${currentPlayer === "X" ? player1Name : player2Name}'s turn`; // Update turn indicator with player's name
            }
        } else {
            // Solo mode: Human vs Computer
            gameState[cellIndex] = "X";
            clickedCell.innerText = "X";
            clickedCell.classList.add("x-cell");

            if (checkWin()) {
                handleGameEnd();
            } else if (checkTie()) {
                handleGameTie();
            } else {
                // Make computer move
                makeComputerMove();
            }
        }
    }

    // Function for the computer to make a move
    function makeComputerMove() {
        if (!isGameActive) {
            return;
        }

        // Find all empty cells
        const emptyCells = gameState.reduce((acc, cell, index) => {
            if (cell === "") {
                acc.push(index);
            }
            return acc;
        }, []);

        // Randomly choose an empty cell
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cellIndex = emptyCells[randomIndex];

        // Make the move
        gameState[cellIndex] = "O";
        const computerCell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        computerCell.innerText = "O";
        computerCell.classList.add("o-cell");

        if (checkWin()) {
            handleGameEnd();
        } else if (checkTie()) {
            handleGameTie();
        } else {
            currentPlayer = "X";
            turnIndicator.innerText = `${player1Name}'s turn`; // Update turn indicator with player's name
        }
    }

    // Function to handle game end (win)
    function handleGameEnd() {
        status.innerText = `${currentPlayer === "X" ? player1Name : player2Name} wins! 🎉`; // Update win message
        turnIndicator.innerText = "";
        highlightWinningCells();
        isGameActive = false;
        // Change background color based on winner
        document.body.style.backgroundColor = currentPlayer === "X" ? "#8b0000" : "#00008b";
        updateScores(currentPlayer); // Update scores
        resetTimeoutId = setTimeout(() => {
            resetGame();
        }, 5000);
    }

    // Function to handle game tie
    function handleGameTie() {
        status.innerText = "It's a tie! 🤝";
        turnIndicator.innerText = "";
        isGameActive = false;
        // Change background color for tie
        document.body.style.backgroundColor = "#8b008b";
        resetTimeoutId = setTimeout(() => {
            resetGame();
        }, 5000);
    }

    // Function to check for a win
    function checkWin() {
        // Check rows
        for (let i = 0; i < currentBoardSize; i++) {
            const start = i * currentBoardSize;
            if (checkLine(start, 1)) return true;
        }
        // Check columns
        for (let i = 0; i < currentBoardSize; i++) {
            if (checkLine(i, currentBoardSize)) return true;
        }
        // Check diagonals
        if (checkLine(0, currentBoardSize + 1)) return true;
        if (checkLine(currentBoardSize - 1, currentBoardSize - 1)) return true;
        return false;
    }

    // Function to check for a win in a specific line
    function checkLine(startIndex, step) {
        const symbol = gameState[startIndex];
        if (symbol === "") return false;
        for (let i = 1; i < currentBoardSize; i++) {
            if (gameState[startIndex + i * step] !== symbol) return false;
        }
        return true;
    }

    // Function to check for a tie
    function checkTie() {
        return gameState.every(cell => cell !== "");
    }

    // Function to highlight winning cells
    function highlightWinningCells() {
        const winningLines = [];

        // Check rows
        for (let i = 0; i < currentBoardSize; i++) {
            const start = i * currentBoardSize;
            if (checkLine(start, 1)) {
                winningLines.push([...Array(currentBoardSize).keys()].map(j => start + j));
            }
        }

        // Check columns
        for (let i = 0; i < currentBoardSize; i++) {
            if (checkLine(i, currentBoardSize)) {
                winningLines.push([...Array(currentBoardSize).keys()].map(j => i + j * currentBoardSize));
            }
        }

        // Check diagonals
        if (checkLine(0, currentBoardSize + 1)) {
            winningLines.push([...Array(currentBoardSize).keys()].map(j => j * (currentBoardSize + 1)));
        }
        if (checkLine(currentBoardSize - 1, currentBoardSize - 1)) {
            winningLines.push([...Array(currentBoardSize).keys()].map(j => (j + 1) * (currentBoardSize - 1)));
        }

        // Highlight cells
        winningLines.forEach(line => {
            line.forEach(index => {
                document.querySelector(`.cell[data-index="${index}"]`).classList.add("highlight");
            });
        });
    }

    // Function to reset the game
    function resetGame() {
        clearTimeout(resetTimeoutId);
        status.innerText = "";
        initializeGame(currentBoardSize);
        document.body.style.backgroundColor = "#09011e"; // Reset background color
    }

    function resetScores() {
        player1Score = 0;
        player2Score = 0;
        player1ScoreDisplay.innerText = `${player1Name}: ${player1Score}`;
        player2ScoreDisplay.innerText = `${player2Name}: ${player2Score}`;

        document.body.style.backgroundColor = "#09011e"; 
        saveScoresToLocalStorage(); // Optional: Save scores to localStorage after resetting
    }

    // Function to update scores and save to localStorage
    function updateScores(winner) {
        if (winner === "X") {
            player1Score++; // Increase player 1 score
        } else {
            player2Score++; // Increase player 2 score
        }
        player1ScoreDisplay.innerText = `${player1Name}: ${player1Score}`;
        player2ScoreDisplay.innerText = `${player2Name}: ${player2Score}`;

        // Save scores to localStorage
        saveScoresToLocalStorage();
    }

    // Function to save scores to localStorage
    function saveScoresToLocalStorage() {
        localStorage.setItem("player1Score", player1Score);
        localStorage.setItem("player2Score", player2Score);
    }

    // Function to load scores from localStorage
    function initializeScores() {
        player1Score = parseInt(localStorage.getItem("player1Score")) || 0;
        player2Score = parseInt(localStorage.getItem("player2Score")) || 0;

        player1ScoreDisplay.innerText = `${player1Name}: ${player1Score}`;
        player2ScoreDisplay.innerText = `${player2Name}: ${player2Score}`;
    }

    // Event listener for reset button click
    resetButton.addEventListener("click", () => {
        resetModal.style.display = "block";
        clearTimeout(resetTimeoutId);
    });

    // Event listener for modal close button click
    closeModal.addEventListener("click", () => {
        resetModal.style.display = "none";
    });

    // Event listener for confirm reset button click
    confirmResetButton.addEventListener("click", () => {
        resetModal.style.display = "none";
        resetGame();
    });

    // Event listener for cancel reset button click
    cancelResetButton.addEventListener("click", () => {
        resetModal.style.display = "none";
    });

    // Event listener for modal backdrop click
    window.onclick = (event) => {
        if (event.target === resetModal) {
            resetModal.style.display = "none";
        }
    };

    // Event listener for board size selector change
    boardSizeSelector.addEventListener("change", (event) => {
        const newSize = parseInt(event.target.value);
        clearTimeout(resetTimeoutId); // Clear any existing timeout

        if (currentBoardSize !== newSize) {
            initializeGame(newSize); // Reset game immediately if not active and size changed
        }
    });

    // Event listener for reset scores button click
    resetScoresButton.addEventListener("click", () => {
        resetScores();
    });

    // Event listener for toggle mode button click
    toggleModeButton.addEventListener("click", () => {
        soloMode = !soloMode;
        toggleModeButton.innerText = soloMode ? "Switch to Normal Mode" : "Switch to Solo Mode";
        modeIndicator.innerText = soloMode ? "Solo Mode" : "Normal Mode";

        // Change background color if in solo mode
        document.body.style.backgroundColor = soloMode ? "#808080" : "#09011e";

        resetGame(); // Reset the game when toggling modes
    });

    // Example: Allow users to change player names and reset the game
    const changeNameButton = document.querySelector("#changeNameButton");

    changeNameButton.addEventListener("click", () => {
        const newName1 = prompt("Enter new name for Player 1:");
        const newName2 = prompt("Enter new name for Player 2:");

        if (newName1 && newName1.trim() !== "") {
            player1Name = newName1.trim();
        }
        if (newName2 && newName2.trim() !== "") {
            player2Name = newName2.trim();
        }

        // Reset scores to 0
        player1Score = 0;
        player2Score = 0;

        // Update score displays
        player1ScoreDisplay.innerText = `${player1Name}: ${player1Score}`;
        player2ScoreDisplay.innerText = `${player2Name}: ${player2Score}`;

        // Initialize game with new names
        initializeGame(currentBoardSize);
    });
});



