/*
============================================================
描述：        
1.实现ColumnModal、DataSource
2.实现Pager：客户端分页、服务端分页
3.实现FilterRow、SummaryRow、BottomPager
4.实现TableView渲染视图模式
5.实现FitColumns、FixedColumns两种列宽显示模式
============================================================
GridView（基础表格视图）
->  FrezonGridView（锁定列视图）
->  ScrollGridView（动态表格视图）
->  DataGrid（数据表格）
->  TreeGrid（树形表格）
->  Tree（树控件）
============================================================
1.getData()             原始数据。数据结构：数组、树形。
2.getList()             原始数据。数据结构：数组。（树形转为数组）
3.getDataView()         数据视图。客户端排序、过滤后。数据结构：数组。
4.getVisibleRows()      可视数据视图。在DataView基础上，增加了树折叠处理。（是否加分组处理呢？）
5.getGroupingView()     分组数据视图。[group, group, ...]
*/
mini.GridView = function () {
    this._createTime = new Date();  //控件的创建时间

    //columnModel
    this._createColumnModel();
    this._bindColumnModel();

    //dataSource
    this.data = [];
    this._createSource();
    this._bindSource();

    this._initData();

    mini.GridView.superclass.constructor.call(this);


    this._doUpdateFilterRow();
    this._doUpdateSummaryRow();

    this.doUpdate();
}
mini.extend(mini.GridView, mini.Panel, {
    _displayStyle: "block",

    _rowIdField: "_id",

    width: "100%",

    showColumns: true,
    showFilterRow: false,
    showSummaryRow: false,
    showPager: false,

    allowCellWrap: false,
    allowHeaderWrap: false,

    showModified: true,
    showNewRow: true,

    showEmptyText: false,
    emptyText: "No data returned.",

    showHGridLines: true,
    showVGridLines: true,

    allowAlternating: false,
    _alternatingCls: "mini-grid-row-alt",

    _rowCls: "mini-grid-row",
    _cellCls: "mini-grid-cell",
    _headerCellCls: "mini-grid-headerCell",

    _rowSelectedCls: "mini-grid-row-selected",
    _rowHoverCls: "mini-grid-row-hover",

    _cellSelectedCls: "mini-grid-cell-selected",

    defaultRowHeight: 21,
    fixedRowHeight: false,
    isFixedRowHeight: function () {
        return this.fixedRowHeight;
    },

    fitColumns: true,
    isFitColumns: function () {
        return this.fitColumns;
    },

    uiCls: "mini-gridview",
    _create: function () {
        mini.GridView.superclass._create.call(this);
        var el = this.el;
        mini.addClass(el, 'mini-grid');
        mini.addClass(this._borderEl, 'mini-grid-border');
        mini.addClass(this._viewportEl, 'mini-grid-viewport');

        var bottomPager = '<div class="mini-grid-pager"></div>';
        var filter = '<div class="mini-grid-filterRow"><div class="mini-grid-filterRow-view"></div><div class="mini-grid-scrollHeaderCell"></div></div>';
        var summary = '<div class="mini-grid-summaryRow"><div class="mini-grid-summaryRow-view"></div><div class="mini-grid-scrollHeaderCell"></div></div>';
        var columns = '<div class="mini-grid-columns"><div class="mini-grid-columns-view"></div><div class="mini-grid-scrollHeaderCell"></div></div>';


        this._columnsEl = mini.after(this._toolbarEl, columns);
        this._filterEl = mini.after(this._columnsEl, filter);
        this._rowsEl = this._bodyEl;
        mini.addClass(this._rowsEl, "mini-grid-rows");
        this._summaryEl = mini.after(this._rowsEl, summary);
        this._bottomPagerEl = mini.after(this._summaryEl, bottomPager);

        this._columnsViewEl = this._columnsEl.childNodes[0];
        this._topRightCellEl = this._columnsEl.childNodes[1];

        //内嵌一个div(zoom:1)，消除ie7下横向滚动条BUG
        this._rowsViewEl = mini.append(this._rowsEl, '<div class="mini-grid-rows-view"><div class="mini-grid-rows-content"></div></div>')
        this._rowsViewContentEl = this._rowsViewEl.firstChild;

        //filter
        this._filterViewEl = this._filterEl.childNodes[0];
        //summary
        this._summaryViewEl = this._summaryEl.childNodes[0];

        var s = '<a href="#" class="mini-grid-focus" style="position:absolute;left:0px;top:0px;width:0px;height:0px;outline:none;" hideFocus onclick="return false" ></a>';
        this._focusEl = mini.append(this._borderEl, s);

        //this._focusEl.onfocus = function
//        mini.on(this._focusEl, "focus", function (e) {
//            e.preventDefault();
//        });
    },
    _initEvents: function () {
        mini.GridView.superclass._initEvents.call(this);

        mini.on(this._rowsViewEl, "scroll", this.__OnRowViewScroll, this);
    },
    //    _sizeChaned: function () {
    //        this.deferLayout();
    //    },
    _setBodyWidth: false,
    doLayout: function () {
        if (!this.canLayout()) return;
        mini.GridView.superclass.doLayout.call(this);

        this._stopLayout();

        var autoHeight = this.isAutoHeight();
        var hdTable = this._columnsViewEl.firstChild;
        var bdTable = this._rowsViewContentEl.firstChild;

        var filterTable = this._filterViewEl.firstChild;
        var summaryTable = this._summaryViewEl.firstChild;

        //        if (autoHeight) {
        //            mini.addClass(this.el, 'mini-grid-autoHeight');
        //        } else {
        //            mini.removeClass(this.el, 'mini-grid-autoHeight');
        //        }

        function doLayout(hdTable) {
            //fitColumns

            if (this.isFitColumns()) {
                bdTable.style.width = "100%";
                if (mini.isChrome || mini.isIE6) {
                    hdTable.style.width = bdTable.offsetWidth + "px";
                } else {
                    if (this._rowsViewEl.scrollHeight > this._rowsViewEl.clientHeight) {
                        hdTable.style.width = "100%";
                        hdTable.parentNode.style.width = "auto";
                        hdTable.parentNode.style["paddingRight"] = "17px";
                    } else {
                        hdTable.style.width = "100%";
                        hdTable.parentNode.style.width = "100%";
                        hdTable.parentNode.style["paddingRight"] = "0px";
                    }
                }
            } else {
                bdTable.style.width = "0px";
                hdTable.style.width = "0px";
                if (mini.isChrome || mini.isIE6) {
                    //hdTable.style.width = bdTable.offsetWidth + "px";
                } else {
                    hdTable.parentNode.style.width = "100%";
                    hdTable.parentNode.style["paddingRight"] = "0px";
                }
            }

        }
        doLayout.call(this, hdTable);
        doLayout.call(this, filterTable);
        doLayout.call(this, summaryTable);

        //
        this._syncScroll();

        var me = this;
        setTimeout(function () {
            mini.layout(me._filterEl);
            mini.layout(me._summaryEl);


        }, 10);

        if (mini.isIE10 && this.isFrozen()) {
            //fix ie10
            setTimeout(function () {
                if (me.isFitColumns()) {
                    hdTable.style.width = 'auto';
                    hdTable.offsetWidth;
                    hdTable.style.width = '100%';
                } else {
                    hdTable.style.width = '0px';

                }
            }, 0);
        }

    },
    setBody: function () { },
    /////////////////////////
    //------------  Update/Layout -----------//
    _createTopRowHTML: function (columns) {
        var s = "";
        if (mini.isIE) {
            if (mini.isIE6 || mini.isIE7 || !mini.boxModel) {
                s += '<tr style="display:none;height:0px;">';
            } else {
                s += '<tr style="height:0px;">';
            }
        } else {
            s += '<tr style="height:0px;">';
        }
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var width = column.width;
            var id = column._id;
            s += '<td id="' + id + '" style="padding:0;border:0;margin:0;height:0px;';
            if (column.width) s += 'width:' + column.width;
            s += '" ></td>';
        }
        s += '<td style="width:0px;"></td>';
        s += "</tr>";
        return s;
    },

    _createColumnsHTML: function (rows, viewIndex, visibleColumns) {
        var visibleColumns = visibleColumns ? visibleColumns : this.getVisibleColumns();
        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(visibleColumns));


        var sortField = this.getSortField();
        var sortOrder = this.getSortOrder();

        for (var j = 0, k = rows.length; j < k; j++) {
            var columns = rows[j];
            sb[sb.length] = '<tr>';
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];

                var headerText = this._createHeaderText(column, viewIndex);

                var columnId = this._createHeaderCellId(column, viewIndex)

                //if(column.name == "name1") debugger

                var sortCls = "";
                if (sortField && sortField == column.field) {
                    sortCls = sortOrder == "asc" ? "mini-grid-asc" : "mini-grid-desc";
                }
                var cls = "";
                if (this.allowHeaderWrap == false) {
                    cls = " mini-grid-headerCell-nowrap ";
                }

                sb[sb.length] = '<td id="';
                sb[sb.length] = columnId;
                sb[sb.length] = '" class="mini-grid-headerCell ' + sortCls + ' ' + (column.headerCls || "") + ' ';

                var isButtom = !(column.columns && column.columns.length > 0)
                if (isButtom) sb[sb.length] = ' mini-grid-bottomCell ';
                if (i == l - 1) sb[sb.length] = ' mini-grid-rightCell ';

                sb[sb.length] = '" style="';
                if (column.headerStyle) {
                    sb[sb.length] = column.headerStyle + ';';
                }
                if (column.headerAlign) {
                    sb[sb.length] = 'text-align:' + column.headerAlign + ';';
                }

                sb[sb.length] = '" ';

                if (column.rowspan) {
                    sb[sb.length] = 'rowspan="' + column.rowspan + '" ';
                }
                this._createColumnColSpan(column, sb, viewIndex);

                sb[sb.length] = '><div class="mini-grid-headerCell-outer"><div class="mini-grid-headerCell-inner ' + cls + '">';

                sb[sb.length] = headerText;

                if (sortCls) {
                    sb[sb.length] = '<span class="mini-grid-sortIcon"></span>';
                }

                sb[sb.length] = '</div><div id="' + column._id + '" class="mini-grid-column-splitter"></div>';

                sb[sb.length] = '</div></td>';
            }

            //space column
            if (this.isFrozen() && viewIndex == 1) {
                sb[sb.length] = '<td class="mini-grid-headerCell" style="width:0;"><div class="mini-grid-headerCell-inner" style="';

                //sb[sb.length] = '">&nbsp;</div></td>';
                sb[sb.length] = '">0</div></td>';
            }

            sb[sb.length] = '</tr>';
        }
        sb.push('</table>');
        return sb.join('');
    },
    _createHeaderText: function (column, viewIndex) {
        var header = column.header;
        if (typeof header == "function") header = header.call(this, column);
        if (mini.isNull(header) || header === "") header = "&nbsp;";
        return header;
    },
    _createColumnColSpan: function (column, sb, viewIndex) {
        if (column.colspan) {
            sb[sb.length] = 'colspan="' + column.colspan + '" ';
        }
    },
    doUpdateColumns: function () {
        var scrollLeft = this._columnsViewEl.scrollLeft;

        var columnRows = this.getVisibleColumnsRow();
        var html = this._createColumnsHTML(columnRows, 2);
        var s = '<div class="mini-grid-topRightCell"></div>';
        html += s;
        this._columnsViewEl.innerHTML = html;

        this._columnsViewEl.scrollLeft = scrollLeft;
    },
    doUpdate: function () {
        if (this.canUpdate() == false) return;

        //创建组件100毫秒内，rows延迟创建，提升初始化时性能表现（避免了多次setColumns/setData时的重新创建整个表格开销）
        var defer = this._isCreating();

        var sss = new Date();

        this._doUpdateSummaryRow();

        var me = this;
        function doUpdate() {
            me.doUpdateColumns();

            //rows            
            me.doUpdateRows();
            me.doLayout();
            me._doUpdateTimer = null;
            //alert(new Date() - sss);
        }

        //columns
        me.doUpdateColumns();

        //        if (this._doUpdateTimer) {
        //            this.doLayout();
        //            return;
        //        }

        //EmptyView
        if (defer) {
            this._useEmptyView = true;
        }

        //移除行
        if (this._rowsViewContentEl && this._rowsViewContentEl.firstChild) {
            this._rowsViewContentEl.removeChild(this._rowsViewContentEl.firstChild);
        }
        if (this._rowsLockContentEl && this._rowsLockContentEl.firstChild) {
            this._rowsLockContentEl.removeChild(this._rowsLockContentEl.firstChild);
        }

        me.doUpdateRows();
        if (defer) {
            this._useEmptyView = false;
        }
        me.doLayout();
        if (defer && !this._doUpdateTimer) {
            this._doUpdateTimer = setTimeout(doUpdate, 15);
        }
        this.unmask();
    },
    /////////////////////////////////////////
    _isCreating: function () {
        return (new Date() - this._createTime) < 1000;
    },
    deferUpdate: function (time) {
        if (!time) time = 5;
        if (this._updateTimer || this._doUpdateTimer) return;
        var me = this;
        this._updateTimer = setTimeout(function () {
            me._updateTimer = null;
            me.doUpdate();
        }, time);
    },
    _updateCount: 0,
    beginUpdate: function () {
        this._updateCount++;
    },
    endUpdate: function (raise) {
        this._updateCount--;
        if (this._updateCount == 0 || raise === true) {
            this._updateCount = 0;
            this.doUpdate();
        }
    },
    canUpdate: function () {
        //return this._updateCount == 0 && this.isRender();
        return this._updateCount == 0;
    },
    /////////////////////////////////////////
    setDefaultRowHeight: function (value) {
        this.defaultRowHeight = value;
    },
    getDefaultRowHeight: function () {
        return this.defaultRowHeight;
    },
    _getRowHeight: function (record) {

        var h = this.defaultRowHeight;
        if (record._height) {
            h = parseInt(record._height);
            if (isNaN(parseInt(record._height))) h = rowHeight;
        }
        h -= 4; //padding-top/padding-bottom
        //if (!mini.isOpera) {
        h -= 1;
        //}
        return h;
    },
    _createGroupingHTML: function (columns, viewIndex) {
        var groups = this.getGroupingView();
        var showGroupSummary = this._showGroupSummary;

        var isFrozen = this.isFrozen();

        var rowIndex = 0;
        var me = this;
        function createRows(rows, group) {
            sb.push('<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">');
            if (columns.length > 0) {
                sb.push(me._createTopRowHTML(columns));
                for (var j = 0, k = rows.length; j < k; j++) {
                    var row = rows[j];
                    me._createRowHTML(row, rowIndex++, columns, viewIndex, sb);
                }
            }
            //分组汇总
            if (showGroupSummary) {

            }
            sb.push('</table>');
        }

        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(columns));
        for (var j = 0, k = groups.length; j < k; j++) {
            var group = groups[j];
            var id = this._createRowGroupId(group, viewIndex);
            var rowid = this._createRowGroupRowsId(group, viewIndex);
            var e = this._OnDrawGroup(group);
            var cls = group.expanded ? '' : ' mini-grid-group-collapse ';

            sb[sb.length] = '<tr id="';
            sb[sb.length] = id;
            sb[sb.length] = '" class="mini-grid-groupRow';
            sb[sb.length] = cls;
            sb[sb.length] = '"><td class="mini-grid-groupCell" colspan="';
            sb[sb.length] = columns.length;
            sb[sb.length] = '"><div class="mini-grid-groupHeader">';

            if (!isFrozen || (isFrozen && viewIndex == 1)) {
                sb[sb.length] = '<div class="mini-grid-group-ecicon"></div>';
                sb[sb.length] = '<div class="mini-grid-groupTitle">' + e.cellHtml + '</div>';
            } else {
                sb[sb.length] = "&nbsp;";
            }
            sb[sb.length] = '</div></td></tr>';

            //group.expanded = false;

            var style = group.expanded ? "" : "display:none";
            sb[sb.length] = '<tr class="mini-grid-groupRows-tr" style="';
            //if (mini.isIE) sb[sb.length] = style;
            sb[sb.length] = '"><td class="mini-grid-groupRows-td" colspan="';
            sb[sb.length] = columns.length;
            sb[sb.length] = '"><div id="';
            sb[sb.length] = rowid;
            sb[sb.length] = '" class="mini-grid-groupRows" style="';
            sb[sb.length] = style;
            sb[sb.length] = '">';
            createRows(group.rows, group);
            sb[sb.length] = '</div></td></tr>';
        }
        sb.push('</table>');
        return sb.join('');
    },

    _isFastCreating: function () {
        //return false;
        var data = this.getVisibleRows();
        if (data.length > 50) {
            return this._isCreating() || this.getScrollTop() < 50 * this._defaultRowHeight;
        }
        return false;
    },
    _createRowHTML: function (record, rowIndex, columns, viewIndex, sb) {
        var isReturn = !sb;
        if (!sb) sb = [];
        var rowHeight = "";
        var isFixedRowHeight = this.isFixedRowHeight();
        if (isFixedRowHeight) {
            rowHeight = this._getRowHeight(record);
        }

        var rowClsIndex = -1;
        var rowCls = " ";
        var rowStyleIndex = -1;
        var rowStyle = " ";

        sb[sb.length] = '<tr class="mini-grid-row ';

        if (record._state == "added" && this.showNewRow) sb[sb.length] = "mini-grid-newRow ";

        if (this.allowAlternating && rowIndex % 2 == 1) {
            sb[sb.length] = this._alternatingCls;
            sb[sb.length] = " ";
        }

        //if(record.name== '滴答滴答滴答滴答滴答滴答滴答') debugger
        var isSelected = this._dataSource.isSelected(record);
        if (isSelected) {
            sb[sb.length] = this._rowSelectedCls;
            sb[sb.length] = " ";
        }

        rowClsIndex = sb.length;
        sb[sb.length] = rowCls;
        sb[sb.length] = '" style="';
        rowStyleIndex = sb.length;
        sb[sb.length] = rowStyle;

        if (record.visible === false) {
            sb[sb.length] = ";display:none;";
        }

        sb[sb.length] = '" id="';
        sb[sb.length] = this._createRowId(record, viewIndex);
        sb[sb.length] = '">';

        var _currentCell = this._currentCell;

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var cellId = this._createCellId(record, column);

            var cls = "";

            //var e = this._OnDrawCell(record, column, rowIndex, column._index, i, columns.length, isFrozen, viewIndex);
            var e = this._OnDrawCell(record, column, rowIndex, column._index);
            if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "") {
                e.cellHtml = "&nbsp;";
            }

            sb[sb.length] = '<td ';
            if (e.rowSpan) {
                sb[sb.length] = 'rowspan="' + e.rowSpan + '"';
            }
            if (e.colSpan) {
                sb[sb.length] = 'colspan="' + e.colSpan + '"';
            }
            sb[sb.length] = ' id="';
            sb[sb.length] = cellId;

            sb[sb.length] = '" class="mini-grid-cell ';

            if (i == l - 1) sb[sb.length] = ' mini-grid-rightCell ';

            if (e.cellCls) sb[sb.length] = ' ' + e.cellCls + ' ';
            if (cls) sb[sb.length] = cls;

            if (_currentCell && _currentCell[0] == record && _currentCell[1] == column) {
                sb[sb.length] = " ";
                sb[sb.length] = this._cellSelectedCls;
            }

            sb[sb.length] = '" style="';
            if (e.showHGridLines == false) {
                sb[sb.length] = 'border-bottom:0;';
            }
            if (e.showVGridLines == false) {
                sb[sb.length] = 'border-right:0;';
            }

            if (!e.visible) sb[sb.length] = "display:none;";

            if (column.align) {
                sb[sb.length] = 'text-align:';
                sb[sb.length] = column.align;
                sb[sb.length] = ';';
            }

            if (e.cellStyle) sb[sb.length] = e.cellStyle;

            sb[sb.length] = '">';
            sb[sb.length] = '<div class="mini-grid-cell-inner ';
            if (!e.allowCellWrap) {
                sb[sb.length] = ' mini-grid-cell-nowrap ';
            }
            if (e.cellInnerCls) {
                sb[sb.length] = e.cellInnerCls;
            }

            var isModified = column.field ? this._dataSource.isModified(record, column.field) : false;
            if (isModified && this.showModified) {
                sb[sb.length] = ' mini-grid-cell-dirty';
            }


            sb[sb.length] = '" style="';
            if (isFixedRowHeight) {
                sb[sb.length] = 'height:';
                sb[sb.length] = rowHeight;
                sb[sb.length] = 'px;';
            }
            if (e.cellInnerStyle) {
                sb[sb.length] = e.cellInnerStyle;
            }
            sb[sb.length] = '">';
            sb[sb.length] = e.cellHtml;
            sb[sb.length] = '</div>';
            sb[sb.length] = '</td>';

            if (e.rowCls) rowCls = e.rowCls;
            if (e.rowStyle) rowStyle = e.rowStyle;
        }
        //space column
        if (this.isFrozen() && viewIndex == 1) {
            sb[sb.length] = '<td class="mini-grid-cell" style="width:0;';
            if (this.showHGridLines == false) {
                sb[sb.length] = 'border-bottom:0;';
            }
            sb[sb.length] = '"><div class="mini-grid-cell-inner" style="';
            if (isFixedRowHeight) {
                sb[sb.length] = 'height:';
                sb[sb.length] = rowHeight;
                sb[sb.length] = 'px;';
            }
            //sb[sb.length] = '">&nbsp;</div></td>';
            sb[sb.length] = '">0</div></td>';
        }

        sb[rowClsIndex] = rowCls;
        sb[rowStyleIndex] = rowStyle;

        sb[sb.length] = '</tr>';

        if (isReturn) return sb.join('');
    },
    _createRowsHTML: function (columns, viewIndex, data, bottomHtml) {

        data = data || this.getVisibleRows();

        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(columns));

        var emptyId = this.uid + "$emptytext" + viewIndex;
        if (viewIndex == 2) {
            var style = (this.showEmptyText && data.length == 0) ? '' : 'display:none;';
            sb.push('<tr id="' + emptyId + '" style="' + style + '"><td class="mini-grid-emptyText" colspan="' + columns.length + '">' + this.emptyText + '</td></tr>');
        }

        var startIndex = 0;
        if (data.length > 0) {
            var first = data[0];
            startIndex = this.getVisibleRows().indexOf(first);

        }
        for (var j = 0, k = data.length; j < k; j++) {
            var rowIndex = startIndex + j;
            var record = data[j];
            this._createRowHTML(record, rowIndex, columns, viewIndex, sb);
        }

        if (bottomHtml) {
            sb.push(bottomHtml);
        }

        sb.push('</table>');

        return sb.join('');
    },
    doUpdateRows: function () {
        var data = this.getVisibleRows();

        var columns = this.getVisibleColumns();
        if (this.isGrouping()) {
            var html = this._createGroupingHTML(columns, 2);
            this._rowsViewContentEl.innerHTML = html;
        } else {
            var html = this._createRowsHTML(columns, 2, data);
            this._rowsViewContentEl.innerHTML = html;
        }
    },
    /////////////////////////////////////////////////////
    _createFilterRowHTML: function (columns, viewIndex) {
        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(columns));
        sb[sb.length] = '<tr>';
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = this._createFilterCellId(column);
            sb[sb.length] = '<td id="';
            sb[sb.length] = id;
            sb[sb.length] = '" class="mini-grid-filterCell" style="';
            sb[sb.length] = '">&nbsp;</td>';
        }
        sb[sb.length] = '</tr></table><div class="mini-grid-scrollHeaderCell"></div>';
        var s = sb.join('');
        return s;
    },
    _doRenderFilters: function () {
        //遍历columns，如果有filter对象，则render加入
        var columns = this.getVisibleColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (column.filter) {
                //if (column.field == 'name') debugger
                var cellEl = this.getFilterCellEl(column);
                if (cellEl) {
                    cellEl.innerHTML = "";
                    column.filter.render(cellEl);
                }
            }
        }
    },
    _doUpdateFilterRow: function () {
        if (this._filterViewEl.firstChild) {
            this._filterViewEl.removeChild(this._filterViewEl.firstChild);
        }
        var isFrozen = this.isFrozen();
        var columns = this.getVisibleColumns();

        var html = this._createFilterRowHTML(columns, 2);
        this._filterViewEl.innerHTML = html;

        this._doRenderFilters();
    },
    /////////////////////////////////////////////////////
    _createSummaryRowHTML: function (columns, viewIndex) {
        var records = this.getDataView();

        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(columns));
        sb[sb.length] = '<tr>';
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = this._createSummaryCellId(column);

            var e = this._OnDrawSummaryCell(records, column);

            sb[sb.length] = '<td id="';
            sb[sb.length] = id;
            sb[sb.length] = '" class="mini-grid-summaryCell ' + e.cellCls + '" style="' + e.cellStyle + ';';
            sb[sb.length] = '">';
            sb[sb.length] = e.cellHtml;
            sb[sb.length] = '</td>';
        }
        sb[sb.length] = '</tr></table><div class="mini-grid-scrollHeaderCell"></div>';
        var s = sb.join('');
        return s;
    },
    _doUpdateSummaryRow: function () {
        var columns = this.getVisibleColumns();
        var html = this._createSummaryRowHTML(columns, 2);
        this._summaryViewEl.innerHTML = html;
    },
    /////////////////////////////////////////////////////
    _doSortByField: function (sortField, sortOrder) {
        if (!sortField) return null;
        var dataType = this._columnModel._getDataTypeByField(sortField);
        this._dataSource._doClientSortField(sortField, sortOrder, dataType);
    },
    _expandGroupOnLoad: true,
    _GroupID: 1,
    _groupField: "",
    _groupDir: "",
    groupBy: function (field, dir) {
        if (!field) return;
        this._groupField = field;
        if (typeof dir == "string") dir = dir.toLowerCase();
        this._groupDir = dir;
        this._createGroupingView();
        this.deferUpdate();
    },
    clearGroup: function () {
        this._groupField = "";
        this._groupDir = "";
        this._groupDataView = null;
        this.deferUpdate();
    },
    setGroupField: function (value) {
        this.groupBy(value);
    },
    setGroupDir: function (value) {
        this._groupDir = field;
        this.groupBy(this._groupField, value);
    },
    isGrouping: function () {
        return this._groupField != "";
    },
    getGroupingView: function () {
        return this._groupDataView;
    },
    _createGroupingView: function () {
        if (this.isGrouping() == false) return;
        this._groupDataView = null;

        var field = this._groupField, dir = this._groupDir;

        //1）分组排序
        this._doSortByField(field, dir);

        //2）得到分组数据
        var data = this.getVisibleRows();
        var groups = [];
        var groupMaps = {};
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var v = o[field];    //string, number, boolean, date
            var p = mini.isDate(v) ? v.getTime() : v;
            var group = groupMaps[p];
            if (!group) {
                group = groupMaps[p] = {};
                group.field = field,
                group.dir = dir;
                group.value = v;
                group.rows = [];
                groups.push(group);
                group.id = "g" + this._GroupID++;
                group.expanded = this._expandGroupOnLoad;
            }
            group.rows.push(o);
        }
        this._groupDataView = groups;
    },
    _OnDrawGroup: function (group) {
        var e = {
            group: group,
            rows: group.rows,
            field: group.field,
            dir: group.dir,
            value: group.value,
            cellHtml: group.field + " (" + group.rows.length + " Items)"
        };
        this.fire("drawgroup", e);
        return e;
    },
    getRowGroup: function (id) {
        var t = typeof id;
        if (t == "number") return this.getGroupingView()[id];
        if (t == "string") return this._getRowGroupById(id);
        return id;
    },
    _getRowGroupByEvent: function (e) {
        var t = mini.findParent(e.target, 'mini-grid-groupRow')
        if (t) {
            var ids = t.id.split("$");
            if (ids[0] != this._id) return null;
            var id = ids[ids.length - 1];
            return this._getRowGroupById(id);
        }
        return null;
    },
    _getRowGroupById: function (id) {
        var groups = this.getGroupingView();
        for (var i = 0, l = groups.length; i < l; i++) {
            var g = groups[i];
            if (g.id == id) return g;
        }
        return null;
    },
    _createRowGroupId: function (group, viewIndex) {
        return this._id + "$group" + viewIndex + "$" + group.id;
    },
    _createRowGroupRowsId: function (group, viewIndex) {
        return this._id + "$grouprows" + viewIndex + "$" + group.id;
    },
    ////////////////////////////////////
    _createRowId: function (row, index) {
        var id = this._id + "$row" + index + "$" + row._id;
        return id;
    },
    _createHeaderCellId: function (column, index) {
        var id = this._id + "$headerCell" + index + "$" + column._id;
        return id;
    },
    _createCellId: function (row, column) {
        var id = row._id + "$cell$" + column._id;
        return id;
    },
    _createFilterCellId: function (column) {
        return this._id + "$filter$" + column._id;
    },
    _createSummaryCellId: function (column) {
        return this._id + "$summary$" + column._id;
    },
    /////////////////////////
    getFilterCellEl: function (column) {
        column = this.getColumn(column);
        if (!column) return null;
        return document.getElementById(this._createFilterCellId(column));
    },
    getSummaryCellEl: function (column) {
        column = this.getColumn(column);
        if (!column) return null;
        return document.getElementById(this._createSummaryCellId(column));
    },
    /////////////////////////
    _doVisibleEls: function () {
        mini.GridView.superclass._doVisibleEls.call(this);
        this._columnsEl.style.display = this.showColumns ? "block" : "none";
        this._filterEl.style.display = this.showFilterRow ? "block" : "none";
        this._summaryEl.style.display = this.showSummaryRow ? "block" : "none";
        this._bottomPagerEl.style.display = this.showPager ? "block" : "none";
    },
    setShowColumns: function (value) {
        this.showColumns = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    setShowFilterRow: function (value) {
        this.showFilterRow = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    setShowSummaryRow: function (value) {
        this.showSummaryRow = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    setShowPager: function (value) {

        this.showPager = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    setFitColumns: function (value) {
        this.fitColumns = value;
        mini.removeClass(this.el, 'mini-grid-fixwidth');
        if (this.fitColumns == false) {
            mini.addClass(this.el, 'mini-grid-fixwidth');
        }
        this.deferLayout();
    },
    getBodyHeight: function (content) {
        var h = mini.GridView.superclass.getBodyHeight.call(this, content);
        h = h - this.getColumnsHeight() - this.getFilterHeight()
            - this.getSummaryHeight() - this.getPagerHeight();
        return h;
    },
    getColumnsHeight: function () {
        return this.showColumns ? mini.getHeight(this._columnsEl) : 0;
    },
    getFilterHeight: function () {
        return this.showFilterRow ? mini.getHeight(this._filterEl) : 0;
    },
    getSummaryHeight: function () {
        return this.showSummaryRow ? mini.getHeight(this._summaryEl) : 0;
    },
    getPagerHeight: function () {
        return this.showPager ? mini.getHeight(this._bottomPagerEl) : 0;
    },
    getGridViewBox: function (content) {
        var box = mini.getBox(this._columnsEl);
        var bodyBox = mini.getBox(this._bodyEl);
        box.height = bodyBox.bottom - box.top;
        box.bottom = box.top + box.height;
        return box;
    },
    getSortField: function (value) {
        return this._dataSource.sortField;
    },
    getSortOrder: function (value) {
        return this._dataSource.sortOrder;
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    // DataSource 
    ////////////////////////////////////////////////////////////////////////////////////////    
    _createSource: function () {
        this._dataSource = new mini.DataTable();
    },
    _bindSource: function () {
        var source = this._dataSource;
        //table
        source.on("loaddata", this.__OnSourceLoadData, this);
        source.on("cleardata", this.__OnSourceClearData, this);

    },
    __OnSourceLoadData: function (e) {
        this._initData();
        this.doUpdate();
        //this.fire("load", 
    },
    __OnSourceClearData: function (e) {
        this._initData();
        this.doUpdate();
    },
    _initData: function () {

    },
    ////////////////////////////////////////////////////////////////////////////////////////
    // ColumnModel  
    ////////////////////////////////////////////////////////////////////////////////////////
    isFrozen: function () {
        var sc = this._columnModel._frozenStartColumn, fc = this._columnModel._frozenEndColumn;
        //return this.isTableView() && !this.isGrouping() && sc >= 0 && fc >= sc;
        return this._columnModel.isFrozen();
    },
    _createColumnModel: function () {
        this._columnModel = new mini.ColumnModel(this);
    },
    _bindColumnModel: function () {
        this._columnModel.on("columnschanged", this.__OnColumnsChanged, this);
    },
    __OnColumnsChanged: function (e) {
        this.columns = this._columnModel.columns;
        this._doUpdateFilterRow();
        this._doUpdateSummaryRow();

        this.doUpdate();
        this.fire("columnschanged");

    },
    setColumns: function (columns) {
        this._columnModel.setColumns(columns);
        this.columns = this._columnModel.columns;
    },
    getColumns: function () {
        return this._columnModel.getColumns();
    },
    getBottomColumns: function () {
        return this._columnModel.getBottomColumns();
    },
    getVisibleColumnsRow: function () {
        //获取可视列多行数组。多表头时。
        var rows = this._columnModel.getVisibleColumnsRow().clone();
        return rows;
    },
    getVisibleColumns: function () {
        //获取可视列数组。底行。
        var columns = this._columnModel.getVisibleColumns().clone();
        return columns;
    },
    getFrozenColumns: function () {
        //获取锁定列数组。底行。
        var columns = this._columnModel.getFrozenColumns().clone();
        //alert(columns.length);
        return columns;
    },
    getUnFrozenColumns: function () {
        //获取非锁定列数组。底行。
        var columns = this._columnModel.getUnFrozenColumns().clone();
        return columns;
    },
    getColumn: function (name) {
        //根据列的name和index获取列对象
        return this._columnModel.getColumn(name);
    },
    updateColumn: function (column, options) {
        this._columnModel.updateColumn(column, options);
    },
    showColumns: function (columns) {
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = this.getColumn(columns[i]);
            if (!column) continue;
            column.visible = true;
        }
        this._columnModel._columnsChanged();
        //this.setColumns(this.columns);
    },
    hideColumns: function (columns) {
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = this.getColumn(columns[i]);
            if (!column) continue;
            column.visible = false;
        }
        this._columnModel._columnsChanged();
        //this.setColumns(this.columns);
    },
    showColumn: function (column) {
        this.updateColumn(column, { visible: true });
    },
    hideColumn: function (column) {
        this.updateColumn(column, { visible: false });
    },
    moveColumn: function (column, targetColumn, action) {
        this._columnModel.moveColumn(column, targetColumn, action);
    },
    removeColumn: function (column) {
        column = this.getColumn(column);
        if (!column) return;
        var pcolumn = this.getParentColumn(column);
        if (column && pcolumn) {
            pcolumn.columns.remove(column);
            //this.setColumns(this.columns);
            this._columnModel._columnsChanged();
        }
        return column;
    },
    //    insertColumn: function (column) {
    //        
    //    },
    setColumnWidth: function (column, width) {
        this.updateColumn(column, { width: width });
    },
    getColumnWidth: function (column) {
        var box = this.getColumnBox(column);
        return box.width;
    },
    getParentColumn: function (column) {
        return this._columnModel.getParentColumn(column);
    },
    getMaxColumnLevel: function () {
        return this._columnModel._getMaxColumnLevel();
    },
    /////////////////////////////////////////////////////
    _isCellVisible: function (rowIndex, columnIndex) {
        return true;
    },
    _createDrawCellEvent: function (record, column, rowIndex, columnIndex) {
        var value = mini._getMap(column.field, record);
        var e = {
            sender: this,
            //rowType: record._rowType,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            record: record,
            row: record,
            column: column,
            field: column.field,
            value: value,
            cellHtml: value,
            rowCls: "",
            rowStyle: null,
            cellCls: column.cellCls || '',
            cellStyle: column.cellStyle || '',
            allowCellWrap: this.allowCellWrap,
            showHGridLines: this.showHGridLines,
            showVGridLines: this.showVGridLines,
            cellInnerCls: "",
            cellInnnerStyle: "",
            autoEscape: column.autoEscape
        };
        e.visible = this._isCellVisible(rowIndex, columnIndex);
        if (e.visible == true && this._mergedCellMaps) {
            var cell = this._mergedCellMaps[rowIndex + ":" + columnIndex];
            if (cell) {
                e.rowSpan = cell.rowSpan;
                e.colSpan = cell.colSpan;
            }
        }
        return e;
    },
    _OnDrawCell: function (record, column, rowIndex, columnIndex) {
        var e = this._createDrawCellEvent(record, column, rowIndex, columnIndex);
        var value = e.value;

        if (column.dateFormat) {
            if (mini.isDate(e.value)) {
                //日期格式化，有点慢！已经做了特别优化：yyyy-MM-dd, MM/dd/yyyy
                e.cellHtml = mini.formatDate(value, column.dateFormat);
            }
            else e.cellHtml = value;
        }



        if (column.dataType == "float") {
            var value = parseFloat(e.value);
            if (!isNaN(value)) {
                decimalPlaces = parseInt(column.decimalPlaces);
                if (isNaN(decimalPlaces)) decimalPlaces = 0;
                e.cellHtml = value.toFixed(decimalPlaces);
            }
        }

        if (column.dataType == "currency") {
            e.cellHtml = mini.formatCurrency(e.value, column.currencyUnit);
        }

        if (column.displayField) {
            e.cellHtml = mini._getMap(column.displayField, record)//record[column.displayField];
        }

        if (e.autoEscape == true) {
            e.cellHtml = mini.htmlEncode(e.cellHtml);
        }

        var renderer = column.renderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : mini._getFunctoin(renderer);
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }
        this.fire("drawcell", e);

        if (e.cellHtml && !!e.cellHtml.unshift && e.cellHtml.length == 0) {
            e.cellHtml = "&nbsp;";
        }
        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "") e.cellHtml = "&nbsp;";

        return e;
    },
    _OnDrawSummaryCell: function (records, column) {
        var e = {
            result: this.getResultObject(),
            sender: this,
            data: records,
            column: column,
            field: column.field,
            value: "",
            cellHtml: "",
            cellCls: column.cellCls || '',
            cellStyle: column.cellStyle || '',
            allowCellWrap: this.allowCellWrap
        };

        if (column.summaryType) {
            var fn = mini.summaryTypes[column.summaryType];
            if (fn) {
                e.value = fn(records, column.field);
            }
        }

        var value = e.value;
        e.cellHtml = e.value;

        if (e.value && parseInt(e.value) != e.value && e.value.toFixed) {
            decimalPlaces = parseInt(column.decimalPlaces);
            if (isNaN(decimalPlaces)) decimalPlaces = 2;

            e.cellHtml = parseFloat(e.value.toFixed(decimalPlaces));
        }

        if (column.dateFormat) {
            if (mini.isDate(e.value)) {
                //日期格式化，有点慢！已经做了特别优化：yyyy-MM-dd, MM/dd/yyyy
                e.cellHtml = mini.formatDate(value, column.dateFormat);
            }
            else e.cellHtml = value;
        }
        if (column.dataType == "currency") {
            e.cellHtml = mini.formatCurrency(e.cellHtml, column.currencyUnit);
        }

        var renderer = column.summaryRenderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : window[renderer];
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }
        column.summaryValue = e.value;

        this.fire("drawsummarycell", e);

        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "") e.cellHtml = "&nbsp;";

        return e;
    },
    /////////////////////////////////////////
    getScrollTop: function () {
        return this._rowsViewEl.scrollTop;
    },
    setScrollTop: function (value) {
        this._rowsViewEl.scrollTop = value;
    },
    getScrollLeft: function () {
        return this._rowsViewEl.scrollLeft;
    },
    setScrollLeft: function (value) {
        this._rowsViewEl.scrollLeft = value;
    },
    _syncScroll: function () {
        var scrollLeft = this._rowsViewEl.scrollLeft;
        this._filterViewEl.scrollLeft = scrollLeft;
        this._summaryViewEl.scrollLeft = scrollLeft;
        this._columnsViewEl.scrollLeft = scrollLeft;
    },
    __OnRowViewScroll: function (e) {
        this._syncScroll();
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // Pager
    //////////////////////////////////////////////////////////////////////////////////////////  
    _pagers: [],
    _createPagers: function () {
        this._pagers = [];
        var bottomPager = new mini.Pager();
        this._setBottomPager(bottomPager);
    },
    _setBottomPager: function (pager) {
        pager = mini.create(pager);
        if (!pager) return;
        if (this._bottomPager) {
            this.unbindPager(this._bottomPager);
            this._bottomPagerEl.removeChild(this._bottomPager.el);
        }
        this._bottomPager = pager;
        pager.render(this._bottomPagerEl);
        this.bindPager(pager);
    },
    bindPager: function (pager) {
        this._pagers.add(pager);
    },
    unbindPager: function (pager) {
        this._pagers.remove(pager);
    },
    ////////////////////////////////////////////////////////
    setShowEmptyText: function (value) {
        this.showEmptyText = value;
    },
    getShowEmptyText: function () {
        return this.showEmptyText;
    },
    setEmptyText: function (value) {
        this.emptyText = value;
    },
    getEmptyText: function () {
        return this.emptyText;
    },
    setShowModified: function (value) {
        this.showModified = value;
    },
    getShowModified: function () {
        return this.showModified;
    },
    setShowNewRow: function (value) {
        this.showNewRow = value;
    },
    getShowNewRow: function () {
        return this.showNewRow;
    },
    setAllowCellWrap: function (value) {
        this.allowCellWrap = value;
    },
    getAllowCellWrap: function () {
        return this.allowCellWrap;
    },
    setAllowHeaderWrap: function (value) {
        this.allowHeaderWrap = value;
    },
    getAllowHeaderWrap: function () {
        return this.allowHeaderWrap;
    },
    /////////////////////////////////////////////////////////////////////
    //Grid Lines
    /////////////////////////////////////////////////////////////////////
    setShowHGridLines: function (value) {
        if (this.showHGridLines != value) {
            this.showHGridLines = value;
            this.deferUpdate();
        }
    },
    getShowHGridLines: function () {
        return this.showHGridLines;
    },
    setShowVGridLines: function (value) {
        if (this.showVGridLines != value) {
            this.showVGridLines = value;
            this.deferUpdate();
        }
    },
    getShowVGridLines: function () {
        return this.showVGridLines;
    }
});

mini.copyTo(mini.GridView.prototype, mini._DataTableApplys);

mini.regClass(mini.GridView, "gridview");
