import {Subject} from 'rxjs/Subject';

export enum ViewType {LEFT, VIEW, RIGHT};
export enum DataType {NUMERIC, STRING, DATE};

export class TableColumnMetadata {
    private tableMetadatas: Array<TableMetadata>;
    private src: TableColumnMetadata;
    private length: number;

    constructor(private id: number, private label: string, private propertyName: string, private preferredLength: number, private dataType: DataType) {
        this.tableMetadatas = new Array<TableMetadata>();
    }

    public getLabel(): string {
        return this.label;
    }

    public getPreferredLength(): number {
        return this.preferredLength;
    }

    public getLength(): number {
        return this.length;
    }

    public setLength(length: number): void {
        this.length = length;
    }

    public getValue(object: Object): any {
        return object[this.propertyName];
    }

    public getId(): number {
        return this.id;
    }

    public addTableMetadata(tableMetadata: TableMetadata) {
        if (this.tableMetadatas.indexOf(tableMetadata)==-1) {
            this.tableMetadatas.push(tableMetadata);
        }
    }

    public removeTableMetadata(tableMetadata: TableMetadata) {
        var index = this.tableMetadatas.indexOf(tableMetadata);
        if (index>-1) {
            this.tableMetadatas.splice(index, 1);
        }
    }

    public clone(): TableColumnMetadata {
        var rslt = new TableColumnMetadata(this.id, this.label, this.propertyName, this.length, this.dataType);
        rslt.src = this;
        return rslt;
    }

    public getDataType(): DataType {
        return this.dataType;
    }
    
    public toString(): string {
        return `(Column [id=${this.id}, label=${this.label}, propertyName=${this.propertyName}, length=${this.length}])`;
    }
}

export class TableViewMetadata {
    private columns: Array<TableColumnMetadata>;

    constructor(private viewType: ViewType) {
        this.columns = new Array<TableColumnMetadata>();
    }

    public addColumn(column: TableColumnMetadata, positionIndex: number): void {
        if (positionIndex!=null) {
            this.columns.splice(positionIndex, 0, column);
        } else {
            this.columns.push(column);
        }
    }

    public addColumnByTarget(column: TableColumnMetadata, targetColumn: TableColumnMetadata, isInsertBefore: boolean): void {
        var index = this.indexOfColumn(targetColumn);
        if (index>-1) {
            this.addColumn(column, index + (isInsertBefore ? 0 : 1));
        } else {
            this.addColumn(column, null);
        }
    }

    public removeColumn(column: TableColumnMetadata): boolean {
        let index = this.columns.indexOf(column);
        if (index>-1) {
            this.columns.splice(index, 1);
            return true;
        }
        return false;
    }

    public getColumns(): TableColumnMetadata[] {
        return this.columns;
    }

    public indexOfColumn(column: TableColumnMetadata): number {
        return (column!=null) ? this.columns.indexOf(column) : -1;
    }

    public isColumnAtExtrema(column: TableColumnMetadata, mustCheckForStartExtrema: boolean): boolean {
        var index = this.indexOfColumn(column);
        if (index>-1) {
            return mustCheckForStartExtrema ? (index==0) : (index==this.columns.length-1);
        }
        return false;
    }

    public getViewType(): ViewType {
        return this.viewType;
    }

    public getColumnById(id: number): TableColumnMetadata {
        for (var i=0; i<this.columns.length; i++) {
            if (this.columns[i].getId()==id) {
                return this.columns[i];
            }
        }
        return null;
    }

    public clearAll(tableMetadata: TableMetadata): void {
        this.columns.forEach(item => {
            item.removeTableMetadata(tableMetadata);
        });
        this.columns.splice(0, this.columns.length);
    }

    public getTotalColumnLength(isPreferredLength: boolean): number {
        var rslt = 0;
        this.columns.forEach(item => {
            rslt += ((isPreferredLength) ? item.getPreferredLength() : item.getLength());
        });
        return rslt;
    }

