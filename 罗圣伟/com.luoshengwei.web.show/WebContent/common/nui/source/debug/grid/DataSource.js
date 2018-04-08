/*

1.getSource()           原始数据。数据结构：数组、树形。
2.getList()             原始数据。数据结构：数组。（树形转为数组）
3.getDataView()         数据视图。客户端排序、过滤后。数据结构：数组。
4.getVisibleRows()      可视数据视图。在DataView基础上，增加了树折叠处理。

*/

mini.DataSource = function () {
    mini.DataSource.superclass.constructor.call(this);
    this._init();
};
mini.extend(mini.DataSource, mini.Component, {
    idField: "id",
    textField: "text",

    _originalIdField: "_id",
    _clearOriginals: true,
    _autoCreateNewID: false,
    _init: function () {
        this.source = [];
        this.dataview = [];
        this.visibleRows = null;

        this._ids = {};
        this._removeds = [];
        if (this._clearOriginals) {
            this._originals = {};
        }
        this._errors = {};

        this._selected = null;
        this._selecteds = [];
        this._idSelecteds = {};

        this.__changeCount = 0;
    },
    getSource: function () {
        return this.source;
    },
    getList: function () {
        return this.source.clone();
    },
    getDataView: function () {
        return this.dataview.clone();
    },
    getVisibleRows: function () {
        //可以根据row的_visible，显示或隐藏
        if (!this.visibleRows) {

            this.visibleRows = this.getDataView().clone();
        }
        return this.visibleRows;
    },
    setData: function (data) {
        this.loadData(data);
    },
    loadData: function (data) {
        if (!mini.isArray(data)) data = [];
        //        var e = {
        //            data: data,
        //            cancel: false
        //        };
        //        this.fire("beforeloaddata", e);
        //        if (e.cancel == true) return false;

        this._init();
        this._doLoadData(data);

        this._dataChanged();
        this.fire("loaddata");
        return true;
    },
    _doLoadData: function (data) {
        this.source = data;
        this.dataview = data;

        var ds = this.source, ids = this._ids;
        for (var i = 0, l = ds.length; i < l; i++) {
            var record = ds[i];
            //if (!record._id) record._id = mini.DataSource.RecordId++;
            record._id = mini.DataSource.RecordId++;
            ids[record._id] = record;

            //历史问题
            record._uid = record._id;
        }
    },
    clearData: function () {
        this._init();
        this._dataChanged();
        this.fire("cleardata");
    },
    clear: function () {
        this.clearData();
    },
    //updateRecord(record, field, value);
    //updateRecord(record, keyValues);
    updateRecord: function (record, field, value) {
        if (mini.isNull(record)) return;
        var getMap = mini._getMap, setMap = mini._setMap;

        this.fire("beforeupdate", { record: record });

        if (typeof field == 'string') {
            //var oldValue = record[field];
            var oldValue = getMap(field, record); //record[p];
            if (mini.isEquals(oldValue, value)) {
                //this.endChange(false);
                return false;
            }
            this.beginChange();
            //record[field] = value;
            setMap(field, value, record);
            this._setModified(record, field, oldValue);
            this.endChange();
            //this._dataChanged();
            //this.ValidateCell(record, field);
        } else {
            this.beginChange();
            for (var p in field) {
                var oldValue = getMap(p, record); //record[p];
                var value = field[p];
                if (mini.isEquals(oldValue, value)) continue;
                //record[p] = value;
                setMap(p, value, record);
                this._setModified(record, p, oldValue);
            }
            this.endChange();
            //this.ValidateRecord(record);
        }

        this.fire("update", { record: record });
    },
    deleteRecord: function (record) {
        this._setDeleted(record);

        this._dataChanged();
        this.fire("delete", { record: record });
    },
    getby_id: function (id) {
        id = typeof id == "object" ? id._id : id;
        return this._ids[id];
    },
    getbyId: function (id) {
        var t = typeof id;
        if (t == "number") return this.getAt(id);
        if (typeof id == "object") {
            if (this.getby_id(id)) return id;
            id = id[this.idField];
        }
        var data = this.getList();
        id = String(id);
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var _id = !mini.isNull(o[this.idField]) ? String(o[this.idField]) : null;
            if (_id == id) return o;
        }
        return null;
    },
    getsByIds: function (value) {
        if (mini.isNull(value)) value = "";
        value = String(value);
        var nodes = [];
        var ids = String(value).split(",");
        for (var i = 0, l = ids.length; i < l; i++) {
            var node = this.getbyId(ids[i]);
            if (node) nodes.push(node);
        }
        return nodes;
    },
    getRecord: function (id) {
        return this.getRow(id);
    },
    getRow: function (index) {
        var t = typeof index;
        if (t == "string") return this.getbyId(index);
        else if (t == "number") return this.getAt(index);
        else if (t == "object") return index;
    },
    delimiter: ",",
    getValueAndText: function (records, delimiter) {
        if (mini.isNull(records)) records = [];
        delimiter = delimiter || this.delimiter;

        if (typeof records == "string" || typeof records == "number") {
            records = this.getsByIds(records);
        } else if (!mini.isArray(records)) {
            records = [records];
        }
        var values = [];
        var texts = [];
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (record) {
                values.push(this.getItemValue(record));
                texts.push(this.getItemText(record));
            }
        }

        return [values.join(delimiter), texts.join(delimiter)];
    },
    getItemValue: function (item) {
        if (!item) return "";
        var t = mini._getMap(this.idField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    getItemText: function (item) {
        if (!item) return "";
        //var t = item[this.textField];
        var t = mini._getMap(this.textField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    ////////////////////////////
    isModified: function (reocrd, field) {
        var or = this._originals[reocrd[this._originalIdField]];
        if (!or) return false;
        if (mini.isNull(field)) return false;
        return or.hasOwnProperty(field);
    },
    hasRecord: function (record) {
        return !!this.getby_id(record);
    },
    findRecords: function (property, value) {
        var ifFn = typeof property == "function";
        var fn = property;
        var scope = value || this;
        var data = this.source;
        var records = [];
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            if (ifFn) {
                var ret = fn.call(scope, o);
                if (ret == true) {
                    records[records.length] = o;
                }
                if (ret === 1) break;
            } else {
                if (o[property] == value) {
                    records[records.length] = o;
                }
            }
        }
        return records;
    },
    findRecord: function (property, value) {
        var records = this.findRecords(property, value);
        return records[0];
    },
    each: function (fn, scope) {
        var data = this.getDataView().clone();
        scope = scope || this;
        mini.forEach(data, fn, scope);
    },
    getCount: function () {
        return this.getDataView().length;
    },
    setIdField: function (value) {
        this.idField = value;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    /////////////////////////////////////////////////////
    __changeCount: 0,
    beginChange: function () {
        this.__changeCount++;
    },
    endChange: function (raise) {
        this.__changeCount--;
        if (this.__changeCount < 0) this.__changeCount = 0;
        if ((raise !== false && this.__changeCount == 0) || raise == true) {
            this.__changeCount = 0;
            this._dataChanged();
        }
    },
    _dataChanged: function () {
        this.visibleRows = null;
        if (this.__changeCount == 0) {
            this.fire("datachanged");
        }
    },
    /////////////////////////////////////////////////////
    //记录状态修改
    _setAdded: function (record) {
        record._id = mini.DataSource.RecordId++;

        //自动创建idField
        if (this._autoCreateNewID && !record[this.idField]) {
            record[this.idField] = UUID();
        }

        //历史问题
        record._uid = record._id;

        //if (!record._id) record._id = mini.DataSource.RecordId++;
        record._state = "added";
        this._ids[record._id] = record;
        delete this._originals[record[this._originalIdField]];
    },
    _setModified: function (record, field, oldValue) {
        if (record._state != "added"
            && record._state != "deleted"
            && record._state != "removed"
        ) {
            record._state = "modified";
            var or = this._getOriginal(record);
            if (!or.hasOwnProperty(field)) {
                or[field] = oldValue;
            }
        }
    },
    _setDeleted: function (record) {
        if (record._state != "added"
            && record._state != "deleted"
            && record._state != "removed"
        ) {
            record._state = "deleted";
        }
    },
    _setRemoved: function (record) {
        delete this._ids[record._id];
        if (record._state != "added" && record._state != "removed") {
            record._state = "removed";
            delete this._originals[record[this._originalIdField]];
            this._removeds.push(record);
        }
    },
    _getOriginal: function (record) {
        var rid = record[this._originalIdField];
        var or = this._originals[rid];
        if (!or) {
            or = this._originals[rid] = {};
        }
        return or;
    },
    /////////////////////////////////////////////////////    
    _selected: null,    //current
    _selecteds: [],
    _idSelecteds: null,
    multiSelect: false,
    isSelected: function (id) {
        if (!id) return false;
        if (typeof id != "string") id = id._id;
        return !!this._idSelecteds[id];
    },
    setSelected: function (record) {         //@@不开放
        record = this.getby_id(record);
        var selected = this.getSelected();
        if (selected != record) {
            this._selected = record;
            if (record) {
                this.select(record);
            } else {
                this.deselect(this.getSelected());
            }
            //this.fire("currentchanged"); //选择、修改、删除，都是currentchanged
            this._OnCurrentChanged(record);
        }
    },
    getSelected: function () {
        if (this.isSelected(this._selected)) return this._selected;
        return this._selecteds[0];
    },
    setCurrent: function (record) {
        this.setSelected(record);
    },
    getCurrent: function () {
        return this.getSelected();
    },
    getSelecteds: function () {
        return this._selecteds.clone();
    },
    select: function (record) {
        if (mini.isNull(record)) return;
        this.selects([record]);
    },
    deselect: function (record) {
        if (mini.isNull(record)) return;
        this.deselects([record]);
    },
    selectAll: function () {
        this.selects(this.getList());
    },
    deselectAll: function () {
        this.deselects(this.getList());
    },
    selects: function (records) {
        if (!mini.isArray(records)) return;
        records = records.clone();

        //single select
        if (this.multiSelect == false) {
            this.deselects(this.getSelecteds());
            if (records.length > 0) records.length = 1;
            this._selecteds = [];
            this._idSelecteds = {};
        }

        var _records = [];
        for (var i = 0, l = records.length; i < l; i++) {
            var record = this.getbyId(records[i]);
            if (!record) continue;
            if (!this.isSelected(record)) {
                this._selecteds.push(record);
                this._idSelecteds[record._id] = record;
                _records.push(record);
            }
        }
        this._OnSelectionChanged(records, true, _records);
    },
    deselects: function (records) {
        if (!mini.isArray(records)) return;
        records = records.clone();
        var _records = [];
        for (var i = records.length - 1; i >= 0; i--) {
            var record = this.getbyId(records[i]);
            if (!record) continue;
            if (this.isSelected(record)) {
                this._selecteds.remove(record);
                delete this._idSelecteds[record._id];
                _records.push(record);
            }
        }
        this._OnSelectionChanged(records, false, _records);
    },
    _OnSelectionChanged: function (records, select, _records) {
        var e = {
            records: records,
            select: select,
            selected: this.getSelected(),
            selecteds: this.getSelecteds(),
            _records: _records
        };
        this.fire("SelectionChanged", e);

        var current = this._current;
        var now = this.getCurrent();
        if (current != now) {
            this._current = now;
            this._OnCurrentChanged(now);
        }
    },
    _OnCurrentChanged: function (record) {
        if (this._currentTimer) {
            clearTimeout(this._currentTimer);
        }
        var me = this;
        this._currentTimer = setTimeout(function () {
            me._currentTimer = null;
            var e = { record: record };
            me.fire("CurrentChanged", e);
        }, 1);
    },
    _checkSelecteds: function () {
        for (var i = this._selecteds.length - 1; i >= 0; i--) {
            var record = this._selecteds[i];
            var r = this.getby_id(record._id);
            if (!r) {
                this._selecteds.removeAt(i);
                delete this._idSelecteds[record._id];
            }
        }
        if (this._selected && this.getby_id(this._selected._id) == null) {
            this._selected = null;
        }
    },
    setMultiSelect: function (value) {
        if (this.multiSelect != value) {
            this.multiSelect = value;
            if (value == false) {
                //...
            }
        }
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    selectPrev: function () {
        var record = this.getSelected();
        if (!record) {
            record = this.getAt(0);
        } else {
            var index = this.indexOf(record);
            record = this.getAt(index - 1);
        }
        if (record) {
            this.deselectAll();
            this.select(record);
            this.setCurrent(record);
        }
    },
    selectNext: function () {
        var record = this.getSelected();
        if (!record) {
            record = this.getAt(0);
        } else {
            var index = this.indexOf(record);
            record = this.getAt(index + 1);
        }
        if (record) {
            this.deselectAll();
            this.select(record);
            this.setCurrent(record);
        }
    },
    selectFirst: function () {
        var record = this.getAt(0);
        if (record) {
            this.deselectAll();
            this.select(record);
            this.setCurrent(record);
        }
    },
    selectLast: function () {
        var data = this.getVisibleRows();
        var record = this.getAt(data.length - 1);
        if (record) {
            this.deselectAll();
            this.select(record);
            this.setCurrent(record);
        }
    },
    getSelectedsId: function (delimiter) {
        var nodes = this.getSelecteds();
        var vts = this.getValueAndText(nodes, delimiter);
        return vts[0];
    },
    getSelectedsText: function (delimiter) {
        var nodes = this.getSelecteds();
        var vts = this.getValueAndText(nodes, delimiter);
        return vts[1];
    },
    ////////////////////////////////////////    
    _filterInfo: null,
    _sortInfo: null,
    filter: function (fn, scope) {

        if (typeof fn != "function") return;
        scope = scope || this;

        this._filterInfo = [fn, scope];
        //alert(this.getVisibleRows().length);
        this._doFilter();
        //alert(this.getVisibleRows().length);
        this._doSort();

        this._dataChanged();

        this.fire("filter");
    },
    clearFilter: function () {
        if (!this._filterInfo) return;
        this._filterInfo = null;
        this._doFilter();
        this._doSort();
        this._dataChanged();
        this.fire("filter");
    },
    sort: function (fn, scope, reverse) {
        if (typeof fn != "function") return;
        scope = scope || this;
        this._sortInfo = [fn, scope, reverse];
        this._doSort();
        this._dataChanged();
        this.fire("sort");
    },
    clearSort: function () {
        this._sortInfo = null;

        this.sortField = this.sortOrder = null;

        this._doFilter();
        this._dataChanged();
        this.fire("filter");
    },
    _doClientSortField: function (sortField, sortOrder, dataType) {

        var sortFn = this._getSortFnByField(sortField, dataType);
        if (!sortFn) return;

        this.sortField = sortField;
        this.sortOrder = sortOrder;

        var reverse = sortOrder == "desc";
        this.sort(sortFn, this, reverse);
    },
    _getSortFnByField: function (field, sortType) {
        if (!field) return null;
        var sortFn = null;
        var typeFn = mini.sortTypes[sortType];
        if (!typeFn) typeFn = mini.sortTypes["string"];
        function sortBy(a, b) {
            var a1 = mini._getMap(field, a), b1 = mini._getMap(field, b);

            var nullA = mini.isNull(a1) || a1 === "";
            var nullB = mini.isNull(b1) || b1 === "";
            if (nullA) return -1;
            if (nullB) return 1;

            var v1 = typeFn(a1);
            var v2 = typeFn(b1);
            if (v1 > v2) return 1;
            else if (v1 == v2) return 0;
            else return -1;
        }

        sortFn = sortBy;
        return sortFn;
    },
    ////////////////////////////////////////////////////////////////////
    // Pager Load
    ////////////////////////////////////////////////////////////////////


    ajaxOptions: null,
    autoLoad: false,
    url: "",

    pageSize: 10,
    pageIndex: 0,
    totalCount: 0,
    totalPage: 0,

    sortField: "",
    sortOrder: "",

    loadParams: null,
    getLoadParams: function () {
        return this.loadParams || {};
    },

    //serverSorting: false,
    sortMode: "server", //server,client

    pageIndexField: "pageIndex",
    pageSizeField: "pageSize",
    sortFieldField: "sortField",
    sortOrderField: "sortOrder",
    totalField: "total",
    dataField: "data",

    load: function (params, success, error, complete) {
        if (typeof params == "string") {
            this.setUrl(params);
            return;
        }

        if (this._loadTimer) clearTimeout(this._loadTimer);
        this.loadParams = params || {};
        if (!mini.isNumber(this.loadParams.pageIndex)) this.loadParams.pageIndex = 0;
        if (this.ajaxAsync) {
            var me = this;
            this._loadTimer = setTimeout(function () {
                me._doLoadAjax(me.loadParams, success, error, complete);
                me._loadTimer = null;
            }, 1);
        } else {
            this._doLoadAjax(this.loadParams, success, error, complete);
        }
    },
    reload: function (success, error, complete) {
        this.load(this.loadParams, success, error, complete);
    },
    gotoPage: function (index, size) {
        var params = this.loadParams || {};
        if (mini.isNumber(index)) params.pageIndex = index;
        if (mini.isNumber(size)) params.pageSize = size;
        this.load(params);
    },

    sortBy: function (sortField, sortOrder) {
        this.sortField = sortField;
        this.sortOrder = sortOrder == "asc" ? "asc" : "desc";
        if (this.sortMode == "server") {
            var params = this.getLoadParams();
            params.sortField = sortField;
            params.sortOrder = sortOrder;
            params.pageIndex = this.pageIndex;
            this.load(params);
        } else {
            //alert("client sort");
            //this._doClientSort(sortField, sortOrder);
        }
    },
    setSortField: function (value) {
        this.sortField = value;
        if (this.sortMode == "server") {
            var params = this.getLoadParams();
            params.sortField = value;
        }
    },
    setSortOrder: function (value) {
        this.sortOrder = value;
        if (this.sortMode == "server") {
            var params = this.getLoadParams();
            params.sortOrder = value;
        }
    },

    checkSelectOnLoad: true,    //重新加载，是否保持原选中记录状态
    selectOnLoad: false,

    ajaxData: null,
    ajaxAsync: true,        //表格异步，tree、combobox同步
    ajaxType: '',           //get|post    
    //    ajaxDataType: "text",
    //    ajaxContentType: "application/x-www-form-urlencoded; charset=UTF-8",
    _doLoadAjax: function (params, success, error, complete, _successHandler) {

        params = params || {};
        if (mini.isNull(params.pageIndex)) params.pageIndex = this.pageIndex;
        if (mini.isNull(params.pageSize)) params.pageSize = this.pageSize;

        if (params.sortField) this.sortField = params.sortField;
        if (params.sortOrder) this.sortOrder = params.sortOrder;
        params.sortField = this.sortField;
        params.sortOrder = this.sortOrder;

        this.loadParams = params;

        var url = this._evalUrl();
        var type = this._evalType(url);

        var e = {
            url: url,
            async: this.ajaxAsync,
            type: type,
            data: params,
            params: params,
            cache: false,
            cancel: false
        };

        //历史遗留问题：兼容e.params参数
        if (e.data != e.params && e.params != params) {
            e.data = e.params;
        }

        var obj = mini._evalAjaxData(this.ajaxData, this);
        mini.copyTo(e.data, obj);

        //ajaxOptions：async, type, dateType, contentType等都能在beforeload前修改。        
        mini.copyTo(e, this.ajaxOptions);

        this._OnBeforeLoad(e);
        if (e.cancel == true) {
            params.pageIndex = this.getPageIndex();
            params.pageSize = this.getPageSize();
            return;
        }

        //处理自定义field
        var o = {};
        o[this.pageIndexField] = params.pageIndex;
        o[this.pageSizeField] = params.pageSize;
        if (params.sortField) o[this.sortFieldField] = params.sortField;
        if (params.sortOrder) o[this.sortOrderField] = params.sortOrder;



        //        delete params.pageIndex;
        //        delete params.pageSize;
        //        delete params.sortField;
        //        delete params.sortOrder;
        mini.copyTo(params, o);

                
        if (this.sortMode == 'client') {
            params[this.sortFieldField] = "";
            params[this.sortOrderField] = "";
        }

        //保存记录值
        var selected = this.getSelected();
        this._selectedValue = selected ? selected[this.idField] : null;
        if (mini.isNumber(this._selectedValue)) this._selectedValue = String(this._selectedValue);

        var me = this;
        me._resultObject = null;
        /*
        e.textStatus
        success     交互成功
        error       网络交互失败：404,500
        timeout     交互超时
        abort       交互终止
        servererror 网络交互成功，返回json，但是业务逻辑错误
        e.errorCode     服务端错误码
        e.errorMsg      错误描述信息
        e.stackTrace    错误定位信息
        */
        var async = e.async;
        mini.copyTo(e, {
            success: function (text, textStatus, xhr) {
                if (!text || text == "null") {
                    text = { tatal: 0, data: [] };
                }
                var result = null;
                try {
                    result = mini.decode(text);
                } catch (ex) {
                    if (mini_debugger == true) {
                        alert(url + "\n json is error.");
                    }
                }

                if (result && !mini.isArray(result)) {
                    result.total = parseInt(mini._getMap(me.totalField, result)); //result[me.totalField];
                    result.data = mini._getMap(me.dataField, result); //result[me.dataField];
                } else {
                    if (result == null) {
                        result = {};
                        result.data = [];
                        result.total = 0;
                    } else if (mini.isArray(result)) {
                        var r = {};
                        r.data = result;
                        r.total = result.length;
                        result = r;
                    }
                }
                if (!result.data) result.data = [];
                if (!result.total) result.total = 0;
                me._resultObject = result;


                if (!mini.isArray(result.data)) {
                    result.data = [result.data];
                }

                var ex = {
                    xhr: xhr,
                    text: text,
                    textStatus: textStatus,
                    result: result,
                    total: result.total,
                    data: result.data.clone(),

                    pageIndex: params[me.pageIndexField],
                    pageSize: params[me.pageSizeField]
                };

                if (mini.isNumber(result.error) && result.error != 0) {
                    //server error
                    ex.textStatus = "servererror";
                    ex.errorCode = result.error;
                    ex.stackTrace = result.stackTrace;
                    ex.errorMsg = result.errorMsg;
                    if (mini_debugger == true) {
                        alert(url + "\n" + ex.textStatus + "\n" + ex.stackTrace);
                    }
                    me.fire("loaderror", ex);
                    if (error) error.call(me, ex);
                } else {

                    if (_successHandler) {
                        _successHandler(ex);
                    } else {
                        //pager
                        me.pageIndex = ex.pageIndex;
                        me.pageSize = ex.pageSize;
                        me.setTotalCount(ex.total);

                        //success
                        me._OnPreLoad(ex);

                        //data
                        me.setData(ex.data);

                        //checkSelectOnLoad
                        if (me._selectedValue && me.checkSelectOnLoad) {
                            var o = me.getbyId(me._selectedValue);
                            if (o) {
                                me.select(o);
                            }
                        }
                        //selectOnLoad                    
                        if (me.getSelected() == null && me.selectOnLoad && me.getDataView().length > 0) {
                            me.select(0);
                        }
                        me.fire("load", ex);

                        if (success) {
                            if (async) {
                                setTimeout(function () {
                                    success.call(me, ex);
                                }, 20);
                            } else {
                                success.call(me, ex);
                            }
                        }
                    }
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                var ex = {
                    xhr: xhr,
                    text: xhr.responseText,
                    textStatus: textStatus
                };
                ex.errorMsg = xhr.responseText;
                ex.errorCode = xhr.status;

                if (mini_debugger == true) {
                    alert(url + "\n" + ex.errorCode + "\n" + ex.errorMsg);
                }

                me.fire("loaderror", ex);
                if (error) error.call(me, ex);
            },
            complete: function (xhr, textStatus) {
                var ex = {
                    xhr: xhr,
                    text: xhr.responseText,
                    textStatus: textStatus
                };
                me.fire("loadcomplete", ex);
                if (complete) complete.call(me, ex);
                me._xhr = null;
            }
        });
        if (this._xhr) {
            //this._xhr.abort();
        }
        this._xhr = mini.ajax(e);
    },
    _OnBeforeLoad: function (e) {
        this.fire("beforeload", e);
    },
    _OnPreLoad: function (e) {
        this.fire("preload", e); //加载前夕，处理更复杂数据
    },
    _evalUrl: function () {
        var url = this.url;
        if (typeof url == "function") {
            url = url();
        } else {
            try {
                url = eval(url);
            } catch (ex) {
                url = this.url;
            }
            if (!url) {
                url = this.url;
            }
        }
        return url;
    },
    _evalType: function (url) {
        var type = this.ajaxType;
        if (!type) {
            type = 'post';
            if (url) {
                if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
                    type = "get";
                }
            } else {
                type = "get";
            }
        }
        return type;
    },
    setSortMode: function (value) {
        this.sortMode = value;
    },
    getSortMode: function () {
        return this.sortMode;
    },
    setAjaxOptions: function (value) {
        this.ajaxOptions = value;
    },
    getAjaxOptions: function () {
        return this.ajaxOptions;
    },
    setAutoLoad: function (value) {
        this.autoLoad = value;
    },
    getAutoLoad: function () {
        return this.autoLoad;
    },
    setUrl: function (value) {
        this.url = value;
        if (this.autoLoad) {
            this.load();
        }
    },
    getUrl: function () {
        return this.url;
    },
    setPageIndex: function (value) {
        this.pageIndex = value;
        this.fire("pageinfochanged");
    },
    getPageIndex: function () {
        return this.pageIndex;
    },
    setPageSize: function (value) {
        this.pageSize = value;
        this.fire("pageinfochanged");
    },
    getPageSize: function () {
        return this.pageSize;
    },
    setTotalCount: function (value) {
        this.totalCount = value;
        this.fire("pageinfochanged");
    },
    getTotalCount: function () {
        return this.totalCount;
    },
    getTotalPage: function () {
        return this.totalPage;
    },
    setCheckSelectOnLoad: function (value) {
        this.checkSelectOnLoad = value;
    },
    getCheckSelectOnLoad: function () {
        return this.checkSelectOnLoad;
    },
    setSelectOnLoad: function (value) {
        this.selectOnLoad = value;
    },
    getSelectOnLoad: function () {
        return this.selectOnLoad;
    }

});
mini.DataSource.RecordId = 1;






/* DataTable
-----------------------------------------------------------------------------*/

mini.DataTable = function () {
    mini.DataTable.superclass.constructor.call(this);
};
mini.extend(mini.DataTable, mini.DataSource, {
    _init: function () {
        mini.DataTable.superclass._init.call(this);
        this._filterInfo = null;
        this._sortInfo = null;
    },
    add: function (record) {
        return this.insert(this.source.length, record);
    },
    addRange: function (records) {
        this.insertRange(this.source.length, records);
    },
    insert: function (index, record) {
        if (!record) return null;

        var e = {
            index: index,
            record: record
        };

        this.fire("beforeadd", e);

        if (!mini.isNumber(index)) {
            var insertRow = this.getRecord(index);
            if (insertRow) {
                index = this.indexOf(insertRow);
            } else {
                index = this.getDataView().length;
            }
            //return null;
        }

        var target = this.dataview[index];
        if (target) {
            this.dataview.insert(index, record);
        } else {
            this.dataview.add(record);
        }

        if (this.dataview != this.source) {
            if (target) {
                var sourceIndex = this.source.indexOf(target);
                this.source.insert(sourceIndex, record);
            } else {
                this.source.add(record);
            }
        }

        this._setAdded(record);

        this._dataChanged();


        this.fire("add", e);
    },
    insertRange: function (index, records) {
        if (!mini.isArray(records)) return;
        this.beginChange();
        records = records.clone();
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            this.insert(index + i, record);
        }
        this.endChange();
    },
    remove: function (record, autoSelect) {
        var index = this.indexOf(record);
        return this.removeAt(index, autoSelect);
    },
    removeAt: function (index, autoSelect) {
        var record = this.getAt(index);
        if (!record) return null;

        var e = {
            record: record
        };
        this.fire("beforeremove", e);

        var isSelected = this.isSelected(record);

        this.source.removeAt(index);
        if (this.dataview !== this.source) {
            this.dataview.removeAt(index);
        }

        this._setRemoved(record);

        this._checkSelecteds();

        this._dataChanged();

        this.fire("remove", e);

        if (isSelected && autoSelect) {
            var newSelected = this.getAt(index);
            if (!newSelected) newSelected = this.getAt(index - 1);
            this.deselectAll();
            this.select(newSelected);
        }
    },
    removeRange: function (records, autoSelect) {
        if (!mini.isArray(records)) return;
        this.beginChange();
        records = records.clone();
        for (var i = 0, l = records.length; i < l; i++) {
            var o = records[i];
            this.remove(o, autoSelect);
        }
        this.endChange();
    },
    move: function (record, newIndex) {
        if (!record || !mini.isNumber(newIndex)) return;
        if (newIndex < 0) return;
        if (mini.isArray(record)) {
            this.beginChange();

            var rs = record, targetRecord = this.getAt(newIndex);
            var sf = this;
            mini.sort(rs, function (a, b) {
                return sf.indexOf(a) > sf.indexOf(b);
            }, this);
            for (var i = 0, l = rs.length; i < l; i++) {
                var r = rs[i];
                var index = this.indexOf(targetRecord);
                this.move(r, index);
            }
            this.endChange();
            return;
        }

        var e = {
            index: newIndex,
            record: record
        };
        this.fire("beforemove", e);

        var target = this.dataview[newIndex];

        this.dataview.remove(record);

        var _index = this.dataview.indexOf(target);
        if (_index != -1) {
            newIndex = _index;
        }
        if (target) {
            this.dataview.insert(newIndex, record);
        } else {
            this.dataview.add(record);
        }

        if (this.dataview != this.source) {
            this.source.remove(record);
            var _index = this.source.indexOf(target);
            if (_index != -1) {
                newIndex = _index;
            }
            if (target) {
                this.source.insert(newIndex, record);
            } else {
                this.source.add(record);
            }
        }

        this._dataChanged();


        this.fire("move", e);
    },
    indexOf: function (record) {
        return this.getVisibleRows().indexOf(record);
    },
    getAt: function (index) {
        //return this.dataview[index];
        return this.getVisibleRows()[index];
    },
    getRange: function (start, end) {
        if (start > end) {
            var t = start;
            start = end;
            end = t;
        }
        var range = [];
        for (var i = start, l = end; i <= l; i++) {
            var o = this.dataview[i];
            range.push(o);
        }
        return range;
    },
    selectRange: function (start, end) {
        if (!mini.isNumber(start)) start = this.indexOf(start);
        if (!mini.isNumber(end)) end = this.indexOf(end);
        if (mini.isNull(start) || mini.isNull(end)) return;

        var rs = this.getRange(start, end);
        this.selects(rs);
    },
    toArray: function () {
        return this.source.clone();
    },
    //////////////////////////////////////////////
    isChanged: function () {
        return this.getChanges().length > 0;
    },
    /*
    使用rowState获得不同状态的行对象数组:
    新增的
    删除的
    修改的
    */
    getChanges: function (rowState, onlyField) {
        var changes = [];
        if (rowState == "removed" || rowState == null) {
            changes.addRange(this._removeds.clone());
        }
        for (var i = 0, l = this.source.length; i < l; i++) {
            var record = this.source[i];
            if (!record._state) continue;
            if (record._state == rowState || rowState == null) {
                changes[changes.length] = record;
            }
        }
        var rows = changes;
        if (onlyField) {
            for (var i = 0, l = rows.length; i < l; i++) {
                var row = rows[i];
                if (row._state == "modified") {
                    var newRow = {};
                    newRow._state = row._state;
                    newRow[this.idField] = row[this.idField];
                    for (var field in row) {
                        var modifed = this.isModified(row, field);
                        if (modifed) {
                            newRow[field] = row[field];
                        }
                    }
                    rows[i] = newRow;
                }
            }
        }
        return changes;
    },
    //acceptChanges和rejectChanges都能清空DataTable的增/删/改/错误等标记信息, 但是一个是"提交", 一个是"撤销"处理
    accept: function () {
        this.beginChange();
        for (var i = 0, l = this.source.length; i < l; i++) {
            var record = this.source[i];
            this.acceptRecord(record);
        }
        this._removeds = [];  //被删除行集合
        this._originals = {}; //被修改行集合        
        this.endChange();
    },
    reject: function () {
        this.beginChange();
        for (var i = 0, l = this.source.length; i < l; i++) {
            var record = this.source[i];
            this.rejectRecord(record);
        }
        this._removeds = [];  //被删除行集合
        this._originals = {}; //被修改行集合
        this.endChange();
    },
    acceptRecord: function (node) {
        if (!node._state) return;
        delete this._originals[node[this._originalIdField]];
        if (node._state == "deleted") {  //如果是"删除", 则提交修改时, 实现真正移除
            this.remove(node);
        } else {
            delete node._state;
            delete this._originals[node[this._originalIdField]];
            this._dataChanged();
        }
        this.fire("update", { record: node });
    },
    rejectRecord: function (node) {
        if (!node._state) return;
        if (node._state == "added") {   //如果是新增撤销, 则删除之                                   
            this.remove(node);
        } else if (node._state == "modified" || node._state == "deleted") {
            var or = this._getOriginal(node);
            mini.copyTo(node, or);
            delete node._state;
            delete this._originals[node[this._originalIdField]];
            this._dataChanged();
            this.fire("update", { record: node });
        }
    },
    //////////////////////////////////////////////  
    _doFilter: function () {
        if (!this._filterInfo) {
            this.dataview = this.source;
            return;
        }
        var fn = this._filterInfo[0], scope = this._filterInfo[1];
        var view = [];
        var data = this.source;
        for (var i = 0, l = data.length; i < l; i++) {
            var r = data[i];
            var add = fn.call(scope, r, i, this);
            if (add !== false) {
                view.push(r);
            }
        }
        this.dataview = view;
    },
    _doSort: function () {
        if (!this._sortInfo) return;
        var fn = this._sortInfo[0], scope = this._sortInfo[1], reverse = this._sortInfo[2];
        var dv = this.getDataView().clone();
        mini.sort(dv, fn, scope);
        if (reverse) dv.reverse();
        this.dataview = dv;
    }
});
mini.regClass(mini.DataTable, "datatable");

/*
    root == source  :原始树形数据对象。
    viewNodes       :哈希结构，存放“过滤、排序”后的子节点数组。 (Tree控件)
    dataview        :列表数据视图。“过滤、排序、折叠”后的数组。 (SuperTree控件)    
*/
/* DataTree
-----------------------------------------------------------------------------*/

mini.DataTree = function () {
    mini.DataTree.superclass.constructor.call(this);
};
mini.extend(mini.DataTree, mini.DataSource, {
    isTree: true,

    expandOnLoad: false,            //默认全部收缩

    idField: "id",
    parentField: "pid",
    nodesField: "children",
    checkedField: "checked",
    resultAsTree: true,

    dataField: "",

    checkModel: "cascade",          //multiple|single|cascade
    autoCheckParent: false,         //1.选子，选父；2.选父，全选子；3.全取消子，取消父
    onlyLeafCheckable: false,       //只显示子节点checkbox


    setExpandOnLoad: function (value) {
        this.expandOnLoad = value;
    },
    getExpandOnLoad: function () {
        return this.expandOnLoad;
    },
    setParentField: function (value) {
        this.parentField = value;
    },
    setNodesField: function (value) {
        if (this.nodesField != value) {
            var data = this.root[this.nodesField];
            this.nodesField = value;
            this._doLoadData(data);
        }
    },
    setResultAsTree: function (value) {
        this.resultAsTree = value;
    },
    setCheckRecursive: function (value) {
        this.checkModel = value ? "cascade" : "multiple";
    },
    getCheckRecursive: function () {
        return this.checkModel == "cascade";
    },
    setShowFolderCheckBox: function (value) {
        this.onlyLeafCheckable = !value;
    },
    getShowFolderCheckBox: function () {
        return !this.onlyLeafCheckable;
    },
    _doExpandOnLoad: function (nodes) {
        //expandOnLoad
        var nodesField = this.nodesField;
        var expandOnLoad = this.expandOnLoad;

        function eachNodes(nodes, level) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];

                if (mini.isNull(node.expanded)) {
                    if (expandOnLoad === true
                    || (mini.isNumber(expandOnLoad) && level <= expandOnLoad)) {
                        node.expanded = true;
                    } else {
                        node.expanded = false;
                    }
                } else {
                    //node.expanded = false;
                }

                var childs = node[nodesField];
                if (childs) {
                    eachNodes(childs, level + 1);
                }
            }
        }
        eachNodes(nodes, 0);
    },
    ///////////////////////////////////////////////////////////

    _OnBeforeLoad: function (e) {
        var node = this._loadingNode || this.root;
        e.node = node;

        if (this._isNodeLoading()) {
            e.async = true;
            e.isRoot = e.node == this.root;
            if (!e.isRoot) {
                e.data[this.idField] = this.getItemValue(e.node);
            }
        }
        this.fire("beforeload", e);
    },
    _OnPreLoad: function (e) {
        //resultAsTree
        if (this.resultAsTree == false) {
            e.data = mini.arrayToTree(e.data, this.nodesField, this.idField, this.parentField)
        }
        this.fire("preload", e);




    },
    _init: function () {
        mini.DataTree.superclass._init.call(this);
        this.root = { _id: -1, _level: -1 };
        this.source = this.root[this.nodesField] = [];
        this.viewNodes = null;  //当排序、过滤后，viewNodes才有对象
        this.dataview = null;
        this.visibleRows = null;

        this._ids[this.root._id] = this.root;
    },
    _doLoadData: function (data) {
        data = data || [];

        this._doExpandOnLoad(data);

        this.source = this.root[this.nodesField] = data;
        this.viewNodes = null;
        this.dataview = null;
        this.visibleRows = null;

        //处理_id映射
        var ds = mini.treeToArray(data, this.nodesField);
        var ids = this._ids;
        ids[this.root._id] = this.root;
        for (var i = 0, l = ds.length; i < l; i++) {
            var node = ds[i];
            //if (!node._id) node._id = mini.DataSource.RecordId++;
            node._id = mini.DataSource.RecordId++;
            ids[node._id] = node;

            //历史问题
            node._uid = node._id;
        }
        //遍历树形，设置父子关系

        var checkedField = this.checkedField;
        var ds = mini.treeToArray(data, this.nodesField, "_id", "_pid", this.root._id);
        for (var i = 0, l = ds.length; i < l; i++) {
            var node = ds[i];
            var parentNode = this.getParentNode(node);
            node._pid = parentNode._id;
            node._level = parentNode._level + 1;
            delete node._state;


            node.checked = node[checkedField];
            if (node.checked) {
                node.checked = node.checked != 'false';
            }
            //
            //if (node.isLeaf === false) {
            if(this.isLeafNode(node) == false){
                var cs = node[this.nodesField];
                if (cs && cs.length > 0) {
                    //delete node.isLeaf;
                }
            }
        }

        //同步checked
        this._doUpdateLoadedCheckedNodes();
    },
    _setAdded: function (node) {
        var parentNode = this.getParentNode(node);  //设置父节点Id
        node._id = mini.DataSource.RecordId++;

        //自动创建idField
        if (this._autoCreateNewID && !node[this.idField]) {
            node[this.idField] = UUID();
        }

        //历史问题
        node._uid = node._id;

        //if (!node._id) node._id = mini.DataSource.RecordId++;
        node._pid = parentNode._id;
        if (parentNode[this.idField]) {
            node[this.parentField] = parentNode[this.idField];
        }
        node._level = parentNode._level + 1;
        node._state = "added";
        this._ids[node._id] = node;
        delete this._originals[node[this._originalIdField]];
    },
    _createNodes: function (node) {
        var nodes = node[this.nodesField];
        if (!nodes) {
            nodes = node[this.nodesField] = [];

        }
        if (this.viewNodes && !this.viewNodes[node._id]) {
            this.viewNodes[node._id] = [];
        }
        return nodes;
    },
    ///////////////////////////////////////    
    addNode: function (node, parentNode) {
        if (!node) return;
        return this.insertNode(node, -1, parentNode);
    },
    addNodes: function (nodes, parentNode, action) {
        if (!mini.isArray(nodes)) return;
        if (mini.isNull(action)) action = "add";
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.insertNode(node, action, parentNode);
        }
    },
    insertNodes: function (nodes, index, parentNode) {
        if (!mini.isNumber(index)) return;
        if (!mini.isArray(nodes)) return;
        if (!parentNode) parentNode = this.root;
        this.beginChange();

        var pnodes = this._createNodes(parentNode);
        if (index < 0 || index > pnodes.length) index = pnodes.length;

        nodes = nodes.clone();
        for (var i = 0, l = nodes.length; i < l; i++) {
            this.insertNode(nodes[i], index + i, parentNode);
        }

        this.endChange();
        return nodes;
    },
    removeNode: function (node) {
        var parentNode = this.getParentNode(node);
        if (!parentNode) return;
        var index = this.indexOfNode(node);
        return this.removeNodeAt(index, parentNode);
    },
    removeNodes: function (nodes) {
        if (!mini.isArray(nodes)) return;
        this.beginChange();
        nodes = nodes.clone();
        for (var i = 0, l = nodes.length; i < l; i++) {
            this.removeNode(nodes[i]);
        }
        this.endChange();
    },
    moveNodes: function (nodes, targetNode, action) {
        if (!nodes || nodes.length == 0 || !targetNode || !action) return;
        this.beginChange();
        var sf = this;
        mini.sort(nodes, function (a, b) {
            return sf.indexOf(a) > sf.indexOf(b);
        }, this);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.moveNode(node, targetNode, action);
            if (i != 0) {
                targetNode = node;
                action = "after";
            }
            //alert(node.Name);
        }
        this.endChange();
    },
    /*
    node: 要移动的节点
    targetNode: 目标节点
    action:
    1.  index   这时候, targetNode作为父节点
    2.  before, after, add/append 移动的方式
    */
    moveNode: function (node, targetNode, action) {
        if (!node || !targetNode || mini.isNull(action)) return;

        //如果有viewNodes，同时也发生变化
        if (this.viewNodes) {
            var parentNode = targetNode;
            var index = action;
            if (index == 'before') {
                parentNode = this.getParentNode(targetNode);
                index = this.indexOfNode(targetNode);
            } else if (index == 'after') {
                parentNode = this.getParentNode(targetNode);
                index = this.indexOfNode(targetNode) + 1;
            } else if (index == 'add' || index == "append") {
                if (!parentNode[this.nodesField]) parentNode[this.nodesField] = [];
                index = parentNode[this.nodesField].length;
            } else if (!mini.isNumber(index)) {
                return;
            }
            if (this.isAncestor(node, parentNode)) {  //如果目标父节点, 是节点的子节点, 则不能加入
                return false;
            }

            var childNodes = this.getChildNodes(parentNode);
            if (index < 0 || index > childNodes.length) index = childNodes.length;

            //加入新父节点下(假节点)
            var ___node = {};
            childNodes.insert(index, ___node);

            //node从原来的父节点中移除
            var oldParentNode = this.getParentNode(node);
            var oldChildNodes = this.getChildNodes(oldParentNode);
            oldChildNodes.remove(node);

            //真正节点加入
            index = childNodes.indexOf(___node);
            childNodes[index] = node;

        }

        var parentNode = targetNode;
        var index = action;
        var childNodes = this._createNodes(parentNode);

        if (index == 'before') {
            parentNode = this.getParentNode(targetNode);
            childNodes = this._createNodes(parentNode);
            index = childNodes.indexOf(targetNode);
        } else if (index == 'after') {
            parentNode = this.getParentNode(targetNode);
            childNodes = this._createNodes(parentNode);
            index = childNodes.indexOf(targetNode) + 1;
        } else if (index == 'add' || index == "append") {
            index = childNodes.length;
        } else if (!mini.isNumber(index)) {
            return;
        }
        if (this.isAncestor(node, parentNode)) {  //如果目标父节点, 是节点的子节点, 则不能加入
            return false;
        }

        if (index < 0 || index > childNodes.length) index = childNodes.length;

        //加入新父节点下(假节点)
        var ___node = {};
        childNodes.insert(index, ___node);

        //node从原来的父节点中移除
        var oldParentNode = this.getParentNode(node);
        oldParentNode[this.nodesField].remove(node);

        //真正节点加入
        index = childNodes.indexOf(___node);
        childNodes[index] = node;

        //_ParentId和_Level会改变
        this._updateParentAndLevel(node, parentNode);

        this._dataChanged();
        var e = {
            parentNode: parentNode,
            index: index,
            node: node
        };

        this.fire("movenode", e);
    },
    //insertNode(task, action, targetTask) //action: before, after, append/add
    insertNode: function (node, index, parentNode) {
        if (!node) return;
        if (!parentNode) {
            parentNode = this.root;
            index = "add";
        }
        if (!mini.isNumber(index)) {
            switch (index) {
                case "before":
                    index = this.indexOfNode(parentNode);
                    parentNode = this.getParentNode(parentNode);
                    this.insertNode(node, index, parentNode);
                    break;
                case "after":
                    index = this.indexOfNode(parentNode);
                    parentNode = this.getParentNode(parentNode);
                    this.insertNode(node, index + 1, parentNode);
                    break;
                case "append":
                case "add":
                    this.addNode(node, parentNode);
                    break;
                default:
                    break;
            }
            return;
        };

        var nodes2 = this._createNodes(parentNode); //原始节点组
        var nodes = this.getChildNodes(parentNode);      //视图节点组
        if (index < 0) index = nodes.length;

        nodes.insert(index, node);  //view
        //nodes[nodes.length] = node;
        index = nodes.indexOf(node);
        //index = index;
        if (this.viewNodes) {
            var preNode = nodes[index - 1];
            if (preNode) {
                var index2 = nodes2.indexOf(preNode);
                nodes2.insert(index2 + 1, node);
            } else {
                nodes2.insert(0, node);
            }
        }

        node._pid = parentNode._id;
        this._setAdded(node);
        this.cascadeChild(node, function (n, i, p) {
            n._pid = p._id;
            this._setAdded(n);
        }, this);

        this._dataChanged();
        var e = {
            parentNode: parentNode,
            index: index,
            node: node
        };
        this.fire("addnode", e);
        return node;
    },
    removeNodeAt: function (index, parentNode) {

        if (!parentNode) parentNode = this.root;
        var nodes = this.getChildNodes(parentNode);
        var node = nodes[index];
        if (!node) return null;

        nodes.removeAt(index);
        if (this.viewNodes) {
            var nodes2 = parentNode[this.nodesField];
            nodes2.remove(node);
        }

        this._setRemoved(node);
        this.cascadeChild(node, function (n, i, p) {
            this._setRemoved(n);
        }, this);

        this._checkSelecteds();

        this._dataChanged();
        var e = {
            parentNode: parentNode,
            index: index,
            node: node
        };
        this.fire("removenode", e);

        return node;
    },
    ///////////////////////////////////////////////////////
    //由当前节点开始一直上溯到根节点,对于每个节点应用fn,直到有一个fn返回假为止
    bubbleParent: function (node, fn, scope) {
        scope = scope || this;
        if (node) fn.call(this, node);
        var parentNode = this.getParentNode(node);
        if (parentNode && parentNode != this.root) {
            this.bubbleParent(parentNode, fn, scope);
        }
    },
    //遍历所有层次的子节点, 直到返回false
    cascadeChild: function (node, fn, scope) {
        if (!fn) return;
        if (!node) node = this.root;
        var nodes = node[this.nodesField];
        if (nodes) {
            nodes = nodes.clone();
            for (var i = 0, l = nodes.length; i < l; i++) {
                var c = nodes[i];
                if (fn.call(scope || this, c, i, node) === false) return;
                this.cascadeChild(c, fn, scope);
            }
        }
    },
    //遍历下一级子节点
    eachChild: function (node, fn, scope) {
        if (!fn || !node) return;
        var nodes = node[this.nodesField];
        if (nodes) {
            var list = nodes.clone();
            for (var i = 0, l = list.length; i < l; i++) {
                var o = list[i];
                if (fn.call(scope || this, o, i, node) === false) break;
            }
        }
    },

    collapse: function (node, deep) {

        if (!node) return;
        this.beginChange();

        node.expanded = false;
        if (deep) {
            this.eachChild(node, function (o) {
                if (o[this.nodesField] != null) {
                    this.collapse(o, deep);
                }
            }, this);
        }

        this.endChange();

        var e = {
            node: node
        };
        this.fire("collapse", e);
    },
    expand: function (node, deep) {

        if (!node) return;
        this.beginChange();

        node.expanded = true;
        if (deep) {
            this.eachChild(node, function (o) {
                if (o[this.nodesField] != null) {
                    this.expand(o, deep);
                }
            }, this);
        }

        this.endChange();

        var e = {
            node: node
        };
        this.fire("expand", e);
    },
    toggle: function (node) {
        if (this.isExpandedNode(node)) this.collapse(node);
        else this.expand(node);
    },
    expandNode: function (node) {
        this.expand(node);
    },
    collapseNode: function (node) {
        this.collapse(node);
    },
    collapseAll: function () {
        this.collapse(this.root, true);
    },
    expandAll: function () {
        this.expand(this.root, true);
    },
    collapseLevel: function (level, deep) {
        this.beginChange();
        this.each(function (node) {
            var nodeLevel = this.getLevel(node);
            if (level == nodeLevel) {
                this.collapse(node, deep);
            }
        }, this);
        this.endChange();
    },
    expandLevel: function (level, deep) {
        this.beginChange();
        this.each(function (node) {
            var nodeLevel = this.getLevel(node);
            if (level == nodeLevel) {
                this.expand(node, deep);
            }
        }, this);
        this.endChange();
    },
    expandPath: function (node) {
        node = this.getNode(node);
        if (!node) return;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            this.expandNode(ans[i]);
        }
    },
    collapsePath: function (node) {
        node = this.getNode(node);
        if (!node) return;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            this.collapseNode(ans[i]);
        }
    },
    ///////////////////////////////////////////////////////
    //判断parentNode是否是node的父级节点
    isAncestor: function (parentNode, node) {
        if (parentNode == node) return true;
        if (!parentNode || !node) return false;
        var as = this.getAncestors(node);
        for (var i = 0, l = as.length; i < l; i++) {
            if (as[i] == parentNode) return true;
        }
        return false;
    },
    //获取父级链
    getAncestors: function (node) {
        var as = [];
        while (1) {
            var parentNode = this.getParentNode(node);
            if (!parentNode || parentNode == this.root) break;
            as[as.length] = parentNode;
            node = parentNode;
        }
        as.reverse();
        return as;
    },
    getNode: function (node) {
        return this.getRecord(node);
    },
    getRootNode: function () {
        return this.root;
    },
    getParentNode: function (node) {
        //if (this.root._id == node._pid) return this.root;
        if (!node) return null;
        return this.getby_id(node._pid);
    },
    getAllChildNodes: function (node) {
        return this.getChildNodes(node, true);
    },
    getChildNodes: function (node, all, useView) {
        node = this.getNode(node);
        if (!node) node = this.getRootNode();
        var nodes = node[this.nodesField];

        //如果有过滤、排序，则从viewNodes中获取
        if (this.viewNodes && useView !== false) {
            nodes = this.viewNodes[node._id];
        }
        //        else if (nodes) {
        //            nodes = nodes.clone();
        //        }

        if (all === true && nodes) {
            var view = [];
            for (var i = 0, l = nodes.length; i < l; i++) {
                var cnode = nodes[i];
                view[view.length] = cnode;
                var cnodes = this.getChildNodes(cnode, all, useView);
                if (cnodes && cnodes.length > 0) {
                    view.addRange(cnodes);
                }
            }
            nodes = view;
        }
        return nodes || [];
    },
    getChildNodeAt: function (index, node) {
        var nodes = this.getChildNodes(node);
        if (nodes) return nodes[index];
        return null;
    },
    //是否有子节点
    hasChildNodes: function (node) {
        var nodes = this.getChildNodes(node);
        return nodes.length > 0;
    },
    getLevel: function (node) {
        return node._level;
    },

    //是否叶子节点(没有子节点的)
    //注意: 是否有子节点, 跟是否是叶子节点没有必然的关系    一般我们用IsLeaf来显示+-号, 在懒加载的时候管用
    _is_true: function (v) {
        return v === true || v === 1 || v === 'Y' || v === 'y'
    },
    _is_false: function (v) {
        return v === false || v === 0 || v === 'N' || v === 'n';
    },
    leafField: 'isLeaf',
    isLeafNode: function (node) {
        return this.isLeaf(node);
    },
    isLeaf: function (node) {
        
        var v = node[this.leafField];
        if (!node || this._is_false(v)) return false;
        var nodes = this.getChildNodes(node);
        if (nodes.length > 0) return false;
        return true;
    },
    hasChildren: function (node) {
        var subNodes = this.getChildNodes(node);
        return !!(subNodes && subNodes.length > 0);
    },
    isFirstNode: function (node) {
        if (node == this.root) return true;
        var parentNode = this.getParentNode(node);
        if (!parentNode) return false;
        return this.getFirstNode(parentNode) == node;
    },
    isLastNode: function (node) {
        if (node == this.root) return true;
        var parentNode = this.getParentNode(node);
        if (!parentNode) return false;
        return this.getLastNode(parentNode) == node;
    },
    isCheckedNode: function (node) {
        return node.checked === true;
    },
    isExpandedNode: function (node) {
        return node.expanded == true || node.expanded == 1 || mini.isNull(node.expanded);
    },
    isEnabledNode: function (node) {
        return node.enabled !== false;
    },
    isVisibleNode: function (node) {  //根据父节点折叠, 判断本节点是否可视
        if (node.visible == false) return false;
        var pnode = this._ids[node._pid];
        if (!pnode || pnode == this.root) return true;
        if (pnode.expanded === false) return false;
        return this.isVisibleNode(pnode);
    },
    getNextNode: function (node) {
        var parentNode = this.getby_id(node._pid);
        if (!parentNode) return null;
        var index = this.indexOfNode(node);
        return this.getChildNodes(parentNode)[index + 1];
    },
    getPrevNode: function (node) {
        var parentNode = this.getby_id(node._pid);
        if (!parentNode) return null;
        var index = this.indexOfNode(node);
        return this.getChildNodes(parentNode)[index - 1];
    },
    getFirstNode: function (parentNode) {
        return this.getChildNodes(parentNode)[0];
    },
    getLastNode: function (parentNode) {
        var nodes = this.getChildNodes(parentNode);
        return nodes[nodes.length - 1];
    },
    indexOfNode: function (node) {
        var parentNode = this.getby_id(node._pid);
        if (parentNode) {
            return this.getChildNodes(parentNode).indexOf(node);
        }
        return -1;
    },
    indexOfList: function (node) {
        return this.getList().indexOf(node);
    },
    getAt: function (index) {
        //return this.getDataView()[index];
        return this.getVisibleRows()[index];
    },
    indexOf: function (record) {
        return this.getVisibleRows().indexOf(record);
    },
    getRange: function (start, end) {
        if (start > end) {
            var t = start;
            start = end;
            end = t;
        }
        var data = this.getChildNodes(this.root, true);
        var range = [];
        for (var i = start, l = end; i <= l; i++) {
            var o = data[i];
            if (o) {
                range.push(o);
            }
        }
        return range;
    },
    selectRange: function (start, end) {
        var data = this.getChildNodes(this.root, true);
        if (!mini.isNumber(start)) start = data.indexOf(start);
        if (!mini.isNumber(end)) end = data.indexOf(end);
        if (mini.isNull(start) || mini.isNull(end)) return;

        var rs = this.getRange(start, end);
        this.selects(rs);
    },
    findRecords: function (property, value) {
        var data = this.toArray();

        var ifFn = typeof property == "function";
        var fn = property;
        var scope = value || this;
        var records = [];
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];

            if (ifFn) {
                var ret = fn.call(scope, o);
                if (ret == true) {
                    records[records.length] = o;
                }
                if (ret === 1) break;
            } else {
                if (o[property] == value) {
                    records[records.length] = o;
                }
            }
        }
        return records;
    },
    ////////////////////////////////////
    _dataChangedCount: 0,
    _dataChanged: function () {
        this._dataChangedCount++;
        this.dataview = null;
        this.visibleRows = null;
        if (this.__changeCount == 0) {
            this.fire("datachanged");
        }
    },
    _createDataView: function () {
        //获取所有排序、过滤后的节点列表
        var data = this.getChildNodes(this.root, true);
        return data;
    },
    _createVisibleRows: function () {
        //获取所有排序、过滤后的节点列表
        var data = this.getChildNodes(this.root, true);
        //根据isVisibleNode, 再次筛选
        var view = [];
        for (var i = 0, l = data.length; i < l; i++) {
            var node = data[i];
            if (this.isVisibleNode(node)) view[view.length] = node;
        }
        return view;
    },
    getList: function () {

        return mini.treeToList(this.source, this.nodesField);
    },
    getDataView: function () {
        if (!this.dataview) {
            this.dataview = this._createDataView();
        }
        return this.dataview.clone();
    },
    getVisibleRows: function () {
        if (!this.visibleRows) {
            this.visibleRows = this._createVisibleRows();
        }
        return this.visibleRows;
    },
    //过滤、排序，生成viewNodes
    _doFilter: function () {
        if (!this._filterInfo) {
            this.viewNodes = null;
            return;
        }

        var fn = this._filterInfo[0], scope = this._filterInfo[1];

        var viewNodes = this.viewNodes = {}, nodesField = this.nodesField;
        function filter(node) {
            var nodes = node[nodesField];
            if (!nodes) return false;
            var id = node._id;
            var views = viewNodes[id] = [];

            for (var i = 0, l = nodes.length; i < l; i++) {
                var r = nodes[i];
                var cadd = filter(r);
                var add = fn.call(scope, r, i, this);
                if (add === true || cadd) {
                    views.push(r);
                }

            }
            return views.length > 0;
        }
        filter(this.root);
    },
    _doSort: function () {
        if (!this._filterInfo && !this._sortInfo) {
            this.viewNodes = null;
            return;
        }
        if (!this._sortInfo) return;
        var fn = this._sortInfo[0], scope = this._sortInfo[1], reverse = this._sortInfo[2];
        var nodesField = this.nodesField;
        if (!this.viewNodes) {
            var viewNodes = this.viewNodes = {};
            //如果没有viewNodes，则一一创建
            viewNodes[this.root._id] = this.root[nodesField].clone();
            this.cascadeChild(this.root, function (node, i, p) {
                var nodes = node[nodesField];
                if (nodes) {
                    viewNodes[node._id] = nodes.clone();
                }
            });
        }

        var sf = this;
        function sort(node) {
            var nodes = sf.getChildNodes(node);
            mini.sort(nodes, fn, scope);
            if (reverse) nodes.reverse();
            for (var i = 0, l = nodes.length; i < l; i++) {
                var r = nodes[i];
                sort(r);
            }
        };
        sort(this.root);
    },
    ////////////////////////////////////////////////////////

    toArray: function () {
        //return this.getChildNodes(this.root, true, false);

        if (!this._array || this._dataChangedCount != this._dataChangedCount2) {
            this._dataChangedCount2 = this._dataChangedCount;
            this._array = this.getChildNodes(this.root, true, false);
        }

        //1)节省掉性能开销；2）在大树形数据下，少生成对象，节省内存

        return this._array;
    },
    toTree: function () {
        return this.root[this.nodesField];
    },
    isChanged: function () {
        return this.getChanges().length > 0;
    },
    /*
    使用rowState获得不同状态的行对象数组:
    新增的
    删除的
    修改的
    */
    getChanges: function (rowState, onlyField) {
        var changes = [];
        if (rowState == "removed" || rowState == null) {
            changes.addRange(this._removeds.clone());
        }
        this.cascadeChild(this.root, function (record, i, p) {
            if (record._state == null || record._state == "") return;
            if (record._state == rowState || rowState == null) {
                changes[changes.length] = record;
            }
        }, this);
        var rows = changes;
        if (onlyField) {
            for (var i = 0, l = rows.length; i < l; i++) {
                var row = rows[i];
                if (row._state == "modified") {
                    var newRow = {};
                    newRow[this.idField] = row[this.idField];
                    for (var field in row) {
                        var modifed = this.isModified(row, field);
                        if (modifed) {
                            newRow[field] = row[field];
                        }
                    }
                    rows[i] = newRow;
                }
            }
        }
        return changes;
    },
    //acceptChanges和rejectChanges都能清空DataTable的增/删/改/错误等标记信息, 但是一个是"提交", 一个是"撤销"处理
    accept: function (node) {
        node = node || this.root;
        this.beginChange();
        this.cascadeChild(this.root, function (node) {
            this.acceptRecord(node);
        }, this);
        this._removeds = [];  //被删除行集合
        this._originals = {}; //被修改行集合
        this.endChange();
    },
    reject: function (node) {
        this.beginChange();
        this.cascadeChild(this.root, function (node) {
            this.rejectRecord(node);
        }, this);
        this._removeds = [];  //被删除行集合
        this._originals = {}; //被修改行集合
        this.endChange();
    },
    acceptRecord: function (node) {
        if (!node._state) return;
        delete this._originals[node[this._originalIdField]];
        if (node._state == "deleted") {  //如果是"删除", 则提交修改时, 实现真正移除
            this.removeNode(node);
        } else {
            delete node._state;
            delete this._originals[node[this._originalIdField]];
            this._dataChanged();
            this.fire("update", { record: node });
        }

    },
    rejectRecord: function (node) {
        if (!node._state) return;
        if (node._state == "added") {   //如果是新增撤销, 则删除之                                   
            this.removeNode(node);
        } else if (node._state == "modified" || node._state == "deleted") {
            var or = this._getOriginal(node);
            mini.copyTo(node, or);
            delete node._state;
            delete this._originals[node[this._originalIdField]];
            this._dataChanged();
            this.fire("update", { record: node });
        }
    },
    ///////////////////////////////////////////////
    ////升级/降级方法, 不公开, 给甘特图用
    upGrade: function (task) {
        var parentTask = this.getParentNode(task);
        if (parentTask == this.root || task == this.root) {
            return false;
        }

        //任务的当前位置
        var pNodes = parentTask[this.nodesField];

        var index = pNodes.indexOf(task);
        var appendIndex = task[this.nodesField] ? task[this.nodesField].length : 0;
        //删除父任务下,index之后的元素,并将删除的元素增加给选中元素
        for (var i = pNodes.length - 1; i >= index; i--) {
            var o = pNodes[i];
            pNodes.removeAt(i);
            if (o != task) {
                if (!task[this.nodesField]) task[this.nodesField] = [];
                task[this.nodesField].insert(appendIndex, o);
            }
        }
        //将task加入到原父任务之后位置
        var pparentTask = this.getParentNode(parentTask);
        var ppNodes = pparentTask[this.nodesField];
        var index = ppNodes.indexOf(parentTask);
        ppNodes.insert(index + 1, task);

        //_ParentId和_Level会改变
        this._updateParentAndLevel(task, pparentTask);

        this._doFilter();

        this._dataChanged();
    },
    downGrade: function (node) {
        //如果node是数组的第一个元素,则不能降级
        if (this.isFirstNode(node)) {
            return false;
        }

        var oldParentNode = this.getParentNode(node);

        var opNodes = oldParentNode[this.nodesField];

        var index = opNodes.indexOf(node);

        var parentNode = opNodes[index - 1];

        //从旧父节点中删除, 并插入到新父节点下
        opNodes.removeAt(index);
        if (!parentNode[this.nodesField]) parentNode[this.nodesField] = [];
        parentNode[this.nodesField].add(node);

        //_ParentId和_Level会改变
        this._updateParentAndLevel(node, parentNode);

        //如果有viewNodes，同时也发生变化

        this._doFilter();

        this._dataChanged();


    },

    _updateParentAndLevel: function (node, parentNode) {
        node._pid = parentNode._id;
        node._level = parentNode._level + 1;
        this.cascadeChild(node, function (n, i, p) {
            n._pid = p._id;
            n._level = p._level + 1;

            n[this.parentField] = p[this.idField];
        }, this);
        this._setModified(node);
    },
    //////////////////////////////////////////////////////////////
    // Check Node
    //////////////////////////////////////////////////////////////
    setCheckModel: function (value) {
        this.checkModel = value;
    },
    getCheckModel: function () {
        return this.checkModel;
    },
    setOnlyLeafCheckable: function (value) {
        this.onlyLeafCheckable = value;
    },
    getOnlyLeafCheckable: function () {
        return this.onlyLeafCheckable;
    },
    setAutoCheckParent: function (value) {
        this.autoCheckParent = value;
    },
    getAutoCheckParent: function () {
        return this.autoCheckParent;
    },
    _doUpdateLoadedCheckedNodes: function () {  //加载后调用，同步checked

        var nodes = this.getAllChildNodes(this.root);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.checked == true) {
                if (this.autoCheckParent == false || !this.hasChildNodes(node)) {
                    this._doUpdateNodeCheckState(node);
                }
            }
        }

    },
    _doUpdateNodeCheckState: function (node) {
        //遍历节点，根据设置，关联选择：checkModel(cascade)，
        //判断：onlyLeafCheckable，node.checkable
        if (!node) return;
        var checked = this.isChecked(node);
        if (this.checkModel == "cascade" || this.autoCheckParent) {
            //反选子节点            
            this.cascadeChild(node, function (cnode) {
                //                var checkable = this.getCheckable(cnode);
                //                if (checkable) {
                this.doCheckNodes(cnode, checked);
                //                }
            }, this);
            //三态父节点
            if (!this.autoCheckParent) {
                var ans = this.getAncestors(node);
                ans.reverse();
                for (var i = 0, l = ans.length; i < l; i++) {
                    var pnode = ans[i];
                    //                    var checkable = this.getCheckable(pnode);
                    //                    if (checkable == false) return;
                    var childNodes = this.getChildNodes(pnode);
                    var checkAll = true;
                    for (var ii = 0, ll = childNodes.length; ii < ll; ii++) {
                        var cnode = childNodes[ii];
                        if (!this.isCheckedNode(cnode)) {
                            checkAll = false;
                        }
                    }
                    if (checkAll) this.doCheckNodes(pnode, true);
                    else {
                        this.doCheckNodes(pnode, false);
                    }
                    //父节点数据不多，激发下
                    this.fire("checkchanged", { nodes: [pnode], _nodes: [pnode] });
                }
            }
        }
        var that = this;
        //if (this.autoCheckParent && checked) {
        function hasCheckedChildNode(pnode) {
            var childNodes = that.getChildNodes(pnode);
            for (var ii = 0, ll = childNodes.length; ii < ll; ii++) {
                var cnode = childNodes[ii];
                if (that.isCheckedNode(cnode)) {
                    return true;
                }
            }
            return false;
        }
        if (this.autoCheckParent) {
            //1)有子节点选中就选中；2)所有子节点都没选中，取消选中
            var ans = this.getAncestors(node);
            ans.reverse();
            for (var i = 0, l = ans.length; i < l; i++) {
                var pnode = ans[i];
                //                var checkable = this.getCheckable(pnode);
                //                if (checkable == false) return;
                pnode.checked = hasCheckedChildNode(pnode);
                this.fire("checkchanged", { nodes: [pnode], _nodes: [pnode] });
            }
        }
    },
    doCheckNodes: function (nodes, checked, cascade) {
        //cascade: 是否关联选择
        if (!nodes) return;
        if (typeof nodes == "string") {
            nodes = nodes.split(",");
        }
        if (!mini.isArray(nodes)) nodes = [nodes];
        nodes = nodes.clone();
        var _nodes = [];
        checked = checked !== false;

        if (cascade === true) {
            if (this.checkModel == "single") {
                this.uncheckAllNodes();
            }
        }
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = this.getRecord(nodes[i]);
            if (
                !node
                || (checked && node.checked === true)
                || (!checked && node.checked !== true)
            ) {
                if (node) {
                    if (cascade === true) {
                        this._doUpdateNodeCheckState(node);
                    }
                }
                continue;
            }
            node.checked = checked;
            _nodes.push(node);
            if (cascade === true) {
                this._doUpdateNodeCheckState(node);
            }
            //if (checked) delete node.checkState;
        }

        var me = this;
        setTimeout(function () {
            me.fire("checkchanged", { nodes: nodes, _nodes: _nodes, checked: checked });
        }, 1);
    },
    checkNode: function (node, cascade) {
        this.doCheckNodes([node], true, cascade !== false);
    },
    uncheckNode: function (node, cascade) {
        this.doCheckNodes([node], false, cascade !== false);
    },
    checkNodes: function (nodes, cascade) {
        if (!mini.isArray(nodes)) nodes = [];
        this.doCheckNodes(nodes, true, cascade !== false);
    },
    uncheckNodes: function (nodes, cascade) {
        if (!mini.isArray(nodes)) nodes = [];
        this.doCheckNodes(nodes, false, cascade !== false);
    },
    checkAllNodes: function () {
        var nodes = this.getList();
        this.doCheckNodes(nodes, true, false);
    },
    uncheckAllNodes: function () {
        var nodes = this.getList();
        this.doCheckNodes(nodes, false, false);
    },

    getCheckedNodes: function (mode) {  //parent, leaf, true(包含父节点）, 不传递（当前选中）
        if (mode === false) mode = 'leaf';
        var nodes = [];
        var maps = {};        
        this.cascadeChild(this.root, function (node) {
            if (node.checked == true) {
                var isLeaf = this.isLeafNode(node);
                if (mode === true) {
                    //nodes.push(node);
                    if (!maps[node._id]) {
                        maps[node._id] = node;
                        nodes.push(node);
                    }
                    var ans = this.getAncestors(node);
                    for (var i = 0, l = ans.length; i < l; i++) {
                        var anode = ans[i];
                        if (!maps[anode._id]) {
                            maps[anode._id] = anode;
                            nodes.push(anode);
                        }
                    }
                } else if (mode === "parent") {
                    if (!isLeaf) {
                        //nodes.push(node);
                        if (!maps[node._id]) {
                            maps[node._id] = node;
                            nodes.push(node);
                        }
                    }
                } else if (mode === "leaf") {
                    if (isLeaf) {
                        //nodes.push(node);
                        if (!maps[node._id]) {
                            maps[node._id] = node;
                            nodes.push(node);
                        }
                    }
                } else {
                    //nodes.push(node);
                    if (!maps[node._id]) {
                        maps[node._id] = node;
                        nodes.push(node);
                    }
                }
            }
        }, this);
        return nodes;
    },
    getCheckedNodesId: function (mode, delimiter) {
        var nodes = this.getCheckedNodes(mode);
        var vts = this.getValueAndText(nodes, delimiter);
        return vts[0];
    },
    getCheckedNodesText: function (mode, delimiter) {
        var nodes = this.getCheckedNodes(mode);
        var vts = this.getValueAndText(nodes, delimiter);
        return vts[1];
    },
    isChecked: function (node) {
        node = this.getRecord(node);
        if (!node) return null;
        return node.checked === true || node.checked === 1;
    },
    getCheckState: function (node) {    //更新三态时，只获取父节点

        node = this.getRecord(node);
        if (!node) return null;
        if (node.checked === true) return "checked";
        if (!node[this.nodesField]) return "unchecked";
        var children = this.getChildNodes(node, true);
        for (var i = 0, l = children.length; i < l; i++) {
            var node = children[i];
            if (node.checked === true) return "indeterminate";
        }
        return "unchecked";
    },
    getUnCheckableNodes: function () {
        var nodes = [];
        this.cascadeChild(this.root, function (node) {
            var checkable = this.getCheckable(node);
            if (checkable == false) {
                nodes.push(node);
            }
        }, this);
        return nodes;
    },
    setCheckable: function (nodes, checkable) {  //disableCheckbox方法就不提供了
        if (!nodes) return;
        if (!mini.isArray(nodes)) nodes = [nodes];
        nodes = nodes.clone();
        checkable = !!checkable;
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = this.getRecord(nodes[i]);
            if (!node) {
                continue;
            }
            node.checkable = checked;
        }
        //        this.fire("checkchanged", {nodes: [node]);
    },
    getCheckable: function (node) {
        node = this.getRecord(node);
        if (!node) return false;
        if (node.checkable === true) return true;
        if (node.checkable === false) return false;
        return this.isLeafNode(node) ? true : !this.onlyLeafCheckable;
    },
    showNodeCheckbox: function (node, show) {

    },
    ///////////////////////////////////
    _isNodeLoading: function () {
        return !!this._loadingNode;
    },
    loadNode: function (node, expand) {
        this._loadingNode = node;
        var e = { node: node };
        this.fire("beforeloadnode", e);
        //

        var time = new Date();

        var me = this;
        me._doLoadAjax(me.loadParams, null, null, null, function (e) {
            var t = new Date() - time;
            if (t < 60) t = 60 - t;

            setTimeout(function () {
                //success
                e.node = node;
                me._OnPreLoad(e);

                e.node = me._loadingNode;
                me._loadingNode = null;

                var oldNodes = node[me.nodesField];
                me.removeNodes(oldNodes);

                var nodes = e.data;
                if (nodes && nodes.length > 0) {
                    me.addNodes(nodes, node);
                    if (expand !== false) {
                        me.expand(node, true);
                    } else {
                        me.collapse(node, true);
                    }
                } else {
                    delete node[me.leafField];
                    me.expand(node, true);
                }


                me.fire("loadnode", e);
                me.fire("load", e);
            }, t);
        }, true);
    }
});
mini.regClass(mini.DataTree, "datatree");



