"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var table_model2_1 = require('./table.model2');
var EMPTY_TABLE_VIEW = new Array();
var dragTargetStack = new Array();
var parseStyleInt = function (styleInt) {
    var rslt = parseInt(styleInt);
    return isNaN(rslt) ? 0 : rslt;
};
var DragEventData = (function () {
    function DragEventData(draggedColumnId, droppedColumnId, droppedViewId, droppedAreaViewType) {
        this.draggedColumnId = draggedColumnId;
        this.droppedColumnId = droppedColumnId;
        this.droppedViewId = droppedViewId;
        this.droppedAreaViewType = droppedAreaViewType;
    }
    DragEventData.prototype.getDraggedColumnId = function () {
        return this.draggedColumnId;
    };
    DragEventData.prototype.getDroppedColumnId = function () {
        return this.droppedColumnId;
    };
    DragEventData.prototype.getDroppedViewId = function () {
        return this.droppedViewId;
    };
    DragEventData.prototype.getDroppedAreaViewType = function () {
        return this.droppedAreaViewType;
    };
    DragEventData.prototype.setId = function (id) {
        this.id = id;
    };
    DragEventData.prototype.getId = function () {
        return this.id;
    };
    return DragEventData;
}());
exports.DragEventData = DragEventData;
var ResizeEventData = (function () {
    function ResizeEventData(resizedColumnIndex, startClientX) {
        this.resizedColumnIndex = resizedColumnIndex;
        this.startClientX = startClientX;
    }
    ResizeEventData.prototype.getResizedColumnIndex = function () {
        return this.resizedColumnIndex;
    };
    ResizeEventData.prototype.getStartClientX = function () {
        return this.startClientX;
    };
    return ResizeEventData;
}());
exports.ResizeEventData = ResizeEventData;
var TableCellComponent = (function () {
    function TableCellComponent(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    TableCellComponent.prototype.ngOnInit = function () {
        var elem = this.elementRef.nativeElement;
        if (!this.rowData) {
            this.renderer.setElementAttribute(elem, "data-id", "" + this.column.getColumnId());
        }
        if (this.column.isRepeateable() && this.rowData == null) {
            this.renderer.setElementClass(elem, "repeatable", true);
        }
        this.currentCellWidth = "" + this.column.getLength();
        this.formatStyleWithElemWidth(elem, this.currentCellWidth);
    };
    TableCellComponent.prototype.ngDoCheck = function () {
        var newCellWidth = "" + this.column.getLength();
        if (this.currentCellWidth != newCellWidth) {
            this.currentCellWidth = newCellWidth;
            //            console.log("####### ngDoCheck " + this.currentCellWidth);
            var elem = this.elementRef.nativeElement;
            this.formatStyleWithElemWidth(elem, newCellWidth);
        }
    };
    TableCellComponent.prototype.formatStyleWithElemWidth = function (elem, width) {
        this.renderer.setElementStyle(elem, "flex-basis", width + "px");
        this.renderer.setElementStyle(elem, "width", width + "px");
        this.renderer.setElementStyle(elem, "flex-grow", width);
        this.renderer.setElementStyle(elem, "flex-shrink", width);
    };
    TableCellComponent.prototype.getCellValue = function () {
        return (this.rowData) ? this.column.getValue(this.rowData) : this.column.getColumnLabel();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableViewColumn)
    ], TableCellComponent.prototype, "column", void 0);
    __decorate([
        core_1.Optional(),
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TableCellComponent.prototype, "rowData", void 0);
    __decorate([
        core_1.Optional(),
        core_1.Input(), 
        __metadata('design:type', Number)
    ], TableCellComponent.prototype, "preferredHeight", void 0);
    TableCellComponent = __decorate([
        core_1.Component({
            selector: 'my-table-cell',
            encapsulation: core_1.ViewEncapsulation.Emulated,
            template: "<div [style.height]=\"preferredHeight\">{{getCellValue()}}</div>"
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], TableCellComponent);
    return TableCellComponent;
}());
exports.TableCellComponent = TableCellComponent;
var TableColumnResizeComponent = (function () {
    function TableColumnResizeComponent(renderer, elementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.onResizeStartEvent = new core_1.EventEmitter();
        this.onDragDropEvent = new core_1.EventEmitter();
    }
    TableColumnResizeComponent.prototype.onDragStart = function (event) {
        console.log("@@@@@@@@@@ drag start");
        // Method called because a drag operation has been initiated on the event.srcElement element
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text', "" + this.column.getIndexInView());
        var img = new Image();
        var e = event;
        e.dataTransfer.setDragImage(img, 10, 10);
        this.onResizeStartEvent.emit(new ResizeEventData(this.column.getIndexInView(), event.clientX));
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableViewColumn)
    ], TableColumnResizeComponent.prototype, "column", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableColumnResizeComponent.prototype, "onResizeStartEvent", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableColumnResizeComponent.prototype, "onDragDropEvent", void 0);
    TableColumnResizeComponent = __decorate([
        core_1.Component({
            selector: 'my-table-col-resizer',
            encapsulation: core_1.ViewEncapsulation.Emulated,
            host: {
                '(dragstart)': 'onDragStart($event)'
            },
            template: "<div></div>"
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], TableColumnResizeComponent);
    return TableColumnResizeComponent;
}());
exports.TableColumnResizeComponent = TableColumnResizeComponent;
var TableCellHeaderComponent = (function (_super) {
    __extends(TableCellHeaderComponent, _super);
    function TableCellHeaderComponent(renderer, elementRef) {
        _super.call(this, renderer, elementRef);
        this.onResizeStartEvent = new core_1.EventEmitter();
        this.onDragDropEvent = new core_1.EventEmitter();
    }
    TableCellHeaderComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
    };
    TableCellHeaderComponent.prototype.resizeStartEvent = function (event) {
        this.onResizeStartEvent.emit(event);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableViewColumn)
    ], TableCellHeaderComponent.prototype, "column", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], TableCellHeaderComponent.prototype, "isResizeable", void 0);
    __decorate([
        core_1.Optional(),
        core_1.Input(), 
        __metadata('design:type', Number)
    ], TableCellHeaderComponent.prototype, "preferredHeight", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableCellHeaderComponent.prototype, "onResizeStartEvent", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableCellHeaderComponent.prototype, "onDragDropEvent", void 0);
    TableCellHeaderComponent = __decorate([
        core_1.Component({
            selector: 'my-table-cell-header',
            encapsulation: core_1.ViewEncapsulation.Emulated,
            template: "<div [style.height]=\"preferredHeight\">{{getCellValue()}}</div>\n               <my-table-col-resizer *ngIf=\"isResizeable\" draggable=\"true\" [column]=\"column\" (onResizeStartEvent)=\"resizeStartEvent($event)\"></my-table-col-resizer>\n              "
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], TableCellHeaderComponent);
    return TableCellHeaderComponent;
}(TableCellComponent));
exports.TableCellHeaderComponent = TableCellHeaderComponent;
var TableHeaderComponent = (function () {
    function TableHeaderComponent(renderer, elementRef) {
        this.onResizeStartEvent = new core_1.EventEmitter();
        this.onResizeBusyEvent = new core_1.EventEmitter();
        this.dragInitialColumnSizes = new Array();
        this.lastDragBusyEventTimestamp = Date.now();
        this.renderer = renderer;
        this.elementRef = elementRef;
    }
    TableHeaderComponent.prototype.getColumns = function () {
        return (this.tableView === undefined) ? EMPTY_TABLE_VIEW : this.tableView.getColumns();
    };
    TableHeaderComponent.prototype.onDragOver = function (event) {
        // Method called because a dragged element is moved over the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'move';
        this.resizeBusyEvent(new ResizeEventData(null, event.clientX));
        return false;
    };
    TableHeaderComponent.prototype.onDragEnter = function (event) {
        console.log("@@@@@@@@@@ onDragEnter HEADER ");
        // Method called because a dragged element enters the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        var srcElem = this.elementRef.nativeElement;
        if (dragTargetStack.indexOf(srcElem) == -1) {
        }
        dragTargetStack.push(srcElem);
    };
    TableHeaderComponent.prototype.onDragLeave = function (event) {
        console.log("@@@@@@@@@@ onDragLeave HEADER ");
        // Method called because a dragged element leaved the event.srcElement element
        var srcElem = this.elementRef.nativeElement;
        var index = dragTargetStack.indexOf(srcElem);
        if (index > -1) {
            dragTargetStack.splice(index, 1);
            index = dragTargetStack.indexOf(srcElem);
            if (index == -1) {
            }
        }
    };
    TableHeaderComponent.prototype.resizeStartEvent = function (event) {
        this.onResizeStartEvent.emit(event);
    };
    TableHeaderComponent.prototype.resizeBusyEvent = function (event) {
        this.onResizeBusyEvent.emit(event);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableView)
    ], TableHeaderComponent.prototype, "tableView", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableHeaderComponent.prototype, "onResizeStartEvent", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableHeaderComponent.prototype, "onResizeBusyEvent", void 0);
    TableHeaderComponent = __decorate([
        core_1.Component({
            selector: 'my-table-header',
            host: {
                '(dragover)': 'onDragOver($event)',
                '(dragenter)': 'onDragEnter($event)',
                '(dragleave)': 'onDragLeave($event)'
            },
            template: "<my-table-cell-header *ngFor=\"let column of getColumns(), let isLast=last\" [column]=\"column\" (onResizeStartEvent)=\"resizeStartEvent($event)\" [isResizeable]=\"!isLast\"></my-table-cell-header>"
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], TableHeaderComponent);
    return TableHeaderComponent;
}());
exports.TableHeaderComponent = TableHeaderComponent;
var TableRowComponent = (function () {
    function TableRowComponent() {
    }
    TableRowComponent.prototype.getColumns = function () {
        return (this.tableView === undefined) ? EMPTY_TABLE_VIEW : this.tableView.getColumns();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.TableView)
    ], TableRowComponent.prototype, "tableView", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TableRowComponent.prototype, "rowData", void 0);
    TableRowComponent = __decorate([
        core_1.Component({
            selector: 'my-table-row',
            template: "<my-table-cell *ngFor=\"let column of getColumns()\" [style.height]=\"preferredHeight\" [column]=\"column\" [rowData]=\"rowData\"></my-table-cell>"
        }), 
        __metadata('design:paramtypes', [])
    ], TableRowComponent);
    return TableRowComponent;
}());
exports.TableRowComponent = TableRowComponent;
var TableComponent = (function () {
    function TableComponent(elementRef) {
        this.onViewChange = new core_1.EventEmitter();
        this.dragInitialColumnSizes = new Array();
        this.lastDragBusyEventTimestamp = Date.now();
        this.elementRef = elementRef;
    }
    TableComponent.prototype.getLastUpdateCounter = function () {
        return this.table.getLastUpdateCounter();
    };
    TableComponent.prototype.getCurrentView = function () {
        return this.table.getViews()[this.currentViewIndex];
    };
    TableComponent.prototype.getData = function () {
        return this.table.getData();
    };
    TableComponent.prototype.getTable = function () {
        return this.table;
    };
    TableComponent.prototype.ngAfterViewInit = function () {
        var self = this;
        setTimeout(function () {
            self.forceRedraw(true);
        }, 1);
    };
    TableComponent.prototype.handleWindowResizeEvent = function (uiEvent) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        var self = this;
        this.timer = setTimeout(function () {
            self.timer = null;
            self.forceRedraw(false);
        }, 100);
    };
    TableComponent.prototype.forceRedraw = function (hasContentChanged) {
        var tableElem = this.elementRef.nativeElement;
        var tableHeaderElem = tableElem.querySelector(this.getTableHeaderTag());
        // tableHeaderElem is used instead of tableElem because tableElem.offsetWidth always returns 0 in Chrome
        var width = tableHeaderElem.offsetWidth - parseStyleInt(tableElem.style.marginLeft) - parseStyleInt(tableElem.style.marginRight);
        if (hasContentChanged) {
            this.table.refresh(width);
        }
        else {
            this.table.redraw(width, false);
        }
    };
    TableComponent.prototype.resizeStartEvent = function (event) {
        console.log("#################### dragStartEvent");
        this.dragInitialColumnSizes = new Array();
        this.dragStartEvent = event;
        var tableElem = this.elementRef.nativeElement;
        var tableCellHeaderElems = tableElem.querySelectorAll("my-table-cell-header");
        this.forceRedraw(false);
        var viewColumns = this.getCurrentView().getColumns();
        for (var i = 0; i < viewColumns.length; i++) {
            this.dragInitialColumnSizes[i] = viewColumns[i].getLength();
        }
    };
    TableComponent.prototype.resizeBusyEvent = function (event) {
        var now = Date.now();
        if ((now - this.lastDragBusyEventTimestamp) > 60) {
            var dragClientX = event.getStartClientX();
            var viewColumns = this.getCurrentView().getColumns();
            var offset = dragClientX - this.dragStartEvent.getStartClientX();
            console.log("#################### dragBusyEvent " + offset);
            var resizedColumnIndex = this.dragStartEvent.getResizedColumnIndex();
            viewColumns[resizedColumnIndex].setLength(this.dragInitialColumnSizes[resizedColumnIndex] + offset);
            viewColumns[resizedColumnIndex + 1].setLength(this.dragInitialColumnSizes[resizedColumnIndex + 1] - offset);
            this.table.redraw(null, true);
        }
    };
    TableComponent.prototype.getTableHeaderTag = function () {
        return "my-table-header";
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', table_model2_1.Table)
    ], TableComponent.prototype, "table", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], TableComponent.prototype, "currentViewIndex", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], TableComponent.prototype, "onViewChange", void 0);
    __decorate([
        core_1.ViewChild(TableHeaderComponent), 
        __metadata('design:type', TableHeaderComponent)
    ], TableComponent.prototype, "headerComponent", void 0);
    __decorate([
        core_1.HostListener('window:resize', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [UIEvent]), 
        __metadata('design:returntype', void 0)
    ], TableComponent.prototype, "handleWindowResizeEvent", null);
    TableComponent = __decorate([
        core_1.Component({
            selector: 'my-table',
            template: "<my-table-header [tableView]=\"getCurrentView()\" (onResizeStartEvent)=\"resizeStartEvent($event)\" (onResizeBusyEvent)=\"resizeBusyEvent($event)\"></my-table-header>\n <my-table-row *ngFor=\"let row of getData().getRows()\" [tableView]=\"getCurrentView()\" [rowData]=\"row\"></my-table-row>"
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], TableComponent);
    return TableComponent;
}());
exports.TableComponent = TableComponent;
//# sourceMappingURL=table.component.js.map