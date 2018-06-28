jQuery(async $ => {
  const [, width, height] = (location.search.match(/\bsize=(\d+)x(\d+)/) || [, 4, 4]).map(Number);
  const table = [];

  for (let y = 0; y < height; y++) {
    const row = [];

    for (let x = 0; x < width ; x++) {
      row.push({ x, y, last: (x + 1) * (y + 1)  });
    }

    table.push(row);
  }

  // const nyan = $(`<div class="nyan" data-x="${x}" data-y="${y}">`);
});