//==========================================================================
/* DataTable/DateTree Applys
-----------------------------------------------------------------------------*/
mini._DataTableApplys = {
    /////////////////////////////////////////////
    idField: "id",
    textField: "text",
    setAjaxData: function (value) {
        this._dataSource.ajaxData = value;
    },
    getby_id: function (id) {
        return this._dataSource.getby_id(id);
    },
    getValueAndText: function (records, delimiter) {
        return this._dataSource.getValueAndText(records, delimiter);
    },
    setIdField: function (value) {
        this._dataSource.setIdField(value);
        this.idField = value;
    },
    getIdField: function () {
        return this._dataSource.idField;
    },
    setTextField: function (value) {
    
        this._dataSource.setTextField(value);
        this.textField = value;
    },
    getTextField: function () {
        return this._dataSource.textField;
    },
    //////////////////////////////
    clearData: function () {
        this._dataSource.clearData();
    },
    loadData: function (data) {
        this._dataSource.loadData(data);
    },
    setData: function (data) {
        this._dataSource.loadData(data);
    },
    getData: function () {
        return this._dataSource.getSource().clone();
    },
    getList: function () {
        return this._dataSource.getList();
    },
    getDataView: function () {
        return this._dataSource.getDataView();
    },
    getVisibleRows: function () {
        if (this._useEmptyView) return [];
        return this._dataSource.getVisibleRows();
    },
    toArray: function () {
        return this._dataSource.toArray();
    },
    getRecord: function (id) {
        return this._dataSource.getRecord(id);
    },
    getRow: function (index) {
        return this._dataSource.getRow(index);
    },
    getRange: function (start, end) {
        if (mini.isNull(start) || mini.isNull(end)) return;
        return this._dataSource.getRange(start, end);
    },
    getAt: function (index) {
        return this._dataSource.getAt(index);
    },
    indexOf: function (record) {
        return this._dataSource.indexOf(record);
    },
    getRowByUID: function (uid) {
        return this._dataSource.getby_id(uid);
    },
    getRowById: function (id) {
        return this._dataSource.getbyId(id);
    },
    ///////////////////////////////
    clearRows: function () {
        this._dataSource.clearData();
    },
    //    getRows: function () {
    //        return this._dataSource.toArray();
    //    },
    updateRow: function (record, field, value) {
        this._dataSource.updateRecord(record, field, value);
    },
    addRow: function (record, index) {
        return this._dataSource.insert(index, record);
    },
    removeRow: function (record, autoSelect) {
        return this._dataSource.remove(record, autoSelect);
    },
    removeRows: function (records, autoSelect) {
        return this._dataSource.removeRange(records, autoSelect);
    },
    removeRowAt: function (index, autoSelect) {
        return this._dataSource.removeAt(index, autoSelect);
    },
    moveRow: function (row, index) {
        this._dataSource.move(row, index);
    },
    addRows: function (records, index) {
        return this._dataSource.insertRange(index, records);
    },
    findRows: function (field, value) {
        return this._dataSource.findRecords(field, value);
    },
    findRow: function (field, value) {
        return this._dataSource.findRecord(field, value);
    },
    //    removeSelected: function (select) {
    //        var row = this.getSelected();
    //        var index = this.indexOf(row);
    //        this.removeRecord(row);
    //        if (select !== false) {
    //            row = this.getAt(index);
    //            this.select(row ? index : index - 1);
    //        }
    //    },
    //////////////////////////////////////////////////
    multiSelect: false,
    setMultiSelect: function (value) {
        this._dataSource.setMultiSelect(value);
        this.multiSelect = value;
    },
    getMultiSelect: function () {
        return this._dataSource.getMultiSelect();
    },
    setCurrent: function (record) {
        this._dataSource.setCurrent(record);
    },
    getCurrent: function () {
        return this._dataSource.getCurrent();
    },
    isSelected: function (record) {
        return this._dataSource.isSelected(record);
    },
    setSelected: function (record) {
        this._dataSource.setSelected(record);
    },
    getSelected: function () {
        return this._dataSource.getSelected();
    },
    getSelecteds: function () {
        return this._dataSource.getSelecteds();
    },
    select: function (record) {
        this._dataSource.select(record);
    },
    selects: function (records) {
        this._dataSource.selects(records);
    },
    deselect: function (record) {
        this._dataSource.deselect(record);
    },
    deselects: function (records) {
        this._dataSource.deselects(records);
    },
    selectAll: function () {
        this._dataSource.selectAll();
    },
    deselectAll: function () {
        this._dataSource.deselectAll();
    },
    clearSelect: function () {
        this.deselectAll();
    },
    selectPrev: function () {
        this._dataSource.selectPrev();
    },
    selectNext: function () {
        this._dataSource.selectNext();
    },
    selectFirst: function () {
        this._dataSource.selectFirst();
    },
    selectLast: function () {
        this._dataSource.selectLast();
    },
    selectRange: function (start, end) {
        this._dataSource.selectRange(start, end);
    },
    //////////////////////////////////////////////////
    filter: function (fn, scope) {
        this._dataSource.filter(fn, scope);
    },
    clearFilter: function () {
        this._dataSource.clearFilter();
    },
    sort: function (fn, scope) {
        this._dataSource.sort(fn, scope);
    },
    clearSort: function () {
        this._dataSource.clearSort();
    },
    ////////////////////////////////////////
    getResultObject: function () {
        return this._dataSource._resultObject || {};
    },
    isChanged: function () {
        return this._dataSource.isChanged();
    },
    getChanges: function (state, onlyField) {    
        return this._dataSource.getChanges(state, onlyField);
    },
    accept: function () {
        this._dataSource.accept();
    },
    reject: function () {
        this._dataSource.reject();
    },
    acceptRecord: function (record) {
        this._dataSource.acceptRecord(record);
    },
    rejectRecord: function (record) {
        this._dataSource.rejectRecord(record);
    }
};


