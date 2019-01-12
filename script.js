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

class Board extends Array {
  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;

    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++)
        this.push(new Cell(this, x, y, Cell.Player));
  }

  init() {
    const points = [];
  }

  getCell(x, y) {
    return this[y * this.width + x];
  }
}

class Cell {
  constructor(board, x, y, type) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.type = type;
  }
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
