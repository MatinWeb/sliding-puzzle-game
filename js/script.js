// Define the game board class
class GameBoard {
  constructor(rows, cols, tileSize) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;
    this.tiles = new Array(rows);
    for (let i = 0; i < rows; i++) {
      this.tiles[i] = new Array(cols).fill(null);
    }
    this.emptyTileRow = null;
    this.emptyTileCol = null;
  }

  // Create the HTML elements for the game board
  createBoardElements() {
    const boardEl = document.querySelector("#board");
    boardEl.style.width = `${this.cols * this.tileSize}px`;
    boardEl.style.height = `${this.rows * this.tileSize}px`;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const tileEl = document.createElement("div");
        tileEl.classList.add("tile");
        tileEl.style.width = `${this.tileSize}px`;
        tileEl.style.height = `${this.tileSize}px`;
        tileEl.style.lineHeight = `${this.tileSize}px`;
        tileEl.style.fontSize = `${this.tileSize / 2}px`;
        tileEl.dataset.row = i;
        tileEl.dataset.col = j;
        tileEl.textContent = this.tiles[i][j];
        if (this.tiles[i][j] === null) {
          tileEl.classList.add("empty");
        }
        boardEl.appendChild(tileEl);
      }
    }
  }

  // Randomize the tiles on the board
  randomizeTiles() {
    const nums = [...Array(this.rows * this.cols - 1).keys()].map((i) => i + 1);
    nums.push(null);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.tiles[i][j] = nums[i * this.cols + j];
        if (this.tiles[i][j] === null) {
          this.emptyTileRow = i;
          this.emptyTileCol = j;
        }
      }
    }
  }

  // Swap the position of two tiles on the board
  swapTiles(row1, col1, row2, col2) {
    [this.tiles[row1][col1], this.tiles[row2][col2]] = [
      this.tiles[row2][col2],
      this.tiles[row1][col1],
    ];
    const tile1 = document.querySelector(
      `.tile[data-row="${row1}"][data-col="${col1}"]`
    );
    const tile2 = document.querySelector(
      `.tile[data-row="${row2}"][data-col="${col2}"]`
    );
    [tile1.textContent, tile2.textContent] = [
      tile2.textContent,
      tile1.textContent,
    ];
    if (this.tiles[row1][col1] === null) {
      [this.emptyTileRow, this.emptyTileCol] = [row1, col1];
      tile1.classList.add("empty");
      tile2.classList.remove("empty");
    } else if (this.tiles[row2][col2] === null) {
      [this.emptyTileRow, this.emptyTileCol] = [row2, col2];
      tile2.classList.add("empty");
      tile1.classList.remove("empty");
    }
  }

  // Move the empty tile in the specified direction, if possible
  moveEmptyTile(direction) {
    switch (direction) {
      case "up":
        if (this.emptyTileRow > 0) {
          this.swapTiles(
            this.emptyTileRow,
            this.emptyTileCol,
            this.emptyTileRow - 1,
            this.emptyTileCol
          );
        }
        break;
      case "down":
        if (this.emptyTileRow < this.rows - 1) {
          this.swapTiles(
            this.emptyTileRow,
            this.emptyTileCol,
            this.emptyTileRow + 1,
            this.emptyTileCol
          );
        }
        break;
      case "left":
        if (this.emptyTileCol > 0) {
          this.swapTiles(
            this.emptyTileRow,
            this.emptyTileCol,
            this.emptyTileRow,
            this.emptyTileCol - 1
          );
        }
        break;
      case "right":
        if (this.emptyTileCol < this.cols - 1) {
          this.swapTiles(
            this.emptyTileRow,
            this.emptyTileCol,
            this.emptyTileRow,
            this.emptyTileCol + 1
          );
        }
        break;
    }
  }

  // Check if the board is in a valid (solvable) configuration
  isSolvable() {
    let inversions = 0;
    for (let i = 0; i < this.rows * this.cols; i++) {
      const tileValue = this.tiles[Math.floor(i / this.cols)][i % this.cols];
      if (tileValue === null) {
        continue;
      }
      for (let j = i + 1; j < this.rows * this.cols; j++) {
        const otherValue = this.tiles[Math.floor(j / this.cols)][j % this.cols];
        if (otherValue !== null && otherValue < tileValue) {
          inversions += 1;
        }
      }
    }
    if (this.rows % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRowFromBottom = this.rows - this.emptyTileRow;
      return (inversions + emptyRowFromBottom) % 2 === 1;
    }
  }

  // Check if the board is in the winning configuration
  isSolved() {
    let rowCounter = 1;
    for (let i = 0; i < this.rows; i++) {
      let colCounter = 1;
      for (let j = 0; j < this.cols; j++) {
        if (this.tiles[i][j] !== i * this.cols + j + 1) {
          if (
            rowCounter === this.rows &&
            i === this.rows - 1 &&
            colCounter === this.cols &&
            j === this.cols - 1
          ) {
            if (!this.tiles[i][j]) return true;
          }
          return false;
        } else {
          colCounter++;
        }
      }
      rowCounter++;
    }
    return true;
  }
}

// Define the game class
class Game {
  constructor(board) {
    this.board = board;
    this.board.randomizeTiles();
    while (!this.board.isSolvable()) {
      this.board.randomizeTiles();
    }
    this.board.createBoardElements();
    this.addEventListeners();
  }

  addEventListeners() {
    const boardEl = document.querySelector("#board");
    boardEl.addEventListener("click", (event) => {
      const clickedTile = event.target;
      if (
        clickedTile.classList.contains("tile") &&
        !clickedTile.classList.contains("empty")
      ) {
        const row = parseInt(clickedTile.dataset.row);
        const col = parseInt(clickedTile.dataset.col);
        if (
          row === this.board.emptyTileRow &&
          (col === this.board.emptyTileCol - 1 ||
            col === this.board.emptyTileCol + 1)
        ) {
          const direction = col < this.board.emptyTileCol ? "left" : "right";
          this.board.moveEmptyTile(direction);
        } else if (
          col === this.board.emptyTileCol &&
          (row === this.board.emptyTileRow - 1 ||
            row === this.board.emptyTileRow + 1)
        ) {
          const direction = row < this.board.emptyTileRow ? "up" : "down";
          this.board.moveEmptyTile(direction);
        }
        if (this.board.isSolved()) {
          setTimeout(() => {
            alert("Congratulations! You solved the puzzle!");
          }, 0);
        }
      }
    });
  }
}

// Create a new game with a 4x4 board and 100px tile size
const game = new Game(new GameBoard(4, 4, 100));
