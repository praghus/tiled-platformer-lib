"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = void 0;
class Viewport {
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
exports.Viewport = Viewport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvbW9kZWxzL3ZpZXdwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLE1BQWEsUUFBUTtJQU9qQixZQUNZLElBQVksRUFDWixJQUFZO1FBRFosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVE7UUFSakIsVUFBSyxHQUFHLENBQUMsQ0FBQTtRQUNULFdBQU0sR0FBRyxDQUFDLENBQUE7UUFDVixVQUFLLEdBQUcsQ0FBQyxDQUFBO1FBQ1QsZ0JBQVcsR0FBRyxDQUFDLENBQUE7UUFDZixnQkFBVyxHQUFHLENBQUMsQ0FBQTtRQU1sQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDeEIsQ0FBQztJQUVELGFBQWE7UUFDVCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFBO1FBQy9CLE1BQU0sTUFBTSxHQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUE7UUFFbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsTUFBTTtZQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUUvRSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzNELENBQUM7Q0FDSjtBQTVCRCw0QkE0QkMifQ==