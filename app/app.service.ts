import {Subject} from 'rxjs/Subject';
import {TableMetadata, TableColumnMetadata, DataType} from './table.metadata';
import {TableModel} from './table.model';

export class MyService {
    private allTableColumns : Array<TableColumnMetadata>;
    private tableMetadata : TableMetadata;
    private tableData : TableModel;
    private tableDataForCalibration : TableModel;
    private initialColumnLength : Array<number>;

    constructor() {
        this.allTableColumns = new Array<TableColumnMetadata>();
        this.allTableColumns.push(new TableColumnMetadata(1, "Label 1", "Prop1", 40, DataType.STRING));
        this.allTableColumns.push(new TableColumnMetadata(2, "Label 2", "Prop2", 40, DataType.STRING));

        this.allTableColumns.push(new TableColumnMetadata(3, "Label 3", "Prop3", 8, DataType.STRING));
        this.allTableColumns.push(new TableColumnMetadata(4, "Label 4", "Prop4", 15, DataType.STRING));
        this.allTableColumns.push(new TableColumnMetadata(5, "Label 5", "Prop5", 40, DataType.STRING));

        this.allTableColumns.push(new TableColumnMetadata(6, "Label 6", "Prop6", 8, DataType.STRING));
        this.allTableColumns.push(new TableColumnMetadata(7, "Label 7", "Prop7", 8, DataType.STRING));
        this.allTableColumns.push(new TableColumnMetadata(8, "Label 8", "Prop8", 8, DataType.STRING));

        this.allTableColumns.push(new TableColumnMetadata(9, "Label 9", "Prop9", 10, DataType.DATE));
        this.allTableColumns.push(new TableColumnMetadata(10, "Label 10", "Prop10", 8, DataType.NUMERIC));

        this.initialColumnLength = new Array<number>();
        for (var i=0; i<this.allTableColumns.length; i++) {
            this.initialColumnLength[this.allTableColumns[i].getId()] = Math.ceil(this.allTableColumns[i].getLength()*1.5);
        }

        /* Configuration for data visualization */
        var meta = new TableMetadata();
        for (var i=0; i<8; i++) {
            meta.addColumn(this.allTableColumns[i], (i<5) ? 0 : 1, null);
        }
        meta.makeRepeatable(meta.getColumns(0)[0], true);
        meta.makeRepeatable(meta.getColumns(0)[0], false);
        this.tableMetadata = meta;
        this.tableMetadata.normalizeColumnWidths();

        var model = new TableModel();
        model.addRow({'Prop1': 'Hello Toto', 'Prop2': 'How are you', 'Prop3': 45, 'Prop4': 'Brussel', 'Prop5': 'A city from Belgium', 'Prop6': 1080, 'Prop7': 'Y', 'Prop8': 'T', 'Prop9': '2016/02/12', 'Prop10': 'T'});
        model.addRow({'Prop1': 'Hello Titi', 'Prop2': 'How are you', 'Prop3': 30, 'Prop4': 'Brussel', 'Prop5': 'A city from BelgiumA city from BelgiumA city from Belgium', 'Prop6': 1080, 'Prop7': 'Y', 'Prop8': 'F', 'Prop9': '2016/02/16', 'Prop10': 'T'});
        this.tableData = model;

        var modelForCalibration = new TableModel();
        modelForCalibration.addRow({'Prop1': 'xxxxxxxxxx', 'Prop2': 'xxxxxxxxxxx', 'Prop3': 'xx', 'Prop4': 'xxxxxxx', 'Prop5': 'xxxxxxxxxxxxxxxxxxx', 'Prop6': 'xxxx', 'Prop7': 'x', 'Prop8': 'x', 'Prop9': 'xxxx/xx/xx', 'Prop10': 'x'});
        modelForCalibration.addRow({'Prop1': 'xxxxxxxxxx', 'Prop2': 'xxxxxxxxxxx', 'Prop3': 'xx', 'Prop4': 'xxxxxxx', 'Prop5': 'xxxxxxxxxxxxxxxxxxx', 'Prop6': 'xxxx', 'Prop7': 'x', 'Prop8': 'x', 'Prop9': 'xxxx/xx/xx', 'Prop10': 'x'});
        this.tableDataForCalibration = modelForCalibration;
    }

