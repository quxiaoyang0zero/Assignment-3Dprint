

//Selection
mini._Grid_Select = function (grid) {
    this.owner = grid, el = grid.el;
    //row hover        
    grid.on("rowmousemove", this.__OnRowMouseMove, this);
    mini.on(grid._viewportEl, "mouseout", this.__OnMouseOut, this);
    mini.on(grid._viewportEl, "mousewheel", this.__OnMouseWheel, this);
    //cell select/ cell edit
    grid.on("cellmousedown", this.__OnCellMouseDown, this);
    grid.on("cellclick", this.__OnGridCellClick, this);
    grid.on("celldblclick", this.__OnGridCellClick, this);

    mini.on(grid.el, "keydown", this.__OnGridKeyDown, this);
}
mini._Grid_Select.prototype = {
    __OnGridKeyDown: function (e) {

        var grid = this.owner;
        if (mini.isAncestor(grid._filterEl, e.target)
            || mini.isAncestor(grid._summaryEl, e.target)
            || mini.isAncestor(grid._toolbarEl, e.target)
            || mini.isAncestor(grid._footerEl, e.target)
            || mini.findParent(e.target, 'mini-grid-detailRow')
            || mini.findParent(e.target, 'mini-grid-rowEdit')
            || mini.findParent(e.target, 'mini-tree-editinput')
            ) {
            return;
        }

        var currentCell = grid.getCurrentCell();

        if (e.shiftKey || e.ctrlKey || e.altKey) {
            return;
        }

        if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
            e.preventDefault();
        }
        var columns = grid.getVisibleColumns();

        var column = currentCell ? currentCell[1] : null,
            record = currentCell ? currentCell[0] : null;
        if (!currentCell) record = grid.getCurrent();
        var columnIndex = columns.indexOf(column);
        var rowIndex = grid.indexOf(record);
        var count = grid.getVisibleRows().length;

        switch (e.keyCode) {
            case 9:     //tab
                if (grid.allowCellEdit && grid.editOnTabKey) {
                    e.preventDefault();
                    grid._beginEditNextCell(e.shiftKey == false);
                    return;
                }
                //                if (column) {
                //                    if (columnIndex > 0) {
                //                        columnIndex += 1;
                //                    }
                //                } else {
                //                    columnIndex = 0;
                //                }
                //                e.preventDefault();
                break;
            case 27:        //esc

                break;
            case 13:     //enter
                if (grid.allowCellEdit && grid.editNextOnEnterKey) {
                    if (grid.isEditingCell(currentCell) || !column.editor) {
                        grid._beginEditNextCell(e.shiftKey == false);
                        return;
                    }
                }
                if (grid.allowCellEdit && currentCell && !column.readOnly) {
                    grid.beginEditCell();
                }
                break;
            case 37:    //left
                if (column) {
                    if (columnIndex > 0) {
                        columnIndex -= 1;
                    }
                } else {
                    columnIndex = 0;
                }
                break;
            case 38:    //top      
                if (record) {
                    if (rowIndex > 0) rowIndex -= 1;
                } else {
                    rowIndex = 0;
                }
                if (rowIndex != 0 && grid.isVirtualScroll()) {
                    if (grid._viewRegion.start > rowIndex) {
                        grid._bodyEl.scrollTop -= grid._rowHeight;
                        grid._tryUpdateScroll();
                    }
                }
                break;
            case 39:    //right
                if (column) {
                    if (columnIndex < columns.length - 1) {
                        columnIndex += 1;
                    }
                } else {
                    columnIndex = 0;
                }
                break;
            case 40:    //bottom                   
                if (record) {
                    if (rowIndex < count - 1) rowIndex += 1;
                } else {
                    rowIndex = 0;
                }
                if (grid.isVirtualScroll()) {
                    if (grid._viewRegion.end < rowIndex) {
                        grid._bodyEl.scrollTop += grid._rowHeight;
                        grid._tryUpdateScroll();
                    }
                }
                break;
            default:
                break;
        }

        column = columns[columnIndex];
        
        record = grid.getAt(rowIndex);
        //current cell
        if (column && record && grid.allowCellSelect) {
            var currentCell = [record, column];
            grid.setCurrentCell(currentCell);
            grid.scrollIntoView(record, column);
        }
        //current row
        if (record && grid.allowRowSelect) {
            grid.deselectAll();
            grid.setCurrent(record);
            if (record) {
                grid.scrollIntoView(record);
            }
        }
    },
    __OnMouseWheel: function (e) {
        var grid = this.owner;
        if (grid.allowCellEdit) {
            grid.commitEdit();
        }
    },
    __OnGridCellClick: function (e) {
        var grid = this.owner;
        if (grid.allowCellEdit == false) return;
        if (grid.cellEditAction != e.type) return;

        var record = e.record, column = e.column;
        if (!column.readOnly && !grid.isReadOnly()) {
            if (e.htmlEvent.shiftKey || e.htmlEvent.ctrlKey) {
            } else {
                grid.beginEditCell();
            }
        }
    },
    __OnCellMouseDown: function (e) {

        var me = this;
        setTimeout(function () {    //必须延迟1秒
        me.__doSelect(e);
        }, 1);
    },
    __OnRowMouseMove: function (e) {
        var grid = this.owner;
        var record = e.record;

        if (!grid.enabled || grid.enableHotTrack == false) return;

        grid.focusRow(record);
    },
    __OnMouseOut: function (e) {
        this.owner.focusRow(null);
    },
    __doSelect: function (e) {
        var record = e.record, column = e.column;
        var grid = this.owner;
        if (record.enabled === false) return;

        //cell select
        if (grid.allowCellSelect) {
            var cell = [record, column];
            grid.setCurrentCell(cell);
        }

        //row select 

        if (grid.allowRowSelect) {
            var ex = { record: record, selected: record, cancel: false };
            if (record) {
                grid.fire("beforerowselect", ex);
            }
            if (ex.cancel) return;
            if (grid.getMultiSelect()) {
                grid.el.onselectstart = function () { };

                if (e.htmlEvent.shiftKey) {
                    grid.el.onselectstart = function () { return false };
                    e.htmlEvent.preventDefault();

                    var current = grid.getCurrent();
                    if (current) {
                        grid.deselectAll();
                        grid.selectRange(current, record);
                        grid.setCurrent(current);
                    } else {
                        grid.select(record);
                        grid.setCurrent(record);
                    }

                } else {
                    grid.el.onselectstart = function () { };
                    if (e.htmlEvent.ctrlKey) {
                        grid.el.onselectstart = function () { return false };
                        e.htmlEvent.preventDefault();
                    }

                    if (e.column._multiRowSelect === true || e.htmlEvent.ctrlKey || grid.allowUnselect) {
                        if (grid.isSelected(record)) {
                            grid.deselect(record);
                        } else {
                            grid.select(record);
                            grid.setCurrent(record);
                        }
                    } else {
                        if (grid.isSelected(record)) {
                            //                            grid.deselectAll();
                            //                            grid.select(record);
                        } else {
                            grid.deselectAll();
                            grid.select(record);
                            grid.setCurrent(record);
                        }
                    }
                }
            } else {
                //alert(grid.isSelected(record));

                if (!grid.isSelected(record)) {
                    grid.deselectAll();
                    grid.select(record);
                } else {
                    if (e.htmlEvent.ctrlKey || grid.allowUnselect) {
                        grid.deselectAll();
                    }
                }
            }
        }
    }
};


