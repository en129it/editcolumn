import { Component, HostListener, Input, ElementRef, ViewEncapsulation, Optional, ViewChild, Renderer, Output, EventEmitter } from '@angular/core';
import { MyService } from './app.service';
import { Table, TableView, TableViewColumn, ViewMode, DisplayMode } from './table.model2';
import { TableModel } from './table.model';
import { TableColumnMetadata, ViewType, DataType } from './table.metadata';

const EMPTY_TABLE_VIEW  = new Array<TableViewColumn>();

var dragTargetStack = new Array<HTMLElement>(); 
var parseStyleInt = (styleInt : string) => {
    var rslt = parseInt(styleInt);
    return isNaN(rslt) ? 0 : rslt;
};

export class DragEventData {
    private id: string;

    constructor(private draggedColumnId: number, private droppedColumnId: number, private droppedViewId: number, private droppedAreaViewType: ViewType) {
    }

    getDraggedColumnId() : number {
        return this.draggedColumnId;
    }

    getDroppedColumnId() : number {
        return this.droppedColumnId;
    }

    getDroppedViewId(): number {
        return this.droppedViewId;
    }

    getDroppedAreaViewType(): ViewType {
        return this.droppedAreaViewType;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }
}

export class ResizeEventData {
    private id: string;

    constructor(private resizedColumnIndex: number, private startClientX: number) {
    }

    getResizedColumnIndex() : number {
        return this.resizedColumnIndex;
    }

    getStartClientX() : number {
        return this.startClientX;
    }

}

@Component({
    selector: 'my-table-cell',
    encapsulation : ViewEncapsulation.Emulated,
    template: `<div [style.height]="preferredHeight">{{getCellValue()}}</div>`
})
export class TableCellComponent {
    @Input()
    column: TableViewColumn;
    @Optional() @Input()
    rowData: Object;
    @Optional() @Input()
    preferredHeight: number;
    renderer: Renderer;
    elementRef: ElementRef;
    private currentCellWidth: string;

    constructor(renderer: Renderer, elementRef: ElementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;       
    }

    ngOnInit() { 
        var elem = <HTMLElement>this.elementRef.nativeElement;
        if (!this.rowData) {
            this.renderer.setElementAttribute(elem, "data-id", ""+this.column.getColumnId());
        }
        if (this.column.isRepeateable() && this.rowData==null) {
            this.renderer.setElementClass(elem, "repeatable", true);
        }

        this.currentCellWidth = "" + this.column.getLength();
        this.formatStyleWithElemWidth(elem, this.currentCellWidth);
    }

    ngDoCheck() {
        var newCellWidth = "" + this.column.getLength();
        if (this.currentCellWidth!=newCellWidth) {
            this.currentCellWidth = newCellWidth;
//            console.log("####### ngDoCheck " + this.currentCellWidth);
            var elem = <HTMLElement>this.elementRef.nativeElement;
            this.formatStyleWithElemWidth(elem, newCellWidth);
        }
    }

    private formatStyleWithElemWidth(elem: HTMLElement, width: string) {
        this.renderer.setElementStyle(elem, "flex-basis", width + "px");
        this.renderer.setElementStyle(elem, "width", width + "px");
        this.renderer.setElementStyle(elem, "flex-grow", width);
        this.renderer.setElementStyle(elem, "flex-shrink", width);
    }

    getCellValue(): any {
        return (this.rowData) ? this.column.getValue(this.rowData) : this.column.getColumnLabel();
    }
}


@Component({
    selector: 'my-table-col-resizer',
    encapsulation : ViewEncapsulation.Emulated,
    host: {
        '(dragstart)' : 'onDragStart($event)'
    },
    template: `<div></div>`
})
export class TableColumnResizeComponent {
    @Input()
    column: TableViewColumn;
    @Output() 
    onResizeStartEvent = new EventEmitter<ResizeEventData>();
    @Output() 
    onDragDropEvent = new EventEmitter<DragEventData>();
    showButtons: boolean;

    constructor(private renderer: Renderer, private elementRef: ElementRef) {
    }

