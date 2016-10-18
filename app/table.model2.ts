import { TableMetadata, TableViewMetadata, TableColumnMetadata, ITableMetadataListener, ViewType} from './table.metadata';
import { TableModel} from './table.model';

export enum ViewMode { LEFT_VIEW_RIGHT_MERGE, LEFT_VIEW_RIGHT_DISTINCT, VIEW_ONLY };
export enum DisplayMode { ADAPTABLE, FIXED };

export class TableViewColumn {

    constructor(private columnMetadata: TableColumnMetadata, private viewType: ViewType, private table: Table) {
    }

    public getColumnLabel(): string {
        return (this.columnMetadata!=null) ? this.columnMetadata.getLabel() : null;
    }

    public getPreferredWidth(): number {
        return (this.columnMetadata!=null) ? this.columnMetadata.getLength() : -1;
    }

    public getValue(object: Object): any {
        return (this.columnMetadata!=null) ? this.columnMetadata.getValue(object) : null;
    }

    public getColumnId(): number {
        return (this.columnMetadata!=null) ? this.columnMetadata.getId() : -1;
    }

    public isRepeateable(): boolean {
        return (ViewType.VIEW!=this.viewType);
    }

    public getViewType(): ViewType {
        return this.viewType;
    }

    public isGroweable(): boolean {
//        return this.table.isTableCellGrowable();
        return true;
    }

    public setLength(newLength: number): void {
        this.columnMetadata.setLength(newLength);
    }

    public getIndexInView(): number {
        var views = this.table.getViews();
        for (var i=0; i<views.length; i++) {
            var columns = views[i].getColumns();
            for (var j=0; j<columns.length; j++) {
                if (columns[j].columnMetadata==this.columnMetadata) {
                    return j;
                }
            }
        }
        return -1;
    }

    public getLength(): number {
/*        
        var lWidth1ch = (width1ch!=null) ? width1ch : this.table.getWidth1ch(); 
        var lWidthBox = (widthBox!=null) ? widthBox : this.table.getWidthBox(); 

        var rslt: number;
        if ((lWidth1ch!=null) && (lWidthBox!=null)) {
            rslt = this.columnMetadata.getLength() * lWidth1ch + lWidthBox;
        } else {
            rslt = this.columnMetadata.getLength();
        }
        return Math.ceil(rslt);
        */
        return this.columnMetadata.getLength();
    }
}

export class TableView {
    constructor(private columns : Array<TableViewColumn>, private id: number, private table: Table) {
    }

    public addColumn(viewColumn : TableViewColumn) {
        this.columns.push(viewColumn);
    }

    public getColumns(): Array<TableViewColumn> {
        return this.columns;
    }

    public getId(): number {
        return this.id;
    }

    public isEmpty(): boolean {
        return this.columns.length==0;
    }

    public getTable(): Table {
        return this.table;
    }

    public getTotalColumWidth(): number {
        var rslt = 0;
        this.columns.forEach(item => {
            rslt += item.getLength();
        });
        return rslt;
    }
    
}

export class Table implements ITableMetadataListener {
    private views : Array<TableView>;
    private lastTableWidth: number;
    private lastUpdateCounter: number = 0;

    constructor(private id: string, private tableMetadata : TableMetadata, private tableData: TableModel, private viewMode: ViewMode) {
        if (tableMetadata!=null) {
            this.tableMetadata.addModifListener(this);
        }
        this.views = new Array<TableView>();
    }

    public getId(): string {
        return this.id;
    }

    public clearAll() {
        this.views = new Array<TableView>();
    }

    public getLastUpdateCounter(): number {
        return this.lastUpdateCounter;
    }

