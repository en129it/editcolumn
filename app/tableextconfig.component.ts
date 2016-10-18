import { Component, HostListener, Input, ElementRef, ViewEncapsulation, Optional, ViewChild, Renderer, Output, EventEmitter } from '@angular/core';
import { MyService } from './app.service';
import { ConfigTable, Table, TableView, TableViewColumn, ViewMode, DisplayMode } from './table.model2';
import { TableModel } from './table.model';
import { TableMetadata, TableColumnMetadata, ViewType, DataType } from './table.metadata';
import { DragEventData } from './table.component';

var parseStyleInt = (styleInt : string) => {
    var rslt = parseInt(styleInt);
    return isNaN(rslt) ? 0 : rslt;
};

var dragTargetStack = new Array<HTMLElement>(); 

@Component({
    selector: 'my-table-view-cel-configurer',
    encapsulation : ViewEncapsulation.Emulated,
    host: {
        '(dragstart)' : 'onDragStart($event)',
        '(dragend)' : 'onDragEnd($event)',
        '(dragover)' : 'onDragOver($event)',
        '(dragenter)' : 'onDragEnter($event)',
        '(dragleave)' : 'onDragLeave($event)',
        '(drop)' : 'onDragDrop($event)',
        '(click)' : 'onClick($event)'
    },
    template: `
    <div draggable="true">
        <div *ngIf="getCellValue()!=null">{{getCellValue()}}</div>
    </div>`
})
export class TableCellConfigComponent {
    @Input()
    column: TableViewColumn;
    @Input()
    viewIndex: number;
    @Output() 
    onDragDropEvent = new EventEmitter<DragEventData>();

    constructor(private renderer: Renderer, private elementRef: ElementRef) {
    }

    ngOnInit() { 
        var elem = <HTMLElement>this.elementRef.nativeElement;

        if (this.column.isRepeateable()) {
            this.renderer.setElementClass(elem, "repeatable", true);
        }

        if (this.column) {
            this.renderer.setElementClass(elem, "draggable", true);
        }
    }

    getCellValue(): any {
        return this.column.getColumnLabel();
    }

    onDragStart(event: DragEvent) {
        // Method called because a drag operation has been initiated on the event.srcElement element
        if (this.column) {
            var srcElem = this.elementRef.nativeElement;
            this.renderer.setElementClass(srcElem, 'dnd-src', true);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text', "" + this.column.getColumnId());
        }
    }

    onDragOver(event: DragEvent) {
        // Method called because a dragged element is moved over the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'move';
        return false;
    }

    onDragEnter(event: DragEvent) {
        // Method called because a dragged element enters the event.srcElement element
        if (event.preventDefault) {
            event.preventDefault();
        }
    
        var srcElem = this.elementRef.nativeElement;
        if (dragTargetStack.indexOf(srcElem)==-1) {
            this.renderer.setElementClass(srcElem, "dnd-over", true);
        }
        dragTargetStack.push(srcElem);
    }

    onDragLeave(event: DragEvent) {
        // Method called because a dragged element leaved the event.srcElement element
        var srcElem = this.elementRef.nativeElement;
        var index = dragTargetStack.indexOf(srcElem);
        if (index>-1) {
            dragTargetStack.splice(index, 1);

            index = dragTargetStack.indexOf(srcElem);
            if (index==-1) {
                this.renderer.setElementClass(srcElem, "dnd-over", false);
            }
        }
    }

    onDragDrop(event: DragEvent) {
        // Method called because the user wants to drop a dragged element onto the event.srcElement element
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        console.log("onDragDrop");

        var self = this;
        dragTargetStack.forEach(function(item) {
            item.classList.remove('dnd-over');
        });

        var dropElem = this.elementRef.nativeElement;

        dropElem.classList.remove('dnd-over');
        var draggedElemId = event.dataTransfer.getData('text');
        this.onDragDropEvent.emit(new DragEventData(parseStyleInt(draggedElemId), this.column.getColumnId(), this.viewIndex, this.column.getViewType()));
        
        return false;
    }

    onDragEnd(event: DragEvent) {
        // Method called on a dragged element to notify that it has been dropped
        var srcElem = <HTMLElement>event.srcElement;
        srcElem.style.opacity= '1';
        srcElem.classList.remove('dnd-src');
    }
}

@Component({
    selector: 'my-table-view-available-configurer',
    template: `<div class="row">
                    <my-table-view-cel-configurer *ngFor="let column of getColumns()" [column]="column" [viewIndex]="'0'" (onDragDropEvent)="dragDropEvent($event)"></my-table-view-cel-configurer>
               </div>
               `
})
export class TableViewAvailableConfigurerComponent {
    @Input()
    table: ConfigTable;
    @Output()
    onDragDropEvent = new EventEmitter<DragEventData>();

    constructor() {
    }

    public getColumns(): Array<TableViewColumn> {
        return this.table.getViews()[0].getColumns();
    }

    public dragDropEvent(event: DragEventData) {
        event.setId(this.table.getId());
        this.onDragDropEvent.emit(event);
    }
}