    onDragStart(event: DragEvent) {
        console.log("@@@@@@@@@@ drag start");
        // Method called because a drag operation has been initiated on the event.srcElement element
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text', ""+this.column.getIndexInView());

        var img = new Image(); 
        var e : any = event;
        e.dataTransfer.setDragImage(img, 10, 10);

        this.onResizeStartEvent.emit(new ResizeEventData(this.column.getIndexInView(), event.clientX));
    }
}

@Component({
    selector: 'my-table-cell-header',
    encapsulation : ViewEncapsulation.Emulated,
    template: `<div [style.height]="preferredHeight">{{getCellValue()}}</div>
               <my-table-col-resizer *ngIf="isResizeable" draggable="true" [column]="column" (onResizeStartEvent)="resizeStartEvent($event)"></my-table-col-resizer>
              `
})
export class TableCellHeaderComponent extends TableCellComponent {
    @Input()
    column: TableViewColumn;
    @Input()
    isResizeable: boolean;
    @Optional() @Input()
    preferredHeight: number;
    @Output() 
    onResizeStartEvent = new EventEmitter<ResizeEventData>();
    @Output() 
    onDragDropEvent = new EventEmitter<DragEventData>();
    showButtons: boolean;

    constructor(renderer: Renderer, elementRef: ElementRef) {
        super(renderer, elementRef);       
    }

    ngOnInit() {
        super.ngOnInit(); 
    }

    public resizeStartEvent(event: ResizeEventData) {
        this.onResizeStartEvent.emit(event);
    }
}

@Component({
    selector: 'my-table-header',
    host: {
        '(dragover)' : 'onDragOver($event)',
        '(dragenter)' : 'onDragEnter($event)',
        '(dragleave)' : 'onDragLeave($event)'
    },
    template: `<my-table-cell-header *ngFor="let column of getColumns(), let isLast=last" [column]="column" (onResizeStartEvent)="resizeStartEvent($event)" [isResizeable]="!isLast"></my-table-cell-header>`
})
export class TableHeaderComponent {
    @Input()
    tableView : TableView;
    @Output() 
    onResizeStartEvent = new EventEmitter<ResizeEventData>();
    @Output() 
    onResizeBusyEvent = new EventEmitter<ResizeEventData>();
    protected renderer : Renderer;
    protected elementRef: ElementRef;
    private dragStartEvent: ResizeEventData;
    private dragInitialColumnSizes = new Array<number>();
    private lastDragBusyEventTimestamp = Date.now();

    constructor(renderer: Renderer, elementRef: ElementRef) {
        this.renderer = renderer;
        this.elementRef = elementRef;
    }

    getColumns(): Array<TableViewColumn> {
         return (this.tableView===undefined) ? EMPTY_TABLE_VIEW : this.tableView.getColumns();
    }

    onDragOver(event: DragEvent) {
        // Method called because a dragged element is moved over the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'move';

        this.resizeBusyEvent(new ResizeEventData(null, event.clientX));

        return false;
    }

    onDragEnter(event: DragEvent) {
console.log("@@@@@@@@@@ onDragEnter HEADER ");
        // Method called because a dragged element enters the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
    
        var srcElem = this.elementRef.nativeElement;
        if (dragTargetStack.indexOf(srcElem)==-1) {
        }
        dragTargetStack.push(srcElem);
    }

    onDragLeave(event: DragEvent) {
console.log("@@@@@@@@@@ onDragLeave HEADER ");
        // Method called because a dragged element leaved the event.srcElement element
        var srcElem = this.elementRef.nativeElement;
        var index = dragTargetStack.indexOf(srcElem);
        if (index>-1) {
            dragTargetStack.splice(index, 1);

            index = dragTargetStack.indexOf(srcElem);
            if (index==-1) {
            }
        }
    }

    public resizeStartEvent(event: ResizeEventData) {
        this.onResizeStartEvent.emit(event);
    }

    public resizeBusyEvent(event: ResizeEventData) {
        this.onResizeBusyEvent.emit(event);
    }
}


