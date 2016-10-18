"use strict";
var table_metadata_1 = require('./table.metadata');
var table_model_1 = require('./table.model');
var MyService = (function () {
    function MyService() {
        this.allTableColumns = new Array();
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(1, "Label 1", "Prop1", 40, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(2, "Label 2", "Prop2", 40, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(3, "Label 3", "Prop3", 8, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(4, "Label 4", "Prop4", 15, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(5, "Label 5", "Prop5", 40, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(6, "Label 6", "Prop6", 8, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(7, "Label 7", "Prop7", 8, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(8, "Label 8", "Prop8", 8, table_metadata_1.DataType.STRING));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(9, "Label 9", "Prop9", 10, table_metadata_1.DataType.DATE));
        this.allTableColumns.push(new table_metadata_1.TableColumnMetadata(10, "Label 10", "Prop10", 8, table_metadata_1.DataType.NUMERIC));
        this.initialColumnLength = new Array();
        for (var i = 0; i < this.allTableColumns.length; i++) {
            this.initialColumnLength[this.allTableColumns[i].getId()] = Math.ceil(this.allTableColumns[i].getLength() * 1.5);
        }
        /* Configuration for data visualization */
        var meta = new table_metadata_1.TableMetadata();
        for (var i = 0; i < 8; i++) {
            meta.addColumn(this.allTableColumns[i], (i < 5) ? 0 : 1, null);
        }
        meta.makeRepeatable(meta.getColumns(0)[0], true);
        meta.makeRepeatable(meta.getColumns(0)[0], false);
        this.tableMetadata = meta;
        this.tableMetadata.normalizeColumnWidths();
        var model = new table_model_1.TableModel();
        model.addRow({ 'Prop1': 'Hello Toto', 'Prop2': 'How are you', 'Prop3': 45, 'Prop4': 'Brussel', 'Prop5': 'A city from Belgium', 'Prop6': 1080, 'Prop7': 'Y', 'Prop8': 'T', 'Prop9': '2016/02/12', 'Prop10': 'T' });
        model.addRow({ 'Prop1': 'Hello Titi', 'Prop2': 'How are you', 'Prop3': 30, 'Prop4': 'Brussel', 'Prop5': 'A city from BelgiumA city from BelgiumA city from Belgium', 'Prop6': 1080, 'Prop7': 'Y', 'Prop8': 'F', 'Prop9': '2016/02/16', 'Prop10': 'T' });
        this.tableData = model;
        var modelForCalibration = new table_model_1.TableModel();
        modelForCalibration.addRow({ 'Prop1': 'xxxxxxxxxx', 'Prop2': 'xxxxxxxxxxx', 'Prop3': 'xx', 'Prop4': 'xxxxxxx', 'Prop5': 'xxxxxxxxxxxxxxxxxxx', 'Prop6': 'xxxx', 'Prop7': 'x', 'Prop8': 'x', 'Prop9': 'xxxx/xx/xx', 'Prop10': 'x' });
        modelForCalibration.addRow({ 'Prop1': 'xxxxxxxxxx', 'Prop2': 'xxxxxxxxxxx', 'Prop3': 'xx', 'Prop4': 'xxxxxxx', 'Prop5': 'xxxxxxxxxxxxxxxxxxx', 'Prop6': 'xxxx', 'Prop7': 'x', 'Prop8': 'x', 'Prop9': 'xxxx/xx/xx', 'Prop10': 'x' });
        this.tableDataForCalibration = modelForCalibration;
    }
    MyService.prototype.getTableMetadata = function () {
        return this.tableMetadata;
    };
    MyService.prototype.getTableData = function () {
        return this.tableData;
    };
    MyService.prototype.getAvailableColumnsForCalibration = function () {
        var rslt = new table_metadata_1.TableMetadata();
        var self = this;
        this.allTableColumns.forEach(function (item) {
            if (!self.tableMetadata.containsColumn(item.getId())) {
                rslt.addColumn(item.clone(), 0, null);
            }
        });
        return rslt;
    };
    MyService.prototype.getUsedColumnsForCalibration = function () {
        var rslt = new table_metadata_1.TableMetadata();
        this.tableMetadata.getLeftRepeatableColumns().forEach(function (item) {
            rslt.makeRepeatable(item.clone(), true);
        });
        this.tableMetadata.getRightRepeatableColumns().forEach(function (item) {
            rslt.makeRepeatable(item.clone(), false);
        });
        for (var i = 0; i < this.tableMetadata.getViewSize(); i++) {
            this.tableMetadata.getColumns(i).forEach(function (item) {
                rslt.addColumn(item.clone(), i, null);
            });
        }
        return rslt;
    };
    MyService.prototype.getTableDataForCalibration = function () {
        return this.tableDataForCalibration;
    };
    MyService.prototype.sayHello = function (aName) {
        return this.tableMetadata.toString();
    };
    MyService.prototype.findTableColumnMetadata = function (id) {
        for (var i = 0; i < this.allTableColumns.length; i++) {
            if (this.allTableColumns[i].getId() == id) {
                return this.allTableColumns[i];
            }
        }
        return null;
    };
    MyService.prototype.applyChanges = function (usedTableMetadata) {
        var _this = this;
        this.tableMetadata.enableListenerNotification(false);
        // Clear all the columns in the main meta data table
        this.tableMetadata.clearAll();
        // Apply the modifications of each cloned table column into its source column
        var closeCloneFct = function (item) {
            item.removeTableMetadata(usedTableMetadata);
        };
        usedTableMetadata.getLeftRepeatableColumns().forEach(closeCloneFct);
        usedTableMetadata.getRightRepeatableColumns().forEach(closeCloneFct);
        for (var i = 0; i < usedTableMetadata.getViewSize(); i++) {
            usedTableMetadata.getColumns(i).forEach(closeCloneFct);
        }
        // Populate the main meta data table with the new selected columns
        usedTableMetadata.getLeftRepeatableColumns().forEach(function (item) {
            _this.tableMetadata.makeRepeatable(_this.findTableColumnMetadata(item.getId()), true);
        });
        usedTableMetadata.getRightRepeatableColumns().forEach(function (item) {
            _this.tableMetadata.makeRepeatable(_this.findTableColumnMetadata(item.getId()), false);
        });
        for (var i = 0; i < usedTableMetadata.getViewSize(); i++) {
            usedTableMetadata.getColumns(i).forEach(function (item) {
                _this.tableMetadata.addColumn(_this.findTableColumnMetadata(item.getId()), i, null);
            });
        }
        this.tableMetadata.normalizeColumnWidths();
        this.tableMetadata.enableListenerNotification(true);
        this.tableMetadata.notifyListeners();
    };
    MyService.prototype.getDataMaxCharacters = function (tableColumnMetadata) {
        return 12;
    };
    MyService.prototype.getDataPercentageCoverage = function (numberOfCharacters, tableColumnMetadata) {
        var length = this.initialColumnLength[tableColumnMetadata.getId()];
        return length - Math.min(length, numberOfCharacters);
    };
    return MyService;
}());
exports.MyService = MyService;
//# sourceMappingURL=app.service.js.map