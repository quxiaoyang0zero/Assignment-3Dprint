/*
    ColumnModel 列模型
        多表头
        隐藏列
        锁定列
        分组列
    事件：columnschanged   :   add/remove/resize/move

    列模型数据：
        原始列：columns
            简单：列数组
            复杂：列属性
        列视图：_columnsRow（多行列）、_visibleColumns显示的单行列。
            隐藏列：减少列，改变_visibleColumnsRow和_visibleColumns
            锁定列：不增加、不减少列，不改变_visibleColumnsRow和_visibleColumns。
                  _frozenStartColumn和_frozenEndColumn，约定一个表格显示的左右列区域。
                  生成表头、行的时候，根据这两个参数来处理下就可以了。
            行号列：创建时自己设置列
            //分组列：在GridView层次增加虚列，与ColumnModel无关
*/
mini.ColumnModel = function (grid) {
    this.owner = grid;
    mini.ColumnModel.superclass.constructor.call(this);
    this._init();
}
mini.ColumnModel_ColumnID = 1;
mini.extend(mini.ColumnModel, mini.Component, {

    _defaultColumnWidth: 100,

    _init: function () {
        this.columns = [];                  //原始列（全）

        this._columnsRow = [];              //多表头数组(全）
        this._visibleColumnsRow = [];       //多表头数组（可视，去除隐藏列）

        this._bottomColumns = [];           //底行列数组（全）
        this._visibleColumns = [];          //可视的底行列数组（去除隐藏列）

        this._idColumns = {};
        this._nameColumns = {};
        this._fieldColumns = {};
    },
    getColumns: function () {
        return this.columns;
    },
    getAllColumns: function () {
        var columns = [];
        for (var id in this._idColumns) {
            var column = this._idColumns[id];
            columns.push(column);
        }
        return columns;
    },
    getColumnsRow: function () {
        return this._columnsRow;
    },
    getVisibleColumnsRow: function () {
        return this._visibleColumnsRow;
    },
    getBottomColumns: function () {
        return this._bottomColumns;
    },
    getVisibleColumns: function () {
        return this._visibleColumns;
    },
    _getBottomColumnsByColumn: function (column) {
        //获取某列最底层的列数组
        column = this.getColumn(column);
        var columns = this._bottomColumns;
        var cs = [];
        for (var i = 0, l = columns.length; i < l; i++) {
            var c = columns[i];
            if (this.isAncestorColumn(column, c)) cs.push(c);
        }
        return cs;
    },
    _getVisibleColumnsByColumn: function (column) {
        //获取某列最底层的可视列数组
        column = this.getColumn(column);
        var columns = this._visibleColumns;
        var cs = [];
        for (var i = 0, l = columns.length; i < l; i++) {
            var c = columns[i];
            if (this.isAncestorColumn(column, c)) cs.push(c);
        }
        return cs;
    },
    setColumns: function (columns) {
        if (!mini.isArray(columns)) columns = [];
        this._init();
        this.columns = columns;
        this._columnsChanged();
    },
    _columnsChanged: function () {
        this._updateColumnsView();
        this.fire("columnschanged");
    },
    _updateColumnsView: function () {
        //_id, _pid, _level, 
        this._maxColumnLevel = 0;
        var level = 0;
        function init(column, index, parentColumn) {
            if (column.type) {
                if (!mini.isNull(column.header) && typeof column.header !== "function") {
                    if (column.header.trim() == "") {
                        delete column.header;
                    }
                }
                var col = mini._getColumn(column.type);
                if (col) {
                    var _column = mini.copyTo({}, column);
                    mini.copyTo(column, col);
                    mini.copyTo(column, _column);
                }
            }

            //_id, _pid
            column._id = mini.ColumnModel_ColumnID++;
            column._pid = parentColumn == this ? -1 : parentColumn._id;
            this._idColumns[column._id] = column;
            if (column.name) this._nameColumns[column.name] = column;

            //level
            column._level = level;
            level += 1;
            this.eachColumns(column, init, this);
            level -= 1;
            if (column._level > this._maxColumnLevel) this._maxColumnLevel = column._level;

            //width
            var width = parseInt(column.width);
            if (mini.isNumber(width) && String(width) == column.width) column.width = width + "px";
            if (mini.isNull(column.width)) column.width = this._defaultColumnWidth + "px";

            column.visible = column.visible !== false;
            column.allowResize = column.allowResize !== false;
            column.allowMove = column.allowMove !== false;      //列移动
            column.allowSort = column.allowSort === true;       //列排序
            column.allowDrag = !!column.allowDrag;              //行移动
            column.readOnly = !!column.readOnly;
            column.autoEscape = !!column.autoEscape;
            column.enabled = column.enabled !== false;

            column.vtype = column.vtype || "";

            //editor

            //filter
            if (typeof column.filter == "string") {
                column.filter = eval('(' + column.filter + ')');
            }
            if (column.filter && !column.filter.el) {
                column.filter = mini.create(column.filter);
            }

            //init
            if (typeof column.init == "function" && column.inited != true) {
                column.init(this.owner);
            }
            column.inited = true;   //如果移除column，将inited去除，这样到新表格，才正常。一般也不会那么复杂。

            //历史问题
            column._gridUID = this.owner.uid;
            column._rowIdField = this.owner._rowIdField;
        }
        this.eachColumns(this, init, this);

        //多表头行
        this._createColumnsRow();

        //底部显示的列集合
        var index = 0;
        var view = this._visibleColumns = [];
        var bottoms = this._bottomColumns = [];
        this.cascadeColumns(this, function (column) {
            if (!column.columns || column.columns.length == 0) {
                bottoms.push(column);
                if (this.isVisibleColumn(column)) {
                    view.push(column);
                    column._index = index++;
                }
            }
        }, this);

        this._fieldColumns = {};
        var columns = this.getAllColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (column.field && !this._fieldColumns[column.field]) {
                this._fieldColumns[column.field] = column;
            }
        }

        //计算锁定colspan1、非锁定colspan2
        this._createFrozenColSpan();
    },
    //////////////////////////////////////////////////
    _frozenStartColumn: -1,
    _frozenEndColumn: -1,
    isFrozen: function () {
        return this._frozenStartColumn >= 0 && this._frozenEndColumn >= this._frozenStartColumn;
    },
    isFrozenColumn: function (column) {
        if (!this.isFrozen()) return false;
        column = this.getColumn(column);
        if (!column) return false;
        var index = this.getVisibleColumns().indexOf(column);
        return this._frozenStartColumn <= index && index <= this._frozenEndColumn;
    },
    frozen: function (startColumn, finishColumn) {
        startColumn = this.getColumn(startColumn);
        finishColumn = this.getColumn(finishColumn);

        var columns = this.getVisibleColumns();
        this._frozenStartColumn = columns.indexOf(startColumn);
        this._frozenEndColumn = columns.indexOf(finishColumn);

        if (startColumn && finishColumn) {
            this._columnsChanged();
        }
    },
    unFrozen: function () {
        this._frozenStartColumn = -1;
        this._frozenEndColumn = -1;
        this._columnsChanged();
    },
    setFrozenStartColumn: function (value) {
        this.frozen(value, this._frozenEndColumn);
    },
    setFrozenEndColumn: function (value) {
        this.frozen(this._frozenStartColumn, value);
    },
    getFrozenColumns: function () {
        var columns = [], isFrozen = this.isFrozen();
        for (var i = 0, l = this._visibleColumns.length; i < l; i++) {
            if (isFrozen && this._frozenStartColumn <= i && i <= this._frozenEndColumn) {
                columns.push(this._visibleColumns[i]);
            }
        }
        return columns;
    },
    getUnFrozenColumns: function () {
        var columns = [], isFrozen = this.isFrozen();
        for (var i = 0, l = this._visibleColumns.length; i < l; i++) {
            if ((isFrozen && i > this._frozenEndColumn) || !isFrozen) {
                columns.push(this._visibleColumns[i]);
            }
        }
        return columns;
    },
    getFrozenColumnsRow: function () {
        return this.isFrozen() ? this._columnsRow1 : [];
    },
    getUnFrozenColumnsRow: function () {
        return this.isFrozen() ? this._columnsRow2 : this.getVisibleColumnsRow();
    },
    //////////////////////////////////////////////////
    _createFrozenColSpan: function () {
        //计算锁定前的colspan0、锁定colspan1、非锁定colspan2：一共有3个区段
        //步骤：从visibleColumns遍历，向上计算父column的colspan
        var me = this;
        var visibleColumns = this.getVisibleColumns();
        var start = this._frozenStartColumn, end = this._frozenEndColumn;

        function isViewIndex(column, viewIndex) {
            var columns = me.isBottomColumn(column) ? [column] : me._getVisibleColumnsByColumn(column);
            for (var i = 0, l = columns.length; i < l; i++) {
                var c = columns[i];
                var index = visibleColumns.indexOf(c);
                if (viewIndex == 0 && index < start) return true;
                if (viewIndex == 1 && start <= index && index <= end) return true;
                if (viewIndex == 2 && index > end) return true;
            }
            return false;
        }

        function getColSpan(col, viewIndex) {
            var subColumns = mini.treeToList(col.columns, "columns");
            var colSpan = 0;
            for (var i = 0, l = subColumns.length; i < l; i++) {
                var c = subColumns[i];
                if (me.isVisibleColumn(c) == false || isViewIndex(c, viewIndex) == false) continue;
                if (!c.columns || c.columns.length == 0) {//只处理最底层的列
                    colSpan += 1;
                }
            }
            return colSpan;
        }

        var list = mini.treeToList(this.columns, "columns");
        for (var i = 0, l = list.length; i < l; i++) {
            var column = list[i];
            //if (column.header == 'Order') debugger
            delete column.colspan0;
            delete column.colspan1;
            delete column.colspan2;

            delete column.viewIndex0;
            delete column.viewIndex1;
            delete column.viewIndex2;

            if (this.isFrozen()) {
                if (column.columns && column.columns.length > 0) {
                    column.colspan1 = getColSpan(column, 1);
                    column.colspan2 = getColSpan(column, 2);
                    column.colspan0 = getColSpan(column, 0);
                } else {
                    column.colspan1 = 1;
                    column.colspan2 = 1;
                    column.colspan0 = 1;
                }
                //确定列属于什么区域
                if (isViewIndex(column, 0)) {
                    column["viewIndex" + 0] = true;
                }
                if (isViewIndex(column, 1)) {
                    column["viewIndex" + 1] = true;
                }
                if (isViewIndex(column, 2)) {
                    column["viewIndex" + 2] = true;
                }
            }
        }

        //创建锁定列、非锁定列的列行数组
        var maxLevel = this._getMaxColumnLevel();
        this._columnsRow1 = [];
        this._columnsRow2 = [];
        for (var i = 0, l = this._visibleColumnsRow.length; i < l; i++) {
            var columns = this._visibleColumnsRow[i];
            var columns1 = [];
            var columns2 = [];
            this._columnsRow1.push(columns1);
            this._columnsRow2.push(columns2);

            for (var j = 0, k = columns.length; j < k; j++) {
                var c = columns[j];
                if (c.viewIndex1) columns1.push(c);
                if (c.viewIndex2) columns2.push(c);
            }
        }
    },
    _createColumnsRow: function () {
        //创建列行数组：可视的。
        var maxLevel = this._getMaxColumnLevel();

        var columnsRow = [];
        var visibleColumnsRow = [];
        for (var i = 0, l = maxLevel; i <= l; i++) {
            columnsRow.push([]);
            visibleColumnsRow.push([]);
        }

        var me = this;
        function getColSpan(col) {
            var subColumns = mini.treeToList(col.columns, "columns");
            var colSpan = 0;
            for (var i = 0, l = subColumns.length; i < l; i++) {
                var c = subColumns[i];
                if (me.isVisibleColumn(c) == false) continue;
                if (!c.columns || c.columns.length == 0) {
                    colSpan += 1;
                }
            }
            return colSpan;
        }

        var list = mini.treeToList(this.columns, "columns");

        for (var i = 0, l = list.length; i < l; i++) {
            var column = list[i];
            var cols = columnsRow[column._level];
            var vcols = visibleColumnsRow[column._level];

            delete column.rowspan;
            delete column.colspan;

            if (column.columns && column.columns.length > 0) {
                column.colspan = getColSpan(column);
            }
            if ((!column.columns || column.columns.length == 0) && column._level < maxLevel) {
                column.rowspan = maxLevel - column._level + 1;
            }
            //if (column.header == '工作信息') debugger
            cols.push(column);
            if (this.isVisibleColumn(column)) {
                vcols.push(column);
            }
        }
        //debugger
        this._columnsRow = columnsRow;
        this._visibleColumnsRow = visibleColumnsRow;
    },
    _getMaxColumnLevel: function () {
        return this._maxColumnLevel;
    },
    cascadeColumns: function (node, fn, scope) {
        if (!fn) return;
        var nodes = node.columns;
        if (nodes) {
            nodes = nodes.clone();
            for (var i = 0, l = nodes.length; i < l; i++) {
                var c = nodes[i];
                if (fn.call(scope || this, c, i, node) === false) return;
                this.cascadeColumns(c, fn, scope);
            }
        }
    },
    eachColumns: function (column, fn, scope) {
        var columns = column.columns;
        if (columns) {
            var list = columns.clone();
            for (var i = 0, l = list.length; i < l; i++) {
                var o = list[i];
                if (fn.call(scope, o, i, column) === false) break;
            }
        }
    },
    getColumn: function (index) {
        var t = typeof index;
        if (t == "number") return this._bottomColumns[index];
        else if (t == "object") return index;
        else {
            return this._nameColumns[index];
        }
    },
    getColumnByField: function (field) {
        if (!field) return null;
        return this._fieldColumns[field];
    },
    _getColumnById: function (id) {
        return this._idColumns[id];
    },
    _getDataTypeByField: function (field) {
        var sortType = "string";
        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (column.field == field) {
                if (column.dataType) sortType = column.dataType.toLowerCase();
                break;
            }
        }
        return sortType;
    },
    getParentColumn: function (column) {
        column = this.getColumn(column);
        var pid = column._pid;
        if (pid == -1) return this;
        return this._idColumns[pid];
    },
    getAncestorColumns: function (node) {
        var as = [node];
        while (1) {
            var parentNode = this.getParentColumn(node);
            if (!parentNode || parentNode == this) break;
            as[as.length] = parentNode;
            node = parentNode;
        }
        as.reverse();
        return as;
    },
    isAncestorColumn: function (parentNode, node) {
        if (parentNode == node) return true;
        if (!parentNode || !node) return false;
        var as = this.getAncestorColumns(node);
        for (var i = 0, l = as.length; i < l; i++) {
            if (as[i] == parentNode) return true;
        }
        return false;
    },
    isVisibleColumn: function (column) {
        column = this.getColumn(column);
        if (column.visible == false) return false;

        var columns = this.getAncestorColumns(column);
        for (var i = 0, l = columns.length; i < l; i++) {
            if (columns[i].visible == false) return false;
        }

        var nodes = column.columns;
        if (nodes) {
            var allHide = true;
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (this.isVisibleColumn(node)) {
                    allHide = false;
                    break;
                }
            }
            if (allHide) return false;
        }

        return true;
    },
    isBottomColumn: function (column) {
        column = this.getColumn(column);
        return !(column.columns && column.columns.length > 0);
    },
    ////////////////////////////////
    updateColumn: function (column, options) {
        column = this.getColumn(column);
        if (!column) return;
        mini.copyTo(column, options);
        this._columnsChanged();
    },
    moveColumn: function (column, targetColumn, action) {
        column = this.getColumn(column);
        targetColumn = this.getColumn(targetColumn);
        if (!column || !targetColumn || !action || column == targetColumn) return;

        if (this.isAncestorColumn(column, targetColumn)
            ) {
            return;
        }

        //先删除column
        var pcolumn = this.getParentColumn(column);
        if (pcolumn) {
            pcolumn.columns.remove(column);
        }

        //后加入到新位置
        var parentColumn = targetColumn;
        var index = action;
        if (index == 'before') {
            parentColumn = this.getParentColumn(targetColumn);
            index = parentColumn.columns.indexOf(targetColumn);
        } else if (index == 'after') {
            parentColumn = this.getParentColumn(targetColumn);
            index = parentColumn.columns.indexOf(targetColumn) + 1;
        } else if (index == 'add' || index == "append") {
            if (!parentColumn.columns) parentColumn.columns = [];
            index = parentColumn.columns.length;
        } else if (!mini.isNumber(index)) {
            return;
        }

        parentColumn.columns.insert(index, column);

        this._columnsChanged();
    },
    addColumn: function () {
        this._columnsChanged();
    },
    removeColumn: function () {
        this._columnsChanged();
    }
});