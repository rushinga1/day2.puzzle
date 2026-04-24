import { ref, computed } from 'vue';

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

  const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

  const initGame = (newSize = 3) => {
    size.value = newSize;
    moves.value = 0;
    elapsedTime.value = 0;
    isGameActive.value = true;
    isWon.value = false;
    stopTimer();
    
    board.value = generateSolvableBoard(newSize);
    startTimer();
  };

  const generateSolvableBoard = (s) => {
    let newBoard;
    do {
      newBoard = Array.from({ length: s * s }, (_, i) => (i + 1) % (s * s));
      for (let i = newBoard.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBoard[i], newBoard[j]] = [newBoard[j], newBoard[i]];
      }
    } while (!isSolvable(newBoard, s) || isAlreadySolved(newBoard));
    
    return newBoard;
  };

  const isSolvable = (flatBoard, s) => {
    let invCount = 0;
    for (let i = 0; i < flatBoard.length - 1; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] && flatBoard[j] && flatBoard[i] > flatBoard[j]) {
          invCount++;
        }
      }
    }

    if (s % 2 !== 0) {
      return invCount % 2 === 0;
    } else {
      const emptyIndex = flatBoard.indexOf(0);
      const emptyRowFromBottom = s - Math.floor(emptyIndex / s);
      if (emptyRowFromBottom % 2 === 0) {
        return invCount % 2 !== 0;
      } else {
        return invCount % 2 === 0;
      }
    }
  };

  const isAlreadySolved = (flatBoard) => {
    for (let i = 0; i < flatBoard.length - 1; i++) {
      if (flatBoard[i] !== i + 1) return false;
    }
    return flatBoard[flatBoard.length - 1] === 0;
  };

  const moveTile = (index) => {
    if (!isGameActive.value || isWon.value) return;

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
      moves.value++;
      moveSound.play().catch(() => {});
      checkWin();
    }
  };

  const checkWin = () => {
    if (isAlreadySolved(board.value)) {
      isWon.value = true;
      isGameActive.value = false;
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
      
      // Auto-hide hint after 3 seconds
      setTimeout(() => {
        showHint.value = false;
      }, 3000);
    } else {
      showHint.value = false;
    }
  };

  return {
    board,
    size,
    moves,
    elapsedTime,
    isGameActive,
    isWon,
    showHint,
    hintsRemaining,
    initGame,
    moveTile,
    toggleHint
  };
}
