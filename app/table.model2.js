"use strict";
var table_metadata_1 = require('./table.metadata');
(function (ViewMode) {
    ViewMode[ViewMode["LEFT_VIEW_RIGHT_MERGE"] = 0] = "LEFT_VIEW_RIGHT_MERGE";
    ViewMode[ViewMode["LEFT_VIEW_RIGHT_DISTINCT"] = 1] = "LEFT_VIEW_RIGHT_DISTINCT";
    ViewMode[ViewMode["VIEW_ONLY"] = 2] = "VIEW_ONLY";
})(exports.ViewMode || (exports.ViewMode = {}));
var ViewMode = exports.ViewMode;
;
(function (DisplayMode) {
    DisplayMode[DisplayMode["ADAPTABLE"] = 0] = "ADAPTABLE";
    DisplayMode[DisplayMode["FIXED"] = 1] = "FIXED";
})(exports.DisplayMode || (exports.DisplayMode = {}));
var DisplayMode = exports.DisplayMode;
;
var TableViewColumn = (function () {
    function TableViewColumn(columnMetadata, viewType, table) {
        this.columnMetadata = columnMetadata;
        this.viewType = viewType;
        this.table = table;
    }
    TableViewColumn.prototype.getColumnLabel = function () {
        return (this.columnMetadata != null) ? this.columnMetadata.getLabel() : null;
    };
    TableViewColumn.prototype.getPreferredWidth = function () {
        return (this.columnMetadata != null) ? this.columnMetadata.getLength() : -1;
    };
    TableViewColumn.prototype.getValue = function (object) {
        return (this.columnMetadata != null) ? this.columnMetadata.getValue(object) : null;
    };
    TableViewColumn.prototype.getColumnId = function () {
        return (this.columnMetadata != null) ? this.columnMetadata.getId() : -1;
    };
    TableViewColumn.prototype.isRepeateable = function () {
        return (table_metadata_1.ViewType.VIEW != this.viewType);
    };
    TableViewColumn.prototype.getViewType = function () {
        return this.viewType;
    };
    TableViewColumn.prototype.isGroweable = function () {
        //        return this.table.isTableCellGrowable();
        return true;
    };
    TableViewColumn.prototype.setLength = function (newLength) {
        this.columnMetadata.setLength(newLength);
    };
    TableViewColumn.prototype.getIndexInView = function () {
        var views = this.table.getViews();
        for (var i = 0; i < views.length; i++) {
            var columns = views[i].getColumns();
            for (var j = 0; j < columns.length; j++) {
                if (columns[j].columnMetadata == this.columnMetadata) {
                    return j;
                }
            }
        }
        return -1;
    };
    TableViewColumn.prototype.getLength = function () {
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
    };
    return TableViewColumn;
}());
exports.TableViewColumn = TableViewColumn;
var TableView = (function () {
    function TableView(columns, id, table) {
        this.columns = columns;
        this.id = id;
        this.table = table;
    }
    TableView.prototype.addColumn = function (viewColumn) {
        this.columns.push(viewColumn);
    };
    TableView.prototype.getColumns = function () {
        return this.columns;
    };
    TableView.prototype.getId = function () {
        return this.id;
    };
    TableView.prototype.isEmpty = function () {
        return this.columns.length == 0;
    };
    TableView.prototype.getTable = function () {
        return this.table;
    };
    TableView.prototype.getTotalColumWidth = function () {
        var rslt = 0;
        this.columns.forEach(function (item) {
            rslt += item.getLength();
        });
        return rslt;
    };
    return TableView;
}());
exports.TableView = TableView;
var Table = (function () {
    function Table(id, tableMetadata, tableData, viewMode) {
        this.id = id;
        this.tableMetadata = tableMetadata;
        this.tableData = tableData;
        this.viewMode = viewMode;
        this.lastUpdateCounter = 0;
        if (tableMetadata != null) {
            this.tableMetadata.addModifListener(this);
        }
        this.views = new Array();
    }
    Table.prototype.getId = function () {
        return this.id;
    };
    Table.prototype.clearAll = function () {
        this.views = new Array();
    };
    Table.prototype.getLastUpdateCounter = function () {
        return this.lastUpdateCounter;
    };
    Table.prototype.redraw = function (tableWidth, mustForce) {
        var _this = this;
        this.lastUpdateCounter++;
        if (this.lastTableWidth == null) {
            this.lastTableWidth = this.views[0].getTotalColumWidth();
        }
        if (tableWidth == null) {
            if (mustForce) {
                tableWidth = this.lastTableWidth;
            }
            else {
                return;
            }
        }
        if ((this.lastTableWidth != tableWidth) || mustForce) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ redraw " + this.lastTableWidth + " => " + tableWidth);
            var totalNewRepeatableColumnWidth = 0;
            var totalCurrentRepeatableColumnWidth = 0;
            var updateColumnLengthFct = function (item) {
                totalCurrentRepeatableColumnWidth += item.getLength();
                var newLength = Math.round(item.getLength() * tableWidth / _this.lastTableWidth);
                totalNewRepeatableColumnWidth += newLength;
                //console.log("                           old length=" + item.getLength() + "  => " + newLength + "                 " + item.getLabel());
                item.setLength(newLength);
            };
            this.tableMetadata.getLeftRepeatableColumns().forEach(updateColumnLengthFct);
            this.tableMetadata.getRightRepeatableColumns().forEach(updateColumnLengthFct);
            var remainingNewWidth = tableWidth - totalNewRepeatableColumnWidth;
            var remainingCurrentWidth = this.lastTableWidth - totalCurrentRepeatableColumnWidth;
            //console.log("     remainingNewWidth=" + remainingNewWidth + "       remainingCurrentWidth=" + remainingCurrentWidth);
            var totalWidth = 0;
            var updateColumnLengthFct = function (item) {
                var newLength = Math.round(item.getLength() * remainingNewWidth / remainingCurrentWidth);
                //console.log("                           old length=" + item.getLength() + "  => " + newLength + "                 " + item.getLabel());
                item.setLength(newLength);
                totalWidth += newLength;
            };
            for (var i = 0; i < this.tableMetadata.getViewSize(); i++) {
                totalWidth = 0;
                this.tableMetadata.getColumns(i).forEach(updateColumnLengthFct);
                if (totalWidth > 0) {
                    //console.log("                           diff = " + (totalWidth - remainingNewWidth));
                    this.tableMetadata.getColumns(i)[0].setLength(this.tableMetadata.getColumns(i)[0].getLength() - (totalWidth - remainingNewWidth));
                }
            }
            this.lastTableWidth = tableWidth;
        }
    };
    Table.prototype.refresh = function (tableWidth) {
        console.log("#### refresh " + tableWidth + "   (" + this.id + ")");
        this.views.splice(0, this.views.length);
        var viewId = 0;
        var self = this;
        var leftRepeatableViewColumns = new Array();
        this.tableMetadata.getLeftRepeatableColumns().forEach(function (item) {
            leftRepeatableViewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.LEFT, self));
        });
        var rightRepeatableViewColumns = new Array();
        this.tableMetadata.getRightRepeatableColumns().forEach(function (item) {
            rightRepeatableViewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.RIGHT, self));
        });
        var viewSize = this.tableMetadata.getViewSize();
        for (var i = 0; i < viewSize; i++) {
            var viewColumns = new Array();
            var processedColumnCount = 0;
            viewColumns = viewColumns.concat(leftRepeatableViewColumns);
            this.tableMetadata.getColumns(i).forEach(function (item) {
                viewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.VIEW, self));
                processedColumnCount++;
            });
            viewColumns = viewColumns.concat(rightRepeatableViewColumns);
            this.views.push(new TableView(viewColumns, viewId++, this));
        }
        this.redraw(tableWidth, false);
    };
    Table.prototype.getViews = function () {
        return this.views;
    };
    Table.prototype.getViewById = function (id) {
        for (var i = 0; i < this.views.length; i++) {
            if (this.views[i].getId() == id) {
                return this.views[i];
            }
        }
        return null;
    };
    Table.prototype.getData = function () {
        return this.tableData;
    };
    Table.prototype.getTableMetadata = function () {
        return this.tableMetadata;
    };
    Table.prototype.tableChangedEvent = function () {
        this.lastTableWidth = null;
        this.refresh(this.lastTableWidth);
    };
    Table.prototype.isTableCellGrowable = function () {
        return true;
    };
    Table.prototype.getTableWidth = function () {
        return this.lastTableWidth;
    };
    return Table;
}());
exports.Table = Table;
var ConfigTable = (function () {
    function ConfigTable(id, tableMetadata, viewMode) {
        this.id = id;
        this.tableMetadata = tableMetadata;
        this.viewMode = viewMode;
        if (tableMetadata != null) {
            this.tableMetadata.addModifListener(this);
        }
        this.views = new Array();
        this.refresh();
    }
    ConfigTable.prototype.getId = function () {
        return this.id;
    };
    ConfigTable.prototype.clearAll = function () {
        this.views = new Array();
    };
    ConfigTable.prototype.refresh = function () {
        this.views.splice(0, this.views.length);
        var viewId = 0;
        var self = this;
        var leftRepeatableViewColumns = new Array();
        if (ViewMode.VIEW_ONLY != this.viewMode) {
            this.tableMetadata.getLeftRepeatableColumns().forEach(function (item) {
                leftRepeatableViewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.LEFT, null));
            });
            // Add extra left repeatable column
            leftRepeatableViewColumns.push(new TableViewColumn(null, table_metadata_1.ViewType.LEFT, null));
        }
        var rightRepeatableViewColumns = new Array();
        if (ViewMode.VIEW_ONLY != this.viewMode) {
            this.tableMetadata.getRightRepeatableColumns().forEach(function (item) {
                rightRepeatableViewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.RIGHT, null));
            });
            // Add extra right repeatable column
            rightRepeatableViewColumns.push(new TableViewColumn(null, table_metadata_1.ViewType.RIGHT, null));
        }
        var viewSize = this.tableMetadata.getViewSize();
        var maxColumnsInView = 0;
        for (var i = 0; i < viewSize; i++) {
            maxColumnsInView = Math.max(maxColumnsInView, this.tableMetadata.getColumns(i).length);
        }
        for (var i = 0; i <= viewSize; i++) {
            var viewColumns = new Array();
            var processedColumnCount = 0;
            viewColumns = viewColumns.concat(leftRepeatableViewColumns);
            if (i < viewSize) {
                this.tableMetadata.getColumns(i).forEach(function (item) {
                    viewColumns.push(new TableViewColumn(item, table_metadata_1.ViewType.VIEW, null));
                    processedColumnCount++;
                });
            }
            // Add extra column(s)
            var columnsToAddCount = (ViewMode.VIEW_ONLY == this.viewMode) ? 1 : (maxColumnsInView - processedColumnCount + 1);
            for (var j = 0; j < columnsToAddCount; j++) {
                viewColumns.push(new TableViewColumn(null, table_metadata_1.ViewType.VIEW, null));
            }
            viewColumns = viewColumns.concat(rightRepeatableViewColumns);
            this.views.push(new TableView(viewColumns, viewId++, null));
        }
        return this.views.length;
    };
    ConfigTable.prototype.getViews = function () {
        return this.views;
    };
    ConfigTable.prototype.getViewById = function (id) {
        for (var i = 0; i < this.views.length; i++) {
            if (this.views[i].getId() == id) {
                return this.views[i];
            }
        }
        return null;
    };
    ConfigTable.prototype.getData = function () {
        return null;
    };
    ConfigTable.prototype.getTableMetadata = function () {
        return this.tableMetadata;
    };
    ConfigTable.prototype.tableChangedEvent = function () {
        this.refresh();
    };
    return ConfigTable;
}());
exports.ConfigTable = ConfigTable;
//# sourceMappingURL=table.model2.js.map