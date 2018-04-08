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

mini.ComboBox = function () {
    this.data = [];
    this.columns = [];
    mini.ComboBox.superclass.constructor.call(this);

    var me = this;
    if (isFirefox) {
        this._textEl.oninput = function () {
            me._tryQuery();
        }
    }
}
mini.extend(mini.ComboBox, mini.PopupEdit, {
    text: '',
    value: '',

    valueField: "id",
    textField: "text",
    dataField: "",

    delimiter: ',',

    multiSelect: false,
    data: [],
    url: "",

    columns: [],

    allowInput: false,

    valueFromSelect: false, //值是否只能来自下拉数据

    popupMaxHeight: 200,

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

        mini.ComboBox.superclass.set.call(this, kv);

        if (!mini.isNull(data)) {
            this.setData(data);

            kv.data = data;
        }
        if (!mini.isNull(url)) {
            this.setUrl(url);

            kv.url = url;
        }
        if (!mini.isNull(value)) {
            this.setValue(value);

            kv.value = value;
        }

        return this;
    },


    uiCls: "mini-combobox",


    _createPopup: function () {
        mini.ComboBox.superclass._createPopup.call(this);

        this._listbox = new mini.ListBox();

        this._listbox.setBorderStyle("border:0;");
        this._listbox.setStyle("width:100%;height:auto;");
        this._listbox.render(this.popup._contentEl);

        this._listbox.on("itemclick", this.__OnItemClick, this);
        this._listbox.on("drawcell", this.__OnItemDrawCell, this);

        var me = this;
        this._listbox.on("beforeload", function (e) {
            me.fire("beforeload", e);
        }, this);
        this._listbox.on("load", function (e) {
            me.fire("load", e);
        }, this);
        this._listbox.on("loaderror", function (e) {
            me.fire("loaderror", e);
        }, this);
    },
    showPopup: function () {
        var ex = { cancel: false };
        this.fire("beforeshowpopup", ex);
        if (ex.cancel == true) return;

        //if (this.id == "cityCombo") debugger
        this._listbox.setHeight("auto");
        mini.ComboBox.superclass.showPopup.call(this);
        var h = this.popup.el.style.height;
        if (h == "" || h == "auto") {
            this._listbox.setHeight("auto");
        } else {
            this._listbox.setHeight("100%");
        }

        this._listbox.setValue(this.value);

        //        var sf = this;
        //        setTimeout(function () {
        //            mini.repaint(sf._listbox.el);
        //        }, 100);
    },
    select: function (item) {
        this._listbox.deselectAll();
        item = this.getItem(item);
        if (item) {
            this._listbox.select(item);
            this.__OnItemClick({ item: item });
        }
    },
    getItem: function (item) {
        return typeof item == "object" ? item : this.data[item];
    },
    indexOf: function (item) {
        return this.data.indexOf(item);
    },
    getAt: function (index) {
        return this.data[index];
    },
    load: function (data) {
        if (typeof data == "string") {
            this.setUrl(data);
        } else {
            this.setData(data);
        }
    },
    _eval: function (_) {
        return eval('(' + _ + ')');
    },
    setData: function (data) {

        if (typeof data == "string") {
            data = this._eval(data);
            //data = eval('(' + data + ')');
            //data = mini._getMap(data, window);

        }
        if (!mini.isArray(data)) data = [];
        this._listbox.setData(data);
        this.data = this._listbox.data;
        //        var v = this._listbox.getValue();
        //        this.setValue(v);

        var vts = this._listbox.getValueAndText(this.value);
        this.text = this._textEl.value = vts[1];

    },
    getData: function () {
        return this.data;
    },
    setUrl: function (url) {
        this.getPopup();

        this._listbox.setUrl(url);
        this.url = this._listbox.url;
        this.data = this._listbox.data;

        var vts = this._listbox.getValueAndText(this.value);
        this.text = this._textEl.value = vts[1];
    },
    getUrl: function () {
        return this.url;
    },
    setValueField: function (valueField) {
        this.valueField = valueField;
        if (this._listbox) {
            this._listbox.setValueField(valueField);
        }
    },
    getValueField: function () {
        return this.valueField;
    },
    setTextField: function (value) {
        if (this._listbox) this._listbox.setTextField(value);
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    setDisplayField: function (value) {
        this.setTextField(value);
    },
    setDataField: function (value) {
        if (this._listbox) this._listbox.setDataField(value);
        this.dataField = value;
    },
    getDataField: function () {
        return this.dataField;
    },
    //////////////////////////
    setValue: function (value) {
        if (this.value !== value) {
            var vts = this._listbox.getValueAndText(value);

            this.value = value;

            this._valueEl.value = this.value;
            this.text = this._textEl.value = vts[1];

            this._doEmpty();
        } else {
            var vts = this._listbox.getValueAndText(value);
            this.text = this._textEl.value = vts[1];
        }
    },
    setMultiSelect: function (value) {
        if (this.multiSelect != value) {
            this.multiSelect = value;
            if (this._listbox) {
                this._listbox.setMultiSelect(value);
                this._listbox.setShowCheckBox(value);
            }
        }
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    setColumns: function (value) {
        if (!mini.isArray(value)) value = [];
        this.columns = value;
        this._listbox.setColumns(value);
    },
    getColumns: function () {
        return this.columns;
    },
    showNullItem: false,
    setShowNullItem: function (value) {
        if (this.showNullItem != value) {
            this.showNullItem = value;
            this._listbox.setShowNullItem(value);
        }
    },
    getShowNullItem: function () {
        return this.showNullItem;
    },
    setNullItemText: function (value) {
        if (this.nullItemText != value) {
            this.nullItemText = value;
            this._listbox.setNullItemText(value);
        }
    },
    getNullItemText: function () {
        return this.nullItemText;
    },
    setValueFromSelect: function (value) {
        this.valueFromSelect = value;
    },
    getValueFromSelect: function () {
        return this.valueFromSelect;
    },

    _OnValueChanged: function () {
        if (this.validateOnChanged) {
            this._tryValidate();
        }
        var value = this.getValue();
        var selecteds = this.getSelecteds();
        var selected = selecteds[0];
        var sf = this;

        sf.fire("valuechanged", { value: value, selecteds: selecteds, selected: selected });

    },
    getSelecteds: function () {
        return this._listbox.findItems(this.value);
    },
    getSelected: function () {
        return this.getSelecteds()[0];
    },
    __OnItemDrawCell: function (e) {

        this.fire("drawcell", e);
    },
    __OnItemClick: function (e) {

        var ev = { item: e.item, cancel: false };
        this.fire("beforeitemclick", ev);
        if (ev.cancel) return;

        //        var v = this._listbox.getValue();
        //        var vts = this._listbox.getValueAndText(v);
        //return;
        var items = this._listbox.getSelecteds();

        var vts = this._listbox.getValueAndText(items);


        //this._stopTextChanged = true;//
        var value = this.getValue();
        this.setValue(vts[0]);
        this.setText(vts[1]);

        //        if (mini.isFirefox) {   //FF下修改textEl.value，会激发changed...
        //            this.blur();
        //            this.focus();
        //        }

        if (e) {
            if (value != this.getValue()) {
                var sf = this;
                setTimeout(function () {
                    sf._OnValueChanged();
                }, 1);
            }

            if (!this.multiSelect) {
                this.hidePopup();
            }

            this.focus();


            this.fire("itemclick", { item: e.item });
        }
    },
    __OnInputKeyDown: function (e, userOldText) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);

        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }

        if (e.keyCode == 9) {   //tab
            if (this.isShowPopup()) {
                this.hidePopup();
            }
            return;
        }

        if (this.isReadOnly()) return;

        switch (e.keyCode) {
            case 27:        //esc
                e.preventDefault();
                if (this.isShowPopup()) {
                    e.stopPropagation();
                }

                this.hidePopup();
                this.focus();
                break;
            case 13:     //enter                
                if (this.isShowPopup()) {
                    e.preventDefault();
                    e.stopPropagation();

                    var index = this._listbox.getFocusedIndex();
                    if (index != -1) {
                        var item = this._listbox.getAt(index);

                        var ev = { item: item, cancel: false };
                        this.fire("beforeitemclick", ev);
                        if (ev.cancel == false) {
                            if (this.multiSelect) {
                                //this._listbox.select(item);
                            } else {
                                this._listbox.deselectAll();
                                this._listbox.select(item);
                            }
                            var items = this._listbox.getSelecteds();
                            var vts = this._listbox.getValueAndText(items);
                            this.setValue(vts[0]);
                            this.setText(vts[1]);
                            this._OnValueChanged();
                        }
                    }
                    this.hidePopup();
                    this.focus();
                } else {
                    this.fire("enter", ex);
                }
                break;
            case 37:    //left
                break;
            case 38:    //top      
                e.preventDefault();
                var index = this._listbox.getFocusedIndex();
                if (index == -1) {
                    index = 0;
                    if (!this.multiSelect) {
                        var item = this._listbox.findItems(this.value)[0];
                        if (item) {
                            index = this._listbox.indexOf(item);
                        }
                    }
                }
                if (this.isShowPopup()) {
                    if (!this.multiSelect) {
                        index -= 1;
                        if (index < 0) index = 0;
                        this._listbox._focusItem(index, true);
                    }
                }
                break;
            case 39:    //right
                break;
            case 40:    //bottom               
                e.preventDefault();
                var index = this._listbox.getFocusedIndex();
                if (index == -1) {
                    index = 0;
                    if (!this.multiSelect) {
                        var item = this._listbox.findItems(this.value)[0];
                        if (item) {
                            index = this._listbox.indexOf(item);
                        }
                    }
                }
                if (this.isShowPopup()) {
                    if (!this.multiSelect) {
                        index += 1;
                        if (index > this._listbox.getCount() - 1) index = this._listbox.getCount() - 1;
                        this._listbox._focusItem(index, true);
                    }
                } else {
                    this.showPopup();
                    if (!this.multiSelect) {
                        this._listbox._focusItem(index, true);
                    }
                }
                break;
            default:
                this._tryQuery(this._textEl.value);
                break;
        }
    },
    __OnInputKeyUp: function (e) {
        this.fire("keyup", { htmlEvent: e });

        //this.__OnInputKeyDown(e, false);
    },
    __OnInputKeyPress: function (e) {
        this.fire("keypress", { htmlEvent: e });
    },
    _tryQuery: function (oldText) {

        var sf = this;
        setTimeout(function () {
            var text = sf._textEl.value;
            if (text != oldText) {
                sf._doQuery(text);
                //document.title = new Date();
            }
        }, 10);
    },
    _doQuery: function (key) {
        if (this.multiSelect == true) return;
        var view = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            var text = mini._getMap(this.textField, o);
            if (typeof text == "string") {
                text = text.toUpperCase();
                key = key.toUpperCase();
                if (text.indexOf(key) != -1) {
                    view.push(o);
                }
            }
        }
        this._listbox.setData(view);
        this._filtered = true;
        if (key !== "" || this.isShowPopup()) {
            this.showPopup();

            //获取第一条，并focus
            //index = this._listbox.getCount() - 1;
            var index = 0;
            //if(this.getText() == "美") debugger
            if (this._listbox.getShowNullItem()) index = 1;
            var me = this;
            //setTimeout(function () {
            me._listbox._focusItem(index, true);
            //}, 10);
        }
    },
    __OnPopupHide: function (e) {
        if (this._filtered) {
            this._filtered = false;
            if (this._listbox.el) {
                this._listbox.setData(this.data);
            }
        }
        this.__doFocusCls();
        this.fire("hidepopup");
    },
    //    hidePopup: function () {
    //        var popup = this.getPopup();
    //        popup.close();

    //    },
    findItems: function (value) {
        return this._listbox.findItems(value);
    },
    __OnInputTextChanged: function (e) {
        if (this.isShowPopup()) return;
        if (this.multiSelect == false) {

            var text = this._textEl.value;
            //valueFromSelect

            //根据text找，必须全部匹配，自动选择
            var data = this.getData();
            var selected = null;
            for (var i = 0, l = data.length; i < l; i++) {
                var item = data[i];
                var itemText = item[this.textField];
                if (itemText == text) {
                    selected = item;
                    break;
                }
            }
            if (selected) {
                this._listbox.setValue(selected ? selected[this.valueField] : "");

                var v = this._listbox.getValue();
                var vts = this._listbox.getValueAndText(v);

                var value = this.getValue();

                this.setValue(v);
                this.setText(vts[1]);
            } else {
                if (this.valueFromSelect) {
                    this.setValue("");
                    this.setText("");
                } else {
                    this.setValue(text);
                    this.setText(text);
                }
            }
            if (value != this.getValue()) {
                var sf = this;
                //setTimeout(function () {
                sf._OnValueChanged();
                //}, 1);
            }


        }
        //}

        //        if (this.multiSelect) {
        //        } else {
        //            if (this._textEl.value == "" && !this.value) {
        //                this.setValue("");
        //                this._OnValueChanged();
        //            }
        //            //            var _value = this.value;
        //            //            var vts = this._listbox.getValueAndText(this.value);
        //            //            if (this._textEl.value != vts[1]) {
        //            //                this.setValue("");
        //            //            }
        //            //            if (_value != this.value) {
        //            //                this._OnValueChanged();
        //            //            }
        //        }
    },
    setAjaxData: function (value) {
        this.ajaxData = value;
        this._listbox.setAjaxData(value);
    },
    setAjaxType: function (value) {
        this.ajaxType = value;
        this._listbox.setAjaxType(value);
    },
    ////////////////////////////////////
    getAttrs: function (el) {

        var attrs = mini.ComboBox.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["url", "data", "textField", "valueField", "displayField", "nullItemText",
            "ondrawcell", "onbeforeload", "onload", "onloaderror", "onitemclick", "onbeforeitemclick"
             ]
        );
        mini._ParseBool(el, attrs,
            ["multiSelect", "showNullItem", "valueFromSelect"
             ]
        );

        if (attrs.displayField) attrs.textField = attrs.displayField;

        var valueField = attrs.valueField || this.valueField;
        var textField = attrs.textField || this.textField;
        if (el.nodeName.toLowerCase() == "select") {

            var data = [];
            for (var i = 0, l = el.length; i < l; i++) {
                var op = el.options[i];
                var o = {};
                o[textField] = op.text;
                o[valueField] = op.value;

                data.push(o);
            }
            if (data.length > 0) {
                attrs.data = data;
            }
        } else {
            var cs = mini.getChildNodes(el);
            for (var i = 0, l = cs.length; i < l; i++) {
                var node = cs[i];
                var property = jQuery(node).attr("property");
                if (!property) continue;
                property = property.toLowerCase();
                if (property == "columns") {
                    attrs.columns = mini._ParseColumns(node);
                } else if (property == "data") {
                    attrs.data = node.innerHTML;
                }
            }
        }

        return attrs;
    }
});
mini.regClass(mini.ComboBox, 'combobox');