    public redraw(tableWidth: number, mustForce: boolean): void {
        this.lastUpdateCounter++;

        if (this.lastTableWidth==null) {
            this.lastTableWidth = this.views[0].getTotalColumWidth();
        }

        if (tableWidth==null) {
            if (mustForce) {
                tableWidth = this.lastTableWidth;
            } else {
                return;
            }
        }

        if ((this.lastTableWidth!=tableWidth) || mustForce) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ redraw " + this.lastTableWidth + " => " + tableWidth);
            var totalNewRepeatableColumnWidth = 0;
            var totalCurrentRepeatableColumnWidth = 0;

            var updateColumnLengthFct = (item: TableColumnMetadata) => {
                totalCurrentRepeatableColumnWidth += item.getLength();
                var newLength = Math.round(item.getLength() * tableWidth / this.lastTableWidth);
                totalNewRepeatableColumnWidth += newLength;
                //console.log("                           old length=" + item.getLength() + "  => " + newLength + "                 " + item.getLabel());
                item.setLength(newLength);
            };

            this.tableMetadata.getLeftRepeatableColumns().forEach(updateColumnLengthFct);
            this.tableMetadata.getRightRepeatableColumns().forEach(updateColumnLengthFct);

            var remainingNewWidth = tableWidth - totalNewRepeatableColumnWidth;
            var remainingCurrentWidth = this.lastTableWidth - totalCurrentRepeatableColumnWidth;

            //console.log("     remainingNewWidth=" + remainingNewWidth + "       remainingCurrentWidth=" + remainingCurrentWidth);

            var totalWidth = 0
            var updateColumnLengthFct = (item: TableColumnMetadata) => {
                var newLength = Math.round(item.getLength() * remainingNewWidth / remainingCurrentWidth);
                //console.log("                           old length=" + item.getLength() + "  => " + newLength + "                 " + item.getLabel());
                item.setLength(newLength);
                totalWidth += newLength;
            };

            for (var i=0; i<this.tableMetadata.getViewSize(); i++) {
                totalWidth = 0;
                this.tableMetadata.getColumns(i).forEach(updateColumnLengthFct);
                if (totalWidth>0) {
                    //console.log("                           diff = " + (totalWidth - remainingNewWidth));
                    this.tableMetadata.getColumns(i)[0].setLength(this.tableMetadata.getColumns(i)[0].getLength() - (totalWidth - remainingNewWidth));
                }
            }

            this.lastTableWidth = tableWidth;
        }   
    }

    public refresh(tableWidth: number): void {
        console.log("#### refresh " + tableWidth + "   (" + this.id + ")");

        this.views.splice(0, this.views.length);

        var viewId: number = 0; var self = this;

        var leftRepeatableViewColumns = new Array<TableViewColumn>();
        this.tableMetadata.getLeftRepeatableColumns().forEach(function(item) {
            leftRepeatableViewColumns.push(new TableViewColumn(item, ViewType.LEFT, self));
        });

        var rightRepeatableViewColumns = new Array<TableViewColumn>();
        this.tableMetadata.getRightRepeatableColumns().forEach(function(item) {
            rightRepeatableViewColumns.push(new TableViewColumn(item, ViewType.RIGHT, self));
        });

        var viewSize = this.tableMetadata.getViewSize();
        for (var i=0; i<viewSize; i++) {
            var viewColumns = new Array<TableViewColumn>();
            var processedColumnCount = 0;

            viewColumns = viewColumns.concat(leftRepeatableViewColumns);
            this.tableMetadata.getColumns(i).forEach(item => {
                viewColumns.push(new TableViewColumn(item, ViewType.VIEW, self));
                processedColumnCount++;
            });
            viewColumns = viewColumns.concat(rightRepeatableViewColumns);

            this.views.push(new TableView(viewColumns, viewId++, this));
        }

        this.redraw(tableWidth, false);
    }

    public getViews(): TableView[] {
        return this.views;
    }

    public getViewById(id: number): TableView {
        for (var i=0; i<this.views.length; i++) {
            if (this.views[i].getId()==id) {
                return this.views[i];
            }
        }
        return null;
    }

    public getData(): TableModel {
        return this.tableData;
    }

    public getTableMetadata() : TableMetadata {
        return this.tableMetadata;
    }

    public tableChangedEvent() {
        this.lastTableWidth = null;
        this.refresh(this.lastTableWidth);
    }

    isTableCellGrowable(): boolean {
        return true;
    }

    getTableWidth(): number {
        return this.lastTableWidth
    }
}


export class ConfigTable implements ITableMetadataListener {
    private views : Array<TableView>;

    constructor(private id: string, private tableMetadata : TableMetadata, private viewMode: ViewMode) {
        if (tableMetadata!=null) {
            this.tableMetadata.addModifListener(this);
        }
        this.views = new Array<TableView>();
        this.refresh();
    }

    public getId(): string {
        return this.id;
    }

    public clearAll() {
        this.views = new Array<TableView>();
    }

    private refresh(): number {
        this.views.splice(0, this.views.length);

        var viewId: number = 0; var self = this;

        var leftRepeatableViewColumns = new Array<TableViewColumn>();
        if (ViewMode.VIEW_ONLY!=this.viewMode) {
            this.tableMetadata.getLeftRepeatableColumns().forEach(function(item) {
                leftRepeatableViewColumns.push(new TableViewColumn(item, ViewType.LEFT, null));
            });
            // Add extra left repeatable column
            leftRepeatableViewColumns.push(new TableViewColumn(null, ViewType.LEFT, null));
        }

        var rightRepeatableViewColumns = new Array<TableViewColumn>();
        if (ViewMode.VIEW_ONLY!=this.viewMode) {
            this.tableMetadata.getRightRepeatableColumns().forEach(function(item) {
                rightRepeatableViewColumns.push(new TableViewColumn(item, ViewType.RIGHT, null));
            });
            // Add extra right repeatable column
            rightRepeatableViewColumns.push(new TableViewColumn(null, ViewType.RIGHT, null));
        }

        var viewSize = this.tableMetadata.getViewSize();
        var maxColumnsInView = 0; 
        for (var i=0; i<viewSize; i++) {
            maxColumnsInView = Math.max(maxColumnsInView, this.tableMetadata.getColumns(i).length);
        }

        for (var i=0; i<=viewSize; i++) {  // +1 for extra view
            var viewColumns = new Array<TableViewColumn>();
            var processedColumnCount = 0;

            viewColumns = viewColumns.concat(leftRepeatableViewColumns);
            if (i<viewSize) {
                this.tableMetadata.getColumns(i).forEach(item => {
                    viewColumns.push(new TableViewColumn(item, ViewType.VIEW, null));
                    processedColumnCount++;
                });
            }
            // Add extra column(s)
            var columnsToAddCount = (ViewMode.VIEW_ONLY==this.viewMode) ? 1 : (maxColumnsInView-processedColumnCount+1);  
            for (var j=0; j<columnsToAddCount; j++) {
                viewColumns.push(new TableViewColumn(null, ViewType.VIEW, null));
            }
            viewColumns = viewColumns.concat(rightRepeatableViewColumns);

            this.views.push(new TableView(viewColumns, viewId++, null));
        }

        return this.views.length;
    }

    public getViews(): TableView[] {
        return this.views;
    }

    public getViewById(id: number): TableView {
        for (var i=0; i<this.views.length; i++) {
            if (this.views[i].getId()==id) {
                return this.views[i];
            }
        }
        return null;
    }

    public getData(): TableModel {
        return null;
    }

    public getTableMetadata() : TableMetadata {
        return this.tableMetadata;
    }

    public tableChangedEvent() {
        this.refresh();
    }
}