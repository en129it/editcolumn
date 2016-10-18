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
var app_service_1 = require('./app.service');
var table_model2_1 = require('./table.model2');
var table_metadata_1 = require('./table.metadata');
var table_component_1 = require('./table.component');
var parseStyleInt = function (styleInt) {
    var rslt = parseInt(styleInt);
    return isNaN(rslt) ? 0 : rslt;
};
var dragTargetStack = new Array();
var TableCellConfigComponent = (function () {
    function TableCellConfigComponent(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.onDragDropEvent = new core_1.EventEmitter();
    }
    TableCellConfigComponent.prototype.ngOnInit = function () {
        var elem = this.elementRef.nativeElement;
        if (this.column.isRepeateable()) {
            this.renderer.setElementClass(elem, "repeatable", true);
        }
        if (this.column) {
            this.renderer.setElementClass(elem, "draggable", true);
        }
    };
    TableCellConfigComponent.prototype.getCellValue = function () {
        return this.column.getColumnLabel();
    };
    TableCellConfigComponent.prototype.onDragStart = function (event) {
        // Method called because a drag operation has been initiated on the event.srcElement element
        if (this.column) {
            var srcElem = this.elementRef.nativeElement;
            this.renderer.setElementClass(srcElem, 'dnd-src', true);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text', "" + this.column.getColumnId());
        }
    };
    TableCellConfigComponent.prototype.onDragOver = function (event) {
        // Method called because a dragged element is moved over the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'move';
        return false;
    };
    TableCellConfigComponent.prototype.onDragEnter = function (event) {
        // Method called because a dragged element enters the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        var srcElem = this.elementRef.nativeElement;
        if (dragTargetStack.indexOf(srcElem) == -1) {
            this.renderer.setElementClass(srcElem, "dnd-over", true);
        }
        dragTargetStack.push(srcElem);
    };
    TableCellConfigComponent.prototype.onDragLeave = function (event) {
        // Method called because a dragged element leaved the event.srcElement element
        var srcElem = this.elementRef.nativeElement;
        var index = dragTargetStack.indexOf(srcElem);
        if (index > -1) {
            dragTargetStack.splice(index, 1);
            index = dragTargetStack.indexOf(srcElem);
            if (index == -1) {
                this.renderer.setElementClass(srcElem, "dnd-over", false);
            }
        }
    };
    TableCellConfigComponent.prototype.onDragDrop = function (event) {
        // Method called because the user wants to drop a dragged element onto the event.srcElement element
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        console.log("onDragDrop");
        var self = this;
        dragTargetStack.forEach(function (item) {
            item.classList.remove('dnd-over');
        });
        var dropElem = this.elementRef.nativeElement;
        dropElem.classList.remove('dnd-over');
        var draggedElemId = event.dataTransfer.getData('text');
        this.onDragDropEvent.emit(new table_component_1.DragEventData(parseStyleInt(draggedElemId), this.column.getColumnId(), this.viewIndex, this.column.getViewType()));
        return false;
    };
    TableCellConfigComponent.prototype.onDragEnd = function (event) {
        // Method called on a dragged element to notify that it has been dropped
        var srcElem = event.srcElement;
        srcElem.style.opacity = '1';
        srcElem.classList.remove('dnd-src');
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableViewColumn)
    ], TableCellConfigComponent.prototype, "column", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], TableCellConfigComponent.prototype, "viewIndex", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableCellConfigComponent.prototype, "onDragDropEvent", void 0);
    TableCellConfigComponent = __decorate([
        core_1.Component({
            selector: 'my-table-view-cel-configurer',
            encapsulation: core_1.ViewEncapsulation.Emulated,
            host: {
                '(dragstart)': 'onDragStart($event)',
                '(dragend)': 'onDragEnd($event)',
                '(dragover)': 'onDragOver($event)',
                '(dragenter)': 'onDragEnter($event)',
                '(dragleave)': 'onDragLeave($event)',
                '(drop)': 'onDragDrop($event)',
                '(click)': 'onClick($event)'
            },
            template: "\n    <div draggable=\"true\">\n        <div *ngIf=\"getCellValue()!=null\">{{getCellValue()}}</div>\n    </div>"
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], TableCellConfigComponent);
    return TableCellConfigComponent;
}());
exports.TableCellConfigComponent = TableCellConfigComponent;
var TableViewAvailableConfigurerComponent = (function () {
    function TableViewAvailableConfigurerComponent() {
        this.onDragDropEvent = new core_1.EventEmitter();
    }
    TableViewAvailableConfigurerComponent.prototype.getColumns = function () {
        return this.table.getViews()[0].getColumns();
    };
    TableViewAvailableConfigurerComponent.prototype.dragDropEvent = function (event) {
        event.setId(this.table.getId());
        this.onDragDropEvent.emit(event);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.ConfigTable)
    ], TableViewAvailableConfigurerComponent.prototype, "table", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableViewAvailableConfigurerComponent.prototype, "onDragDropEvent", void 0);
    TableViewAvailableConfigurerComponent = __decorate([
        core_1.Component({
            selector: 'my-table-view-available-configurer',
            template: "<div class=\"row\">\n                    <my-table-view-cel-configurer *ngFor=\"let column of getColumns()\" [column]=\"column\" [viewIndex]=\"'0'\" (onDragDropEvent)=\"dragDropEvent($event)\"></my-table-view-cel-configurer>\n               </div>\n               "
        }), 
        __metadata('design:paramtypes', [])
    ], TableViewAvailableConfigurerComponent);
    return TableViewAvailableConfigurerComponent;
}());
exports.TableViewAvailableConfigurerComponent = TableViewAvailableConfigurerComponent;
var TableViewUsedConfigurerComponent = (function () {
    function TableViewUsedConfigurerComponent() {
        this.onDragDropEvent = new core_1.EventEmitter();
    }
    TableViewUsedConfigurerComponent.prototype.getViews = function () {
        return this.table.getViews();
    };
    TableViewUsedConfigurerComponent.prototype.dragDropEvent = function (event) {
        event.setId(this.table.getId());
        this.onDragDropEvent.emit(event);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.ConfigTable)
    ], TableViewUsedConfigurerComponent.prototype, "table", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableViewUsedConfigurerComponent.prototype, "onDragDropEvent", void 0);
    TableViewUsedConfigurerComponent = __decorate([
        core_1.Component({
            selector: 'my-table-view-used-configurer',
            template: "<div *ngFor=\"let view of getViews(), let index=index\">\n                    <p>View {{index+1}}</p>\n                    <div class=\"row\">\n                        <my-table-view-cel-configurer *ngFor=\"let column of view.getColumns()\" [column]=\"column\" [viewIndex]=\"index\" (onDragDropEvent)=\"dragDropEvent($event)\"></my-table-view-cel-configurer>\n                    </div>\n               </div>\n               "
        }), 
        __metadata('design:paramtypes', [])
    ], TableViewUsedConfigurerComponent);
    return TableViewUsedConfigurerComponent;
}());
exports.TableViewUsedConfigurerComponent = TableViewUsedConfigurerComponent;
var TableViewConfigurerComponent = (function () {
    function TableViewConfigurerComponent(myService) {
        this.myService = myService;
        this.availableColumnsTable = new table_model2_1.ConfigTable("available table", myService.getAvailableColumnsForCalibration(), table_model2_1.ViewMode.VIEW_ONLY);
        this.usedColumnsTable = new table_model2_1.ConfigTable("used table", myService.getUsedColumnsForCalibration(), table_model2_1.ViewMode.LEFT_VIEW_RIGHT_MERGE);
    }
    TableViewConfigurerComponent.prototype.dragDropEvent = function (event) {
        console.log("DRAG DROP EVENT");
        var draggedColumnId = event.getDraggedColumnId();
        var droppedColumnId = event.getDroppedColumnId();
        var tableColumnMetadataList = null;
        if (this.availableColumnsTable.getId() == event.getId()) {
            var availableColumnsTableMetadata = this.availableColumnsTable.getTableMetadata();
            tableColumnMetadataList = availableColumnsTableMetadata.getColumns(0);
            var indexInView = 0;
            if (droppedColumnId != -1) {
                for (var i = 0; i < tableColumnMetadataList.length; i++) {
                    if (tableColumnMetadataList[i].getId() == droppedColumnId) {
                        indexInView = i;
                        break;
                    }
                }
            }
            else {
                indexInView = tableColumnMetadataList.length;
            }
            var draggedColumn = availableColumnsTableMetadata.getColumnById(draggedColumnId);
            if (draggedColumn == null) {
                // Column is dragged from the usedColumnsTable table
                draggedColumn = this.usedColumnsTable.getTableMetadata().getColumnById(event.getDraggedColumnId());
                this.usedColumnsTable.getTableMetadata().removeColumn(draggedColumn);
                availableColumnsTableMetadata.addColumn(draggedColumn, 0, indexInView);
            }
            else {
                // Column is dragged from the availableColumnsTable table
                availableColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
            }
        }
        else if (this.usedColumnsTable.getId() == event.getId()) {
            var usedColumnsTableMetadata = this.usedColumnsTable.getTableMetadata();
            switch (event.getDroppedAreaViewType()) {
                case table_metadata_1.ViewType.VIEW:
                    tableColumnMetadataList = (event.getDroppedViewId() < usedColumnsTableMetadata.getViewSize()) ? usedColumnsTableMetadata.getColumns(event.getDroppedViewId()) : [];
                    break;
                case table_metadata_1.ViewType.LEFT:
                    tableColumnMetadataList = usedColumnsTableMetadata.getLeftRepeatableColumns();
                    break;
                case table_metadata_1.ViewType.RIGHT:
                    tableColumnMetadataList = usedColumnsTableMetadata.getRightRepeatableColumns();
                    break;
            }
            var indexInView = 0;
            if (droppedColumnId != -1) {
                for (var i = 0; i < tableColumnMetadataList.length; i++) {
                    if (tableColumnMetadataList[i].getId() == droppedColumnId) {
                        indexInView = i;
                        break;
                    }
                }
            }
            else {
                indexInView = tableColumnMetadataList.length;
            }
            var draggedColumn = usedColumnsTableMetadata.getColumnById(draggedColumnId);
            if (draggedColumn == null) {
                // Column is dragged from the availableColumnsTable table
                draggedColumn = this.availableColumnsTable.getTableMetadata().getColumnById(event.getDraggedColumnId());
                this.availableColumnsTable.getTableMetadata().removeColumn(draggedColumn);
                if (table_metadata_1.ViewType.VIEW != event.getDroppedAreaViewType()) {
                    usedColumnsTableMetadata.addColumn(draggedColumn, 0, null);
                    usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
                }
                else {
                    usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
                }
            }
            else {
                // Column is dragged from the usedColumnsTable table
                usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
            }
        }
    };
    TableViewConfigurerComponent.prototype.applyChanges = function () {
        this.myService.applyChanges(this.usedColumnsTable.getTableMetadata());
    };
    TableViewConfigurerComponent = __decorate([
        core_1.Component({
            selector: 'my-table-view-configurer',
            template: "<p><b>Available columns</b></p>\n               <my-table-view-available-configurer [table]=\"availableColumnsTable\" (onDragDropEvent)=\"dragDropEvent($event)\"></my-table-view-available-configurer>\n               <p><b>Used columns</b></p>\n               <my-table-view-used-configurer [table]=\"usedColumnsTable\" (onDragDropEvent)=\"dragDropEvent($event)\"></my-table-view-used-configurer>\n               <button (click)=\"applyChanges()\">Apply</button>\n               "
        }), 
        __metadata('design:paramtypes', [app_service_1.MyService])
    ], TableViewConfigurerComponent);
    return TableViewConfigurerComponent;
}());
exports.TableViewConfigurerComponent = TableViewConfigurerComponent;
//# sourceMappingURL=tableextconfig.component.js.map