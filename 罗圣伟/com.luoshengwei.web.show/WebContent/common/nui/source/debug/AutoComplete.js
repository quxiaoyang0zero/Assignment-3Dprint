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

mini.AutoComplete = function () {
    mini.AutoComplete.superclass.constructor.call(this);

    //this._updateButton("popup", { visible: false });

    var sf = this;
    sf._ValueChangeTimer = null;

    this._textEl.onfocus = function () {
        //sf._NowText = sf._textEl.value;
        sf._LastInputText = sf._textEl.value;
        sf._ValueChangeTimer = setInterval(function () {
            //document.title = new Date().getTime();

            if (sf._LastInputText != sf._textEl.value) {
                //if( sf.minChars
                sf._tryQuery();
                sf._LastInputText = sf._textEl.value;

                if (sf._textEl.value == "" && sf.value != "") {
                    sf.setValue("");
                    sf._OnValueChanged();
                }
            }
        }, 10);

        //sf.addCls(sf._focusCls);
        //sf._focused = true;
    }
    this._textEl.onblur = function () {
        clearInterval(sf._ValueChangeTimer);
        if (!sf.isShowPopup()) {
            if (sf._LastInputText != sf._textEl.value) {
                //alert(1);
                if (sf._textEl.value == "" && sf.value != "") {
                    sf.setValue("");
                    sf._OnValueChanged();
                }
            }
        }
    }

    this._buttonEl.style.display = "none";

    this._doInputLayout();
}
mini.extend(mini.AutoComplete, mini.ComboBox, {
    url: "",
    allowInput: true,
    delay: 150,

    searchField: "key",

    minChars: 0,

    _buttonWidth: 0,

    uiCls: "mini-autocomplete",

    setUrl: function (value) {
        this.url = value;
    },
    setValue: function (value) {
        //if (value == "德国") alert(value);
        if (mini.isNull(value)) value = "";
        if (this.value != value) {
            this.value = value;
            this._valueEl.value = this.value;
        }
    },
    setText: function (value) {
        if (mini.isNull(value)) value = "";
        if (this.text != value) {
            this.text = value;
            this._LastInputText = value;
        }
        //fix ff
        //        var _canFire = this._canFire;
        //        this._canFire = false;
        //this._stopTextChanged = true;   //fix ff
        this._textEl.value = this.text;
        //delete this._stopTextChanged;
        //this._canFire = _canFire;
    },

    setMinChars: function (value) {
        this.minChars = value;
    },
    getMinChars: function () {
        return this.minChars;
    },
    setSearchField: function (value) {
        this.searchField = value;
    },
    getSearchField: function () {
        return this.searchField;
    },


    ////////////////////////////////
    popupLoadingText: "<span class='mini-textboxlist-popup-loading'>Loading...</span>",
    popupErrorText: "<span class='mini-textboxlist-popup-error'>Error</span>",
    popupEmptyText: "<span class='mini-textboxlist-popup-noresult'>No Result</span>",
    showPopup: function (action) {

        var popup = this.getPopup();
        var control = this._listbox;
        control.showEmpty = true;
        control.emptyText = this.popupEmptyText;
        if (action == "loading") {
            control.emptyText = this.popupLoadingText;
            this._listbox.setData([]);
        } else if (action == "error") {
            control.emptyText = this.popupLoadingText;
            this._listbox.setData([]);
        }
        this._listbox.doUpdate();

        mini.AutoComplete.superclass.showPopup.call(this);


    },
    ///////////////////////////////
    //    __OnInputKeyUp: function (e) {
    //        this.__OnInputKeyDown(e);
    //    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 9) {   //tab
            this.hidePopup();
            return;
        }

        if (this.isReadOnly()) return;

        switch (e.keyCode) {
            case 27:        //esc
                if (this.isShowPopup()) {
                    e.stopPropagation();
                }

                this.hidePopup();
                break;
            case 13:     //enter      

                if (this.isShowPopup()) {
                    e.preventDefault();
                    e.stopPropagation();

                    var index = this._listbox.getFocusedIndex();

                    if (index != -1) {
                        var item = this._listbox.getAt(index);
                        var vts = this._listbox.getValueAndText([item]);
                        var value = vts[0];

                        this.setText(vts[1]);
                        //                        if (mini.isFirefox) {   //FF下修改textEl.value，会激发changed...
                        //                            this.blur();
                        //                            this.focus();
                        //                        }

                        this.setValue(value);

                        this._OnValueChanged();

                        this.hidePopup();
                        this.focus();
                        //alert(this.getValue());
                    }
                } else {
                    this.fire("enter", ex);
                }
                break;
            case 37:    //left
                break;
            case 38:    //top      
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

                var index = this._listbox.getFocusedIndex();
                if (this.isShowPopup()) {
                    if (!this.multiSelect) {
                        index += 1;
                        if (index > this._listbox.getCount() - 1) index = this._listbox.getCount() - 1;
                        this._listbox._focusItem(index, true);
                    }
                } else {
                    this._tryQuery(this._textEl.value);
                }
                break;
            default:
                this._tryQuery(this._textEl.value);
                break;
        }
    },
    doQuery: function () {
        this._tryQuery();
    },
    _tryQuery: function (oldText) {
        var sf = this;
        if (this._queryTimer) {
            clearTimeout(this._queryTimer);
            this._queryTimer = null;
        }
        this._queryTimer = setTimeout(function () {
            var text = sf._textEl.value;
            //if (text != oldText) {
            sf._doQuery(text);
            //document.title = new Date();
            //}
        }, this.delay);
        this.showPopup("loading");
    },

    _doQuery: function (key) {
        if (!this.url) return;
        if (this._ajaxer) {
            this._ajaxer.abort();
        }

        var url = this.url;
        var ajaxMethod = "post";
        if (url) {
            if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
                ajaxMethod = "get";
            }
        }

        var params = {};
        params[this.searchField] = key;

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
                try {
                    var data = mini.decode(text);
                } catch (ex) {
                    throw new Error("autocomplete json is error");
                }
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

                me._listbox.setData(data);
                me.showPopup();
                me._listbox._focusItem(0, true);
                me.data = data;
                me.fire("load", { data: data });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                me.showPopup("error");
            }
        });

        this._ajaxer = mini.ajax(e);
    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.AutoComplete.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["searchField"]
        );

        return attrs;
    }
});

mini.regClass(mini.AutoComplete, "autocomplete");