function solve(board) {
  const queue = [[board.player]];
  const memo = new Map();

  while (queue.length) {
    const [cell, prevCell] = queue.shift();
    memo.set(cell, prevCell);
    queue.push(...cell.around.filter(c => c && !memo.has(c)).map(c => [cell, c]));
  }
}

solve(window.board);
