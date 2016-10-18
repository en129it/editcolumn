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
var platform_browser_1 = require('@angular/platform-browser');
var app_component_1 = require('./app.component');
var table_component_1 = require('./table.component');
var tableext_component_1 = require('./tableext.component');
var tableextconfig_component_1 = require('./tableextconfig.component');
var app_service_1 = require('./app.service');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule],
            declarations: [app_component_1.AppComponent, tableext_component_1.TableViewer, tableextconfig_component_1.TableViewConfigurerComponent, tableextconfig_component_1.TableCellConfigComponent, table_component_1.TableComponent, table_component_1.TableHeaderComponent, table_component_1.TableRowComponent, table_component_1.TableCellComponent, tableextconfig_component_1.TableCellConfigComponent, tableextconfig_component_1.TableViewAvailableConfigurerComponent, tableextconfig_component_1.TableViewUsedConfigurerComponent, table_component_1.TableCellHeaderComponent, table_component_1.TableColumnResizeComponent],
            providers: [app_service_1.MyService],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map