    public getTableMetadata(): TableMetadata {
        return this.tableMetadata;
    }
    public getTableData(): TableModel {
        return this.tableData;
    }
    public getAvailableColumnsForCalibration(): TableMetadata {
        var rslt = new TableMetadata();
        var self = this;

        this.allTableColumns.forEach(item => {
            if (!self.tableMetadata.containsColumn(item.getId())) {
                rslt.addColumn(item.clone(), 0, null);
            }
        });
        return rslt;
    }
    public getUsedColumnsForCalibration(): TableMetadata {
        var rslt = new TableMetadata();
        this.tableMetadata.getLeftRepeatableColumns().forEach(item => {
            rslt.makeRepeatable(item.clone(), true);
        });
        this.tableMetadata.getRightRepeatableColumns().forEach(item => {
            rslt.makeRepeatable(item.clone(), false);
        });
        for (var i=0; i<this.tableMetadata.getViewSize(); i++) {
            this.tableMetadata.getColumns(i).forEach(item => {
                rslt.addColumn(item.clone(), i, null);
            });
        }
        return rslt;
    }
 
    public getTableDataForCalibration(): TableModel {
        return this.tableDataForCalibration;
    }
    sayHello(aName: string) : string {
        return this.tableMetadata.toString();
    }

    private findTableColumnMetadata(id: number): TableColumnMetadata {
        for (var i=0; i<this.allTableColumns.length; i++) {
            if (this.allTableColumns[i].getId()==id) {
                return this.allTableColumns[i];
            }
        }
        return null;
    }

    public applyChanges(usedTableMetadata: TableMetadata) {
        this.tableMetadata.enableListenerNotification(false);
        // Clear all the columns in the main meta data table
        this.tableMetadata.clearAll();

        // Apply the modifications of each cloned table column into its source column
        var closeCloneFct = (item:TableColumnMetadata) => {
            item.removeTableMetadata(usedTableMetadata);
        };
        usedTableMetadata.getLeftRepeatableColumns().forEach(closeCloneFct);
        usedTableMetadata.getRightRepeatableColumns().forEach(closeCloneFct);
        for (var i=0; i<usedTableMetadata.getViewSize(); i++) {
            usedTableMetadata.getColumns(i).forEach(closeCloneFct);
        }

        // Populate the main meta data table with the new selected columns
        usedTableMetadata.getLeftRepeatableColumns().forEach(item => {
            this.tableMetadata.makeRepeatable(this.findTableColumnMetadata(item.getId()), true);
        });
        usedTableMetadata.getRightRepeatableColumns().forEach(item => {
            this.tableMetadata.makeRepeatable(this.findTableColumnMetadata(item.getId()), false);
        });
        for (var i=0; i<usedTableMetadata.getViewSize(); i++) {
            usedTableMetadata.getColumns(i).forEach(item => {
                this.tableMetadata.addColumn(this.findTableColumnMetadata(item.getId()), i, null);
            });
        }
        this.tableMetadata.normalizeColumnWidths();
        this.tableMetadata.enableListenerNotification(true);
        this.tableMetadata.notifyListeners();
    }

    public getDataMaxCharacters(tableColumnMetadata: TableColumnMetadata): number {
        return 12;
    }

    public getDataPercentageCoverage(numberOfCharacters: number, tableColumnMetadata: TableColumnMetadata): number {
        var length = this.initialColumnLength[tableColumnMetadata.getId()];
        return length-Math.min(length, numberOfCharacters);
    }
    
}