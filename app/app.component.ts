import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { TableComponent } from './table.component';
import { TableViewer } from './tableext.component';
import { TableViewConfigurerComponent, TableCellConfigComponent } from './tableextconfig.component';
import { MyService } from './app.service';
import { TableMetadata, TableColumnMetadata } from './table.metadata';
import { Table } from './table.model2';

@Component({
    selector: 'my-app',
    template: `
         <my-table-viewer></my-table-viewer>
         <my-table-view-configurer></my-table-view-configurer>
     `
})
export class AppComponent {
}