/* RowGroup
-----------------------------------------------------------------------------*/

mini._Grid_RowGroup = function (grid) {
    this.owner = grid, el = grid.el;    
    mini.on(grid._bodyEl, "click", this.__OnClick, this);
}
mini._Grid_RowGroup.prototype = {
    __OnClick: function (e) {
        var grid = this.owner;
        var group = grid._getRowGroupByEvent(e);
        if (group) {
            grid.toggleRowGroup(group);
        }
    }
};


/* ColumnsMenu
-----------------------------------------------------------------------------*/
mini._Grid_ColumnsMenu = function (grid) {
    this.owner = grid;
    this.menu = this.createMenu();
    mini.on(grid.el, "contextmenu", this.__OnContextMenu, this);
}
mini._Grid_ColumnsMenu.prototype = {
    createMenu: function () {
        var menu = mini.create({ type: "menu", hideOnClick: false });
        menu.on("itemclick", this.__OnItemClick, this);
        return menu;
    },
    updateMenu: function () {
        var grid = this.owner, menu = this.menu;
        var columns = grid.getBottomColumns();
        var items = [];
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var item = {};
            item.checked = column.visible;
            item.checkOnClick = true;
            item.text = grid._createHeaderText(column);
            if (item.text == "&nbsp;") {
                if (column.type == "indexcolumn") item.text = "序号";
                if (column.type == "checkcolumn") item.text = "选择";
            }
            items.push(item);
            //enabled
            item.enabled = column.enabled;

            item._column = column;
        }
        menu.setItems(items);
    },
    __OnContextMenu: function (e) {
        var grid = this.owner;
        if (grid.showColumnsMenu == false) return;
        if (mini.isAncestor(grid._columnsEl, e.target) == false) return;
        this.updateMenu();
        this.menu.showAtPos(e.pageX, e.pageY);
        return false;
    },
    __OnItemClick: function (e) {
        var grid = this.owner, menu = this.menu;
        var columns = grid.getBottomColumns();
        var items = menu.getItems();
        var item = e.item, column = item._column;

        var checkedCount = 0;
        for (var i = 0, l = items.length; i < l; i++) {
            var it = items[i];
            if (it.getChecked()) checkedCount++;
        }
        if (checkedCount < 1) {
            item.setChecked(true);
        }

        var checked = item.getChecked();
        if (checked) grid.showColumn(column);
        else grid.hideColumn(column);
    }
}


