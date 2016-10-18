import { Component, ViewChild, HostListener } from '@angular/core';
import { TableComponent } from './table.component';
import { MyService } from './app.service';
import { Table, ViewMode, DisplayMode } from './table.model2';

@Component({
    selector: 'my-table-viewer',
    template: `
        <my-table [currentViewIndex]="currentViewIndex" [table]="table" (onViewChange)="onViewChange($event)"></my-table>
        <div style="position: absolute; top:0px; left:0px;"><button (click)="onLeftClick($event)">&lt;</button></div>
        <div style="position: absolute; top:0px; right:0px;"><button (click)="onRightClick($event)">&gt;</button></div>
    `
})
export class TableViewer {
    private currentViewIndex : number = 0;
    private table : Table;
    @ViewChild(TableComponent) tableComponent : TableComponent;
    
    constructor(myService: MyService) {
        this.table = new Table("data", myService.getTableMetadata(), myService.getTableData(), ViewMode.LEFT_VIEW_RIGHT_MERGE);
    }

    onLeftClick(event: UIEvent) {
        if (this.currentViewIndex>0) {
            this.currentViewIndex--;
        }
    }

    onRightClick(event: UIEvent) {
        if (this.currentViewIndex < this.table.getViews().length-1) {
            this.currentViewIndex++;
        }
    }
    
    onViewChange(event: any) {
        this.currentViewIndex = this.table.getViews().length-1;
    }
} 