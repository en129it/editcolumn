export class TableModel {
    private data: Array<Object>;
    
    constructor() {
        this.data = new Array<Object>();
    }

    getRows(): Array<Object> {
        return this.data;
    }

    addRow(row : Object) {
        this.data.push(row);
    }

    getRowCount(): number {
        return this.data.length;
    }
}