/* _CellToolTip
-----------------------------------------------------------------------------*/

mini._Grid_CellToolTip = function (grid) {
    this.owner = grid;
    mini.on(this.owner._bodyEl, "mousemove", this.__OnGridMouseMove, this);
};
mini._Grid_CellToolTip.prototype = {
    __OnGridMouseMove: function (e) {
        var grid = this.owner;
        var cell = grid._getCellByEvent(e);

        var cellEl = grid._getCellEl(cell[0], cell[1]);
        //if (cell.record && cell.column && cell.column.vtype) debugger

        var error = grid.getCellError(cell[0], cell[1]);
        if (cellEl) {
            if (error) {
                setTimeout(function () {
                    cellEl.title = error.errorText;
                }, 10);
                return;
            }
            if (cellEl.firstChild) {
                if (mini.hasClass(cellEl.firstChild, "mini-grid-cell-inner")) {
                    cellEl = cellEl.firstChild;
                }
            }
            if (cellEl.scrollWidth > cellEl.clientWidth) {

                var s = cellEl.innerText || cellEl.textContent || "";
                cellEl.title = s.trim();
            } else {
                cellEl.title = "";
            }
        }
    }
};


/* Sorter
-----------------------------------------------------------------------------*/

mini._Grid_Sorter = function (grid) {

    this.owner = grid;
    this.owner.on("headercellclick", this.__OnGridHeaderCellClick, this);
    //this.owner.on("headercellmousedown", this.__OnGridHeaderCellMouseDown, this);

    mini.on(grid._headerEl, "mousemove", this.__OnGridHeaderMouseMove, this);
    mini.on(grid._headerEl, "mouseout", this.__OnGridHeaderMouseOut, this);
};
mini._Grid_Sorter.prototype = {
    __OnGridHeaderMouseOut: function (e) {
        if (this._focusedColumnEl) {
            mini.removeClass(this._focusedColumnEl, "mini-grid-headerCell-hover");
        }
    },
    __OnGridHeaderMouseMove: function (e) {
        var t = mini.findParent(e.target, "mini-grid-headerCell");
        if (t) {
            mini.addClass(t, "mini-grid-headerCell-hover");
            this._focusedColumnEl = t;
        }
    },
    __OnGridHeaderCellClick: function (e) {
        var grid = this.owner;
        if (!mini.hasClass(e.htmlEvent.target, "mini-grid-column-splitter")) {
            if (grid.allowSortColumn && grid.isEditing() == false) {
            
                var column = e.column;
                if (!column.columns || column.columns.length == 0) {
                    if (column.field && column.allowSort !== false) {
                        var sortOrder = "asc";
                        if (grid.getSortField() == column.field) {
                            sortOrder = grid.getSortOrder() == "asc" ? "desc" : "asc";
                        }
                        grid.sortBy(column.field, sortOrder);
                    }
                }
            }
        }
    }
};


