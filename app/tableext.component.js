"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var table_component_1 = require('./table.component');
var app_service_1 = require('./app.service');
var table_model2_1 = require('./table.model2');
var TableViewer = (function () {
    function TableViewer(myService) {
        this.currentViewIndex = 0;
        this.table = new table_model2_1.Table("data", myService.getTableMetadata(), myService.getTableData(), table_model2_1.ViewMode.LEFT_VIEW_RIGHT_MERGE);
    }
    TableViewer.prototype.onLeftClick = function (event) {
        if (this.currentViewIndex > 0) {
            this.currentViewIndex--;
        }
    };
    TableViewer.prototype.onRightClick = function (event) {
        if (this.currentViewIndex < this.table.getViews().length - 1) {
            this.currentViewIndex++;
        }
    };
    TableViewer.prototype.onViewChange = function (event) {
        this.currentViewIndex = this.table.getViews().length - 1;
    };
    __decorate([
        core_1.ViewChild(table_component_1.TableComponent), 
        __metadata('design:type', table_component_1.TableComponent)
    ], TableViewer.prototype, "tableComponent", void 0);
    TableViewer = __decorate([
        core_1.Component({
            selector: 'my-table-viewer',
            template: "\n        <my-table [currentViewIndex]=\"currentViewIndex\" [table]=\"table\" (onViewChange)=\"onViewChange($event)\"></my-table>\n        <div style=\"position: absolute; top:0px; left:0px;\"><button (click)=\"onLeftClick($event)\">&lt;</button></div>\n        <div style=\"position: absolute; top:0px; right:0px;\"><button (click)=\"onRightClick($event)\">&gt;</button></div>\n    "
        }), 
        __metadata('design:paramtypes', [app_service_1.MyService])
    ], TableViewer);
    return TableViewer;
}());
exports.TableViewer = TableViewer;
//# sourceMappingURL=tableext.component.js.map