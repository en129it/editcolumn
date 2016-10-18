import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { TableComponent, TableHeaderComponent, TableRowComponent, TableCellComponent, TableCellHeaderComponent, TableColumnResizeComponent }  from './table.component';
import { TableViewer } from './tableext.component';
import { TableViewConfigurerComponent, TableCellConfigComponent, TableViewAvailableConfigurerComponent, TableViewUsedConfigurerComponent } from './tableextconfig.component';
import { Table } from './table.model2';
import { MyService } from './app.service';

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ AppComponent, TableViewer, TableViewConfigurerComponent, TableCellConfigComponent, TableComponent, TableHeaderComponent, TableRowComponent, TableCellComponent, TableCellConfigComponent, TableViewAvailableConfigurerComponent, TableViewUsedConfigurerComponent, TableCellHeaderComponent, TableColumnResizeComponent],
  providers: [MyService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
