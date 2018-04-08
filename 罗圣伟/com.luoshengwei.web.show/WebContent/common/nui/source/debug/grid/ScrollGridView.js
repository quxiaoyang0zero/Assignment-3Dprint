/*
    1.动态刷新表格
*/

mini.ScrollGridView = function () {
    mini.ScrollGridView.superclass.constructor.call(this);
};
mini.extend(mini.ScrollGridView, mini.FrozenGridView, {

    virtualScroll: true,
    virtualRows: 25,

    defaultRowHeight: 23,

    ///////////////////////////
    _canDeferSyncScroll: function () {
        return this.isFrozen() && !this.isVirtualScroll();
    },
    setVirtualScroll: function (value) {
        this.virtualScroll = value;
        this.doUpdate();
    },
    getVirtualScroll: function (value) {
        return this.virtualScroll;
    },
    isFixedRowHeight: function () {
        return this.fixedRowHeight || this.isVirtualScroll() || this.isFrozen();
    },
    isVirtualScroll: function () {
        if (this.virtualScroll) {
            return this.isAutoHeight() == false && this.isGrouping() == false;
        }
        return false;
    },
    _getScrollView: function () {
        var data = this.getVisibleRows();
        return data;
    },
    _getScrollViewCount: function () {
        return this._getScrollView().length;
    },
    _getScrollRowHeight: function (index, row) {
        if (row && row._height) {
            var h = parseInt(row._height);
            if (!isNaN(h)) return h;
        }
        return this.defaultRowHeight;

        //        var data = this._getScrollView();
        //        var record = data[index];
        //        if (!record) return 0;
        //        var h = parseInt(record._height);
        //        if (isNaN(parseInt(record._height))) h = this.defaultRowHeight;
        //        return h;
    },
    _getRangeHeight: function (start, end) {
        var height = 0;
        var data = this._getScrollView();
        for (var i = start; i < end; i++) {
            var row = data[i];
            var h = this._getScrollRowHeight(i, row);
            height += h;
        }
        return height;
    },
    _getIndexByScrollTop: function (scrollTop) {
        var height = 0;
        var data = this._getScrollView();
        var count = this._getScrollViewCount();
        for (var i = 0, l = count; i < l; i++) {
            var row = data[i];
            var h = this._getScrollRowHeight(i, row);
            height += h;
            if (height >= scrollTop) return i;
        }
        return count;
    },
    __getScrollViewRange: function (start, end) {
        var data = this._getScrollView();
        return data.getRange(start, end);
    },
    _getViewRegion: function () {

        //根据virtualRows，返回严格限制的区域范围：start, end
        var data = this._getScrollView();

        if (this.isVirtualScroll() == false) {
            var region = {
                top: 0,
                bottom: 0,
                rows: data,
                start: 0,
                end: 0
            };
            return region;
        }

        var rowHeight = this.defaultRowHeight;

        var nowRegion = this._getViewNowRegion();

        var scrollTop = this.getScrollTop();
        var bodyHeight = this._vscrollEl.offsetHeight;

        var count = this._getScrollViewCount();

        var start = nowRegion.start, end = nowRegion.end;
        for (var i = 0, l = count; i < l; i += this.virtualRows) {
            var i2 = i + this.virtualRows;
            if (i <= start && start < i2) {
                start = i;
            }
            if (i < end && end <= i2) {
                end = i2;
            }
        }
        if (end > count) end = count;
        if (end == 0) end = this.virtualRows;
        //if (start > end) start = end;

        var top = this._getRangeHeight(0, start);
        var bottom = this._getRangeHeight(end, this._getScrollViewCount());
        var data = this.__getScrollViewRange(start, end); //data.getRange(start, end);

        var region = {
            top: top,
            bottom: bottom,
            rows: data,
            start: start,
            end: end,
            viewStart: start,
            viewEnd: end
            //            viewStart: nowRegion.start,
            //            viewEnd: nowRegion.end
        };
        //document.title = start + ":" + end + " (" + region.viewStart + ":" + region.viewEnd + ")";

        region.viewTop = this._getRangeHeight(0, region.viewStart);
        region.viewBottom = this._getRangeHeight(region.viewEnd, this._getScrollViewCount());

        return region;
    },
    _getViewNowRegion: function () {
        //根据当前scrllTop和bodyHeight，获取当前的start~end范围
        var rowHeight = this.defaultRowHeight;
        var scrollTop = this.getScrollTop();
        var bodyHeight = this._vscrollEl.offsetHeight;

        //@@@
        var startRow = this._getIndexByScrollTop(scrollTop); //parseInt(scrollTop / rowHeight);
        var endRow = this._getIndexByScrollTop(scrollTop + bodyHeight + 30);
        //var endRow = parseInt((scrollTop + bodyHeight) / rowHeight) + 1;

        var count = this._getScrollViewCount();
        if (endRow > count) endRow = count;

        var region = { start: startRow, end: endRow };
        return region;
    },
    _canVirtualUpdate: function () {
        if (!this._viewRegion) return true;
        var region = this._getViewNowRegion();

        if (this._viewRegion.start <= region.start && region.end <= this._viewRegion.end) return false;
        return true;
    },
    ////////////////////////////////////////////////////////////
    __OnColumnsChanged: function (e) {
        this.columns = this._columnModel.columns;
        this._doUpdateFilterRow();
        this._doUpdateSummaryRow();
        if (this.getVisibleRows().length == 0) {
            //this.doUpdateColumns();
            this.doUpdate();
        } else {
            this.deferUpdate();
        }
        if (this.isVirtualScroll()) {
            this.__OnVScroll();
        }
        this.fire("columnschanged");
    },
    doLayout: function () {
        if (this.canLayout() == false) return;
        mini.ScrollGridView.superclass.doLayout.call(this);
        this._layoutScroll();
    },
    _createRowsHTML: function (columns, viewIndex, data, top, bottom, rowIndex) {
        var isVirtualScroll = this.isVirtualScroll();
        if (!isVirtualScroll) {
            return mini.ScrollGridView.superclass._createRowsHTML.apply(this, arguments);
        }

        var region = isVirtualScroll ? this._getViewRegion() : null;

        var sb = ['<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">'];
        sb.push(this._createTopRowHTML(columns));
        if (this.isVirtualScroll()) {
            var style = top == 0 ? "display:none;" : "";
            sb.push('<tr class="mini-grid-virtualscroll-top" style="padding:0;border:0;' + style + '"><td colspan="' + columns.length + '" style="height:' + top + 'px;padding:0;border:0;' + style + '"></td></tr>');
        }
        if (viewIndex == 1 && this.isFrozen() == false) {
            //如果非锁定，且绘制锁定区域，则不创建

        } else {
            for (var j = 0, k = data.length; j < k; j++) {
                //var rowIndex = startIndex + j;            
                var record = data[j];
                //if (!record) continue;//???????????????????????
                this._createRowHTML(record, rowIndex, columns, viewIndex, sb);
                rowIndex++;
            }
        }
        if (this.isVirtualScroll()) {
            sb.push('<tr class="mini-grid-virtualscroll-bottom" style="padding:0;border:0;"><td colspan="' + columns.length + '" style="height:' + bottom + 'px;padding:0;border:0;"></td></tr>');
        }
        sb.push('</table>');
        return sb.join('');
    },
    //更优化：先显示view区域，然后在填补top和bottom部分
    doUpdateRows: function () {

        if (this.isVirtualScroll() == false) {
            mini.ScrollGridView.superclass.doUpdateRows.call(this);
            return;
        }

        var region = this._getViewRegion();
        this._viewRegion = region;  //当创建时刻的region，才是viewRegion

        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();

        var rowIndex = region.viewStart;
        var rowIndexTop = region.start;
        var rowIndexBottom = region.viewEnd;
        if (this._scrollPaging) {
            var index = this.getPageIndex() * this.getPageSize();
            rowIndex -= index;
            rowIndexTop -= index;
            rowIndexBottom -= index;
        }
        var sss = new Date();
        var lockHtml = this._createRowsHTML(columns1, 1, region.rows, region.viewTop, region.viewBottom, rowIndex);
        var html = this._createRowsHTML(columns2, 2, region.rows, region.viewTop, region.viewBottom, rowIndex);

        //if (this.getVisibleRows().length > 0) alert(new Date() - sss);

        this._rowsLockContentEl.innerHTML = lockHtml;
        this._rowsViewContentEl.innerHTML = html;

    },

    ////////////////////////////////////////////////////////////
    _create: function () {
        mini.ScrollGridView.superclass._create.call(this);
        //vscroll
        this._vscrollEl = mini.append(this._rowsEl, '<div class="mini-grid-vscroll"><div class="mini-grid-vscroll-content"></div></div>');
        this._vscrollContentEl = this._vscrollEl.firstChild;
    },
    _initEvents: function () {
        mini.ScrollGridView.superclass._initEvents.call(this);

        var me = this;
        mini.on(this._vscrollEl, "scroll", this.__OnVScroll, this);
        mini._onScrollDownUp(this._vscrollEl, function (e) {
            //document.title = 'down:' +new Date().getTime();
            me._VScrollMouseDown = true;
        }, function (e) {
            //document.title = 'up:' + new Date().getTime();
            me._VScrollMouseDown = false;
        });
    },

    _layoutScroll: function () {

        var isVirtualScroll = this.isVirtualScroll();

        if (isVirtualScroll) {

            var scrollHeight = this.getScrollHeight();

            var outHeight = scrollHeight > this._rowsViewEl.offsetHeight;

            if (isVirtualScroll && outHeight) {
                this._vscrollEl.style.display = 'block';
                this._vscrollContentEl.style.height = scrollHeight + "px";
            } else {
                this._vscrollEl.style.display = 'none';
            }

            if (this._rowsViewEl.scrollWidth > this._rowsViewEl.clientWidth + 1) {
                var h = this.getBodyHeight(true) - 18;
                if (h < 0) h = 0;
                this._vscrollEl.style.height = h + 'px';
            } else {
                this._vscrollEl.style.height = '100%';
            }

        } else {

            this._vscrollEl.style.display = "none";
        }

    },
    ////////////////////
    getScrollHeight: function () {
        var data = this.getVisibleRows();
        return this._getRangeHeight(0, data.length);
    },
    setScrollTop: function (value) {
        if (this.isVirtualScroll()) {
            this._vscrollEl.scrollTop = value;
        } else {
            this._rowsViewEl.scrollTop = value;
        }
    },
    getScrollTop: function () {
        if (this.isVirtualScroll()) {
            return this._vscrollEl.scrollTop;
        } else {
            return this._rowsViewEl.scrollTop;
        }
    },
    __OnVScroll: function (e) {

        //当滚动条滚动，禁止刷新top/bottom
        //this._stopUpdateTableView();

        var isVirtualScroll = this.isVirtualScroll();
        if (isVirtualScroll) {

            this._scrollTop = this._vscrollEl.scrollTop;

            var me = this;
            setTimeout(function () {
                me._rowsViewEl.scrollTop = me._scrollTop;
                me.__scrollTimer = null;
            }, 8);

            if (this._scrollTopTimer) {
                clearTimeout(this._scrollTopTimer);
            }
            this._scrollTopTimer = setTimeout(function () {
                me._scrollTopTimer = null;

                me._tryUpdateScroll();

                me._rowsViewEl.scrollTop = me._scrollTop;
                //document.title = new Date().getTime();
            }, 80);
        }
    },
    __OnMouseWheel: function (e) {
        var ev = e.wheelDelta ? e : e.originalEvent;
        var detail = ev.wheelDelta || -ev.detail * 24;

        var scrollTop = this.getScrollTop() - detail;

        var top = this.getScrollTop();
        this.setScrollTop(scrollTop);
        if (top != this.getScrollTop() || this.isVirtualScroll()) {
            e.preventDefault();
        }
    },
    /////////////////////////////////////////
    _tryUpdateScroll: function () {
        //设置一个布尔值，reload成功后取消
        var doUpdate = this._canVirtualUpdate();
        if (doUpdate) {
            if (this._scrollPaging) {
                var me = this;
                //this._doGetScrollPaging = true;
                this.reload(null, null, function (e) {
                    //me._doGetScrollPaging = false;
                });
            } else {

                var sss = new Date();
                this.doUpdateRows();         //30条，55ms                
                //this.deferLayout(50);

                //this.doUpdate();
                //                alert(new Date() - sss);
            }
        } else {
            //this._doUpdateTopBottom();
        }
    }



});
mini.regClass(mini.ScrollGridView, "ScrollGridView");

mini._onScrollDownUp = function (el, mousedown, mouseup) {
    function onmousedown(e) {
        if (mini.isFirefox) {
            mini.on(document, 'mouseup', onmouseup);
        } else {
            mini.on(document, 'mousemove', onmousemove);
        }
        mousedown(e);
    }
    function onmousemove(e) {
        //no ff
        mini.un(document, 'mousemove', onmousemove);
        mouseup(e);
    }
    function onmouseup(e) {
        //ff
        mini.un(document, 'mouseup', onmouseup);
        mouseup(e);
    }

    mini.on(el, 'mousedown', onmousedown);
}