/* _ColumnMove
-----------------------------------------------------------------------------*/

mini._Grid_ColumnMove = function (grid) {
    this.owner = grid;
    mini.on(this.owner.el, "mousedown", this.__onGridMouseDown, this);
};
mini._Grid_ColumnMove.prototype = {
    __onGridMouseDown: function (e) {

        var grid = this.owner;
        
        if (grid.isEditing()) return;
        if (mini.hasClass(e.target, "mini-grid-column-splitter")) return;

        if (e.button == mini.MouseButton.Right) return;
        var t = mini.findParent(e.target, grid._headerCellCls);
        if (t) {
            this._remove();
            var column = grid._getColumnByEvent(e);
            if (grid.allowMoveColumn && column && column.allowMove) {
                this.dragColumn = column;
                this._columnEl = t;
                this.getDrag().start(e);
            }
        }
    },
    getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: false,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        function createHeaderCell(column) {
            var header = column.header;
            if (typeof header == "function") header = header.call(grid, column);
            if (mini.isNull(header) || header === "") header = "&nbsp;";
            return header;
        }

        var grid = this.owner;
        this._dragProxy = mini.append(document.body, '<div class="mini-grid-columnproxy"></div>');
        this._dragProxy.innerHTML = '<div class="mini-grid-columnproxy-inner" style="height:26px;">' + createHeaderCell(this.dragColumn) + '</div>';
        mini.setXY(this._dragProxy, drag.now[0] + 15, drag.now[1] + 18);
        mini.addClass(this._dragProxy, "mini-grid-no");

        this.moveTop = mini.append(document.body, '<div class="mini-grid-movetop"></div>');
        this.moveBottom = mini.append(document.body, '<div class="mini-grid-movebottom"></div>');
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var x = drag.now[0];

        mini.setXY(this._dragProxy, x + 15, drag.now[1] + 18);

        this.targetColumn = this.insertAction = null;
        var t = mini.findParent(drag.event.target, grid._headerCellCls);
        if (t) {
            var column = grid._getColumnByEvent(drag.event);
            if (column && column != this.dragColumn) {
                var p1 = grid.getParentColumn(this.dragColumn);
                var p2 = grid.getParentColumn(column);
                if (p1 == p2) {

                    this.targetColumn = column;
                    this.insertAction = "before";
                    var columnBox = grid.getColumnBox(this.targetColumn);

                    if (x > columnBox.x + columnBox.width / 2) {

                        this.insertAction = "after";
                    }
                }
            }
        }

        if (this.targetColumn) {

            mini.addClass(this._dragProxy, "mini-grid-ok");
            mini.removeClass(this._dragProxy, "mini-grid-no");

            var box = grid.getColumnBox(this.targetColumn);

            this.moveTop.style.display = 'block';
            this.moveBottom.style.display = 'block';
            if (this.insertAction == "before") {

                mini.setXY(this.moveTop, box.x - 4, box.y - 9);
                mini.setXY(this.moveBottom, box.x - 4, box.bottom);
            } else {

                mini.setXY(this.moveTop, box.right - 4, box.y - 9);
                mini.setXY(this.moveBottom, box.right - 4, box.bottom);
            }
        } else {
            mini.removeClass(this._dragProxy, "mini-grid-ok");
            mini.addClass(this._dragProxy, "mini-grid-no");

            this.moveTop.style.display = 'none';
            this.moveBottom.style.display = 'none';
        }
    },
    _remove: function () {
        var grid = this.owner;
        mini.removeNode(this._dragProxy);
        mini.removeNode(this.moveTop);
        mini.removeNode(this.moveBottom);
        this._dragProxy = this.moveTop = this.moveBottom = this.dragColumn = this.targetColumn = null;
    },
    _OnDragStop: function (drag) {
        var grid = this.owner;
        
        grid.moveColumn(this.dragColumn, this.targetColumn, this.insertAction);
        this._remove();
    }
};



