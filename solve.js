function solve(board) {
  const queue = [[board.player, null]];
  const memo = new Map();

  while (queue.length) {
    const [cell, prev] = queue.shift();
    memo.set(cell, prev);
    if (cell === board.goal) {
      break;
    }
    queue.push(...cell.around
      .map((c, dir) => c && c.isPath && !memo.has(c) && [c, cell, dir])
      .filter(Boolean));
  }

  const dir = [];
  let cell = board.goal;
  while (cell) {
    const prev = memo.get(cell);
    const dx = cell.x - prev.x;
    const dy = cell.y - prev.y;
    dir.unshift(dx + 1 + 2 - dy);
    cell = prev;
  }
}

solve(window.board);
