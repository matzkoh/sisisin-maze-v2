function solve(board) {
  const queue = [[board.player, null]];
  const memo = new Map();

  while (queue.length) {
    const [cell, prev] = queue.shift();
    if (cell === board.goal) {
      break;
    }
    if (memo.has(cell)) {
      continue;
    }
    memo.set(cell, prev);
    queue.push(...cell.around.filter(c => c && c.isPath && !memo.has(c)).map(c => [c, cell]));
  }
}

solve(window.board);
