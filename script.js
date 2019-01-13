/* global Vue:false */

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

Vue.component('modal-alert', {
  template: `
    <transition name="modal">
      <div class="modal" @click="$emit('close')">
        <div class="modal-container" @click.stop>
          <slot/>
        </div>
      </div>
    </transition>
  `,

  mounted() {
    document.body.appendChild(this.$el);
  },
});

class Board {
  constructor(width, height) {
    this.list = [];
    this.width = width;
    this.height = height;
    this.start = null;
    this.goal = null;
    this.player = null;
    this.init();
  }

  init() {
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++)
        this.list.push(new Cell(this, x, y, Cell.Wall));

    let next;
    let dir;

    const points = [this.getCell(this.width - 2, 1).dig()];

    while (next || points.length) {
      const cell = next || points.splice(points.length * Math.random() | 0, 1)[0];
      const targets = cell.around
        .filter(c => c && c.isWall && 2 < c.around.filter(c => c && c.isWall).length);

      if (!targets.length) {
        next = null;
        continue;
      }

      next = targets[targets.length * Math.random() | 0];
      next.dig();

      if (1 < targets.length) {
        points.push(cell);
      }
    }

    this.goal = this.getCell(this.width - 2, 0);
    this.goal.dig();

    let start = this.getCell(1, this.height - 2);
    while (true) {
      if (start.isPath) {
        break;
      } else {
        start = start.right;
      }
    }

    this.start = start.bottom;
    this.setPlayer(this.start);
  }

  getCell(x, y) {
    return x < 0 || this.width <= x || y < 0 || this.height <= y
      ? null
      : this.list[y * this.width + x];
  }

  setPlayer(cell) {
    if (this.player) {
      this.player.type = Cell.Path;
    }
    cell.type = Cell.Player;
    this.player = cell;
  }

  movePlayerTop() {
    const cell = this.player.top;
    if (cell && cell.isPath) {
      this.setPlayer(cell);
    }
  }

  movePlayerRight() {
    const cell = this.player.right;
    if (cell && cell.isPath) {
      this.setPlayer(cell);
    }
  }

  movePlayerBottom() {
    const cell = this.player.bottom;
    if (cell && cell.isPath) {
      this.setPlayer(cell);
    }
  }

  movePlayerLeft() {
    const cell = this.player.left;
    if (cell && cell.isPath) {
      this.setPlayer(cell);
    }
  }

  solve() {
    const queue = [[null, this.player, null]];
    const memo = new Map();

    while (queue.length) {
      const [prev, cell, dir] = queue.shift();
      memo.set(cell, [prev, dir]);
      if (cell === this.goal) {
        break;
      }
      queue.push(...cell.around
        .map((c, dir) => c && c.isPath && !memo.has(c) && [cell, c, dir])
        .filter(Boolean));
    }

    const dirs = [];
    let cell = this.goal;

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
}

class Cell {
  constructor(board, x, y, type) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.type = type;
  }

  dig() {
    this.type = Cell.Path;
    return this;
  }

  getNeighborByDir(dir) {
    switch (+dir) {
      case 0: return this.top;
      case 1: return this.right;
      case 2: return this.bottom;
      case 3: return this.left;
      default: throw new Error(`invalid dir: ${dir}`);
    }
  }

  get top() { return this.board.getCell(this.x, this.y - 1); }
  get right() { return this.board.getCell(this.x + 1, this.y); }
  get bottom() { return this.board.getCell(this.x, this.y + 1); }
  get left() { return this.board.getCell(this.x - 1, this.y); }
  get around() { return [this.top, this.right, this.bottom, this.left]; }

  get isPath() { return this.type === Cell.Path; }
  get isWall() { return this.type === Cell.Wall; }
  get isPlayer() { return this.type === Cell.Player; }
}

Cell[Cell.Path = 0] = 'Path';
Cell[Cell.Wall = 1] = 'Wall';
Cell[Cell.Player = 2] = 'Player';

new Vue({
  el: '#app',

  data() {
    const board = new Board(9, 9);

    return {
      started: false,
      finished: false,
      modalShown: false,
      retryShown: false,
      startedAt: 0,
      endedAt: 0,
      board,
    };
  },

  computed: {
    time() {
      const ms = this.endedAt - this.startedAt;
      const minutes = `${ms / 1000 / 60 | 0}`.padStart(2, '0');
      const seconds = `${ms / 1000 % 60 | 0}`.padStart(2, '0');
      const mseconds = `${ms % 1000}`.padStart(3, '0');
      return `${minutes}:${seconds}.${mseconds}`;
    },
  },

  mounted() {
    $(document).on('keydown', event => this.onKeyDown(event));
  },

  destroyed() {
    $(document).off('keydown');
  },

  methods: {
    onKeyDown(event) {
      if (this.finished) {
        return;
      }

      switch (event.key) {
        case 'w':
          this.board.movePlayerTop();
          break;

        case 'd':
          this.board.movePlayerRight();
          break;

        case 's':
          this.board.movePlayerBottom();
          break;

        case 'a':
          this.board.movePlayerLeft();
          break;

        case 'Enter':
          this.startAutoSolve();
          break;

        default:
          return;
      }

      if (!this.started) {
        this.start();
      }

      if (this.board.player.y === 0) {
        this.finish();
      }
    },

    async startAutoSolve() {
      const dirs = this.board.solve();
      const keys = 'wdsa';
      const quickness = 50 + Math.random() * 50;

      for (const dir of dirs) {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {key: keys[dir]})
        );

        await wait(quickness);
      }
    },

    start() {
      this.startedAt = Date.now();
      this.started = true;
    },

    async finish() {
      this.endedAt = Date.now();
      this.finished = true;

      await this.openModal();

      this.retryShown = true;
    },

    async openModal() {
      this.modalShown = true;

      await new Promise(resolve => this.$once('modalClosing', resolve));

      this.modalShown = false;
    },

    retry() {
      Object.assign(this.$data, this.$options.data.call(this));
    },
  },
});
