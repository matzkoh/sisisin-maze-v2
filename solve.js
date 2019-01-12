function solve(board) {
  const queue = [board.player];
  const memo = new Map();

  while (queue.length) {
    const cell = queue.shift();
    memo.set(cell, true);
    queue.push(...cell.around.filter(c => c && !memo.has(c)).map(c => [cell, c]));
  }
}

solve(window.board);
