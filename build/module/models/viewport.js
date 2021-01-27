export class Viewport {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.width = 0;
        this.height = 0;
        this.scale = 0;
        this.resolutionX = 0;
        this.resolutionY = 0;
        this.calculateSize();
    }
    calculateSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.scale = width > height
            ? Math.round(height / this.rows)
            : Math.round(width / this.cols);
        this.width = width < this.cols * this.scale ? width : this.cols * this.scale;
        this.height = height < this.rows * this.scale ? height : this.rows * this.scale;
        this.resolutionX = Math.round(this.width / this.scale);
        this.resolutionY = Math.round(this.height / this.scale);
    }
}
