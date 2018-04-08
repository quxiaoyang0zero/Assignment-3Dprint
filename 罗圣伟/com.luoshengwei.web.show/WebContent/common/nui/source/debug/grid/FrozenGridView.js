/*   
    1.实现锁定列

*/

mini.FrozenGridView = function () {    
    mini.FrozenGridView.superclass.constructor.call(this);
};
mini.extend(mini.FrozenGridView, mini.GridView, {

    //锁定列后，行高固定
    isFixedRowHeight: function () {
        return this.fixedRowHeight || this.isFrozen();
    },

    _create: function () {
        mini.FrozenGridView.superclass._create.call(this);
        var el = this.el;

        var lockColumns = '<div class="mini-grid-columns-lock"></div>';
        var lockRows = '<div class="mini-grid-rows-lock"><div class="mini-grid-rows-content"></div></div>';

        this._columnsLockEl = mini.before(this._columnsViewEl, lockColumns);
        this._rowsLockEl = mini.before(this._rowsViewEl, lockRows);

        this._rowsLockContentEl = this._rowsLockEl.firstChild;

        //filter
        var lockFilter = '<div class="mini-grid-filterRow-lock"></div>';
        this._filterLockEl = mini.before(this._filterViewEl, lockFilter);
        //summary
        var lockSummary = '<div class="mini-grid-summaryRow-lock"></div>';
        this._summaryLockEl = mini.before(this._summaryViewEl, lockSummary);
    },
    _initEvents: function () {
        mini.FrozenGridView.superclass._initEvents.call(this);

        mini.on(this._rowsEl, "mousewheel", this.__OnMouseWheel, this);

    },
    _createHeaderText: function (column, viewIndex) {
        var header = column.header;
        if (typeof header == "function") header = header.call(this, column);
        if (mini.isNull(header) || header === "") header = "&nbsp;";
        if (this.isFrozen() && viewIndex == 2) {
            if (column.viewIndex1) {
                header = "&nbsp;";
            }
        }
        return header;
    },
    _createColumnColSpan: function (column, sb, viewIndex) {
        if (this.isFrozen()) {
            var colspan = column["colspan" + viewIndex];
            if (colspan) {
                sb[sb.length] = 'colspan="' + colspan + '" ';
            }
        } else {
            if (column.colspan) {
                sb[sb.length] = 'colspan="' + column.colspan + '" ';
            }
        }
    },
    doUpdateColumns: function () {

        var frozenColumnsRow = this.isFrozen() ? this.getFrozenColumnsRow() : [];
        var unFrozenColumnsRow = this.isFrozen() ? this.getUnFrozenColumnsRow() : this.getVisibleColumnsRow();

        var frozenColumns = this.isFrozen() ? this.getFrozenColumns() : [];
        var unfrozenColumns = this.isFrozen() ? this.getUnFrozenColumns() : this.getVisibleColumns();


        var lockHtml = this._createColumnsHTML(frozenColumnsRow, 1, frozenColumns);
        var html = this._createColumnsHTML(unFrozenColumnsRow, 2, unfrozenColumns);
        var s = '<div class="mini-grid-topRightCell"></div>';

        lockHtml += s;
        html += s;

        this._columnsLockEl.innerHTML = lockHtml;
        this._columnsViewEl.innerHTML = html;

        var lockTable = this._columnsLockEl.firstChild;
        lockTable.style.width = "0px";
        
    },
    doUpdateRows: function () {
        
        var data = this.getVisibleRows();

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();


        if (this.isGrouping()) {
            var lockHtml = this._createGroupingHTML(columns1, 1);
            var html = this._createGroupingHTML(columns2, 2);

            this._rowsLockContentEl.innerHTML = lockHtml;
            this._rowsViewContentEl.innerHTML = html;
        } else {
            var lockHtml = this._createRowsHTML(columns1, 1, this.isFrozen() ? data : []);
            var html = this._createRowsHTML(columns2, 2, data);

            this._rowsLockContentEl.innerHTML = lockHtml;
            this._rowsViewContentEl.innerHTML = html;
        }
        var lockTable = this._rowsLockContentEl.firstChild;
        lockTable.style.width = "0px";
    },
    _doUpdateFilterRow: function () {
        if (this._filterLockEl.firstChild) {
            this._filterLockEl.removeChild(this._filterLockEl.firstChild);
        }
        if (this._filterViewEl.firstChild) {
            this._filterViewEl.removeChild(this._filterViewEl.firstChild);
        }

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();

        var html1 = this._createFilterRowHTML(columns1, 1);
        var html2 = this._createFilterRowHTML(columns2, 2);

        this._filterLockEl.innerHTML = html1;
        this._filterViewEl.innerHTML = html2;

        this._doRenderFilters();
    },
    _doUpdateSummaryRow: function () {

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();

        var html1 = this._createSummaryRowHTML(columns1, 1);
        var html2 = this._createSummaryRowHTML(columns2, 2);

        this._summaryLockEl.innerHTML = html1;
        this._summaryViewEl.innerHTML = html2;
    },
    _syncColumnHeight: function () {
        var lock = this._columnsLockEl.firstChild, view = this._columnsViewEl.firstChild;
        lock.style.height = view.style.height = 'auto';
        if (this.isFrozen()) {
            var h = lock.offsetHeight;
            var h2 = view.offsetHeight;
            h = h > h2 ? h : h2;
            lock.style.height = view.style.height = h + 'px';
        }

        //summary
        var lock = this._summaryLockEl, view = this._summaryViewEl;
        lock.style.height = view.style.height = 'auto';
        if (this.isFrozen()) {
            var h = lock.offsetHeight;
            var h2 = view.offsetHeight;
            h = h > h2 ? h : h2;
            lock.style.height = view.style.height = h + 'px';
        }
    },
    doLayout: function () {
        if (this.canLayout() == false) return;
        this._doLayoutScroll = false;

        this._doEmptyText();
        
        //同步左右两个column高度
        this._syncColumnHeight();

        mini.FrozenGridView.superclass.doLayout.call(this);

        var autoHeight = this.isAutoHeight();
        var isFrozen = this.isFrozen();
        var viewportWidth = this.getViewportWidth(true);
        var lockedWidth = this.getLockedWidth();

        var viewWidth = viewportWidth - lockedWidth;

        if (isFrozen) {

            this._filterViewEl.style["marginLeft"] = lockedWidth + "px";
            this._summaryViewEl.style["marginLeft"] = lockedWidth + "px";
            this._columnsViewEl.style["marginLeft"] = lockedWidth + "px";
            this._rowsViewEl.style["marginLeft"] = lockedWidth + "px";

            if (mini.isChrome || mini.isIE6) {
                this._filterViewEl.style["width"] = viewWidth + "px";
                this._summaryViewEl.style["width"] = viewWidth + "px";
                this._columnsViewEl.style["width"] = viewWidth + "px";
            } else {
                this._filterViewEl.style["width"] = "auto";
                this._summaryViewEl.style["width"] = "auto";
                this._columnsViewEl.style["width"] = "auto";
            }
            //            if (mini.isIE6 || !mini.isIE)  this._columnsViewEl.style["width"] = viewWidth + "px";
            if (mini.isChrome || mini.isIE6) this._rowsViewEl.style["width"] = viewWidth + "px";

            mini.setWidth(this._filterLockEl, lockedWidth);
            mini.setWidth(this._summaryLockEl, lockedWidth);
            mini.setWidth(this._columnsLockEl, lockedWidth);
            mini.setWidth(this._rowsLockEl, lockedWidth);

            this._filterLockEl.style["left"] = "0px";
            this._summaryLockEl.style["left"] = "0px";
            this._columnsLockEl.style["left"] = "0px";
            this._rowsLockEl.style["left"] = "0px";

            //            //锁定列区域偏移
            //            this._columnsLockEl.firstChild.style.left = -leftLockedOffset + "px";
            //            this._columnsViewEl.firstChild.style.left = -rightLockedOffset + "px";

        } else {
            this._doClearFrozen();
        }

        if (autoHeight) {
            this._rowsLockEl.style.height = "auto";
        } else {
            this._rowsLockEl.style.height = "100%";
        }

        //        this._syncRowsHeight();

        //        this._layoutScroll();
        //        var me = this;
        //        setTimeout(function () {
        //            me._layoutScroll();
        //        }, 1);
    },
    _doEmptyText: function () {
        //        var d1 = document.getElementById(this.uid + "$emptytext" + 1);
        //        var d2 = document.getElementById(this.uid + "$emptytext" + 2);        
        //        if (this.getDataView().length == 0 && this.showEmptyText) {            
        //            d1.style.display = d2.style.display = "";
        //        } else {
        //            d1.style.display = d2.style.display = "none";
        //        }
    },
    //count: 0,
    _getRowEl: function (row, index) {
        row = this.getRecord(row);
        var id = this._createRowId(row, index);
        var el = document.getElementById(id);
        return el;
    },

    //    _syncRowsHeightTimer: null,
    //    //@@@此方法基本被丢弃：锁定时固定行高，也就不用此方法了。不过暂时保留代码。
    //    _syncRowsHeight: function () {
    //        //同步锁定区、非锁定区的所有行高。优化方案：在doUpdate的时候调用一次，其他的时候不调用。
    //        var me = this;
    //        function doSync() {
    //            //return;
    //            //优化：1）分2次同步；2）只在doUpdate调用一次
    //            var d = document;
    //            var data = me.getDataView();
    //            for (var i = 0, l = data.length; i < l; i++) {
    //                var row = data[i];
    //                var row1 = me._getRowEl(row, 1);
    //                var row2 = me._getRowEl(row, 2);
    //                if (!row1 || !row2) continue;

    //                row1.style.height = row2.style.height = "auto";

    //                var h1 = row1.offsetHeight;
    //                var h2 = row2.offsetHeight;
    //                if (h1 > h2) {
    //                    row2.style.height = h1 + "px";
    //                } else if (h1 < h2) {
    //                    row1.style.height = h2 + "px";
    //                }
    //            }

    //            //            var lockRows = me._rowsLockContentEl.firstChild.rows;
    //            //            var rows = me._rowsViewContentEl.firstChild.rows;
    //            //            for (var i = 0, l = rows.length; i < l; i++) {
    //            //                var row1 = lockRows[i];
    //            //                var row2 = rows[i];

    //            //                row1.style.height = row2.style.height = "auto";

    //            //                var h1 = row1.offsetHeight;
    //            //                var h2 = row2.offsetHeight;
    //            //                if (h1 > h2) {
    //            //                    row2.style.height = h1 + "px";
    //            //                } else if (h1 < h2) {
    //            //                    row1.style.height = h2 + "px";
    //            //                }
    //            //            }
    //            me._syncRowsHeightTimer = null;
    //        }
    //        if (this.isFrozen() && this.isFixedRowHeight() == false) {
    //            if (this._syncRowsHeightTimer) clearTimeout(this._syncRowsHeightTimer);
    //            //            if (this._isCreating()) {
    //            //                document.title = this.count++;
    //            //                //alert(this.getData().length);
    //            //                doSync();
    //            //            } else {
    //            this._syncRowsHeightTimer = setTimeout(doSync, 1);
    //            //}
    //        }
    //    },
    ///////////////////////////////////////////////////
    _doClearFrozen: function () {

        this._filterLockEl.style.left = "-10px";
        this._summaryLockEl.style.left = "-10px";
        this._columnsLockEl.style.left = "-10px";
        this._rowsLockEl.style.left = "-10px";

        this._filterLockEl.style["width"] = "0px";
        this._summaryLockEl.style["width"] = "0px";
        this._columnsLockEl.style["width"] = "0px";
        this._rowsLockEl.style["width"] = "0px";

        this._filterLockEl.style["marginLeft"] = "0px";
        this._summaryLockEl.style["marginLeft"] = "0px";
        this._columnsViewEl.style["marginLeft"] = "0px";
        this._rowsViewEl.style["marginLeft"] = "0px";

        this._filterViewEl.style["width"] = "auto";
        this._summaryViewEl.style["width"] = "auto";
        this._columnsViewEl.style["width"] = "auto";
        this._rowsViewEl.style["width"] = "auto";

        if (mini.isChrome || mini.isIE6) {
            this._filterViewEl.style["width"] = "100%";
            this._summaryViewEl.style["width"] = "100%";
            this._columnsViewEl.style["width"] = "100%";
            this._rowsViewEl.style["width"] = "100%";
        }

        //        //取消锁定列区域偏移
        //        this._columnsLockEl.firstChild.style.left = "0px";
        //        this._columnsViewEl.firstChild.style.left = "0px";
    },
    frozenColumns: function (startColumn, finishColumn) {
        this.frozen(startColumn, finishColumn);
    },
    unFrozenColumns: function () {
        this.unFrozen();
    },
    frozen: function (startColumn, finishColumn) {
        this._doClearFrozen();
        this._columnModel.frozen(startColumn, finishColumn);
    },
    unFrozen: function () {
        this._doClearFrozen();
        this._columnModel.unFrozen();
    },
    setFrozenStartColumn: function (value) {
        this._columnModel.setFrozenStartColumn(value);
    },
    setFrozenEndColumn: function (value) {
        return this._columnModel.setFrozenEndColumn(value);
    },
    getFrozenStartColumn: function (value) {
        return this._columnModel._frozenStartColumn;
    },
    getFrozenEndColumn: function (value) {
        return this._columnModel._frozenEndColumn;
    },
    getFrozenColumnsRow: function () {
        return this._columnModel.getFrozenColumnsRow();
    },
    getUnFrozenColumnsRow: function () {
        return this._columnModel.getUnFrozenColumnsRow();
    },
    ////////////////////////////////////////////////////
    getLockedWidth: function () {

        if (!this.isFrozen()) return 0;

        //var table = this._rowsLockContentEl.firstChild.firstChild;
        var table = this._columnsLockEl.firstChild.firstChild;
        var width = table ? table.offsetWidth : 0;
        return width;
    },
    ////////////////////////////////////////
    _canDeferSyncScroll: function () {
        return this.isFrozen();
    },
    _syncScroll: function () {
        var scrollLeft = this._rowsViewEl.scrollLeft;
        this._filterViewEl.scrollLeft = scrollLeft;
        this._summaryViewEl.scrollLeft = scrollLeft;
        this._columnsViewEl.scrollLeft = scrollLeft;

        var me = this;
        var scrollTop = me._rowsViewEl.scrollTop;
        me._rowsLockEl.scrollTop = scrollTop;
        if (this._canDeferSyncScroll()) {

            setTimeout(function () {
                me._rowsViewEl.scrollTop = me._rowsLockEl.scrollTop;
            }, 50);
        }
    },
    //    _syncScrollOffset: function () {
    //        var scrollLeft = this._hscrollEl.scrollLeft;
    //        this._rowsViewEl.scrollLeft = scrollLeft;
    //        this._columnsViewEl.scrollLeft = this._rowsViewEl.scrollLeft;

    //        var me = this;
    //        me._rowsLockEl.scrollTop = me._rowsViewEl.scrollTop;
    //        setTimeout(function () {
    //            if (me.isFrozen()) {
    //                me._rowsViewEl.scrollTop = me._rowsLockEl.scrollTop;
    //            }
    //        }, 60);
    //    },
    //    __OnRowsViewScroll: function (e) {
    //        this._syncScrollOffset();
    //    },
    __OnMouseWheel: function (e) {        
        var scrollTop = this.getScrollTop() - e.wheelDelta;
        var top = this.getScrollTop();
        this.setScrollTop(scrollTop);
        if (top != this.getScrollTop()) {
            e.preventDefault();
        }
    }


});
mini.regClass(mini.FrozenGridView, "FrozenGridView");

