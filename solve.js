function solve(board) {
  const stack = [[board.player, null]];
  const memo = new Map();

  while (stack.length) {
    const [cell, prevCell] = stack.pop();
    memo.set(cell, prevCell);
    stack.push(...cell.around.filter(c => c && !memo.has(c)).map(c => [cell, c]));
  }
}

solve(window.board);
