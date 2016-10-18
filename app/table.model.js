"use strict";
var TableModel = (function () {
    function TableModel() {
        this.data = new Array();
    }
    TableModel.prototype.getRows = function () {
        return this.data;
    };
    TableModel.prototype.addRow = function (row) {
        this.data.push(row);
    };
    TableModel.prototype.getRowCount = function () {
        return this.data.length;
    };
    return TableModel;
}());
exports.TableModel = TableModel;
//# sourceMappingURL=table.model.js.map