/* _ColumnSplitter
-----------------------------------------------------------------------------*/

mini._Grid_ColumnSplitter = function (grid) {    
    this.owner = grid;
    mini.on(grid.el, "mousedown", this.__OnMouseDown, this);
};
mini._Grid_ColumnSplitter.prototype = {
    __OnMouseDown: function (e) {
        var grid = this.owner;
        var t = e.target;
        
        if (mini.hasClass(t, "mini-grid-column-splitter")) {
            var column = grid._getColumnById(t.id);
            if (grid.isEditing()) return;
            if (grid.allowResizeColumn && column && column.allowResize) {
                this.splitterColumn = column;
                this.getDrag().start(e);
            }
        }
    },
    getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        var grid = this.owner;
        var columnBox = grid.getColumnBox(this.splitterColumn);

        this.columnBox = columnBox;
        this._dragProxy = mini.append(document.body, '<div class="mini-grid-proxy"></div>');
        var box = grid.getGridViewBox();
        box.x = columnBox.x;
        box.width = columnBox.width;
        box.right = columnBox.right;
        mini.setBox(this._dragProxy, box);
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var box = mini.copyTo({}, this.columnBox);
        var width = box.width + (drag.now[0] - drag.init[0]);
        if (width < grid.columnMinWidth) width = grid.columnMinWidth;
        if (width > grid.columnMaxWidth) width = grid.columnMaxWidth;

        mini.setWidth(this._dragProxy, width);
    },
    _OnDragStop: function (drag) {
        var grid = this.owner;
        var box = mini.getBox(this._dragProxy);
        var sf = this;
        var allowSort = grid.allowSortColumn;
        grid.allowSortColumn = false;
        setTimeout(function () {
            jQuery(sf._dragProxy).remove();
            sf._dragProxy = null;
            grid.allowSortColumn = allowSort;
        }, 10);

        var column = this.splitterColumn;

        var columnWidth = parseInt(column.width);
        if (columnWidth + "%" != column.width) {
            var width = grid.getColumnWidth(column);
            var w = parseInt(columnWidth / width * box.width);

            grid.setColumnWidth(column, w);
        }
    }
};


/* DragDrop
-----------------------------------------------------------------------------*/