@Component({
    selector: 'my-table-view-used-configurer',
    template: `<div *ngFor="let view of getViews(), let index=index">
                    <p>View {{index+1}}</p>
                    <div class="row">
                        <my-table-view-cel-configurer *ngFor="let column of view.getColumns()" [column]="column" [viewIndex]="index" (onDragDropEvent)="dragDropEvent($event)"></my-table-view-cel-configurer>
                    </div>
               </div>
               `
})
export class TableViewUsedConfigurerComponent {
    @Input()
    table: ConfigTable;
    @Output()
    onDragDropEvent = new EventEmitter<DragEventData>();

    constructor() {
    }

    public getViews(): Array<TableView> {
        return this.table.getViews();
    }

    public dragDropEvent(event: DragEventData) {
        event.setId(this.table.getId());
        this.onDragDropEvent.emit(event);
    }
}


@Component({
    selector: 'my-table-view-configurer',
    template: `<p><b>Available columns</b></p>
               <my-table-view-available-configurer [table]="availableColumnsTable" (onDragDropEvent)="dragDropEvent($event)"></my-table-view-available-configurer>
               <p><b>Used columns</b></p>
               <my-table-view-used-configurer [table]="usedColumnsTable" (onDragDropEvent)="dragDropEvent($event)"></my-table-view-used-configurer>
               <button (click)="applyChanges()">Apply</button>
               `
})
export class TableViewConfigurerComponent {
    availableColumnsTable: ConfigTable;
    usedColumnsTable: ConfigTable;

    constructor(private myService: MyService) {
        this.availableColumnsTable = new ConfigTable("available table", myService.getAvailableColumnsForCalibration(), ViewMode.VIEW_ONLY);
        this.usedColumnsTable = new ConfigTable("used table", myService.getUsedColumnsForCalibration(), ViewMode.LEFT_VIEW_RIGHT_MERGE);
    }

    public dragDropEvent(event: DragEventData) {
        console.log("DRAG DROP EVENT");

        var draggedColumnId = event.getDraggedColumnId();
        var droppedColumnId = event.getDroppedColumnId();
        var tableColumnMetadataList: Array<TableColumnMetadata> = null;

        if (this.availableColumnsTable.getId()==event.getId()) {
            var availableColumnsTableMetadata = this.availableColumnsTable.getTableMetadata();
            tableColumnMetadataList = availableColumnsTableMetadata.getColumns(0);
            var indexInView = 0;
            if (droppedColumnId!=-1) {
                for (var i=0; i<tableColumnMetadataList.length; i++) {
                    if (tableColumnMetadataList[i].getId()==droppedColumnId) {
                        indexInView = i;
                        break;
                    }
                }
            } else {
                indexInView = tableColumnMetadataList.length;
            }
            
            var draggedColumn = availableColumnsTableMetadata.getColumnById(draggedColumnId);
            if (draggedColumn==null) {
                // Column is dragged from the usedColumnsTable table
                draggedColumn = this.usedColumnsTable.getTableMetadata().getColumnById(event.getDraggedColumnId());
                this.usedColumnsTable.getTableMetadata().removeColumn(draggedColumn);
                availableColumnsTableMetadata.addColumn(draggedColumn, 0, indexInView);
            } else {
                // Column is dragged from the availableColumnsTable table
                availableColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
            }

        } else if (this.usedColumnsTable.getId()==event.getId()) {
            var usedColumnsTableMetadata = this.usedColumnsTable.getTableMetadata();
            switch (event.getDroppedAreaViewType()) {
                case ViewType.VIEW:
                    tableColumnMetadataList = (event.getDroppedViewId() < usedColumnsTableMetadata.getViewSize()) ? usedColumnsTableMetadata.getColumns(event.getDroppedViewId()) : [];
                    break;
                case ViewType.LEFT:
                    tableColumnMetadataList = usedColumnsTableMetadata.getLeftRepeatableColumns();
                    break;
                case ViewType.RIGHT:
                    tableColumnMetadataList = usedColumnsTableMetadata.getRightRepeatableColumns();
                    break;
            } 
            var indexInView = 0;
            if (droppedColumnId!=-1) {
                for (var i=0; i<tableColumnMetadataList.length; i++) {
                    if (tableColumnMetadataList[i].getId()==droppedColumnId) {
                        indexInView = i;
                        break;
                    }
                }
            } else {
                indexInView = tableColumnMetadataList.length;
            }
            
            var draggedColumn = usedColumnsTableMetadata.getColumnById(draggedColumnId);
            if (draggedColumn==null) {
                // Column is dragged from the availableColumnsTable table
                draggedColumn = this.availableColumnsTable.getTableMetadata().getColumnById(event.getDraggedColumnId());
                this.availableColumnsTable.getTableMetadata().removeColumn(draggedColumn);
                if (ViewType.VIEW!=event.getDroppedAreaViewType()) {
                    usedColumnsTableMetadata.addColumn(draggedColumn, 0, null);
                    usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
                } else {
                    usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
                }
            } else {
                // Column is dragged from the usedColumnsTable table
                usedColumnsTableMetadata.moveColumn(draggedColumn, event.getDroppedAreaViewType(), event.getDroppedViewId(), indexInView);
            }

        }


    }

    public applyChanges() {
        this.myService.applyChanges(this.usedColumnsTable.getTableMetadata());
    }
}
