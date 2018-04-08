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



/*
1.当setValue,setText的时候，自动生成data，然后刷新refresh
2.界面操作：
删除
增加
都从DOM级别修改
3.导航
4.输入下拉        
*/

mini.TextBoxList = function () {
    mini.TextBoxList.superclass.constructor.call(this);

    this.data = [];
    this.doUpdate();

    //this._createPopup();
}
mini.extend(mini.TextBoxList, mini.ValidatorBase, {
    formField: true,

    value: "",
    text: "",
    valueField: "id",
    textField: "text",
    data: "",

    url: "",
    delay: 150,

    allowInput: true,

    editIndex: 0,

    _focusCls: "mini-textboxlist-focus",
    _itemHoverClass: "mini-textboxlist-item-hover",
    _itemSelectedClass: "mini-textboxlist-item-selected",
    _closeHoverClass: "mini-textboxlist-close-hover",

    textName: "",
    setTextName: function (value) {
        this.textName = value;
        //if (this._textEl) mini.setAttr(this._textEl, "name", this.textName);
    },
    getTextName: function () {
        return this.textName;
    },

    ////////////////////////////////////////////
    uiCls: "mini-textboxlist",
    _create: function () {

        var html = '<table class="mini-textboxlist" cellpadding="0" cellspacing="0"><tr ><td class="mini-textboxlist-border"><ul></ul><a href="#"></a><input type="hidden"/></td></tr></table>';
        var d = document.createElement("div");
        d.innerHTML = html;
        this.el = d.firstChild;

        var td = this.el.getElementsByTagName("td")[0];
        this.ulEl = td.firstChild;
        this._valueEl = td.lastChild;
        this.focusEl = td.childNodes[1];
    },
    destroy: function (removeEl) {
        if (this.isShowPopup) {
            this.hidePopup();
        }
        mini.un(document, "mousedown", this.__OnDocMouseDown, this);
        mini.TextBoxList.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini.TextBoxList.superclass._initEvents.call(this);

        mini.on(this.el, "mousemove", this.__OnMouseMove, this);
        mini.on(this.el, "mouseout", this.__OnMouseOut, this);
        mini.on(this.el, "mousedown", this.__OnMouseDown, this);
        mini.on(this.el, "click", this.__OnClick, this);
        mini.on(this.el, "keydown", this.__OnKeyDown, this);

        mini.on(document, "mousedown", this.__OnDocMouseDown, this);
    },
    __OnDocMouseDown: function (e) {
        if (this.isReadOnly()) return;
        if (this.isShowPopup) {
            if (!mini.isAncestor(this.popup.el, e.target)) {
                this.hidePopup();
            }
        }
        if (this._focused) {
            if (this.within(e) == false) {
                this.select(null, false);
                this.showInput(false);

                this.removeCls(this._focusCls);
                this._focused = false;
            }

        }
    },
    ///////////////////////////////////////////////
    errorIconEl: null,
    getErrorIconEl: function () {
        if (!this._errorIconEl) {
            var tr = this.el.rows[0];
            var td = tr.insertCell(1);
            td.style.cssText = 'width:18px;vertical-align:top;';
            td.innerHTML = '<div class="mini-errorIcon"></div>';
            this._errorIconEl = td.firstChild;
        }
        return this._errorIconEl;
    },
    _RemoveErrorIcon: function () {
        if (this._errorIconEl) {
            jQuery(this._errorIconEl.parentNode).remove();
        }
        this._errorIconEl = null;
    },
    ///////////////////////////////////////////////
    doLayout: function () {
        if (this.canLayout() == false) return;
        mini.TextBoxList.superclass.doLayout.call(this);

        if (this.isReadOnly() || this.allowInput == false) {
            this._inputEl.readOnly = true;
        } else {
            this._inputEl.readOnly = false;
        }
    },
    doUpdate: function () {
        if (this._ValueChangeTimer) clearInterval(this._ValueChangeTimer);
        if (this._inputEl) mini.un(this._inputEl, "keydown", this.__OnInputKeyDown, this);

        var sb = [];
        var id = this.uid;
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            var li_id = id + "$text$" + i;
            var text = mini._getMap(this.textField, o); //o[this.textField];
            if (mini.isNull(text)) text = "";
            sb[sb.length] = '<li id="' + li_id + '" class="mini-textboxlist-item">';
            sb[sb.length] = text;
            sb[sb.length] = '<span class="mini-textboxlist-close"></span></li>';
        }
        var inputid = id + "$input";
        sb[sb.length] = '<li id="' + inputid + '" class="mini-textboxlist-inputLi"><input class="mini-textboxlist-input" type="text" autocomplete="off"></li>';

        this.ulEl.innerHTML = sb.join("");

        this.editIndex = this.data.length;
        if (this.editIndex < 0) this.editIndex = 0;

        this.inputLi = this.ulEl.lastChild;
        this._inputEl = this.inputLi.firstChild;

        mini.on(this._inputEl, "keydown", this.__OnInputKeyDown, this);

        var sf = this;
        this._inputEl.onkeyup = function () {
            sf._syncInputSize();
        }

        sf._ValueChangeTimer = null;
        sf._LastInputText = sf._inputEl.value;
        this._inputEl.onfocus = function () {
            sf._ValueChangeTimer = setInterval(function () {
                //document.title = new Date().getTime();

                if (sf._LastInputText != sf._inputEl.value) {
                    sf._startQuery();
                    sf._LastInputText = sf._inputEl.value;
                }
            }, 10);

            sf.addCls(sf._focusCls);
            sf._focused = true;

            sf.fire("focus");
        }
        this._inputEl.onblur = function () {
            clearInterval(sf._ValueChangeTimer);

            sf.fire("blur");
        }

        //        var inputEvent = "input";
        //        if (isIE) inputEvent = "propertychange";
        //        mini.on(this._inputEl, inputEvent, this.__OnInputTextChange, this);

        //this.select(this._selected);
    },
    getItemByEvent: function (event) {
        var domItem = mini.findParent(event.target, "mini-textboxlist-item");
        if (domItem) {
            var ids = domItem.id.split("$");
            var id = ids[ids.length - 1];
            return this.data[id];
        }
    },
    getItem: function (id) {
        if (typeof id == "number") return this.data[id];
        if (typeof id == "object") return id;
        //        for (var i = 0, l = this.data.length; i < l; i++) {
        //            var o = this.data[i];
        //            if (o._id == id) return o;
        //        }
    },
    getItemEl: function (o) {
        var index = this.data.indexOf(o);
        var li_id = this.uid + "$text$" + index;
        return document.getElementById(li_id);
    },
    hoverItem: function (item, e) {
        if (this.isReadOnly() || this.enabled == false) return;
        this.blurItem();
        var li = this.getItemEl(item);
        mini.addClass(li, this._itemHoverClass);

        if (e && mini.hasClass(e.target, "mini-textboxlist-close")) {
            mini.addClass(e.target, this._closeHoverClass);
        }
    },
    blurItem: function () {
        var len = this.data.length;
        for (var i = 0, l = len; i < l; i++) {
            var o = this.data[i];

            var li = this.getItemEl(o);
            if (li) {
                mini.removeClass(li, this._itemHoverClass);

                mini.removeClass(li.lastChild, this._closeHoverClass);
            }
        }
    },
    showInput: function (index) {
        this.select(null);

        if (mini.isNumber(index)) {
            this.editIndex = index;
        } else {
            this.editIndex = this.data.length;
        }
        if (this.editIndex < 0) this.editIndex = 0;
        if (this.editIndex > this.data.length) this.editIndex = this.data.length;

        var inputLi = this.inputLi;
        inputLi.style.display = "block";

        if (mini.isNumber(index) && index < this.data.length) {
            var item = this.data[index];
            var itemEl = this.getItemEl(item);
            jQuery(itemEl).before(inputLi);
        } else {
            this.ulEl.appendChild(inputLi);
        }
        if (index !== false) {
            setTimeout(function () {
                try {

                    inputLi.firstChild.focus();
                    mini.selectRange(inputLi.firstChild, 100);
                } catch (e) {
                }
            }, 10);
        } else {
            this.lastInputText = "";
            this._inputEl.value = "";
        }
        return inputLi;
    },
    select: function (item) {
        item = this.getItem(item);
        if (this._selected) {
            var itemEl = this.getItemEl(this._selected);
            mini.removeClass(itemEl, this._itemSelectedClass);
        }
        this._selected = item;

        if (this._selected) {
            var itemEl = this.getItemEl(this._selected);
            mini.addClass(itemEl, this._itemSelectedClass);
        }

        var sf = this;

        if (this._selected) {
            this.focusEl.focus();
            var me = this;
            setTimeout(function () {
                try {
                    me.focusEl.focus();
                } catch (ex) { }
            }, 50);
        }

        if (this._selected) {
            sf.addCls(sf._focusCls);
            sf._focused = true;
        }
    },
    ////////////////////////////////////////
    _doInsertSelectValue: function () {

        var item = this._listbox.getSelected();
        var index = this.editIndex;

        if (item) {

            item = mini.clone(item);

            this.insertItem(index, item);
        }
    },
    insertItem: function (index, item) {
        this.data.insert(index, item);
        var text = this.getText();
        var value = this.getValue();

        this.setValue(value, false);
        this.setText(text, false);

        this._createData();

        this.doUpdate();

        this.showInput(index + 1);

        this._OnValueChanged();
    },
    removeItem: function (item) {
        if (!item) return;
        var itemEl = this.getItemEl(item);
        mini.removeNode(itemEl);

        this.data.remove(item);

        var text = this.getText();
        var value = this.getValue();


        this.setValue(value, false);
        this.setText(text, false);

        this._OnValueChanged();
    },
    _createData: function () {
        var texts = (this.text ? this.text : "").split(",");
        var values = (this.value ? this.value : "").split(",");

        if (values[0] == "") values = [];
        var len = values.length;
        this.data.length = len;

        for (var i = 0, l = len; i < l; i++) {
            var o = this.data[i];
            if (!o) {
                o = {};
                this.data[i] = o;
            }

            //if (!o._id) o._id = this.itemID++;

            var text = !mini.isNull(texts[i]) ? texts[i] : "";
            var value = !mini.isNull(values[i]) ? values[i] : "";

            mini._setMap(this.textField, text, o);
            mini._setMap(this.valueField, value, o);
        }

        this.value = this.getValue();
        this.text = this.getText();
    },
    getInputText: function () {
        return this._inputEl ? this._inputEl.value : "";
    },
    getText: function () {
        var sb = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            var name = mini._getMap(this.textField, o);
            if (mini.isNull(name)) name = "";
            name = name.replace(",", "，");
            sb.push(name);
        }
        return sb.join(",");
    },
    getValue: function () {
        var sb = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            var v = mini._getMap(this.valueField, o);
            sb.push(v);
        }
        return sb.join(",")
    },
    ///////////////////////////////
    setName: function (value) {
        if (this.name != value) {
            this.name = value;
            this._valueEl.name = value;
        }
    },
    setValue: function (value) {

        if (mini.isNull(value)) value = "";

        if (this.value != value) {
            this.value = value;
            this._valueEl.value = value;
            this._createData();
            this.doUpdate();
        }
    },
    setText: function (value) {
        if (mini.isNull(value)) value = "";        
        if (this.text !== value) {
            this.text = value;
            this._createData();
            this.doUpdate();
        }
    },
    setValueField: function (value) {
        this.valueField = value;
        this._createData();
    },
    getValueField: function () {
        return this.valueField;
    },
    setTextField: function (value) {
        this.textField = value;
        this._createData();
    },
    getTextField: function () {
        return this.textField;
    },
    setAllowInput: function (value) {
        this.allowInput = value;
        this.doLayout();
    },
    getAllowInput: function () {
        return this.allowInput;
    },
    setUrl: function (value) {
        this.url = value;
    },
    getUrl: function () {
        return this.url;
    },
    setPopupHeight: function (value) {
        this.popupHeight = value;
    },
    getPopupHeight: function () {
        return this.popupHeight;
    },
    setPopupMinHeight: function (value) {
        this.popupMinHeight = value;
    },
    getPopupMinHeight: function () {
        return this.popupMinHeight;
    },
    setPopupMaxHeight: function (value) {
        this.popupMaxHeight = value;
    },
    getPopupMaxHeight: function () {
        return this.popupMaxHeight;
    },
    ////////////////////////////////////////////////    
    doQuery: function () {
        this._startQuery(true);
    },
    //文本框宽度调整
    _syncInputSize: function () {
        if (this.isDisplay() == false) return;
        var text = this.getInputText();
        var size = mini.measureText(this._inputEl, text);
        var width = size.width > 20 ? size.width + 4 : 20;
        var elWidth = mini.getWidth(this.el, true);
        if (width > elWidth - 15) width = elWidth - 15;
        this._inputEl.style.width = width + "px";
    },
    _startQuery: function (oldText) {
        var sf = this;



        setTimeout(function () {
            sf._syncInputSize();
        }, 1);

        this.showPopup("loading");

        this._stopQuery();

        this._loading = true;

        this.delayTimer = setTimeout(function () {
            var text = sf._inputEl.value;

            //if (oldText === true || text != oldText) {
            sf._doQuery();
            //}
        }, this.delay);
    },
    ajaxDataType: "text",
    ajaxContentType: "application/x-www-form-urlencoded; charset=UTF-8",
    _doQuery: function () {
        if (this.isDisplay() == false) return;
        var text = this.getInputText();

        var sf = this;
        var dataSource = this._listbox.getData();
        var params = {
            //key: text,
            value: this.getValue(),
            text: this.getText()
        };
        params[this.searchField] = text;

        var url = this.url;
        var fn = typeof url == "function" ? url : window[url];
        if (typeof fn == "function") {
            url = fn(this);
        }
        if (!url) return;

        var ajaxMethod = "post";
        if (url) {
            if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
                ajaxMethod = "get";
            }
        }

        var e = {
            url: url,
            async: true,
            params: params,
            data: params,
            type: this.ajaxType ? this.ajaxType : ajaxMethod,
            cache: false,
            cancel: false
        };

        this.fire("beforeload", e);
        if (e.cancel) return;

        var me = this;
        mini.copyTo(e, {
            success: function (text) {
                var data = mini.decode(text);

                if (mini.isNumber(data.error) && data.error != 0) {
                    var ex = {};
                    ex.stackTrace = data.stackTrace;
                    ex.errorMsg = data.errorMsg;
                    if (mini_debugger == true) {
                        alert(url + "\n" + ex.textStatus + "\n" + ex.stackTrace);
                    }
                    return;
                }

                if (me.dataField) {
                    data = mini._getMap(me.dataField, data);
                }
                if (!data) data = [];


                sf._listbox.setData(data);
                sf.showPopup();
                sf._listbox._focusItem(0, true);
                sf.fire("load");
                sf._loading = false;

                if (sf._selectOnLoad) {
                    sf.__doSelectValue();
                    sf._selectOnLoad = null;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                sf.showPopup("error");
            }
        });

        sf._ajaxer = mini.ajax(e);
    },
    _stopQuery: function () {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
        if (this._ajaxer) {
            this._ajaxer.abort();
        }
        this._loading = false;
    },

    ////////////////////////////////////////////////
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this.showPopup && this.popup && this.popup.within(e)) return true;
        return false;
    },

    popupLoadingText: "<span class='mini-textboxlist-popup-loading'>Loading...</span>",
    popupErrorText: "<span class='mini-textboxlist-popup-error'>Error</span>",
    popupEmptyText: "<span class='mini-textboxlist-popup-noresult'>No Result</span>",

    isShowPopup: false,
    popupHeight: "",
    popupMinHeight: 30,
    popupMaxHeight: 150,
    _createPopup: function () {
        if (!this.popup) {
            this.popup = new mini.ListBox();
            this.popup.addCls("mini-textboxlist-popup");
            this.popup.setStyle("position:absolute;left:0;top:0;");
            this.popup.showEmpty = true;
            this.popup.setValueField(this.valueField);
            this.popup.setTextField(this.textField);
            this.popup.render(document.body);

            this.popup.on("itemclick", function (e) {
                this.hidePopup();
                this._doInsertSelectValue();
            }, this);
        }
        this._listbox = this.popup;
        return this.popup;
    },
    showPopup: function (action) {
        if (this.isDisplay() == false) return;
        this.isShowPopup = true;

        var popup = this._createPopup();

        popup.el.style.zIndex = mini.getMaxZIndex();
        var control = this._listbox;
        control.emptyText = this.popupEmptyText;

        //action = "loading";
        if (action == "loading") {
            control.emptyText = this.popupLoadingText;
            this._listbox.setData([]);
        } else if (action == "error") {
            control.emptyText = this.popupLoadingText;
            this._listbox.setData([]);
        }
        this._listbox.doUpdate();

        var box = this.getBox();
        var x = box.x, y = box.y + box.height;

        this.popup.el.style.display = "block";
        mini.setXY(popup.el, -1000, -1000);
        this.popup.setWidth(box.width);

        this.popup.setHeight(this.popupHeight);

        if (this.popup.getHeight() < this.popupMinHeight) {
            this.popup.setHeight(this.popupMinHeight);
        }
        if (this.popup.getHeight() > this.popupMaxHeight) {
            this.popup.setHeight(this.popupMaxHeight);
        }
        mini.setXY(popup.el, x, y);

    },
    hidePopup: function () {
        this.isShowPopup = false;
        if (this.popup) this.popup.el.style.display = "none";
    },
    ////////////////////////////////////////////////
    __OnMouseMove: function (e) {
        if (this.enabled == false) return;
        var item = this.getItemByEvent(e);
        if (!item) {
            this.blurItem();
            return;
        }
        this.hoverItem(item, e);
    },
    __OnMouseOut: function (e) {
        this.blurItem();
    },
    __OnClick: function (e) {
        if (this.isReadOnly() || this.enabled == false) return;
        if (this.enabled == false) return;
        //if (this.isReadOnly()) return;

        var item = this.getItemByEvent(e);
        if (!item) {
            if (mini.findParent(e.target, "mini-textboxlist-input")) {

            } else {
                this.showInput();
            }
            return;
        }
        this.focusEl.focus();
        this.select(item);

        if (e && mini.hasClass(e.target, "mini-textboxlist-close")) {
            this.removeItem(item);
        }
    },
    __OnKeyDown: function (e) {

        if (this.isReadOnly() || this.allowInput == false) return false;

        var index = this.data.indexOf(this._selected);

        var sf = this;
        function remove() {
            var item = sf.data[index];
            sf.removeItem(item);

            item = sf.data[index];
            if (!item) item = sf.data[index - 1];
            sf.select(item);
            if (!item) {
                sf.showInput();
            }
        }

        switch (e.keyCode) {
            case 8:     //backspace

                e.preventDefault();
                remove();
                break;
            case 37:    //left
            case 38:    //top      
                this.select(null);
                this.showInput(index);

                break;
            case 39:    //right
            case 40:    //bottom
                index += 1;
                this.select(null);
                this.showInput(index);

                break;
            case 46:    //del
                remove();
                break;
        }
    },
    __doSelectValue: function () {
        var item = this._listbox.getFocusedItem();
        if (item) {
            this._listbox.setSelected(item);
        }

        //this._doSetValue();
        //                    var text = this._getValueAndText(this.value)[1];
        //                    this.setText(text, true);

        this.lastInputText = this.text;
        this.hidePopup();

        this._doInsertSelectValue();
    },
    __OnInputKeyDown: function (e) {

        this._selectOnLoad = null;

        if (this.isReadOnly() || this.allowInput == false) return false;

        e.stopPropagation();

        if (this.isReadOnly() || this.allowInput == false) return;

        var range = mini.getSelectRange(this._inputEl);
        var start = range[0], end = range[1], textLen = this._inputEl.value.length;
        var isFirst = start == end && start == 0;
        var isLast = start == end && end == textLen;


        if (this.isReadOnly() || this.allowInput == false) { //bacjsoace
            e.preventDefault();
        }
        if (e.keyCode == 9) {   //tab            
            this.hidePopup();
            return;
        }
        if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18) return;

        switch (e.keyCode) {

            case 13:    //enter

                if (this.isShowPopup) {
                    e.preventDefault();

                    //是否交互中？                    
                    if (this._loading) {
                        this._selectOnLoad = true;
                        return;
                    }

                    //选中
                    this.__doSelectValue();

                }
                break;
            case 27:    //esc
                e.preventDefault();
                this.hidePopup();
                break;
            case 8:    //backspace

                if (isFirst) {
                    e.preventDefault();
                }
            case 37:    //left
                if (isFirst) {
                    if (this.isShowPopup) {
                        this.hidePopup();
                    } else {
                        if (this.editIndex > 0) {
                            var index = this.editIndex - 1;
                            if (index < 0) index = 0;
                            if (index >= this.data.length) index = this.data.length - 1;

                            this.showInput(false);
                            this.select(index);
                        }
                    }
                }
                break;
            case 39:    //right
                if (isLast) {
                    if (this.isShowPopup) {
                        this.hidePopup();
                    } else {
                        if (this.editIndex <= this.data.length - 1) {

                            var index = this.editIndex;
                            //                        if (index < 0) index = 0;
                            //                        if (index >= this.data.length) index = this.data.length - 1;
                            this.showInput(false);
                            this.select(index);

                        }
                    }
                }
                break;
            case 38: //top
                e.preventDefault();
                if (this.isShowPopup) {
                    var index = -1;
                    var item = this._listbox.getFocusedItem();
                    if (item) index = this._listbox.indexOf(item);
                    index--;
                    if (index < 0) index = 0;
                    this._listbox._focusItem(index, true);

                    //his._doSetValue();
                }
                break;
            case 40: //bottom

                e.preventDefault();
                if (this.isShowPopup) {
                    var index = -1;
                    var item = this._listbox.getFocusedItem();
                    if (item) index = this._listbox.indexOf(item);
                    index++
                    if (index < 0) index = 0;
                    if (index >= this._listbox.getCount()) index = this._listbox.getCount() - 1;
                    this._listbox._focusItem(index, true);

                    //this._doSetValue();
                } else {
                    this._startQuery(true);
                }
                break;
            default:
                //this._startQuery(this._inputEl.value);
                break;
        }
    },
    ////////////////////////////////////////////////
    focus: function () {

        try {
            this._inputEl.focus();
        } catch (e) {
        }
    },
    blur: function () {
        try {
            this._inputEl.blur();
        } catch (e) {
        }
    },
    searchField: "key",
    setSearchField: function (value) {
        this.searchField = value;
    },
    getSearchField: function () {
        return this.searchField;
    },
    getAttrs: function (el) {
        var attrs = mini.TextBox.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["value", "text", "valueField", "textField", "url", "popupHeight",
            "textName", "onfocus", "onbeforeload", "onload", "searchField"
             ]
        );
        mini._ParseBool(el, attrs,
            ["allowInput"
             ]
        );

        mini._ParseInt(el, attrs,
            ["popupMinHeight", "popupMaxHeight"
             ]
        );
        return attrs;
    }

});

mini.regClass(mini.TextBoxList, "textboxlist");