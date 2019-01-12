function solve(board) {
  const queue = [board.player];
  const memo = new Map();

  while (queue.length) {
    const cell = queue.shift();
    memo.set(cell, true);
    queue.push(...cell.around.filter(c => c && !memo.has(c)));
  }
}

solve(window.board);
