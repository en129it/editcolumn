"use strict";
(function (ViewType) {
    ViewType[ViewType["LEFT"] = 0] = "LEFT";
    ViewType[ViewType["VIEW"] = 1] = "VIEW";
    ViewType[ViewType["RIGHT"] = 2] = "RIGHT";
})(exports.ViewType || (exports.ViewType = {}));
var ViewType = exports.ViewType;
;
(function (DataType) {
    DataType[DataType["NUMERIC"] = 0] = "NUMERIC";
    DataType[DataType["STRING"] = 1] = "STRING";
    DataType[DataType["DATE"] = 2] = "DATE";
})(exports.DataType || (exports.DataType = {}));
var DataType = exports.DataType;
;
var TableColumnMetadata = (function () {
    function TableColumnMetadata(id, label, propertyName, preferredLength, dataType) {
        this.id = id;
        this.label = label;
        this.propertyName = propertyName;
        this.preferredLength = preferredLength;
        this.dataType = dataType;
        this.tableMetadatas = new Array();
    }
    TableColumnMetadata.prototype.getLabel = function () {
        return this.label;
    };
    TableColumnMetadata.prototype.getPreferredLength = function () {
        return this.preferredLength;
    };
    TableColumnMetadata.prototype.getLength = function () {
        return this.length;
    };
    TableColumnMetadata.prototype.setLength = function (length) {
        this.length = length;
    };
    TableColumnMetadata.prototype.getValue = function (object) {
        return object[this.propertyName];
    };
    TableColumnMetadata.prototype.getId = function () {
        return this.id;
    };
    TableColumnMetadata.prototype.addTableMetadata = function (tableMetadata) {
        if (this.tableMetadatas.indexOf(tableMetadata) == -1) {
            this.tableMetadatas.push(tableMetadata);
        }
    };
    TableColumnMetadata.prototype.removeTableMetadata = function (tableMetadata) {
        var index = this.tableMetadatas.indexOf(tableMetadata);
        if (index > -1) {
            this.tableMetadatas.splice(index, 1);
        }
    };
    TableColumnMetadata.prototype.clone = function () {
        var rslt = new TableColumnMetadata(this.id, this.label, this.propertyName, this.length, this.dataType);
        rslt.src = this;
        return rslt;
    };
    TableColumnMetadata.prototype.getDataType = function () {
        return this.dataType;
    };
    TableColumnMetadata.prototype.toString = function () {
        return "(Column [id=" + this.id + ", label=" + this.label + ", propertyName=" + this.propertyName + ", length=" + this.length + "])";
    };
    return TableColumnMetadata;
}());
exports.TableColumnMetadata = TableColumnMetadata;
var TableViewMetadata = (function () {
    function TableViewMetadata(viewType) {
        this.viewType = viewType;
        this.columns = new Array();
    }
    TableViewMetadata.prototype.addColumn = function (column, positionIndex) {
        if (positionIndex != null) {
            this.columns.splice(positionIndex, 0, column);
        }
        else {
            this.columns.push(column);
        }
    };
    TableViewMetadata.prototype.addColumnByTarget = function (column, targetColumn, isInsertBefore) {
        var index = this.indexOfColumn(targetColumn);
        if (index > -1) {
            this.addColumn(column, index + (isInsertBefore ? 0 : 1));
        }
        else {
            this.addColumn(column, null);
        }
    };
    TableViewMetadata.prototype.removeColumn = function (column) {
        var index = this.columns.indexOf(column);
        if (index > -1) {
            this.columns.splice(index, 1);
            return true;
        }
        return false;
    };
    TableViewMetadata.prototype.getColumns = function () {
        return this.columns;
    };
    TableViewMetadata.prototype.indexOfColumn = function (column) {
        return (column != null) ? this.columns.indexOf(column) : -1;
    };
    TableViewMetadata.prototype.isColumnAtExtrema = function (column, mustCheckForStartExtrema) {
        var index = this.indexOfColumn(column);
        if (index > -1) {
            return mustCheckForStartExtrema ? (index == 0) : (index == this.columns.length - 1);
        }
        return false;
    };
    TableViewMetadata.prototype.getViewType = function () {
        return this.viewType;
    };
    TableViewMetadata.prototype.getColumnById = function (id) {
        for (var i = 0; i < this.columns.length; i++) {
            if (this.columns[i].getId() == id) {
                return this.columns[i];
            }
        }
        return null;
    };
    TableViewMetadata.prototype.clearAll = function (tableMetadata) {
        this.columns.forEach(function (item) {
            item.removeTableMetadata(tableMetadata);
        });
        this.columns.splice(0, this.columns.length);
    };
    TableViewMetadata.prototype.getTotalColumnLength = function (isPreferredLength) {
        var rslt = 0;
        this.columns.forEach(function (item) {
            rslt += ((isPreferredLength) ? item.getPreferredLength() : item.getLength());
        });
        return rslt;
    };
    TableViewMetadata.prototype.toString = function () {
        var rslt = "(View [";
        this.columns.forEach(function (item) {
            rslt += item.toString() + " ";
        });
        rslt += "])";
        return rslt;
    };
    return TableViewMetadata;
}());
exports.TableViewMetadata = TableViewMetadata;
var TableMetadata = (function () {
    function TableMetadata() {
        this.isModifListenerEnabled = true;
        this.leftRepeatableColumns = new TableViewMetadata(ViewType.LEFT);
        this.rightRepeatableColumns = new TableViewMetadata(ViewType.RIGHT);
        this.views = new Array();
        this.modifListeners = new Array();
    }
    TableMetadata.prototype.addColumn = function (column, viewIndex, indexInView) {
        var view = null;
        if (this.views.length == viewIndex) {
            view = new TableViewMetadata(ViewType.VIEW);
            this.views.push(view);
        }
        else {
            view = this.views[viewIndex];
        }
        view.addColumn(column, indexInView);
        this.notifyListeners();
        column.addTableMetadata(this);
    };
    TableMetadata.prototype.removeColumn = function (column) {
        if (this.removeColumnHelper(column)) {
            this.adjustViews();
            this.notifyListeners();
            return true;
        }
        return false;
    };
    TableMetadata.prototype.removeColumnHelper = function (column) {
        if (column != null) {
            column.removeTableMetadata(this);
            var rslt = this.views.some(function (item) {
                return item.removeColumn(column);
            });
            if (!rslt) {
                rslt = this.leftRepeatableColumns.removeColumn(column);
                if (!rslt) {
                    rslt = this.rightRepeatableColumns.removeColumn(column);
                }
            }
            return rslt;
        }
        else {
            return false;
        }
    };
    TableMetadata.prototype.moveColumn = function (column, viewType, viewIndex, indexInView) {
        var srcView = this.getViewOfColumn(column);
        var targetView = null;
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
                if (targetView == null && this.views.length == viewIndex) {
                    targetView = new TableViewMetadata(ViewType.VIEW);
                    isNewTargetView = true;
                    this.views.push(targetView);
                }
                break;
        }
        if (srcView == targetView) {
            var srcColumnIndex = srcView.indexOfColumn(column);
            if (srcColumnIndex == indexInView) {
                // Nothing to move
                if (isNewTargetView) {
                    this.views.splice(this.views.length - 1);
                }
                this.notifyListeners(); //TODO to remove
                return;
            }
        }
        else if ((ViewType.VIEW == srcView.getViewType()) && (ViewType.VIEW == targetView.getViewType()) && (srcView.getColumns().length == 1) && (this.views.indexOf(srcView) < this.views.indexOf(targetView))) {
            // Forbid the move as it will create an empty row in the middle of the table
            if (isNewTargetView) {
                this.views.splice(this.views.length - 1);
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
    };
    TableMetadata.prototype.makeRepeatable = function (column, isLeftRepeatable) {
        this.removeColumnHelper(column);
        column.addTableMetadata(this);
        if (isLeftRepeatable) {
            this.leftRepeatableColumns.addColumn(column, null);
        }
        else {
            this.rightRepeatableColumns.addColumn(column, null);
        }
        this.adjustViews();
        this.notifyListeners();
    };
    TableMetadata.prototype.getLeftRepeatableColumns = function () {
        return this.leftRepeatableColumns.getColumns();
    };
    TableMetadata.prototype.getRightRepeatableColumns = function () {
        return this.rightRepeatableColumns.getColumns();
    };
    TableMetadata.prototype.getViewSize = function () {
        return this.views.length;
    };
    TableMetadata.prototype.getColumns = function (viewIndex) {
        return this.views[viewIndex].getColumns();
    };
    TableMetadata.prototype.getViewOfColumn = function (column) {
        for (var i = 0; i < this.views.length; i++) {
            if (this.views[i].indexOfColumn(column) > -1) {
                return this.views[i];
            }
        }
        if (this.leftRepeatableColumns.indexOfColumn(column) > -1) {
            return this.leftRepeatableColumns;
        }
        if (this.rightRepeatableColumns.indexOfColumn(column) > -1) {
            return this.rightRepeatableColumns;
        }
        return null;
    };
    TableMetadata.prototype.getColumnById = function (id) {
        var rslt;
        rslt = this.leftRepeatableColumns.getColumnById(id);
        if (rslt == null) {
            rslt = this.rightRepeatableColumns.getColumnById(id);
            if (rslt == null) {
                for (var i = 0; i < this.views.length; i++) {
                    rslt = this.views[i].getColumnById(id);
                    if (rslt != null) {
                        return rslt;
                    }
                }
            }
        }
        return rslt;
    };
    TableMetadata.prototype.containsColumn = function (id) {
        return (this.getColumnById(id) != null);
    };
    TableMetadata.prototype.addModifListener = function (listener) {
        this.modifListeners.push(listener);
    };
    TableMetadata.prototype.enableListenerNotification = function (mustEnable) {
        this.isModifListenerEnabled = mustEnable;
    };
    TableMetadata.prototype.notifyListeners = function () {
        if (this.isModifListenerEnabled) {
            this.modifListeners.forEach(function (item) {
                item.tableChangedEvent();
            });
        }
    };
    TableMetadata.prototype.clearAll = function () {
        var self = this;
        this.leftRepeatableColumns.clearAll(self);
        this.rightRepeatableColumns.clearAll(self);
        this.views.forEach(function (item) {
            item.clearAll(self);
        });
        this.views.splice(0, this.views.length);
    };
    TableMetadata.prototype.adjustViews = function () {
        if ((this.views.length > 0) && (this.views[this.views.length - 1].getColumns().length == 0)) {
            this.views.splice(this.views.length - 1, 1);
        }
    };
    TableMetadata.prototype.normalizeColumnWidths = function () {
        var maxViewPreferredLength = 0;
        this.views.forEach(function (item) {
            maxViewPreferredLength = Math.max(maxViewPreferredLength, item.getTotalColumnLength(true));
        });
        this.views.forEach(function (item) {
            var viewPreferredLength = item.getTotalColumnLength(true);
            var totalLength = 0;
            item.getColumns().forEach(function (colItem) {
                var newLength = Math.round(colItem.getPreferredLength() * maxViewPreferredLength / viewPreferredLength);
                colItem.setLength(newLength);
                totalLength += newLength;
            });
            if (totalLength != 0) {
                item.getColumns()[0].setLength(item.getColumns()[0].getLength() - (totalLength - maxViewPreferredLength));
            }
        });
        var fct = function (item) {
            item.setLength(item.getPreferredLength());
        };
        this.getLeftRepeatableColumns().forEach(fct);
        this.getRightRepeatableColumns().forEach(fct);
    };
    TableMetadata.prototype.toString = function () {
        var rslt = "";
        for (var i = 0; i < this.views.length; i++) {
            rslt += ((i > 0) ? "," : "") + this.views[i].toString();
        }
        return "(Table [" + rslt + "])";
    };
    return TableMetadata;
}());
exports.TableMetadata = TableMetadata;
//# sourceMappingURL=table.metadata.js.map