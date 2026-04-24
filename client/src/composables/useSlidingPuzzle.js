import { ref, onUnmounted } from 'vue';

export function useSlidingPuzzle() {
  const board = ref([]);
  const size = ref(3);
  const moves = ref(0);
  const startTime = ref(null);
  const elapsedTime = ref(0);
  const timerInterval = ref(null);
  const isGameActive = ref(false);
  const isWon = ref(false);
  const showHint = ref(false);
  const hintsRemaining = ref(5);
  const isSolving = ref(false);
  const solutionPath = ref([]); // Stores the sequence of tile VALUES to move

  const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

  const initGame = (newSize = 3) => {
    size.value = newSize;
    moves.value = 0;
    elapsedTime.value = 0;
    isGameActive.value = true;
    isWon.value = false;
    isSolving.value = false;
    stopTimer();
    
    board.value = generateSolvableBoard(newSize);
    startTimer();
  };

  const generateSolvableBoard = (s) => {
    let newBoard = Array.from({ length: s * s }, (_, i) => (i + 1) % (s * s));
    let emptyIndex = newBoard.indexOf(0);
    const shuffleMoves = s * s * 30;
    const valuesMoved = [];

    for (let i = 0; i < shuffleMoves; i++) {
      const neighbors = [];
      const row = Math.floor(emptyIndex / s);
      const col = emptyIndex % s;
      if (row > 0) neighbors.push(emptyIndex - s);
      if (row < s - 1) neighbors.push(emptyIndex + s);
      if (col > 0) neighbors.push(emptyIndex - 1);
      if (col < s - 1) neighbors.push(emptyIndex + 1);

      const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
      const tileValue = newBoard[randomNeighborIndex];
      
      valuesMoved.push(tileValue);

      [newBoard[emptyIndex], newBoard[randomNeighborIndex]] = [newBoard[randomNeighborIndex], newBoard[emptyIndex]];
      emptyIndex = randomNeighborIndex;
    }
    
    solutionPath.value = valuesMoved.reverse();
    return isAlreadySolved(newBoard) ? generateSolvableBoard(s) : newBoard;
  };

  const isAlreadySolved = (flatBoard) => {
    for (let i = 0; i < flatBoard.length - 1; i++) {
      if (flatBoard[i] !== i + 1) return false;
    }
    return flatBoard[flatBoard.length - 1] === 0;
  };

  const moveTile = (index, isAuto = false) => {
    if (!isGameActive.value && !isAuto) return;
    if (isWon.value) return;
    if (isSolving.value && !isAuto) return;

    const emptyIndex = board.value.indexOf(0);
    const row = Math.floor(index / size.value);
    const col = index % size.value;
    const emptyRow = Math.floor(emptyIndex / size.value);
    const emptyCol = emptyIndex % size.value;

    const isAdjacent = (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );

    if (isAdjacent) {
      [board.value[index], board.value[emptyIndex]] = [board.value[emptyIndex], board.value[index]];
      if (!isAuto) moves.value++;
      moveSound.play().catch(() => {});
      checkWin(isAuto);
    }
  };

  const checkWin = (isAuto = false) => {
    if (isAlreadySolved(board.value)) {
      isWon.value = true;
      isGameActive.value = false;
      isSolving.value = false;
      winSound.play().catch(() => {});
      stopTimer();
    }
  };

  const startTimer = () => {
    startTime.value = Date.now();
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  const toggleHint = () => {
    if (!showHint.value && hintsRemaining.value > 0) {
      showHint.value = true;
      hintsRemaining.value--;
      setTimeout(() => { showHint.value = false; }, 3000);
    } else {
      showHint.value = false;
    }
  };

  const solveFast = async () => {
    if (isSolving.value || isWon.value) return;
    
    isSolving.value = true;
    isGameActive.value = false;
    stopTimer();

    alert("SYSTEM OVERRIDE: YOU FAILED TO SOLVE IT MANUALLY. AUTO-SOLVING...");

    for (const tileValue of solutionPath.value) {
      if (!isSolving.value) break;
      
      const currentTileIndex = board.value.indexOf(tileValue);
      moveTile(currentTileIndex, true);
      
      // Delay for animation effect
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  onUnmounted(() => {
    stopTimer();
  });

  return {
    board, size, moves, elapsedTime, isGameActive, isWon, showHint, hintsRemaining, isSolving,
    initGame, moveTile, toggleHint, solveFast
  };
}
