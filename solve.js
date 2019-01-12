function solve(board) {
  const queue = [[null, board.player, null]];
  const memo = new Map();

  while (queue.length) {
    const [prev, cell, dir] = queue.shift();
    memo.set(cell, [prev, dir]);
    if (cell === board.goal) {
      break;
    }
    queue.push(...cell.around
      .map((c, dir) => c && c.isPath && !memo.has(c) && [cell, c, dir])
      .filter(Boolean));
  }

  const dirs = [];
  let cell = board.goal;

  while (cell) {
    const [prev, dir] = memo.get(cell);
    if (!prev) {
      break;
    }
    dirs.unshift(dir);
    cell = prev;
  }

  return dirs;
}

console.log(solve(window.board));
