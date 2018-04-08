/**
* jQuery MiniUI v3.0
* 
* Web Site : http://www.miniui.com
*
* Commercial License : http://www.miniui.com/license
*
* Copyright(c) 2012 All Rights Reserved. Shanghai PusSoft Co., Ltd (上海普加软件有限公司) [ services@plusoft.com.cn ]. 
* 
*/

mini.Lookup = function () {
    this.data = [];
    mini.Lookup.superclass.constructor.call(this);

    mini.on(this._textEl, "mouseup", this.__OnMouseUp, this);

    this.on("showpopup", this.__OnShowPopup, this);
    
}
mini.extend(mini.Lookup, mini.PopupEdit, {
    allowInput: true,

    valueField: "id",
    textField: "text",
    delimiter: ',',

    multiSelect: false,

    data: [],

    grid: null,
    _destroyPopup: false,


    uiCls: "mini-lookup",
    destroy: function (removeEl) {

        if (this.grid) {
            //this.grid.el.parentNode.removeChild(this.grid.el);

            this.grid.un("rowclick", this.__OnGridRowClickChanged, this);
            this.grid.un("load", this.__OnGridLoad, this);
            this.grid = null;


        }
        mini.Lookup.superclass.destroy.call(this, removeEl);
    },
    setMultiSelect: function (value) {
        this.multiSelect = value;

        if (this.grid) this.grid.setMultiSelect(value);
    },
    setGrid: function (value) {

        if (typeof value == "string") {
            mini.parse(value);
            value = mini.get(value);
        }
        this.grid = mini.getAndCreate(value);
        if (this.grid) {
            this.grid.setMultiSelect(this.multiSelect);
            this.grid.setCheckSelectOnLoad(false);
            this.grid.on("rowclick", this.__OnGridRowClickChanged, this);
            this.grid.on("load", this.__OnGridLoad, this);
            this.grid.on("checkall", this.__OnGridRowClickChanged, this);

        }
    },
    getGrid: function () {
        return this.grid;
    },
    setValueField: function (valueField) {
        this.valueField = valueField;
        //        if (this._listbox) {
        //            this._listbox.setValueField(valueField);
        //        }
    },
    getValueField: function () {
        return this.valueField;
    },
    setTextField: function (value) {
        //if (this._listbox) this._listbox.setTextField(value);
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    deselectAll: function () {
        this.data = [];
        this.setValue("");
        this.setText("");
        if (this.grid) this.grid.deselectAll();
    },
    ///////////////////////////////////////////////////
    getItemValue: function (item) {
        return String(item[this.valueField]);
    },
    getItemText: function (item) {
        var t = item[this.textField];
        return mini.isNull(t) ? '' : String(t);
    },
    getValueAndText: function (records) {
        if (mini.isNull(records)) records = [];

        var values = [];
        var texts = [];
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (record) {
                values.push(this.getItemValue(record));
                texts.push(this.getItemText(record));
            }
        }
        return [values.join(this.delimiter), texts.join(this.delimiter)];
    },
    _createData: function () {
        this.value = mini.isNull(this.value) ? "" : String(this.value);
        this.text = mini.isNull(this.text) ? "" : String(this.text);
        //        if (typeof this.value != "string") this.value = "";
        //        if (typeof this.text != "string") this.text = "";

        var data = [];
        var values = this.value.split(this.delimiter);
        var texts = this.text.split(this.delimiter);
        var len = values.length;
        //if (len < values.length) len = values.length;
        if (this.value) {
            for (var i = 0, l = len; i < l; i++) {
                var row = {};
                var id = values[i];
                var text = texts[i];
                row[this.valueField] = id ? id : "";
                row[this.textField] = text ? text : "";
                data.push(row);
            }
        }
        this.data = data;

    },
    _getValueMaps: function (rows) {

        var vs = {};
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            var id = row[this.valueField];
            vs[id] = row;
        }
        return vs;
    },
    setValue: function (value) {

        mini.Lookup.superclass.setValue.call(this, value);
        this._createData();
    },
    setText: function (value) {
        mini.Lookup.superclass.setText.call(this, value);
        this._createData();
    },
    __OnGridRowClickChanged: function (e) {

        var rows = this._getValueMaps(this.grid.getData());         //当前页行
        var sels = this._getValueMaps(this.grid.getSelecteds());    //当前页选中
        var vs = this._getValueMaps(this.data);                     //所有选中
        if (this.multiSelect == false) {
            vs = {};
            this.data = [];
        }
        //处理删除
        var removes = {};
        for (var id in vs) {
            var o = vs[id];
            if (rows[id]) {         //如果在当前页
                if (sels[id]) {     //如果被选中

                } else {            //否则去除掉
                    removes[id] = o;
                }
            }
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var o = this.data[i];
            var id = o[this.valueField];
            if (removes[id]) this.data.removeAt(i);
        }

        //处理增加
        for (var id in sels) {
            var o = sels[id];
            if (!vs[id]) this.data.push(o);
        }

        /////////////////////////////////////////

        var vts = this.getValueAndText(this.data);

        this.setValue(vts[0]);
        this.setText(vts[1]);

        this._OnValueChanged();
    },
    __OnGridLoad: function (e) {
        this.__OnShowPopup(e);
    },
    __OnShowPopup: function (e) {

        var vsb = String(this.value).split(this.delimiter);
        var vs = {};
        for (var i = 0, l = vsb.length; i < l; i++) {
            var v = vsb[i];
            vs[v] = 1;
        }

        var rows = this.grid.getData();
        //var vs = this._getValueMaps(this.data);                     //所有选中

        var sels = [];
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            var id = row[this.valueField];
            if (vs[id]) sels.push(row);
        }

        this.grid.selects(sels);
    },
    //////////////////////////////////////////////

    //禁止输入，光标可操作
    doUpdate: function () {
        mini.Lookup.superclass.doUpdate.call(this);
        this._textEl.readOnly = true;
        this.el.style.cursor = "default";
        //this.addCls(this._readOnlyCls);
    },
    __OnInputKeyDown: function (e) {
        mini.Lookup.superclass.__OnInputKeyDown.call(this, e);
        //e.preventDefault();
        switch (e.keyCode) {
            case 46:    //del
            case 8:    //backspace

                break;
            case 37:    //left

                break;
            case 39:    //right

                break;
        }
        //        this.fire("keydown", { htmlEvent: e });
        //        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
        //            return false;
        //        }
        //        if (e.keyCode == 13) {
        //            this.fire("enter");
        //        }
    },
    __OnMouseUp: function (e) {
        if (this.isReadOnly()) return;
        //mini.Lookup.superclass.__OnMouseUp.call(this, e);

        var rg = mini.getSelectRange(this._textEl);
        var start = rg[0], end = rg[1];

        //alert(rg[0] + ":" + rg[1]);
        var index = this._findTextIndex(start);
        //document.title = index;
        //暂时不做。。。
    },
    _findTextIndex: function (rgIndex) {
        var index = -1;
        if (this.text == "") return index;

        var texts = String(this.text).split(this.delimiter);
        var len = 0;
        for (var i = 0, l = texts.length; i < l; i++) {
            var text = texts[i];
            if (len < rgIndex && rgIndex <= len + text.length) {
                index = i;
                break;
            }
            len = len + text.length + 1;
        }
        return index;
    },

    /////////////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.Lookup.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["grid", "valueField", "textField"
             ]
        );
        mini._ParseBool(el, attrs,
            ["multiSelect"
             ]
        );

        return attrs;
    }
});

mini.regClass(mini.Lookup, 'lookup');

/*
    目的：多选/单选数据，标准使用。复杂使用，可以做一个弹出表格选择面板示例。
        本地
        远程数据

    另外，弹出面板的表格数据选择，做成一个独立示例。
*/