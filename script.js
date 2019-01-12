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

    this.init();
  }

  async init() {
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++)
        this.list.push(new Cell(this, x, y, Cell.Wall));

    this.getCell(1, this.height - 1).dig();

    let next;
    let dir;

    const points = [this.getCell(1, this.height - 2).dig()];

    while (next || points.length) {
      // await wait(0);

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

    let goal = this.getCell(this.width - 2, 1);
    while (true) {
      if (goal.isPath) {
        goal.top.dig();
        break;
      } else {
        goal = goal.left;
      }
    }
  }

  getCell(x, y) {
    return x < 0 || this.width <= x || y < 0 || this.height <= y
      ? null
      : this.list[y * this.width + x];
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
    return {
      finished: false,
      modalShown: false,
      retryShown: false,
      startedAt: 0,
      endedAt: 0,
      board: new Board(15, 15),
    };
  },

  computed: {
  },

  created() {
  },

  mounted() {
  },

  methods: {
    check() {
    },

    move() {
    },

    async openModal() {
      this.modalShown = true;

      await new Promise(resolve => this.$once('modalClosing', resolve));

      this.modalShown = false;
    },

    async finish() {
      this.finished = true;
      this.endedAt = Date.now();

      await wait(500);

      this.nyans.push({
        x0: this.blankX,
        y0: this.blankY,
        x: this.blankX,
        y: this.blankY,
      });

      await wait(1000);

      await this.openModal();

      this.retryShown = true;
    },

    retry() {
      Object.assign(this.$data, this.$options.data.call(this));
      this.$options.created.forEach(fn => fn.call(this));
      this.$options.mounted.forEach(fn => fn.call(this));
    },
  },
});