    public toString(): string {
        var rslt = "(View [";
        this.columns.forEach(function(item){
            rslt += item.toString() + " ";
        });
        rslt += "])";
        return rslt;
    }
}

export interface ITableMetadataListener {
    tableChangedEvent(): void;
}

export class TableMetadata {
    private leftRepeatableColumns: TableViewMetadata;
    private rightRepeatableColumns: TableViewMetadata;
    private views: Array<TableViewMetadata>;
    private modifListeners: Array<ITableMetadataListener>;
    private isModifListenerEnabled: boolean = true;

    constructor() {
        this.leftRepeatableColumns = new TableViewMetadata(ViewType.LEFT);
        this.rightRepeatableColumns = new TableViewMetadata(ViewType.RIGHT);
        this.views = new Array<TableViewMetadata>();
        this.modifListeners = new Array<ITableMetadataListener>();
    }

    public addColumn(column: TableColumnMetadata, viewIndex: number, indexInView: number): void {
        var view: TableViewMetadata = null;
        if (this.views.length==viewIndex) {
            view = new TableViewMetadata(ViewType.VIEW);
            this.views.push(view);
        } else {
            view = this.views[viewIndex];
        }

        view.addColumn(column, indexInView);        
        this.notifyListeners();
        column.addTableMetadata(this);
    }

    public removeColumn(column: TableColumnMetadata): boolean {
        if (this.removeColumnHelper(column)) {
            this.adjustViews();
            this.notifyListeners();
            return true;
        }
        return false;
    }

    private removeColumnHelper(column: TableColumnMetadata): boolean {
        if (column!=null) {
            column.removeTableMetadata(this);
            var rslt = this.views.some(item => {
                return item.removeColumn(column);
            });
            if (!rslt) {
                rslt = this.leftRepeatableColumns.removeColumn(column);
                if (!rslt) {
                    rslt = this.rightRepeatableColumns.removeColumn(column);
                }
            }
            return rslt;
        } else {
            return false;
        }
    }

    public moveColumn(column: TableColumnMetadata, viewType: ViewType, viewIndex: number, indexInView: number): void {
        var srcView = this.getViewOfColumn(column);

        var targetView: TableViewMetadata = null;
        var isNewTargetView = false;
        switch (viewType) {
            case ViewType.LEFT: 
                targetView = this.leftRepeatableColumns;
                break;
            case ViewType.RIGHT: 
                targetView = this.rightRepeatableColumns;
                break;
            case ViewType.VIEW: 
                targetView = this.views[viewIndex];
                if (targetView==null && this.views.length==viewIndex) {
                    targetView = new TableViewMetadata(ViewType.VIEW);
                    isNewTargetView = true;
                    this.views.push(targetView);
                }
                break;
        }

        if (srcView==targetView) {
            var srcColumnIndex = srcView.indexOfColumn(column);
            if (srcColumnIndex==indexInView) {
                // Nothing to move
                if (isNewTargetView) {
                    this.views.splice(this.views.length-1);
                }
                this.notifyListeners(); //TODO to remove
                return;
            }
        } else if ((ViewType.VIEW==srcView.getViewType()) && (ViewType.VIEW==targetView.getViewType()) && (srcView.getColumns().length==1) && (this.views.indexOf(srcView)<this.views.indexOf(targetView))) {
            // Forbid the move as it will create an empty row in the middle of the table
            if (isNewTargetView) {
                this.views.splice(this.views.length-1);
            }
            this.notifyListeners(); //TODO to remove
            return;
        }

        this.removeColumnHelper(column);
        column.addTableMetadata(this);

        switch (viewType) {
            case ViewType.LEFT:
                this.leftRepeatableColumns.addColumn(column, indexInView);
                break;
            case ViewType.RIGHT:
                this.rightRepeatableColumns.addColumn(column, indexInView);
                break;
            case ViewType.VIEW:
                targetView.addColumn(column, indexInView);
                break;
        }
        this.adjustViews();
        this.notifyListeners();
    }

