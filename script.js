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

new Vue({
  el: '#app',

  data() {
    const [, sizeW, sizeH] = (location.search.match(/\bsize=(\d+)x(\d+)/) || [, 4, 4]).map(n => Math.max(n, 2));

    return {
      finished: false,
      modalShown: false,
      retryShown: false,
      sizeW,
      sizeH,
      width: 80,
      height: 80,
      blankX: sizeW - 1,
      blankY: sizeH - 1,
      startedAt: 0,
      endedAt: 0,
      count: 0,
      nyans: [],
    };
  },

  computed: {
    simeStyle() {
      return {
        width: `${this.width * this.sizeW}px`,
        height: `${this.height * this.sizeH}px`,
      };
    },
    size() {
      return `${this.sizeW}x${this.sizeH}`;
    },
    time() {
      return ((this.endedAt - this.startedAt) / 1000).toFixed(2);
    },
  },

  created() {
    const {sizeW: w, sizeH: h, nyans} = this;

    // 初期化
    for (let i = 0; i < w * h - 1; i++) {
      const x = i % w;
      const y = i / w | 0;
      nyans.push({x0: x, y0: y, x, y});
    }

    do {
      // シャッフル
      for (let i = 0; i < w * h * 10; i++) {
        const {blankX, blankY} = this;
        const arr = nyans.filter(n => n.x === blankX && n.y !== blankY || n.y === blankY && n.x !== blankX);
        const nyan = arr[Math.random() * arr.length | 0];
        this.move(nyan);
      }

      // 右下をあける
      for (let y = this.blankY; y < h; y++) {
        const nyan = nyans.find(n => n.x === w - 1 && n.y === y);
        if (nyan)
          this.move(nyan);
      }
    } while (this.check());
  },

  mounted() {
    this.startedAt = Date.now();
  },

  methods: {
    getNyanStyle(nyan) {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: `${this.width * nyan.x}px`,
        top: `${this.height * nyan.y}px`,
        backgroundSize: `${this.width * this.sizeW}px ${this.height * this.sizeH}px`,
        backgroundPosition: `-${this.width * nyan.x0}px -${this.height * nyan.y0}px`,
      };
    },

    check() {
      const w = this.sizeW;
      return this.nyans.every(({x, y}, i) => x === i % w && y === (i / w | 0));
    },

    move(nyan) {
      const {x, y} = nyan;
      const {blankX, blankY, nyans} = this;

      if (x === blankX && y !== blankY) {
        for (const n of nyans) {
          if (n.x !== x)
            continue;

          if (y < blankY) {
            if (y <= n.y && n.y < blankY)
              n.y++;
          } else {
            if (blankY < n.y && n.y <= y)
              n.y--;
          }
        }
      } else if (y === blankY && x !== blankX) {
        for (const n of nyans) {
          if (n.y !== y)
            continue;

          if (x < blankX) {
            if (x <= n.x && n.x < blankX)
              n.x++;
          } else {
            if (blankX < n.x && n.x <= x)
              n.x--;
          }
        }
      } else {
        return;
      }

      this.blankX = x;
      this.blankY = y;
    },

    click(nyan) {
      if (this.finished)
        return;

      const {x, y} = nyan;

      this.move(nyan);
      this.count++;

      if (this.check())
        this.finish();
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