@Component({
    selector: 'my-table-row',
    template: `<my-table-cell *ngFor="let column of getColumns()" [style.height]="preferredHeight" [column]="column" [rowData]="rowData"></my-table-cell>`
})
export class TableRowComponent {
    @Input()
    tableView : TableView;
    @Input()
    rowData : Object;

    constructor() {
    }

    getColumns(): Array<TableViewColumn> {
         return (this.tableView===undefined) ? EMPTY_TABLE_VIEW : this.tableView.getColumns();
    }
}


@Component({
    selector: 'my-table',
    template: 
`<my-table-header [tableView]="getCurrentView()" (onResizeStartEvent)="resizeStartEvent($event)" (onResizeBusyEvent)="resizeBusyEvent($event)"></my-table-header>
 <my-table-row *ngFor="let row of getData().getRows()" [tableView]="getCurrentView()" [rowData]="row"></my-table-row>`
})
export class TableComponent {
    @Input()
    table : Table;
    @Input()
    currentViewIndex : number;
    @Output() 
    onViewChange = new EventEmitter<boolean>();
    @ViewChild(TableHeaderComponent) headerComponent: TableHeaderComponent;
    protected timer: any;
    protected elementRef : ElementRef;
    private dragStartEvent: ResizeEventData;
    private dragInitialColumnSizes = new Array<number>();
    private lastDragBusyEventTimestamp = Date.now();

    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }

    getLastUpdateCounter() {
        return this.table.getLastUpdateCounter();
    }

    getCurrentView(): TableView {
        return this.table.getViews()[this.currentViewIndex];
    }

    getData(): TableModel {
        return this.table.getData();
    }

    getTable(): Table {
        return this.table;
    }

    ngAfterViewInit() {
        var self = this;
        setTimeout(function() {
            self.forceRedraw(true);
        }, 1);
    }

    @HostListener('window:resize', ['$event'])
    handleWindowResizeEvent(uiEvent: UIEvent) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        var self = this;
        this.timer = setTimeout(function() {
            self.timer = null;
            self.forceRedraw(false);
        }, 100);
    }

    public forceRedraw(hasContentChanged: boolean) {
        var tableElem = <HTMLElement>this.elementRef.nativeElement;
        var tableHeaderElem = <HTMLElement>tableElem.querySelector(this.getTableHeaderTag());
        
        // tableHeaderElem is used instead of tableElem because tableElem.offsetWidth always returns 0 in Chrome
        var width = tableHeaderElem.offsetWidth - parseStyleInt(tableElem.style.marginLeft) - parseStyleInt(tableElem.style.marginRight);

        if (hasContentChanged) { 
            this.table.refresh(width);
        } else {
            this.table.redraw(width, false);
        }
    }

    public resizeStartEvent(event: ResizeEventData) {
        console.log("#################### dragStartEvent");

        this.dragInitialColumnSizes = new Array<number>();

        this.dragStartEvent = event;
        var tableElem = this.elementRef.nativeElement;
        var tableCellHeaderElems = <Array<HTMLElement>>tableElem.querySelectorAll("my-table-cell-header");
        
        this.forceRedraw(false);

        var viewColumns = this.getCurrentView().getColumns();
        for (var i=0; i<viewColumns.length; i++) {
            this.dragInitialColumnSizes[i] = viewColumns[i].getLength(); 
        }
    }

    public resizeBusyEvent(event: ResizeEventData) {
        var now = Date.now();
        if ((now-this.lastDragBusyEventTimestamp) > 60) {
            var dragClientX = event.getStartClientX();
            var viewColumns = this.getCurrentView().getColumns();
            
            var offset = dragClientX - this.dragStartEvent.getStartClientX();
            console.log("#################### dragBusyEvent " + offset );

            var resizedColumnIndex = this.dragStartEvent.getResizedColumnIndex();
            viewColumns[resizedColumnIndex].setLength(this.dragInitialColumnSizes[resizedColumnIndex] + offset);
            viewColumns[resizedColumnIndex+1].setLength(this.dragInitialColumnSizes[resizedColumnIndex+1] - offset);
            this.table.redraw(null, true);
        }
    }

    protected getTableHeaderTag(): string {
        return "my-table-header";
    }
}