    public makeRepeatable(column: TableColumnMetadata, isLeftRepeatable: boolean): void {
        this.removeColumnHelper(column);
        column.addTableMetadata(this);
        if (isLeftRepeatable) {
            this.leftRepeatableColumns.addColumn(column, null);
        } else {
            this.rightRepeatableColumns.addColumn(column, null);
        }
        this.adjustViews();
        this.notifyListeners();
    }

    public getLeftRepeatableColumns(): TableColumnMetadata[] {
        return this.leftRepeatableColumns.getColumns();
    }

    public getRightRepeatableColumns(): TableColumnMetadata[] {
        return this.rightRepeatableColumns.getColumns();
    }

    public getViewSize(): number {
        return this.views.length;
    }

    public getColumns(viewIndex: number): TableColumnMetadata[] {
        return this.views[viewIndex].getColumns();
    }

    private getViewOfColumn(column: TableColumnMetadata): TableViewMetadata {
        for (var i=0; i<this.views.length; i++) {
            if (this.views[i].indexOfColumn(column)>-1) {
                return this.views[i];
            }
        }
        if (this.leftRepeatableColumns.indexOfColumn(column)>-1) {
            return this.leftRepeatableColumns;
        }
        if (this.rightRepeatableColumns.indexOfColumn(column)>-1) {
            return this.rightRepeatableColumns;
        }
        return null;
    }

    public getColumnById(id: number): TableColumnMetadata {
        var rslt : TableColumnMetadata;

        rslt = this.leftRepeatableColumns.getColumnById(id);
        if (rslt==null) {
            rslt = this.rightRepeatableColumns.getColumnById(id);
            if (rslt==null) {
                for (var i=0; i<this.views.length; i++) {
                    rslt = this.views[i].getColumnById(id);
                    if (rslt!=null) {
                        return rslt;
                    }
                }
            }
        }
        return rslt;
    }

    public containsColumn(id: number): boolean {
        return (this.getColumnById(id)!=null);
    }

    public addModifListener(listener : ITableMetadataListener) {
        this.modifListeners.push(listener);
    }

    public enableListenerNotification(mustEnable: boolean) {
        this.isModifListenerEnabled = mustEnable;
    }

    public notifyListeners() {
        if (this.isModifListenerEnabled) {
            this.modifListeners.forEach(function(item) {
                item.tableChangedEvent();
            });
        }
    }

    public clearAll() {
        var self = this;
        this.leftRepeatableColumns.clearAll(self);
        this.rightRepeatableColumns.clearAll(self);
        this.views.forEach(item => {
            item.clearAll(self);
        });
        this.views.splice(0, this.views.length);
    }

    private adjustViews() {
        if ((this.views.length>0) && (this.views[this.views.length-1].getColumns().length==0)) {
            this.views.splice(this.views.length-1, 1);
        }
    }

    public normalizeColumnWidths(): void {
        var maxViewPreferredLength = 0;
        this.views.forEach(item => {
            maxViewPreferredLength = Math.max(maxViewPreferredLength, item.getTotalColumnLength(true));
        });

        this.views.forEach(item => {
            var viewPreferredLength = item.getTotalColumnLength(true);
            var totalLength = 0;
            item.getColumns().forEach(colItem => {
                var newLength = Math.round(colItem.getPreferredLength() * maxViewPreferredLength / viewPreferredLength);
                colItem.setLength(newLength);
                totalLength += newLength;
            });
            if (totalLength!=0) {
                item.getColumns()[0].setLength(item.getColumns()[0].getLength() - (totalLength - maxViewPreferredLength)); 
            }
        });

        var fct = (item: TableColumnMetadata) => {
            item.setLength(item.getPreferredLength());
        }
        this.getLeftRepeatableColumns().forEach(fct);
        this.getRightRepeatableColumns().forEach(fct);
    }

    public toString(): string {
        var rslt = "";
        for (var i=0; i<this.views.length; i++) {
            rslt += ((i>0) ? "," : "") + this.views[i].toString();
        }

        return "(Table [" + rslt +  "])";
    }
}

