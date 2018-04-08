/*
    描述：DataGrid
    功能：
        选择模型：
            行选择
            单元格选择
        编辑模型：
            单元格编辑
            行编辑
        分页模型：
            服务端分页
            top/bottom分页
            自定义分页
*/

mini.DataGrid = function (el) {
    mini.DataGrid.superclass.constructor.call(this, el);    

    this._Events = new mini._Grid_Events(this);
    this._Select = new mini._Grid_Select(this);
    this._DragDrop = new mini._Grid_DragDrop(this);

    this._RowGroup = new mini._Grid_RowGroup(this);

    this._Splitter = new mini._Grid_ColumnSplitter(this);
    this._ColumnMove = new mini._Grid_ColumnMove(this);
    this._Sorter = new mini._Grid_Sorter(this);
    this._CellToolTip = new mini._Grid_CellToolTip(this);
    this._ColumnsMenu = new mini._Grid_ColumnsMenu(this);

    this._createPagers();
};
mini.extend(mini.DataGrid, mini.ScrollGridView, {

    uiCls: "mini-datagrid",

    selectOnLoad: false,

    showHeader: false,
    showPager: true,

    allowUnselect: false,       //单选时点击能取消选择；多选的时候能直接点击多选
    allowRowSelect: true,
    allowCellSelect: false,
    allowCellEdit: false,
    cellEditAction: "cellclick",
    allowCellValid: false,

    allowResizeColumn: true,
    allowSortColumn: true,
    allowMoveColumn: true,

    showColumnsMenu: false,

    virtualScroll: false,
    enableHotTrack: true,
    showLoading: true,

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;
        var url = kv.url;
        delete kv.url;
        var data = kv.data;
        delete kv.data;
        var columns = kv.columns;
        delete kv.columns;

        if (!mini.isNull(columns)) {
            this.setColumns(columns);
        }

        mini.DataGrid.superclass.set.call(this, kv);

        if (!mini.isNull(data)) {
            this.setData(data);
        }
        if (!mini.isNull(url)) {

            this.setUrl(url);
        }
        if (!mini.isNull(value)) {
            this.setValue(value);
        }

        return this;
    },
    doUpdate: function () {

        this._destroyEditors();
        mini.DataGrid.superclass.doUpdate.apply(this, arguments);
    },
    _destroyEditors: function () {
        var controls = mini.getChildControls(this);
        var editors = [];
        for (var i = 0, l = controls.length; i < l; i++) {
            var ui = controls[i];
            if (ui.el && mini.findParent(ui.el, this._rowCls)) {
                editors.push(ui);
                ui.destroy();
            }
        }
        //alert(editors.length);
    },
    /////////////////////////////////////////////////
    _OnDrawCell: function () {
        var e = mini.DataGrid.superclass._OnDrawCell.apply(this, arguments);
        var error = this.getCellError(e.record, e.column);
        if (error) {
            if (!e.cellCls) e.cellCls = "";
            e.cellCls += " mini-grid-cell-error ";
        }

        return e;
    },
    /////////////////////////////////////////////////
    _bindSource: function () {
        var source = this._dataSource;
        //table
        source.on("beforeload", this.__OnSourceBeforeLoad, this);
        source.on("preload", this.__OnSourcePreLoad, this);
        source.on("load", this.__OnSourceLoadSuccess, this);
        source.on("loaderror", this.__OnSourceLoadError, this);


        source.on("loaddata", this.__OnSourceLoadData, this);
        source.on("cleardata", this.__OnSourceClearData, this);
        source.on("sort", this.__OnSourceSort, this);
        source.on("filter", this.__OnSourceFilter, this);

        source.on("pageinfochanged", this.__OnPageInfoChanged, this);
        source.on("selectionchanged", this.__OnSelectionChanged, this);
        source.on("currentchanged", function (e) {
            this.fire("currentchanged", e);
        }, this);

        //
        source.on("add", this.__OnSourceAdd, this);
        source.on("update", this.__OnSourceUpdate, this);
        source.on("remove", this.__OnSourceRemove, this);
        source.on("move", this.__OnSourceMove, this);

        source.on("beforeadd", function (e) {
            this.fire("beforeaddrow", e);
        }, this);
        source.on("beforeupdate", function (e) {
            this.fire("beforeupdaterow", e);
        }, this);
        source.on("beforeremove", function (e) {
            this.fire("beforeremoverow", e);
        }, this);
        source.on("beforemove", function (e) {
            this.fire("beforemoverow", e);
        }, this);
    },
    //    _getMaskWrapEl: function () {
    //        return this.el;
    //    },
    _initData: function () {

        this.data = this.getData();
        this.pageIndex = this.getPageIndex();
        this.pageSize = this.getPageSize();
        this.totalCount = this.getTotalCount();
        this.totalPage = this.getTotalPage();
        this.sortField = this.getSortField();
        this.sortOrder = this.getSortOrder();
        this.url = this.getUrl();

        this._mergedCellMaps = {};
        this._mergedCells = {};

        this._cellErrors = [];
        this._cellMapErrors = {};
    },
    __OnSourceBeforeLoad: function (e) {
        this.fire("beforeload", e);
        if (e.cancel == true) {

            return;
        }
        if (this.showLoading) {
            this.loading();
        }
    },
    __OnSourcePreLoad: function (e) {
        this.fire("preload", e);
    },
    __OnSourceLoadSuccess: function (e) {
        if (this.isGrouping()) {
            this.groupBy(this._groupField, this._groupDir);
        }

        this.fire("load", e);
        this.unmask();
    },
    __OnSourceLoadError: function (e) {
        this.fire("loaderror", e);
        this.unmask();
    },

    __OnSourceSort: function (e) {
        this.deferUpdate();
        this.fire("sort", e);
    },
    __OnSourceFilter: function (e) {
        this.deferUpdate();
        this.fire("filter", e);
    },

    __OnSourceAdd: function (e) {
        this._doAddRowEl(e.record);
        this._doUpdateSummaryRow();
        this.fire("addrow", e);
    },
    __OnSourceUpdate: function (e) {
        this._doUpdateRowEl(e.record);
        this._doUpdateSummaryRow();

        this.fire("updaterow", e);
    },
    __OnSourceRemove: function (e) {

        this._doRemoveRowEl(e.record);
        this._doUpdateSummaryRow();

        this.fire("removerow", e);

        if (this.isVirtualScroll()) {
            this.deferUpdate();
        }
    },
    __OnSourceMove: function (e) {
        this._doMoveRowEl(e.record, e.index);
        this._doUpdateSummaryRow();
        this.fire("moverow", e);
    },
    __OnSelectionChanged: function (e) {

        if (e.select) {
            this.fire("rowselect", e);
        } else {
            this.fire("rowdeselect", e);
        }

        var me = this;
        if (this._selectionTimer) {
            clearTimeout(this._selectionTimer);
            this._selectionTimer = null;
        }
        this._selectionTimer = setTimeout(function () {
            me._selectionTimer = null;

            me.fire("SelectionChanged", e);

            //            //滚动第一个
            //            var first = me.getSelected();
            //            if(first) 
        }, 1);
        //alert(e.records.length);
        var sss = new Date();

        this._doRowSelect(e._records, e.select);

        //        if (e.select) {
        //            setTimeout(function () {
        //                alert(new Date() - sss);
        //            }, 1);
        //        }
        //this.fire("_SelectionChanged", e);
    },
    __OnPageInfoChanged: function (e) {
        this._updatePagesInfo();
    },
    _updatePagesInfo: function () {
        var pageIndex = this.getPageIndex();
        var pageSize = this.getPageSize();
        var totalCount = this.getTotalCount();
        var totalPages = this.getTotalPage();

        var pagers = this._pagers;
        for (var i = 0, l = pagers.length; i < l; i++) {
            var pager = pagers[i];
            pager.update(pageIndex, pageSize, totalCount);
            this._dataSource.totalPage = pager.totalPage;
        }
    },
    setPagerButtons: function (value) {
        this._bottomPager.setButtons(value);
    },
    setPager: function (value) {
        if (typeof value == "string") {
            var el = mini.byId(value);
            if (!el) return;
            mini.parse(value);
            value = mini.get(value);
        }
        if (value) {
            this.bindPager(value);
        }
    },
    bindPager: function (pager) {
        if (!pager) return;
        this.unbindPager(pager);
        this._pagers.add(pager);
        pager.on("beforepagechanged", this.__OnPageChanged, this);
    },
    unbindPager: function (pager) {
        if (!pager) return;
        this._pagers.remove(pager);
        pager.un("pagechanged", this.__OnPageChanged, this);
    },
    __OnPageChanged: function (e) {
        e.cancel = true;
        this.gotoPage(e.pageIndex, e.pageSize);
        //this._dataSource.gotoPage(e.pageIndex, e.pageSize);
    },
    ///////////////////////////////////////////////
    _canUpdateRowEl: true,
    _doUpdateRowEl: function (row) {

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();


        var rowIndex = this.indexOf(row);

        var s = this._createRowHTML(row, rowIndex, columns2, 2);
        var rowEl = this._getRowEl(row, 2);
        jQuery(rowEl).before(s);
        if (rowEl) rowEl.parentNode.removeChild(rowEl);

        if (this.isFrozen()) {
            var s = this._createRowHTML(row, rowIndex, columns1, 1);
            var rowEl = this._getRowEl(row, 1);
            jQuery(rowEl).before(s);
            rowEl.parentNode.removeChild(rowEl);
        }
        this.deferLayout();
    },
    _doAddRowEl: function (row) {

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();

        var bdTable1 = this._rowsLockContentEl.firstChild;
        var bdTable2 = this._rowsViewContentEl.firstChild;

        var rowIndex = this.indexOf(row);
        var insertRow = this.getAt(rowIndex + 1);

        function doAdd(row, viewIndex, columns, bdTable) {
            var s = this._createRowHTML(row, rowIndex, columns, viewIndex);
            if (insertRow) {
                var inertRowEl = this._getRowEl(insertRow, viewIndex);
                jQuery(inertRowEl).before(s);
            } else {
                mini.append(bdTable, s);
            }
        }

        doAdd.call(this, row, 2, columns2, bdTable2);
        if (this.isFrozen()) {
            doAdd.call(this, row, 1, columns1, bdTable1);
        }

        this.deferLayout();

        var el = jQuery(".mini-grid-emptyText", this._bodyEl)[0];
        if (el) {
            //mini.removeNode(el.parentNode);           
            el.style.display = "none";
            el.parentNode.style.display = "none";
        }
    },
    _doRemoveRowEl: function (row) {
        var rowEl = this._getRowEl(row, 1);
        var rowEl2 = this._getRowEl(row, 2);
        if (rowEl) rowEl.parentNode.removeChild(rowEl);
        if (rowEl2) rowEl2.parentNode.removeChild(rowEl2);

        //详细行
        var tr = this._getRowDetailEl(row, 1);
        var tr2 = this._getRowDetailEl(row, 2);
        if (tr) tr.parentNode.removeChild(tr);
        if (tr2) tr2.parentNode.removeChild(tr2);

        this.deferLayout();

        if (this.showEmptyText && this.getVisibleRows().length == 0) {
            var el = jQuery(".mini-grid-emptyText", this._bodyEl)[0];
            if (el) {
                //mini.removeNode(el.parentNode);           
                el.style.display = "";
                el.parentNode.style.display = "";
            }
        }
    },
    _doMoveRowEl: function (row, index) {
        this._doRemoveRowEl(row);
        this._doAddRowEl(row);
    },
    ///////////////////////////////////////////////
    _getRowGroupEl: function (group, index) {
        if (index == 1 && !this.isFrozen()) return null;
        var id = this._createRowGroupId(group, index);
        var el = mini.byId(id, this.el);   //是否优化此方法？
        return el;
    },
    _getRowGroupRowsEl: function (group, index) {
        if (index == 1 && !this.isFrozen()) return null;
        var id = this._createRowGroupRowsId(group, index);
        var el = mini.byId(id, this.el);   //是否优化此方法？
        return el;
    },
    _getRowEl: function (row, index) {
        if (index == 1 && !this.isFrozen()) return null;
        row = this.getRecord(row);
        var id = this._createRowId(row, index);
        var el = mini.byId(id, this.el);   //是否优化此方法？
        return el;
    },
    _getHeaderCellEl: function (column, index) {
        if (index == 1 && !this.isFrozen()) return null;
        column = this.getColumn(column);
        var id = this._createHeaderCellId(column, index);
        var el = mini.byId(id, this.el);
        return el;
    },
    _getCellEl: function (row, column) {
        row = this.getRecord(row);
        column = this.getColumn(column);
        if (!row || !column) return null;
        var id = this._createCellId(row, column);
        var el = mini.byId(id, this.el);
        return el;
    },
    getRecordByEvent: function (e) {
        return this._getRecordByEvent(e);
    },
    _getRecordByEvent: function (e) {
        var t = mini.findParent(e.target, this._rowCls);
        if (!t) return null;
        var ids = t.id.split("$");
        var uid = ids[ids.length - 1];
        return this._getRowByID(uid);
    },
    _getColumnByEvent: function (e) {
        var t = mini.findParent(e.target, this._cellCls);
        if (!t) t = mini.findParent(e.target, this._headerCellCls);
        if (t) {
            var ids = t.id.split("$");
            var id = ids[ids.length - 1];
            return this._getColumnById(id);
        }
        return null;
    },
    _getCellByEvent: function (e) {
        var record = this._getRecordByEvent(e);
        var column = this._getColumnByEvent(e);
        return [record, column];
    },
    _getRowByID: function (id) {
        return this._dataSource.getby_id(id);
    },
    _getColumnById: function (id) {
        return this._columnModel._getColumnById(id);
    },
    addRowCls: function (row, cls) {
        var d1 = this._getRowEl(row, 1);
        var d2 = this._getRowEl(row, 2);
        if (d1) mini.addClass(d1, cls);
        if (d2) mini.addClass(d2, cls);
    },
    removeRowCls: function (row, cls) {
        var d1 = this._getRowEl(row, 1);
        var d2 = this._getRowEl(row, 2);
        if (d1) mini.removeClass(d1, cls);
        if (d2) mini.removeClass(d2, cls);
    },
    getCellBox: function (row, column) {
        row = this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return null;
        var cellEl = this._getCellEl(row, column);
        if (!cellEl) return null;
        return mini.getBox(cellEl);
    },
    getColumnBox: function (column) {
        var id = this._createHeaderCellId(column, 2);
        var el = document.getElementById(id);
        if (!el) {
            id = this._createHeaderCellId(column, 1);
            el = document.getElementById(id);
        }
        if (el) {
            //if (el.style.display == "none") return null;
            var box = mini.getBox(el);
            box.x -= 1;
            box.left = box.x;
            box.right = box.x + box.width;
            return box;
        }
    },
    getRowBox: function (row) {
        var rowEl = this._getRowEl(row, 1);
        var rowEl2 = this._getRowEl(row, 2);
        if (!rowEl2) return null;
        var box = mini.getBox(rowEl2);
        if (rowEl) {
            var box1 = mini.getBox(rowEl);
            box.x = box.left = box1.left;
            box.width = box.right - box.x;
        }
        return box;
    },
    ///////////////////

    _doRowSelect: function (rows, select) {
        var sss = new Date();
        for (var i = 0, l = rows.length; i < l; i++) {
            var record = rows[i];
            if (select) {
                this.addRowCls(record, this._rowSelectedCls);
            } else {
                this.removeRowCls(record, this._rowSelectedCls);
            }
        }
    },
    _tryFocus: function (e) {

        try {
            var tagName = e.target.tagName.toLowerCase();
            if (tagName == "input" || tagName == "textarea" || tagName == "select") return;

            if (mini.findParent(e.target, 'mini-grid-rows-content')) {
                //
                //mini.setX(this._focusEl, box.x);
                mini.setXY(this._focusEl, e.pageX, e.pageY);

                this.focus();
            }
            //            if (mini.isAncestor(this._filterEl, e.target)
            //            || mini.isAncestor(this._summaryEl, e.target)
            //            || mini.isAncestor(this._footerEl, e.target)
            //            || mini.findParent(e.target, "mini-grid-rowEdit")
            //            || mini.findParent(e.target, "mini-grid-detailRow")
            //            ) {

            //            } else {
            //                var me = this;

            //                //setTimeout(function () {
            //                me.focus();
            //                //}, 100);
            //            }
        } catch (ex) { }
    },
    focus: function () {
        try {

            var cell = this.getCurrentCell();
            if (cell) {
                var box = this.getCellBox(cell[0], cell[1]);
                mini.setX(this._focusEl, box.x);
            }

            var row = this.getCurrent();
            if (row) {

                //alert('focus');

                //var cellEl = this._getCellEl(

                var rowEl = this._getRowEl(row, 2);
                if (rowEl) {
                    var rowBox = mini.getBox(rowEl);
                    mini.setY(this._focusEl, rowBox.top);

                    //                    var that = this;
                    //                    setTimeout(function () {
                    //                        that._focusEl.focus();
                    //                    }, 1);
                    //                    //                    return;
                    if (isOpera) {
                        rowEl.focus();
                    } else if (isChrome) {
                        this._focusEl.focus();
                        //this.el.focus();
                    } else if (isGecko) {
                        //this.el.focus();
                        this._focusEl.focus();
                    } else {
                        this._focusEl.focus();
                    }
                }
            } else {
                if (isGecko) {
                    this.el.focus();
                } else {
                    this._focusEl.focus();
                }
            }

        } catch (e) { }
    },
    focusRow: function (row) {
        if (this._focusRow == row) return;
        if (this._focusRow) {
            this.removeRowCls(this._focusRow, this._rowHoverCls);
        }
        this._focusRow = row;
        if (row) this.addRowCls(row, this._rowHoverCls);
    },
    scrollIntoView: function (row, column) {
        try {
            if (column) {

                if (this._columnModel.isFrozenColumn(column)) {
                    column = null;
                }
            }

            if (column) {
                var cellEl = this._getCellEl(row, column);
                mini.scrollIntoView(cellEl, this._rowsViewEl, true);
            } else {
                var rowEl = this._getRowEl(row, 2);
                mini.scrollIntoView(rowEl, this._rowsViewEl, false);
            }
        } catch (e) { }
    },
    /////////////////////////////////////////////////////////////

    setShowLoading: function (value) {
        this.showLoading = value;
    },
    getShowLoading: function () {
        return this.showLoading;
    },
    setEnableHotTrack: function (value) {
        this.enableHotTrack = value;
    },
    getEnableHotTrack: function () {
        return this.enableHotTrack;
    },
    setAllowUnselect: function (value) {
        this.allowUnselect = value;
    },
    getAllowUnselect: function () {
        return this.allowUnselect;
    },
    setAllowRowSelect: function (value) {
        this.allowRowSelect = value;
    },
    getAllowRowSelect: function () {
        return this.allowRowSelect;
    },
    setAllowCellSelect: function (value) {
        this.allowCellSelect = value;
    },
    getAllowCellSelect: function () {
        return this.allowCellSelect;
    },
    setAllowCellEdit: function (value) {
        this.allowCellEdit = value;
    },
    getAllowCellEdit: function () {
        return this.allowCellEdit;
    },
    setCellEditAction: function (value) {
        this.cellEditAction = value;
    },
    getCellEditAction: function () {
        return this.cellEditAction;
    },
    setAllowCellValid: function (value) {
        this.allowCellValid = value;
    },
    getAllowCellValid: function () {
        return this.allowCellValid;
    },
    setAllowResizeColumn: function (value) {
        this.allowResizeColumn = value;
        mini.removeClass(this.el, "mini-grid-resizeColumns-no");
        if (!value) {
            mini.addClass(this.el, "mini-grid-resizeColumns-no");
        }
    },
    getAllowResizeColumn: function () {
        return this.allowResizeColumn;
    },
    setAllowSortColumn: function (value) {
        this.allowSortColumn = value;
    },
    getAllowSortColumn: function () {
        return this.allowSortColumn;
    },
    setAllowMoveColumn: function (value) {
        this.allowMoveColumn = value;
    },
    getAllowMoveColumn: function () {
        return this.allowMoveColumn;
    },
    setShowColumnsMenu: function (value) {
        this.showColumnsMenu = value;
    },
    getShowColumnsMenu: function () {
        return this.showColumnsMenu;
    },

    setEditNextRowCell: function (value) {
        this.editNextRowCell = value;
    },
    getEditNextRowCell: function () {
        return this.editNextRowCell;
    },
    setEditNextOnEnterKey: function (value) {
        this.editNextOnEnterKey = value;
    },
    getEditNextOnEnterKey: function () {
        return this.editNextOnEnterKey;
    },
    setEditOnTabKey: function (value) {
        this.editOnTabKey = value;
    },
    getEditOnTabKey: function () {
        return this.editOnTabKey;
    },
    setCreateOnEnter: function (value) {
        this.createOnEnter = value;
    },
    getCreateOnEnter: function () {
        return this.createOnEnter;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // CellSelect
    //////////////////////////////////////////////////////////////////////////////////////////
    _currentCell: null,
    _doCurrentCell: function (select) {
        if (this._currentCell) {
            var record = this._currentCell[0], column = this._currentCell[1];
            var cellEl = this._getCellEl(record, column);
            if (cellEl) {
                if (select) {
                    mini.addClass(cellEl, this._cellSelectedCls);
                } else {
                    mini.removeClass(cellEl, this._cellSelectedCls);
                }
            }
        }
    },
    setCurrentCell: function (cell) {
        if (this._currentCell != cell) {
            this._doCurrentCell(false);
            this._currentCell = cell;

            if (cell) {
                var row = this.getRow(cell[0]);
                var column = this.getColumn(cell[1]);
                if (row && column) {
                    this._currentCell = [row, column];
                } else {
                    this._currentCell = null;
                }
            }

            this._doCurrentCell(true);
            if (cell) {

                if (this.isFrozen()) {
                    this.scrollIntoView(cell[0]);
                } else {
                    //this.scrollIntoView(cell[0]);
                    this.scrollIntoView(cell[0], cell[1]);
                }
            }
            this.fire("currentcellchanged");
            //this._blurRow();
        }
    },
    getCurrentCell: function () {
        var cc = this._currentCell;
        if (cc) {
            if (this.indexOf(cc[0]) == -1) {
                this._currentCell = null;
                cc = null;
            }
        }
        return cc;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // CellEdit
    //////////////////////////////////////////////////////////////////////////////////////////
    _editingCell: null,
    isEditingCell: function (cell) {
        return this._editingCell && this._editingCell[0] == cell[0] && this._editingCell[1] == cell[1];
    },
    beginEditCell: function (row, column) {
        row = this.getRow(row);
        column = this.getColumn(column);
        var cell = [row, column];
        if (row && column) {
            this.setCurrentCell(cell);
        }

        var cell = this.getCurrentCell();
        if (this._editingCell && cell) {
            if (this._editingCell[0] == cell[0] && this._editingCell[1] == cell[1]) return;
        }

        if (this._editingCell) this.commitEdit();
        if (cell) {
            var row = cell[0], column = cell[1];
            var canEdit = this._OnCellBeginEdit(row, column, this.getCellEditor(column));
            if (canEdit !== false) {
                this.scrollIntoView(row, column);
                this._editingCell = cell;
                this._OnCellShowingEdit(row, column);
            }
        }
    },
    cancelEdit: function () {

        if (this.allowCellEdit) {
            if (this._editingCell) {
                this._OnCellEndEdit();
            }
        } else {
            if (this.isEditing()) {
                this._allowLayout = false;
                var data = this.getDataView();
                for (var i = 0, l = data.length; i < l; i++) {
                    var row = data[i];
                    if (row._editing == true) this.cancelEditRow(i);
                }
                this._allowLayout = true;
                this.doLayout();
            }
        }
    },
    commitEdit: function () {

        if (this.allowCellEdit) {

            if (this._editingCell) {
                this._OnCellCommitEdit(this._editingCell[0], this._editingCell[1]);
                this._OnCellEndEdit();
            }
        } else {
            if (this.isEditing()) {
                this._allowLayout = false;
                var data = this.getDataView();
                for (var i = 0, l = data.length; i < l; i++) {
                    var row = data[i];
                    if (row._editing == true) this.commitEditRow(i);
                }
                this._allowLayout = true;

                this.doLayout();
            }
        }
    },

    getCellEditor: function (column, row) {

        column = this.getColumn(column);
        if (!column) return;
        if (this.allowCellEdit) {

            var editor = column.__editor;

            if (!editor) editor = mini.getAndCreate(column.editor);
            if (editor && editor != column.editor) {
                column.editor = editor;
            }
            return editor;
        } else {
            row = this.getRow(row);
            column = this.getColumn(column);
            if (!row) row = this.getEditingRow();
            if (!row || !column) return null;
            var id = this.uid + "$" + row._uid + "$" + column._id + "$editor";
            return mini.get(id);
        }
    },

    _OnCellBeginEdit: function (record, column, editor) {

        var value = mini._getMap(column.field, record);
        var e = {
            sender: this,
            rowIndex: this.indexOf(record),
            row: record,
            record: record,
            column: column,
            field: column.field,
            editor: editor,
            value: value,
            cancel: false
        };

        this.fire("cellbeginedit", e);

        if (!mini.isNull(column.defaultValue) && (mini.isNull(e.value) || e.value === "")) {
            var defaultValue = column.defaultValue;
            //            try {
            //                
            //                defaultValue = eval('('+defaultValue+')');
            //            } catch (ex) { debugger}
            var obj = mini.clone({ d: defaultValue });
            e.value = obj.d;
        }

        var editor = e.editor;
        value = e.value;

        if (e.cancel) {
            return false;
        }
        if (!editor) return false;
        //column.editor = editor;   //!!!不能加

        //value, text初始化
        if (mini.isNull(value)) value = "";
        if (editor.setValue) {

            editor.setValue(value);
        }
        editor.ownerRowID = record._uid;

        if (column.displayField && editor.setText) {
            //var text = record[column.displayField];
            var text = mini._getMap(column.displayField, record);

            if (!mini.isNull(column.defaultText) && (mini.isNull(text) || text === "")) {
                var obj = mini.clone({ d: column.defaultText });
                text = obj.d;
            }

            editor.setText(text);
        }

        if (this.allowCellEdit) {
            this._editingControl = e.editor;
        }

        return true;
    },
    _OnCellCommitEdit: function (record, column, value, editor) {
        var e = {
            sender: this,
            rowIndex: this.indexOf(record),
            record: record,
            row: record,
            column: column,
            field: column.field,
            editor: editor ? editor : this.getCellEditor(column),
            value: mini.isNull(value) ? "" : value,
            text: "",
            cancel: false
        };

        if (e.editor && e.editor.getValue) {
            try {
                e.editor.blur();
            } catch (ex) {

            }
            e.value = e.editor.getValue();
        }
        if (e.editor && e.editor.getText) {
            e.text = e.editor.getText();
        }

        var oldValue = record[column.field], newValue = e.value;
        e.oldValue = oldValue;
        if (mini.isEquals(oldValue, newValue)) return e;

        this.fire("cellcommitedit", e);

        if (e.cancel == false) {

            if (this.allowCellEdit) {
                var o = {};
                o[column.field] = e.value;
                //mini._setMap(column.field, e.value, o);
                if (column.displayField) {
                    o[column.displayField] = e.text;
                    //mini._setMap(column.displayField, e.text, o);
                }
                this.updateRow(record, o);
            }
        }
        return e;
    },
    _OnCellEndEdit: function () {
        if (!this._editingCell) return;
        var record = this._editingCell[0];
        var column = this._editingCell[1];
        var e = {
            sender: this,
            rowIndex: this.indexOf(record),
            record: record,
            row: record,
            column: column,
            field: column.field,
            editor: this._editingControl,
            value: record[column.field]
        };

        this.fire("cellendedit", e);

        if (this.allowCellEdit) {
            var editor = e.editor;
            if (editor && editor.setIsValid) {

                editor.setIsValid(true);
            }

            if (this._editWrap) this._editWrap.style.display = 'none';
            var childNodes = this._editWrap.childNodes;
            for (var i = childNodes.length - 1; i >= 0; i--) {
                var el = childNodes[i];
                this._editWrap.removeChild(el);
            }


            if (editor && editor.hidePopup) {
                editor.hidePopup();
            }
            if (editor && editor.setValue) {
                editor.setValue("");
            }

            this._editingControl = null;
            this._editingCell = null;

            if (this.allowCellValid) {
                this.validateCell(record, column);
                //this.validateRow(record);
            }
        }
    },
    _OnCellShowingEdit: function (record, column) {
        if (!this._editingControl) return false;

        var cellBox = this.getCellBox(record, column);
        var viewWidth = document.body.scrollWidth; //mini.getViewportBox().width;
        if (cellBox.right > viewWidth) {

            cellBox.width = viewWidth - cellBox.left;
            if (cellBox.width < 10) cellBox.width = 10;
            cellBox.right = cellBox.left + cellBox.width;
        }
        var e = {
            sender: this,
            rowIndex: this.indexOf(record),
            record: record,
            row: record,
            column: column,
            field: column.field,
            cellBox: cellBox,
            editor: this._editingControl
        };

        this.fire("cellshowingedit", e);

        var editor = e.editor;
        if (editor && editor.setIsValid) {

            editor.setIsValid(true);
        }

        var editWrap = this._getEditWrap(cellBox);
        this._editWrap.style.zIndex = mini.getMaxZIndex();

        if (editor.render) {
            editor.render(this._editWrap);
            setTimeout(function () {
                editor.focus();
                if (editor.selectText) editor.selectText();
            }, 50);
            if (editor.setVisible) editor.setVisible(true);
        } else if (editor.el) {
            this._editWrap.appendChild(editor.el);
            setTimeout(function () {
                try {
                    editor.el.focus();
                } catch (e) {
                }
            }, 50);
        }

        if (editor.setWidth) {
            var width = cellBox.width;
            if (width < 20) width = 20;
            editor.setWidth(width);
        }

        if (editor.setHeight && editor.type == "textarea") {
            var height = cellBox.height - 1;
            if (editor.minHeight && height < editor.minHeight) height = editor.minHeight;
            editor.setHeight(height);
        }
        if (editor.setWidth) {
            var width = cellBox.width - 1;
            if (editor.minWidth && width < editor.minWidth) width = editor.minWidth;
            editor.setWidth(width);
        }
        mini.on(document, 'mousedown', this.__OnBodyMouseDown, this);

        if (column.autoShowPopup && editor.showPopup) {

            editor.showPopup();
        }
    },
    __OnBodyMouseDown: function (e) {
        if (this._editingControl) {

            var cell = this._getCellByEvent(e);

            if (this._editingCell && cell) {
                if (this._editingCell[0] == cell.record && this._editingCell[1] == cell.column) {
                    return false;
                }
            }

            var within = false;
            if (this._editingControl.within) within = this._editingControl.within(e);
            else within = mini.isAncestor(this._editWrap, e.target);

            if (within == false) {
                var me = this;
                if (mini.isAncestor(this._bodyEl, e.target) == false) {
                    setTimeout(function () {

                        me.commitEdit();

                    }, 1);
                } else {

                    var cell1 = me._editingCell;
                    setTimeout(function () {
                        var cell2 = me._editingCell;
                        if (cell1 == cell2) {
                            me.commitEdit();
                        }
                    }, 70);
                }
                mini.un(document, 'mousedown', this.__OnBodyMouseDown, this);
            }
        }
    },
    _getEditWrap: function (box) {
        if (!this._editWrap) {
            this._editWrap = mini.append(document.body, '<div class="mini-grid-editwrap" style="position:absolute;"></div>');
            //this._editWrap = mini.append(this.el, '<div class="mini-grid-editwrap" style="position:absolute;"></div>');

            mini.on(this._editWrap, "keydown", this.___OnEditControlKeyDown, this);
        }
        this._editWrap.style.zIndex = 1000000000;    //
        this._editWrap.style.display = 'block';
        mini.setXY(this._editWrap, box.x, box.y);
        mini.setWidth(this._editWrap, box.width);

        var viewWidth = document.body.scrollWidth; //mini.getViewportBox().width;
        if (box.x > viewWidth) mini.setX(this._editWrap, -1000);

        return this._editWrap;
    },
    ___OnEditControlKeyDown: function (e) {

        var editor = this._editingControl;

        if (e.keyCode == 13 && editor && editor.type == "textarea") {

            return;
        }
        //        if (e.keyCode == 13 && e.ctrlKey == false && editor && editor.type == "textarea") {
        //            return;
        //        }
        //        if (e.keyCode == 38 || e.keyCode == 40) {
        //            e.preventDefault();
        //        }
        if (e.keyCode == 13) {      //enter

            var cell = this._editingCell;
            if (cell && cell[1] && cell[1].enterCommit === false) return;

            this.commitEdit();
            this.focus();

            if (this.editNextOnEnterKey) {

                this._beginEditNextCell(e.shiftKey == false);
            } else {


            }
        } else if (e.keyCode == 27) {
            this.cancelEdit();

            this.focus();
        } else if (e.keyCode == 9) {    //tab
            this.commitEdit();
            if (this.editOnTabKey) {
                e.preventDefault();
                this.commitEdit();
                this._beginEditNextCell(e.shiftKey == false);
            } else {
                //this.cancelEdit();
            }
        }
    },

    editNextRowCell: false,
    editNextOnEnterKey: false,
    editOnTabKey: true,
    createOnEnter: false,
    _beginEditNextCell: function (next) {
        var grid = this;
        var currentCell = this.getCurrentCell();
        if (!currentCell) return;
        this.focus();
        var columns = grid.getVisibleColumns();

        var column = currentCell ? currentCell[1] : null,
            record = currentCell ? currentCell[0] : null;
        //if (!currentCell) record = grid.getCurrent();

        var columnIndex = columns.indexOf(column);
        var rowIndex = grid.indexOf(record);
        var count = grid.getData().length;


        if (next === false) {

            columnIndex -= 1;
            column = columns[columnIndex];
            if (!column) {
                column = columns[columns.length - 1];
                record = grid.getAt(rowIndex - 1);
                if (!record) {

                    return;
                }
            }
        } else {
            if (this.editNextRowCell) {
                if (rowIndex + 1 < count) {
                    record = grid.getAt(rowIndex + 1);
                }
            } else {
                columnIndex += 1;
                column = columns[columnIndex];
                if (!column) {
                    column = columns[0];
                    record = grid.getAt(rowIndex + 1);
                    if (!record) {
                        if (this.createOnEnter) {
                            record = {};

                            this.addRow(record);
                        } else {
                            return;
                        }
                    }
                }
            }
        }

        var currentCell = [record, column];
        grid.setCurrentCell(currentCell);
        grid.deselectAll();
        grid.setCurrent(record);
        grid.scrollIntoView(record, column);

        grid.beginEditCell();
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // RowEdit
    //////////////////////////////////////////////////////////////////////////////////////////    
    getEditorOwnerRow: function (editor) {
        var uid = editor.ownerRowID;
        return this.getRowByUID(uid);
    },

    beginEditRow: function (row) {
        if (this.allowCellEdit) return;

        var sss = new Date();

        row = this.getRow(row);
        if (!row) return;
        var rowEl = this._getRowEl(row, 2);
        if (!rowEl) return;


        //if (!this.multiEdit) this.cancelEdit();

        row._editing = true;

        this._doUpdateRowEl(row);
        //        var s = this._createRow(row);
        //        var rowEl = this._getRowEl(row);
        //        jQuery(rowEl).before(s);
        //        rowEl.parentNode.removeChild(rowEl);

        var rowEl = this._getRowEl(row, 2);
        mini.addClass(rowEl, "mini-grid-rowEdit");

        var columns = this.getVisibleColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var value = row[column.field];

            //var cellId = this._createCellId(row, columns[i]);
            //var cellEl = document.getElementById(cellId);
            var cellEl = this._getCellEl(row, column);
            if (!cellEl) continue;

            if (typeof column.editor == "string") {
                column.editor = eval('(' + column.editor + ')');
            }

            var editorConfig = mini.copyTo({}, column.editor);

            editorConfig.id = this.uid + "$" + row._uid + "$" + column._id + "$editor";
            var editor = mini.create(editorConfig);

            if (this._OnCellBeginEdit(row, column, editor)) {
                if (editor) {
                    mini.addClass(cellEl, "mini-grid-cellEdit");
                    cellEl.innerHTML = "";
                    cellEl.appendChild(editor.el);
                    mini.addClass(editor.el, "mini-grid-editor");
                }
            }
        }

        this.doLayout();
        //alert(new Date() - sss);

    },
    cancelEditRow: function (row) {
        if (this.allowCellEdit) return;

        row = this.getRow(row);
        if (!row || !row._editing) return;
        delete row._editing;

        var rowEl = this._getRowEl(row);

        var columns = this.getVisibleColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];

            var cellId = this._createCellId(row, columns[i]);
            var cellEl = document.getElementById(cellId);

            var editorEl = cellEl.firstChild;
            var editor = mini.get(editorEl);
            if (!editor) continue;

            editor.destroy();
        }

        this._doUpdateRowEl(row);

        this.doLayout();

    },
    commitEditRow: function (row) {
        if (this.allowCellEdit) return;

        row = this.getRow(row);
        if (!row || !row._editing) return;

        var rowData = this.getEditRowData(row, false, false);

        this._canUpdateRowEl = false;
        this.updateRow(row, rowData);
        this._canUpdateRowEl = true;

        this.cancelEditRow(row);
    },
    isEditing: function () {
        var data = this.getDataView();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            if (row._editing == true) return true;
        }
        return false;
    },
    isEditingRow: function (row) {
        row = this.getRow(row);
        if (!row) return false;
        return !!row._editing;
    },
    isNewRow: function (row) {
        return row._state == "added";
    },
    getEditingRows: function () {
        var rows = [];
        var data = this.getDataView();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            if (row._editing == true) rows.push(row);
        }
        return rows;
    },
    getEditingRow: function () {
        var rows = this.getEditingRows();
        return rows[0];
    },
    getEditData: function (all) {
        var data = [];
        var data = this.getDataView();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            if (row._editing == true) {
                var rowData = this.getEditRowData(i, all);
                rowData._index = i;

                data.push(rowData);
            }
        }
        return data;
    },
    getEditRowData: function (row, all, deep) {
        row = this.getRow(row);

        if (!row || !row._editing) return null;

        var idField = this.getIdField();
        var pidField = this.getParentField ? this.getParentField() : null;

        var rowData = {};

        var columns = this.getVisibleColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var cellId = this._createCellId(row, columns[i]);
            var cellEl = document.getElementById(cellId);

            var e = null;
            if (column.type == "checkboxcolumn" || column.type == "radiobuttoncolumn") {//checkboxcolumn
                var ck = column.getCheckBoxEl(row, column);
                var value = ck.checked ? column.trueValue : column.falseValue;
                e = this._OnCellCommitEdit(row, column, value);
            } else {
                var editorEl = cellEl.firstChild;
                var editor = mini.get(editorEl);
                if (!editor) continue;
                e = this._OnCellCommitEdit(row, column, null, editor);
            }
            if (deep !== false) {
                mini._setMap(column.field, e.value, rowData);
                if (column.displayField) {
                    mini._setMap(column.displayField, e.text, rowData);
                }
            } else {
                rowData[column.field] = e.value;
                if (column.displayField) {
                    rowData[column.displayField] = e.text;
                }
            }
        }

        rowData[idField] = row[idField];
        if (pidField) {
            rowData[pidField] = row[pidField];
        }

        if (all) {
            var o = mini.copyTo({}, row);
            rowData = mini.copyTo(o, rowData);
        }

        return rowData;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // RowGroup
    //////////////////////////////////////////////////////////////////////////////////////////
    collapseGroups: function () {
        if (!this.isGrouping()) return;
        this._allowLayout = false;
        var groups = this.getGroupingView();
        for (var i = 0, l = groups.length; i < l; i++) {
            var g = groups[i];
            this.collapseRowGroup(g);
        }
        this._allowLayout = true;
        this.doLayout();
    },
    expandGroups: function () {
        if (!this.isGrouping()) return;
        this._allowLayout = false;
        var groups = this.getGroupingView();
        for (var i = 0, l = groups.length; i < l; i++) {
            var g = groups[i];
            this.expandRowGroup(g);
        }
        this._allowLayout = true;
        this.doLayout();
    },
    toggleRowGroup: function (group) {
        if (group.expanded) {
            this.collapseRowGroup(group);
        } else {
            this.expandRowGroup(group);
        }
    },
    collapseRowGroup: function (group) {

        group = this.getRowGroup(group);
        if (!group) return;
        group.expanded = false;

        var g = this._getRowGroupEl(group, 1);
        var rows = this._getRowGroupRowsEl(group, 1);
        var g2 = this._getRowGroupEl(group, 2);
        var rows2 = this._getRowGroupRowsEl(group, 2);

        if (rows) rows.style.display = "none";
        if (rows2) rows2.style.display = "none";

        if (g) mini.addClass(g, "mini-grid-group-collapse");
        if (g2) mini.addClass(g2, "mini-grid-group-collapse");
        this.doLayout();
    },
    expandRowGroup: function (group) {
        group = this.getRowGroup(group);
        if (!group) return;
        group.expanded = true;

        var g = this._getRowGroupEl(group, 1);
        var rows = this._getRowGroupRowsEl(group, 1);
        var g2 = this._getRowGroupEl(group, 2);
        var rows2 = this._getRowGroupRowsEl(group, 2);

        if (rows) rows.style.display = "";
        if (rows2) rows2.style.display = "";

        if (g) mini.removeClass(g, "mini-grid-group-collapse");
        if (g2) mini.removeClass(g2, "mini-grid-group-collapse");
        this.doLayout();
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // RowDetail
    //////////////////////////////////////////////////////////////////////////////////////////
    showAllRowDetail: function () {
        this._allowLayout = false;
        var data = this.getDataView();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.showRowDetail(row);
        }
        this._allowLayout = true;
        this.doLayout();
    },
    hideAllRowDetail: function () {
        this._allowLayout = false;
        var data = this.getDataView();

        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.hideRowDetail(row);
        }
        this._allowLayout = true;
        this.doLayout();
    },
    isShowRowDetail: function (row) {
        row = this.getRow(row);
        if (!row) return false;
        return !!row._showDetail;
    },
    toggleRowDetail: function (row) {
        row = this.getRow(row);
        if (!row) return;
        if (grid.isShowRowDetail(row)) {
            grid.hideRowDetail(row);
        } else {
            grid.showRowDetail(row);
        }
    },
    showRowDetail: function (row) {
        row = this.getRow(row);
        if (!row || row._showDetail == true) return;
        row._showDetail = true;

        var tr = this._getRowDetailEl(row, 1, true);
        var tr2 = this._getRowDetailEl(row, 2, true);
        if (tr) tr.style.display = "";
        if (tr2) tr2.style.display = "";

        var rowEl = this._getRowEl(row, 1);
        var rowEl2 = this._getRowEl(row, 2);
        if (rowEl) mini.addClass(rowEl, "mini-grid-expandRow");
        if (rowEl2) mini.addClass(rowEl2, "mini-grid-expandRow");

        this.fire("showrowdetail", { record: row });

        this.doLayout();
    },
    hideRowDetail: function (row) {
        row = this.getRow(row);
        if (!row || row._showDetail !== true) return;
        row._showDetail = false;

        var tr = this._getRowDetailEl(row, 1);
        var tr2 = this._getRowDetailEl(row, 2);
        if (tr) tr.style.display = "none";
        if (tr2) tr2.style.display = "none";

        var rowEl = this._getRowEl(row, 1);
        var rowEl2 = this._getRowEl(row, 2);
        if (rowEl) mini.removeClass(rowEl, "mini-grid-expandRow");
        if (rowEl2) mini.removeClass(rowEl2, "mini-grid-expandRow");

        this.fire("hiderowdetail", { record: row });

        this.doLayout();
    },
    _getRowDetailEl: function (row, viewIndex, autoCreate) {
        row = this.getRow(row);
        if (!row) return null;
        var id = this._createRowDetailId(row, viewIndex);
        var el = document.getElementById(id);
        if (!el && autoCreate === true) {
            el = this._createRowDetail(row, viewIndex);
        }
        return el;
    },
    _createRowDetail: function (row, viewIndex) {
        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();
        var colspan = columns1.length;
        if (viewIndex == 2) {
            colspan = columns2.length;
        }
        var el = this._getRowEl(row, viewIndex);
        if (!el) return null;
        var id = this._createRowDetailId(row, viewIndex);
        var s = '<tr id="' + id + '" class="mini-grid-detailRow"><td class="mini-grid-detailCell" colspan="' + colspan + '"></td></tr>';
        jQuery(el).after(s);
        return document.getElementById(id);
    },
    _createRowDetailId: function (row, viewIndex) {
        return this._id + "$detail" + viewIndex + "$" + row._id;
    },
    getRowDetailCellEl: function (row, viewIndex) {
        if (!viewIndex) viewIndex = 2;
        var el = this._getRowDetailEl(row, viewIndex);
        if (el) return el.cells[0];
    },
    autoHideRowDetail: true,
    setAutoHideRowDetail: function (value) {
        this.autoHideRowDetail = value;
    },
    getAutoHideRowDetail: function () {
        return this.autoHideRowDetail;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // MergerCell
    //////////////////////////////////////////////////////////////////////////////////////////
    mergeColumns: function (columns) {
        if (columns && mini.isArray(columns) == false) columns = [columns];
        //自动合并值相同的单元格：行合并
        var grid = this;
        var bottomColumns = grid.getVisibleColumns();
        if (!columns) columns = bottomColumns;
        var data = grid.getDataView();
        data.push({});

        var __cells = [];

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            column = grid.getColumn(column);
            if (!column) continue;
            var cells = margeCells(column);
            __cells.addRange(cells);
        }

        function margeCells(column) {
            if (!column.field) return;
            var cells = [];
            var rowIndex = -1, rowSpan = 1, columnIndex = bottomColumns.indexOf(column);
            var cellValue = null;
            for (var i = 0, l = data.length; i < l; i++) {
                var row = data[i];
                //var value = row[column.field];
                var value = mini._getMap(column.field, row);
                if (rowIndex == -1 || value != cellValue) {
                    if (rowSpan > 1) {
                        var cell = { rowIndex: rowIndex, columnIndex: columnIndex, rowSpan: rowSpan, colSpan: 1 };
                        cells.push(cell);
                    }
                    rowIndex = i;
                    rowSpan = 1;
                    cellValue = value;
                } else {
                    rowSpan++;
                }
            }
            return cells;
        }

        grid.mergeCells(__cells);
    },
    mergeCells: function (cells) {
        if (!mini.isArray(cells)) return;
        this._mergedCells = cells;
        //maps
        var _mergedCellMaps = this._mergedCellMaps = {};

        function doMargedCellMaps(rowIndex, columnIndex, rowSpan, colSpan, cell) {
            for (var i = rowIndex, l = rowIndex + rowSpan; i < l; i++) {
                for (var j = columnIndex, k = columnIndex + colSpan; j < k; j++) {
                    if (i == rowIndex && j == columnIndex) {
                        _mergedCellMaps[i + ":" + j] = cell;
                    } else {
                        _mergedCellMaps[i + ":" + j] = true;
                    }
                }
            }
        }
        var cells = this._mergedCells;
        if (cells) {
            for (var i = 0, l = cells.length; i < l; i++) {
                var cell = cells[i];
                if (!cell.rowSpan) cell.rowSpan = 1;
                if (!cell.colSpan) cell.colSpan = 1;
                doMargedCellMaps(cell.rowIndex, cell.columnIndex, cell.rowSpan, cell.colSpan, cell);
            }
        }

        this.deferUpdate();
    },
    margeCells: function (cells) {
        this.mergeCells(cells);
    },
    _isCellVisible: function (rowIndex, columnIndex) {
        if (!this._mergedCellMaps) return true;
        var ret = this._mergedCellMaps[rowIndex + ":" + columnIndex];
        return !(ret === true);
    },

    //    _doMargeCells: function () {
    //        function _doMargeCells() {
    //            var cells = this._mergedCells;
    //            if (!cells) return;
    //            for (var i = 0, l = cells.length; i < l; i++) {
    //                var cell = cells[i];
    //                if (!cell.rowSpan) cell.rowSpan = 1;
    //                if (!cell.colSpan) cell.colSpan = 1;
    //                var cellEls = this._getCellEls(cell.rowIndex, cell.columnIndex, cell.rowSpan, cell.colSpan);
    //                for (var j = 0, k = cellEls.length; j < k; j++) {
    //                    var el = cellEls[j];
    //                    if (j != 0) {
    //                        el.style.display = "none";
    //                    } else {
    //                        el.rowSpan = cell.rowSpan;
    //                        el.colSpan = cell.colSpan;
    //                    }
    //                }
    //            }
    //        }
    //        //if (mini.isIE8) {
    //        _doMargeCells.call(this);
    //        //        } else {
    //        //            var me = this;
    //        //            if (this._doMargeCellsTimer) return;
    //        //            this._doMargeCellsTimer = setTimeout(function () {
    //        //                _doMargeCells.call(me);
    //        //                me._doMargeCellsTimer = null;
    //        //            }, 1);
    //        //        }
    //    },
    _getCellEls: function (rowIndex, columnIndex, rowSpan, colSpan) {
        var cells = [];
        if (!mini.isNumber(rowIndex)) return [];
        if (!mini.isNumber(columnIndex)) return [];
        var columns = this.getVisibleColumns();
        var data = this.getDataView();

        for (var i = rowIndex, l = rowIndex + rowSpan; i < l; i++) {
            for (var j = columnIndex, k = columnIndex + colSpan; j < k; j++) {
                var cell = this._getCellEl(i, j);
                if (cell) cells.push(cell);
            }
        }
        return cells;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // Row DragDrop
    //////////////////////////////////////////////////////////////////////////////////////////
    _getDragData: function () {
        return this.getSelecteds().clone();
    },
    _getDragText: function (dragNodes) {
        return "Records " + dragNodes.length;
    },
    allowDrag: false,
    allowDrop: false,
    allowLeafDropIn: false,
    setAllowLeafDropIn: function (value) {
        this.allowLeafDropIn = value;
    },
    getAllowLeafDropIn: function () {
        return this.allowLeafDropIn;
    },
    setAllowDrag: function (value) {
        this.allowDrag = value;
    },
    getAllowDrag: function () {
        return this.allowDrag;
    },
    setAllowDrop: function (value) {
        this.allowDrop = value;
    },
    getAllowDrop: function () {
        return this.allowDrop;
    },
    isAllowDrag: function (node, column) {
        if (this.isReadOnly() || this.enabled == false) return false;
        if (!this.allowDrag || !column.allowDrag) return false;
        if (node.allowDrag === false) return false;
        return true;
        //        var e = this._OnDragStart(node, column);
        //        return !e.cancel;
    },
    _OnDragStart: function (node, column) {
        var e = {
            node: node,
            nodes: this._getDragData(),
            column: column,
            cancel: false
        };
        e.record = e.node;
        e.records = e.nodes;
        e.dragText = this._getDragText(e.nodes);

        this.fire("dragstart", e);
        return e;
    },
    _OnGiveFeedback: function (effect, dragNodes, dropNode, from) {
        var e = {};
        e.from = from;

        e.effect = effect;
        e.nodes = dragNodes;
        e.node = e.nodes[0];
        e.targetNode = dropNode;

        e.dragNodes = dragNodes;
        e.dragNode = e.dragNodes[0];
        e.dropNode = e.targetNode;
        e.dragAction = e.action;

        this.fire("givefeedback", e);
        return e;
    },
    _OnDragDrop: function (dragNodes, dropNode, dragAction) {
        dragNodes = dragNodes.clone();
        var e = {
            dragNodes: dragNodes,
            targetNode: dropNode,
            action: dragAction,
            cancel: false
        };

        e.dragNode = e.dragNodes[0];
        e.dropNode = e.targetNode;
        e.dragAction = e.action;

        this.fire("beforedrop", e);
        this.fire("dragdrop", e);
        return e;
    },
    ////////////////////////////
    moveUp: function (items) {
        if (!mini.isArray(items)) return;
        //按序号，从小到大
        var me = this;
        items = items.sort(function (a, b) {
            var i1 = me.indexOf(a);
            var i2 = me.indexOf(b);
            if (i1 > i2) return 1;
            return -1;
        });
        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            var index = this.indexOf(item);
            this.moveRow(item, index - 1);
        }
    },
    moveDown: function (items) {
        if (!mini.isArray(items)) return;
        //按序号，从大到小
        var me = this;
        items = items.sort(function (a, b) {
            var i1 = me.indexOf(a);
            var i2 = me.indexOf(b);
            if (i1 > i2) return 1;
            return -1;
        });
        items.reverse();
        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            var index = this.indexOf(item);
            this.moveRow(item, index + 2);
        }
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // Load Sort Pager
    //////////////////////////////////////////////////////////////////////////////////////////
    pageSize: 20,
    pageIndex: 0,
    totalCount: 0,
    totalPage: 0,

    sortField: "",
    sortOrder: "",
    url: "",

    setAjaxAsync: function (value) {
        this._dataSource.ajaxAsync = value;
        this.ajaxAsync = value;
    },
    getAjaxAsync: function () {
        return this._dataSource.ajaxAsync;
    },
    setAjaxMethod: function (value) {
        this._dataSource.ajaxMethod = value;
        this.ajaxMethod = value;
    },
    getAjaxMethod: function () {
        return this._dataSource.ajaxMethod;
    },
    setAjaxOptions: function (value) {
        this._dataSource.setAjaxOptions(value);
    },
    getAjaxOptions: function () {
        return this._dataSource.getAjaxOptions();
    },
    setAutoLoad: function (value) {
        this._dataSource.setAutoLoad(value);
    },
    getAutoLoad: function () {
        return this._dataSource.getAutoLoad();
    },
    setUrl: function (value) {
        this._dataSource.setUrl(value);
        this.url = value;
    },
    getUrl: function () {
        return this._dataSource.getUrl();
    },
    load: function (params, success, error, complete) {
        this._dataSource.load(params, success, error, complete);
    },
    reload: function (success, error, complete) {
        this.accept();
        this._dataSource.reload(success, error, complete);
    },
    gotoPage: function (index, size) {
        this._dataSource.gotoPage(index, size);
    },
    sortBy: function (sortField, sortOrder) {
        if (!sortField) return null;
        if (this._dataSource.sortMode == "server") {
            this._dataSource.sortBy(sortField, sortOrder);
        } else {
            var dataType = this._columnModel._getDataTypeByField(sortField);
            this._dataSource._doClientSortField(sortField, sortOrder, dataType);
        }
    },
    setCheckSelectOnLoad: function (value) {
        this._dataSource.setCheckSelectOnLoad(value);
        this.checkSelectOnLoad = value;
    },
    getCheckSelectOnLoad: function () {
        return this._dataSource.getCheckSelectOnLoad();
    },
    setSelectOnLoad: function (value) {
        this._dataSource.setSelectOnLoad(value);
        this.selectOnLoad = value;
    },
    getSelectOnLoad: function () {
        return this._dataSource.getSelectOnLoad();
    },
    setSortMode: function (value) {
        this._dataSource.setSortMode(value);
        this.sortMode = value;
    },
    getSortMode: function () {
        return this._dataSource.getSortMode();
    },
    setPageIndex: function (value) {
        this._dataSource.setPageIndex(value);
        this.pageIndex = value;
    },
    getPageIndex: function () {
        return this._dataSource.getPageIndex();
    },
    setPageSize: function (value) {
        this._dataSource.setPageSize(value);
        this._virtualRows = value;
        this.pageSize = value;
    },
    getPageSize: function () {
        return this._dataSource.getPageSize();
    },
    setTotalCount: function (value) {
        this._dataSource.setTotalCount(value);
        this.totalCount = value;
    },
    getTotalCount: function () {
        return this._dataSource.getTotalCount();
    },
    getTotalPage: function () {
        return this._dataSource.getTotalPage();
    },

    setSortField: function (value) {
        this._dataSource.setSortField(value);
        this.sortField = value;
    },
    getSortField: function () {
        return this._dataSource.sortField;
    },
    setSortOrder: function (value) {
        this._dataSource.setSortOrder(value);
        this.sortOrder = value;
    },
    getSortOrder: function () {
        return this._dataSource.sortOrder;
    },

    setPageIndexField: function (value) {
        this._dataSource.pageIndexField = value;
        this.pageIndexField = value;
    },
    getPageIndexField: function () {
        return this._dataSource.pageIndexField;
    },
    setPageSizeField: function (value) {
        this._dataSource.pageSizeField = value;
        this.pageSizeField = value;
    },
    getPageSizeField: function () {
        return this._dataSource.pageSizeField;
    },
    setSortFieldField: function (value) {
        this._dataSource.sortFieldField = value;
        this.sortFieldField = value;
    },
    getSortFieldField: function () {
        return this._dataSource.sortFieldField;
    },
    setSortOrderField: function (value) {
        this._dataSource.sortOrderField = value;
        this.sortOrderField = value;
    },
    getSortOrderField: function () {
        return this._dataSource.sortOrderField;
    },
    setTotalField: function (value) {
        this._dataSource.totalField = value;
        this.totalField = value;
    },
    getTotalField: function () {
        return this._dataSource.totalField;
    },
    setDataField: function (value) {
        this._dataSource.dataField = value;
        this.dataField = value;
    },
    getDataField: function () {
        return this._dataSource.dataField;
    },
    setShowReloadButton: function (value) {
        this._bottomPager.setShowReloadButton(value);
    },
    getShowReloadButton: function () {
        return this._bottomPager.getShowReloadButton();
    },
    setShowPageInfo: function (value) {
        this._bottomPager.setShowPageInfo(value);
    },
    getShowPageInfo: function () {
        return this._bottomPager.getShowPageInfo();
    },
    setSizeList: function (value) {
        if (!mini.isArray(value)) return;
        this._bottomPager.setSizeList(value);
    },
    getSizeList: function () {
        return this._bottomPager.getSizeList();
    },
    setShowPageSize: function (value) {
        this._bottomPager.setShowPageSize(value);
    },
    getShowPageSize: function () {
        return this._bottomPager.getShowPageSize();
    },
    setShowPageIndex: function (value) {
        this.showPageIndex = value;
        this._bottomPager.setShowPageIndex(value);
    },
    getShowPageIndex: function () {
        return this._bottomPager.getShowPageIndex();
    },
    setShowTotalCount: function (value) {

        this._bottomPager.setShowTotalCount(value);
    },
    getShowTotalCount: function () {
        return this._bottomPager.getShowTotalCount();
    },
    setPagerStyle: function (value) {
        this.pagerStyle = value;
        mini.setStyle(this._bottomPager.el, value);
    },
    setPagerCls: function (value) {
        this.pagerCls = value;
        mini.addClass(this._bottomPager.el, value);
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // ContextMenu
    //////////////////////////////////////////////////////////////////////////////////////////
    _beforeOpenContentMenu: function (menu, e) {
        //var record = this._getRecordByEvent(e.htmlEvent);        
        var can = mini.isAncestor(this._bodyEl, e.htmlEvent.target);
        if (can) {
            menu.fire("BeforeOpen", e);
        } else {
            e.cancel = true;
        }
    },
    __OnHtmlContextMenu: function (e) {
        var ev = {
            popupEl: this.el,
            htmlEvent: e,
            cancel: false
        };

        if (mini.isAncestor(this._columnsEl, e.target)) {
            if (this.headerContextMenu) {
                this.headerContextMenu.fire("BeforeOpen", ev);
                if (ev.cancel == true) return;
                this.headerContextMenu.fire("opening", ev);
                if (ev.cancel == true) return;
                this.headerContextMenu.showAtPos(e.pageX, e.pageY);
                this.headerContextMenu.fire("Open", ev);
            }
        } else {

            var d = mini.findParent(e.target, "mini-grid-detailRow");
            if (d && mini.isAncestor(this.el, d)) return;

            if (this.contextMenu) {
                this._beforeOpenContentMenu(this.contextMenu, ev);
                if (ev.cancel == true) return;
                this.contextMenu.fire("opening", ev);
                if (ev.cancel == true) return;
                this.contextMenu.showAtPos(e.pageX, e.pageY);
                this.contextMenu.fire("Open", ev);
            }
        }
        return false;

    },
    headerContextMenu: null,
    setHeaderContextMenu: function (value) {
        var ui = this._getContextMenu(value);
        if (!ui) return;
        if (this.headerContextMenu !== ui) {
            this.headerContextMenu = ui;
            this.headerContextMenu.owner = this;
            mini.on(this.el, "contextmenu", this.__OnHtmlContextMenu, this);
        }
    },
    getHeaderContextMenu: function () {
        return this.headerContextMenu;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    _get_originals: function () {
        return this._dataSource._originals;
    },
    _set_originals: function (value) {
        this._dataSource._originals = value;
    },
    _set_clearOriginals: function (value) {
        this._dataSource._clearOriginals = value;
    },
    _set_originalIdField: function (value) {
        this._dataSource._originalIdField = value;
    },
    _set_autoCreateNewID: function (value) {
        this._dataSource._autoCreateNewID = value;
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    // HTML Tags
    //////////////////////////////////////////////////////////////////////////////////////////       
    getAttrs: function (el) {
        var attrs = mini.DataGrid.superclass.getAttrs.call(this, el);
        var cs = mini.getChildNodes(el);
        for (var i = 0, l = cs.length; i < l; i++) {
            var node = cs[i];
            var property = jQuery(node).attr("property");
            if (!property) continue;
            property = property.toLowerCase();
            if (property == "columns") {
                attrs.columns = mini._ParseColumns(node);
                mini.removeNode(node);
            } else if (property == "data") {
                attrs.data = node.innerHTML;
                mini.removeNode(node);
            }
        }

        mini._ParseString(el, attrs,
            [
                "url", "sizeList", "bodyCls", "bodyStyle", "footerCls", "footerStyle", "pagerCls", "pagerStyle",
                "onheadercellclick", "onheadercellmousedown", "onheadercellcontextmenu", "onrowdblclick",
                "onrowclick", "onrowmousedown", "onrowcontextmenu",
                "oncellclick", "oncellmousedown", "oncellcontextmenu",
                "onbeforeload", "onpreload", "onloaderror", "onload",
                "ondrawcell", "oncellbeginedit", "onselectionchanged", "ondrawgroup",
                "onbeforeshowrowdetail", "onbeforehiderowdetail", "onshowrowdetail", "onhiderowdetail", "idField", "valueField",
                "pager", "oncellcommitedit", "oncellendedit",
                "headerContextMenu", "loadingMsg", "emptyText", "cellEditAction",
                "sortMode", "oncellvalidation", "onsort",
                "ondrawsummarycell", "ondrawgroupsummarycell", "onresize", "oncolumnschanged",
                "ajaxMethod", "ajaxOptions",

                "onaddrow", "onupdaterow", "onremoverow", "onmoverow",
                "onbeforeaddrow", "onbeforeupdaterow", "onbeforeremoverow", "onbeforemoverow",

                "pageIndexField", "pageSizeField", "sortFieldField", "sortOrderField",
                "totalField", "dataField", "sortField", "sortOrder",
                "pagerButtons"
             ]
        );

        mini._ParseBool(el, attrs,
            ["showColumns", "showFilterRow", "showSummaryRow", "showPager", "showFooter",
            "showHGridLines", "showVGridLines",
            "allowSortColumn", "allowMoveColumn", "allowResizeColumn",
            "fitColumns", "showLoading", "multiSelect", "allowAlternating", "resultAsData", "allowRowSelect", "allowUnselect",
            "enableHotTrack", "showPageIndex", "showPageSize", "showTotalCount",
            "checkSelectOnLoad", "allowResize", "autoLoad",
            "autoHideRowDetail", "allowCellSelect", "allowCellEdit", "allowCellWrap", "allowHeaderWrap", "selectOnLoad",
            "virtualScroll", "collapseGroupOnLoad", "showGroupSummary",
            "showEmptyText", "allowCellValid", "showModified", "showColumnsMenu", "showPageInfo", "showReloadButton",
            "showNewRow", "editNextOnEnterKey", "createOnEnter",
            "ajaxAsync",
            "allowDrag", "allowDrop", "allowLeafDropIn", "editNextRowCell"
             ]
        );

        mini._ParseInt(el, attrs,
            ["frozenStartColumn", "frozenEndColumn",
            "pageIndex", "pageSize", "defaultRowHeight"
             ]
        );

        if (typeof attrs.ajaxOptions == "string") {
            attrs.ajaxOptions = eval('(' + attrs.ajaxOptions + ')');
        }
        if (typeof attrs.sizeList == "string") {
            attrs.sizeList = eval('(' + attrs.sizeList + ')');
        }
        if (!attrs.idField && attrs.valueField) {
            attrs.idField = attrs.valueField;
        }

        if (attrs.pagerButtons) {
            attrs.pagerButtons = mini.byId(attrs.pagerButtons);
        }

        return attrs;
    }
});
mini.regClass(mini.DataGrid, "datagrid");


/* Cell Validae
-----------------------------------------------------------------------------*/

mini_DataGrid_CellValidator_Prototype = {    
    getCellErrors: function () {
        var errors = this._cellErrors.clone();

        var data = this.getDataView();
        for (var i = 0, l = errors.length; i < l; i++) {
            var error = errors[i];
            var row = error.record;
            var column = error.column;
            if (data.indexOf(row) == -1) {
                var id = row[this._rowIdField] + "$" + column._id;
                delete this._cellMapErrors[id];
                this._cellErrors.remove(error);
            }
        }

        return this._cellErrors;
    },
    getCellError: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;

        var id = row[this._rowIdField] + "$" + column._id;
        return this._cellMapErrors[id];
    },
    isValid: function () {
        return this.getCellErrors().length == 0;
    },
    validate: function () {
        var data = this.getDataView();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.validateRow(row);
        }
    },
    validateRow: function (row) {
        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            this.validateCell(row, column);
        }
    },
    validateCell: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;
        var e = {
            record: row,
            row: row,
            node: row,
            column: column,
            field: column.field,
            value: row[column.field],
            isValid: true,
            errorText: ""
        };

        if (column.vtype) {
            
            mini._ValidateVType(column.vtype, e.value, e, column);
        }
        //唯一列值处理unique：遍历行，满足条件，遍历行
        if (e.isValid == true && column.unique && column.field) {

            var maps = {};
            var data = this.data, field = column.field;
            for (var i = 0, l = data.length; i < l; i++) {
                var o = data[i];
                var v = o[field];
                if (mini.isNull(v) || v === "") {
                } else {
                    var old = maps[v];
                    if (old && o == row) {
                        e.isValid = false;
                        e.errorText = mini._getErrorText(column, "uniqueErrorText");

                        //上面的也是
                        this.setCellIsValid(old, column, e.isValid, e.errorText);
                        break;
                    }
                    maps[v] = o;
                }
            }
        }

        this.fire("cellvalidation", e);
        this.setCellIsValid(row, column, e.isValid, e.errorText);
    },

    setIsValid: function (value) {
        if (value) {
            var errors = this._cellErrors.clone();
            for (var i = 0, l = errors.length; i < l; i++) {
                var error = errors[i];
                this.setCellIsValid(error.record, error.column, true);
            }
        }
    },
    _removeRowError: function (row) {
        var columns = this.getColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = row[this._rowIdField] + "$" + column._id;
            var error = this._cellMapErrors[id];
            if (error) {
                delete this._cellMapErrors[id];
                this._cellErrors.remove(error);
            }
        }
    },
    setCellIsValid: function (row, column, isValid, errorText) {
        row = this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;
        var id = row[this._rowIdField] + "$" + column._id;
        var cellEl = this._getCellEl(row, column);

        var error = this._cellMapErrors[id];
        delete this._cellMapErrors[id];
        this._cellErrors.remove(error);

        if (isValid === true) {
            if (cellEl && error) {
                mini.removeClass(cellEl, 'mini-grid-cell-error');
            }
        } else {
            error = { record: row, column: column, isValid: isValid, errorText: errorText };
            this._cellMapErrors[id] = error;
            this._cellErrors.add(error);
            if (cellEl) {
                mini.addClass(cellEl, 'mini-grid-cell-error');
            }
        }
    }
}
mini.copyTo(mini.DataGrid.prototype, mini_DataGrid_CellValidator_Prototype);
