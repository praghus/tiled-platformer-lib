
export class Viewport { 
    public width = 0
    public height = 0
    public scale = 0
    public resolutionX = 0
    public resolutionY = 0
    
    constructor (
        private cols: number,
        private rows: number
    ) {
        this.calculateSize()
    }
    
    calculateSize (): void {
        const width = window.innerWidth
        const height =  window.innerHeight

        this.scale = width > height
            ? Math.round(height / this.rows)
            : Math.round(width / this.cols)
    
        this.width = width < this.cols * this.scale ? width : this.cols * this.scale
        this.height = height < this.rows * this.scale ? height : this.rows * this.scale
        
        this.resolutionX = Math.round(this.width / this.scale)
        this.resolutionY = Math.round(this.height / this.scale)
    }
}