/*
控制行/节点的拖拽拖放行为    
Grid 行拖拽事件:
    RowDragStart可以控制是否可拖拽此行
    RowDragDrop 可以控制是否执行默认的投放操作(移动)
    从而改成自己的投放行为(调用Project.MoveTask方法)    
*/
mini._Grid_DragDrop = function (grid) {
    this.owner = grid;
    this.owner.on('CellMouseDown', this.__OnGridCellMouseDown, this);
}
mini._Grid_DragDrop.prototype = {
    __OnGridCellMouseDown: function (e) {

        if (e.htmlEvent.button == mini.MouseButton.Right) return;
        var grid = this.owner;
        if (grid._dragging) return;

        this.dropObj = grid;

        if (mini.findParent(e.htmlEvent.target, 'mini-tree-editinput')) return;

        if (grid.isReadOnly() || grid.isAllowDrag(e.record, e.column) == false) return;
        //alert(grid._getDragData().length);
        var ex = grid._OnDragStart(e.record, e.column);
        if (ex.cancel) return;
        this.dragText = ex.dragText;

        var record = e.record;

        this.isTree = !!grid.isTree;

        this.beginRecord = record;
        //alert(grid._getDragData().length);
        var drag = this._getDrag();
        drag.start(e.htmlEvent);
    },
    _OnDragStart: function (drag) {
        var grid = this.owner;
        grid._dragging = true;

        var record = this.beginRecord;
        this.dragData = grid._getDragData();

        if (this.dragData.indexOf(record) == -1) {
            this.dragData.push(record);
        }
        //grid.select(record);

        this.feedbackEl = mini.append(document.body, '<div class="mini-feedback"></div>');
        this.feedbackEl.innerHTML = this.dragText;
        this.lastFeedbackClass = "";

        this.enableHotTrack = grid.getEnableHotTrack();
        grid.setEnableHotTrack(false);
    },
    _getDropTargetObj: function (event) {
        var dom = mini.findParent(event.target, "mini-grid", 500);
        if (dom) {
            return mini.get(dom);
        }
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var dropObj = this._getDropTargetObj(drag.event);
        this.dropObj = dropObj;

        var x = drag.now[0], y = drag.now[1];
        mini.setXY(this.feedbackEl, x + 15, y + 18);

        if (dropObj && dropObj.allowDrop) {
            this.isTree = dropObj.isTree;

            var targetRecord = dropObj._getRecordByEvent(drag.event);
            this.dropRecord = targetRecord;

            if (targetRecord) {
                if (this.isTree) {
                    this.dragAction = this.getFeedback(targetRecord, y, 3);
                } else {
                    this.dragAction = this.getFeedback(targetRecord, y, 2);
                }
            } else {
                this.dragAction = "no";
            }

        } else {
            this.dragAction = "no";
        }

        //empty
        if (dropObj && dropObj.allowDrop && !targetRecord && dropObj.getData().length == 0) {
            this.dragAction = "add";
        }

        this.lastFeedbackClass = "mini-feedback-" + this.dragAction;
        this.feedbackEl.className = "mini-feedback " + this.lastFeedbackClass;
        if (this.dragAction == "no") targetRecord = null;
        this.setRowFeedback(targetRecord, this.dragAction);
    },
    _OnDragStop: function (drag) {

        var grid = this.owner;
        var dropObj = this.dropObj;

        grid._dragging = false;
        mini.removeNode(this.feedbackEl);


        grid.setEnableHotTrack(this.enableHotTrack);

        this.feedbackEl = null;
        this.setRowFeedback(null);

        //如果是树形数据源, 只能选择一个父节点, 子节点去除掉
        if (this.isTree) {
            var dragRecords = [];
            for (var i = 0, l = this.dragData.length; i < l; i++) {
                var dragRecord = this.dragData[i];
                var hasParent = false;
                for (var j = 0, k = this.dragData.length; j < k; j++) {
                    var dr = this.dragData[j];
                    if (dr != dragRecord) {
                        hasParent = grid.isAncestor(dr, dragRecord);
                        if (hasParent) break;
                    }
                }

                if (!hasParent) {
                    dragRecords.push(dragRecord);
                }
            }
            this.dragData = dragRecords;
        }

        if (this.dragAction == 'add' && !this.dropRecord) {
            this.dropRecord = dropObj.getRootNode();
        }

        if (this.dropRecord && dropObj && this.dragAction != "no") {
            var e = grid._OnDragDrop(this.dragData, this.dropRecord, this.dragAction);
            if (!e.cancel) {
                var dragRecords = e.dragNodes, targetRecord = e.targetNode, action = e.action;



                if (dropObj.isTree) {
                    if (grid == dropObj) {
                        dropObj.moveNodes(dragRecords, targetRecord, action);
                    } else {
                        grid.removeNodes(dragRecords);
                        dropObj.addNodes(dragRecords, targetRecord, action);
                    }

                } else {
                    var index = dropObj.indexOf(targetRecord);
                    if (action == "after") index += 1;
                    dropObj.moveRow(dragRecords, index);
                }

                var e = {
                    dragNode: e.dragNodes[0],
                    dropNode: e.targetNode,
                    dragAction: e.action,

                    dragNodes: e.dragNodes,
                    targetNode: e.targetNode
                };
                dropObj.fire("drop", e);
            }

        }

        this.dropRecord = null;
        this.dragData = null;
    },
    setRowFeedback: function (record, feedback) {
        //        if (this.lastRowFeedback != -1) {
        //            
        //        }
        var grid = this.owner;
        var dropObj = this.dropObj;

        if (this.lastAddDomRow && dropObj) {
            dropObj.removeRowCls(this.lastAddDomRow, "mini-tree-feedback-add");
        }
        if (record == null || this.dragAction == "add") {
            mini.removeNode(this.feedbackLine);
            this.feedbackLine = null;
        }

        this.lastRowFeedback = record;

        if (record != null) {
            if (feedback == "before" || feedback == "after") {
                if (!this.feedbackLine) {
                    this.feedbackLine = mini.append(document.body, "<div class='mini-feedback-line'></div>");
                }
                this.feedbackLine.style.display = "block";
                var rowBox = dropObj.getRowBox(record);
                var x = rowBox.x, y = rowBox.y - 1;
                if (feedback == "after") {
                    y += rowBox.height;
                }
                mini.setXY(this.feedbackLine, x, y);

                var box = dropObj.getBox(true);
                mini.setWidth(this.feedbackLine, box.width);
            } else {
                dropObj.addRowCls(record, "mini-tree-feedback-add");
                this.lastAddDomRow = record;

                //mini.repaint(grid.el);
            }
        }
    },
    getFeedback: function (dropRecord, y, way) {
        //way : 2, 3
        var grid = this.owner;

        var dropObj = this.dropObj;

        var rowBox = dropObj.getRowBox(dropRecord);
        //var rowPoint = grid.PointToViewport({ X: rowBounds.Left, Y: rowBounds.Top });

        var h = rowBox.height;
        var t = y - rowBox.y;

        var effect = null;

        //如果dropRecord属于dragData之一, 则"no"
        if (this.dragData.indexOf(dropRecord) != -1) return "no";
        var IsLeaf = false;
        if (way == 3) {
            IsLeaf = dropObj.isLeaf(dropRecord);

            //遍历DragRecords, dropRecord不能是其子节点
            for (var i = 0, l = this.dragData.length; i < l; i++) {
                var dragRecord = this.dragData[i];

                var isAncestor = dropObj.isAncestor(dragRecord, dropRecord);
                if (isAncestor) {
                    effect = "no";
                    break;
                }
            }
        }
        if (effect == null) {
            if (way == 2) {
                if (t > h / 2) effect = "after";
                else effect = "before";
            } else {
                if (IsLeaf && dropObj.allowLeafDropIn === false) {
                    if (t > h / 2) effect = "after";
                    else effect = "before";
                } else {
                    if (t > (h / 3) * 2) effect = "after";
                    else if (h / 3 <= t && t <= (h / 3 * 2)) effect = "add";
                    else effect = "before";
                }
            }
        }
        var e = dropObj._OnGiveFeedback(effect, this.dragData, dropRecord, grid);
        return e.effect;
    },
    _getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                //capture: false,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    }
};