mini._DataTreeApplys = {
    addRow: null,
    removeRow: null,
    removeRows: null,
    removeRowAt: null,
    moveRow: null,

    /////////////////////////////////////////////
    setExpandOnLoad: function (value) {
        this._dataSource.setExpandOnLoad(value);
    },
    getExpandOnLoad: function () {
        return this._dataSource.getExpandOnLoad();
    },
    /////////////////////////////////////////////
    selectNode: function (node) {
        if (node) {
            this._dataSource.select(node);
        } else {
            this._dataSource.deselect(this.getSelectedNode());
        }
    },
    getSelectedNode: function () {
        return this.getSelected();
    },
    getSelectedNodes: function () {
        return this.getSelecteds();
    },
    updateNode: function (node, field, value) {
        this._dataSource.updateRecord(node, field, value);
    },
    addNode: function (node, action, parentNode) {
        return this._dataSource.insertNode(node, action, parentNode);
    },
    removeNodeAt: function (index, parentNode) {
        return this._dataSource.removeNodeAt(index, parentNode);
        this._changed = true;
    },
    removeNode: function (node) {
        return this._dataSource.removeNode(node);
    },
    moveNode: function (node, action, targetNode) {
        this._dataSource.moveNode(node, action, targetNode);
    },
    addNodes: function (nodes, parentNode, action) {
        return this._dataSource.addNodes(nodes, parentNode, action);
    },
    insertNodes: function (nodes, index, parentNode) {
        return this._dataSource.insertNodes(index, nodes, parentNode);
    },
    moveNodes: function (nodes, targetNode, action) {
        this._dataSource.moveNodes(nodes, targetNode, action);
    },
    removeNodes: function (nodes) {
        return this._dataSource.removeNodes(nodes);
    },
    ////////////////////////////////////////    

    expandOnLoad: false,            //默认全部收缩
    checkRecursive: true,
    autoCheckParent: false,
    showFolderCheckBox: true,

    idField: "id",
    textField: "text",
    parentField: "pid",
    nodesField: "children",
    checkedField: "checked",
    leafField: 'isLeaf',
    resultAsTree: true,

    //    _changed: false,
    //    isChanged: function () {
    //        return this._changed;
    //    },

    setShowFolderCheckBox: function (value) {
        this._dataSource.setShowFolderCheckBox(value);
        if (this.doUpdate) this.doUpdate();
        this.showFolderCheckBox = value;
    },
    getShowFolderCheckBox: function () {
        return this._dataSource.getShowFolderCheckBox();
    },
    setCheckRecursive: function (value) {
        this._dataSource.setCheckRecursive(value);
        this.checkRecursive = value;
    },
    getCheckRecursive: function () {
        return this._dataSource.getCheckRecursive();
    },
    setResultAsTree: function (value) {
        this._dataSource.setResultAsTree(value);
    },
    getResultAsTree: function (value) {
        return this._dataSource.resultAsTree;
    },
    setParentField: function (value) {
        this._dataSource.setParentField(value);
        this.parentField = value;
    },
    getParentField: function () {
        return this._dataSource.parentField;
    },
    setLeafField: function (value) {
        this._dataSource.leafField = value;
        this.leafField = value;
    },
    getLeafField: function () {
        return this._dataSource.leafField;
    },
    setNodesField: function (value) {
        this._dataSource.setNodesField(value);
        this.nodesField = value;
    },
    getNodesField: function () {
        return this._dataSource.nodesField;
    },
    setCheckedField: function (value) {
        this._dataSource.checkedField = value;
        this.checkedField = value;
    },
    getCheckedField: function () {
        return this.checkedField;
    },
    /////////////////////////////
    findNodes: function (field, value) {
        return this._dataSource.findRecords(field, value);
    },
    getLevel: function (node) {
        return this._dataSource.getLevel(node);
    },
    isVisibleNode: function (node) {
        return this._dataSource.isVisibleNode(node);
    },

    isEnabledNode: function (node) {
        return this._dataSource.isEnabledNode(node);
    },
    isExpandedNode: function (node) {
        return this._dataSource.isExpandedNode(node);
    },
    isCheckedNode: function (node) {
        return this._dataSource.isCheckedNode(node);
    },
    isLeaf: function (node) {
        return this._dataSource.isLeafNode(node);
    },
    hasChildren: function (node) {
        return this._dataSource.hasChildren(node);
    },
    isAncestor: function (pnode, node) {
        return this._dataSource.isAncestor(pnode, node);
    },
    getNode: function (node) {
        return this._dataSource.getRecord(node);
    },
    getRootNode: function () {
        return this._dataSource.getRootNode();
    },
    getParentNode: function (node) {
        return this._dataSource.getParentNode.apply(this._dataSource, arguments);
    },
    getAncestors: function (node) {
        return this._dataSource.getAncestors(node);
    },
    getAllChildNodes: function (node) {
        return this._dataSource.getAllChildNodes.apply(this._dataSource, arguments);
    },
    getChildNodes: function (node, all) {
        return this._dataSource.getChildNodes.apply(this._dataSource, arguments);
    },
    getChildNodeAt: function (index, node) {
        return this._dataSource.getChildNodeAt.apply(this._dataSource, arguments);
    },
    indexOfNode: function (node) {
        return this._dataSource.indexOfNode.apply(this._dataSource, arguments);
    },
    hasChildNodes: function (node) {
        return this._dataSource.hasChildNodes.apply(this._dataSource, arguments);
    },
    isFirstNode: function (node) {
        return this._dataSource.isFirstNode.apply(this._dataSource, arguments);
    },
    isLastNode: function (node) {
        return this._dataSource.isLastNode.apply(this._dataSource, arguments);
    },
    getNextNode: function (node) {
        return this._dataSource.getNextNode.apply(this._dataSource, arguments);
    },
    getPrevNode: function (node) {
        return this._dataSource.getPrevNode.apply(this._dataSource, arguments);
    },
    getFirstNode: function (parentNode) {
        return this._dataSource.getFirstNode.apply(this._dataSource, arguments);
    },
    getLastNode: function (parentNode) {
        return this._dataSource.getLastNode.apply(this._dataSource, arguments);
    },

    ///////////////////////////////////
    toggleNode: function (node) {
        this._dataSource.toggle(node);
    },
    collapseNode: function (node, deep) {
        this._dataSource.collapse(node, deep);
    },
    expandNode: function (node, deep) {
        this._dataSource.expand(node, deep);
    },
    collapseAll: function () {
        this.useAnimation = false;
        this._dataSource.collapseAll();
        this.useAnimation = true;
    },
    expandAll: function () {
        this.useAnimation = false;
        this._dataSource.expandAll();
        this.useAnimation = true;
    },
    expandLevel: function (level) {
        this.useAnimation = false;
        this._dataSource.expandLevel(level);
        this.useAnimation = true;
    },
    collapseLevel: function (level) {
        this.useAnimation = false;
        this._dataSource.collapseLevel(level);
        this.useAnimation = true;
    },
    expandPath: function (node) {
        this.useAnimation = false;
        this._dataSource.expandPath(node);
        this.useAnimation = true;
    },
    collapsePath: function (node) {
        this.useAnimation = false;
        this._dataSource.collapsePath(node);
        this.useAnimation = true;
    },
    ////////////////////////////////
    loadNode: function (node, options) {
        this._dataSource.loadNode(node, options);
    },
    ////////////////////////////////
    setCheckModel: function (value) {
        this._dataSource.setCheckModel(value);
    },
    getCheckModel: function () {
        return this._dataSource.getCheckModel();
    },
    setOnlyLeafCheckable: function (value) {
        this._dataSource.setOnlyLeafCheckable(value);
    },
    getOnlyLeafCheckable: function () {
        return this._dataSource.getOnlyLeafCheckable();
    },
    setAutoCheckParent: function (value) {
        this._dataSource.setAutoCheckParent(value);
    },
    getAutoCheckParent: function () {
        return this._dataSource.getAutoCheckParent();
    },
    checkNode: function (node, cascade) {
        this._dataSource.checkNode(node, cascade);
    },
    uncheckNode: function (node, cascade) {
        this._dataSource.uncheckNode(node, cascade);
    },
    checkNodes: function (nodes, cascade) {
        this._dataSource.checkNodes(nodes, cascade);
    },
    uncheckNodes: function (nodes, cascade) {
        this._dataSource.uncheckNodes(nodes, cascade);
    },
    checkAllNodes: function () {
        this._dataSource.checkAllNodes();
    },
    uncheckAllNodes: function () {
        this._dataSource.uncheckAllNodes();
    },
    getCheckedNodes: function () {
        return this._dataSource.getCheckedNodes.apply(this._dataSource, arguments);
    },
    getCheckedNodesId: function () {
        return this._dataSource.getCheckedNodesId.apply(this._dataSource, arguments);
    },
    getCheckedNodesText: function () {
        return this._dataSource.getCheckedNodesText.apply(this._dataSource, arguments);
    },
    getNodesByValue: function (value) {
        if (mini.isNull(value)) value = "";
        value = String(value);
        var nodes = [];
        var ids = String(value).split(",");
        for (var i = 0, l = ids.length; i < l; i++) {
            var node = this.getNode(ids[i]);
            if (node) nodes.push(node);
        }
        return nodes;
    },
    isChecked: function (node) {
        return this._dataSource.isChecked.apply(this._dataSource, arguments);
    },
    getCheckState: function (node) {
        return this._dataSource.getCheckState.apply(this._dataSource, arguments);
    },
    setCheckable: function (nodes, checkable) {
        this._dataSource.setCheckable.apply(this._dataSource, arguments);
    },
    getCheckable: function (node) {
        return this._dataSource.getCheckable.apply(this._dataSource, arguments);
    },
    ///////////////////////////
    bubbleParent: function (node, fn, scope) {
        this._dataSource.bubbleParent.apply(this._dataSource, arguments);
    },
    cascadeChild: function (node, fn, scope) {
        this._dataSource.cascadeChild.apply(this._dataSource, arguments);
    },
    eachChild: function (node, fn, scope) {
        this._dataSource.eachChild.apply(this._dataSource, arguments);
    }
};