//Events
mini._Grid_Events = function (grid) {
    this.owner = grid, el = grid.el;
    
    mini.on(el, 'click', this.__OnClick, this);
    mini.on(el, 'dblclick', this.__OnDblClick, this);

    mini.on(el, 'mousedown', this.__OnMouseDown, this);
    mini.on(el, 'mouseup', this.__OnMouseUp, this);
    mini.on(el, 'mousemove', this.__OnMouseMove, this);
    mini.on(el, 'mouseover', this.__OnMouseOver, this);
    mini.on(el, 'mouseout', this.__OnMouseOut, this);

    mini.on(el, 'keydown', this.__OnKeyDown, this);
    mini.on(el, 'keyup', this.__OnKeyUp, this);

    mini.on(el, 'contextmenu', this.__OnContextMenu, this);
}
mini._Grid_Events.prototype = {
    __OnClick: function (e) {
        this._fireEvent(e, 'Click');
    },
    __OnDblClick: function (e) {
        this._fireEvent(e, 'Dblclick');
    },
    __OnMouseDown: function (e) {
        if (mini.findParent(e.target, 'mini-tree-editinput')) return;
        this._fireEvent(e, 'MouseDown');

        var grid = this.owner;
        setTimeout(function () {
            grid._tryFocus(e);
        }, 30);
    },
    __OnMouseUp: function (e) {
        if (mini.findParent(e.target, 'mini-tree-editinput')) return;
        if (mini.isAncestor(this.el, e.target)) {

            this.owner._tryFocus(e);
            this._fireEvent(e, 'MouseUp');
        }
    },
    __OnMouseMove: function (e) {
        this._fireEvent(e, 'MouseMove');
    },
    __OnMouseOver: function (e) {
        this._fireEvent(e, 'MouseOver');
    },
    __OnMouseOut: function (e) {
        this._fireEvent(e, 'MouseOut');
    },
    __OnKeyDown: function (e) {
        this._fireEvent(e, 'KeyDown');
    },
    __OnKeyUp: function (e) {
        this._fireEvent(e, 'KeyUp');
    },
    __OnContextMenu: function (e) {
        this._fireEvent(e, 'ContextMenu');
    },
    _fireEvent: function (e, name) {
        //if(name == "Click") debugger
        //if (!this.enabled) return;


        var grid = this.owner;

        var cell = grid._getCellByEvent(e);
        var record = cell[0], column = cell[1];
        if (record) {
            var eve = {
                record: record,
                row: record,
                htmlEvent: e
            };

            var fn = grid['_OnRow' + name];
            if (fn) {
                fn.call(grid, eve);
            } else {
                grid.fire("row" + name, eve);
            }
        }
        if (column) {
            var eve = {
                column: column,
                field: column.field,
                htmlEvent: e
            };

            var fn = grid['_OnColumn' + name];
            if (fn) {
                fn.call(grid, eve);
            } else {
                grid.fire("column" + name, eve);
            }
        }

        if (record && column) {
            var eve = {
                sender: grid,
                record: record,
                row: record,
                column: column,
                field: column.field,
                htmlEvent: e
            };

            var fn = grid['_OnCell' + name];
            if (fn) {
                fn.call(grid, eve);
            } else {
                //if(name == "Click") debugger
                grid.fire("cell" + name, eve);
            }

            if (column["onCell" + name]) {
                column["onCell" + name].call(column, eve);
            }

        }
        if (!record && column && mini.findParent(e.target, 'mini-grid-headerCell')) {
            var eve = {
                column: column,
                htmlEvent: e
            };
            var fn = grid['_OnHeaderCell' + name];
            if (fn) {
                fn.call(grid, eve);
            } else {

                var evName = "onheadercell" + name.toLowerCase();
                if (column[evName]) {
                    eve.sender = grid;
                    column[evName](eve);
                }

                grid.fire("headercell" + name, eve);
            }
        }
    }
}