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

mini.ButtonEdit = function () {
    
    mini.ButtonEdit.superclass.constructor.call(this);
    //this.addCls("mini-buttonedit");

    var isReadOnly = this.isReadOnly();
    if (isReadOnly || this.allowInput == false) {
        this._textEl.readOnly = true;
    }
    if (this.enabled == false) {
        this.addCls(this._disabledCls);
    }
    if (isReadOnly) {
        this.addCls(this._readOnlyCls);
    }
    if (this.required) {
        this.addCls(this._requiredCls);
    }
}
mini.extend(mini.ButtonEdit, mini.ValidatorBase, {
    name: "",
    formField: true,

    selectOnFocus: false,

    showClose: false,

    emptyText: "",

    defaultValue: "",
    defaultText: "",
    value: "",
    text: "",

    maxLength: 1000,
    minLength: 0,

    //width: 125,
    height: 21,

    inputAsValue: false,    //输入内容作为value

    allowInput: true,   //区别于readOnly
    _noInputCls: "mini-buttonedit-noInput",
    _readOnlyCls: "mini-buttonedit-readOnly",
    _disabledCls: "mini-buttonedit-disabled",

    _emptyCls: "mini-buttonedit-empty",
    _focusCls: "mini-buttonedit-focus",

    //_buttonDisabledCls: "mini-buttonedit-button-disabled",
    _buttonCls: "mini-buttonedit-button",
    _buttonHoverCls: "mini-buttonedit-button-hover",
    _buttonPressedCls: "mini-buttonedit-button-pressed",

    _closeCls: "mini-buttonedit-close",

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;
        var text = kv.text;
        delete kv.text;

        this._allowUpdate = !(kv.enabled == false || kv.allowInput == false || kv.readOnly);

        mini.ButtonEdit.superclass.set.call(this, kv);

        if (this._allowUpdate === false) {
            this._allowUpdate = true;
            this.doUpdate();
        }

        if (!mini.isNull(text)) {
            this.setText(text);
        }
        if (!mini.isNull(value)) {
            this.setValue(value);
        }
        return this;
    },
    uiCls: "mini-buttonedit",
    _getButtonsHTML: function () {
        var s = '<span class="mini-buttonedit-close"></span>' + this._getButtonHtml();
        return '<span class="mini-buttonedit-buttons">' + s + '</span>';
    },
    _getButtonHtml: function () {
        var hover = 'onmouseover="mini.addClass(this, \'' + this._buttonHoverCls + '\');" '
                        + 'onmouseout="mini.removeClass(this, \'' + this._buttonHoverCls + '\');"';
        return '<span class="mini-buttonedit-button" ' + hover + '><span class="mini-buttonedit-icon"></span></span>';
    },
    _create: function () {
        this.el = document.createElement("span");
        this.el.className = "mini-buttonedit";

        var s = this._getButtonsHTML();
        this.el.innerHTML = '<span class="mini-buttonedit-border"><input type="input" class="mini-buttonedit-input" autocomplete="off"/>'
                            + s + '</span><input name="' + this.name + '" type="hidden"/>'

        this._borderEl = this.el.firstChild;
        this._textEl = this._borderEl.firstChild;
        this._valueEl = this.el.lastChild;

        this._buttonsEl = this._borderEl.lastChild;
        this._buttonEl = this._buttonsEl.lastChild;
        this._closeEl = this._buttonEl.previousSibling;

        this._doEmpty();
    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmousedown = null;
            this.el.onmousewheel = null;
            this.el.onmouseover = null;
            this.el.onmouseout = null;
        }
        if (this._textEl) {
            this._textEl.onchange = null;
            this._textEl.onfocus = null;

            mini.clearEvent(this._textEl);
            //jQuery(this._textEl).remove();
            this._textEl = null;
        }
        mini.ButtonEdit.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);
            mini_onOne(this._textEl, "focus", this.__OnFocus, this);
            mini_onOne(this._textEl, "change", this.__OnInputTextChanged, this);

            //            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            //            mini.on(this._textEl, "focus", this.__OnFocus, this);
            //            mini.on(this._textEl, "change", this.__OnInputTextChanged, this);

            var v = this.text;
            this.text = null;
            this.setText(v);

        }, this);

    },
    _inputEventsInited: false,
    _initInputEvents: function () {
        if (this._inputEventsInited) return;
        this._inputEventsInited = true;

        mini.on(this.el, "click", this.__OnClick, this);
        mini.on(this._textEl, "blur", this.__OnBlur, this);
        mini.on(this._textEl, "keydown", this.__OnInputKeyDown, this);
        mini.on(this._textEl, "keyup", this.__OnInputKeyUp, this);
        mini.on(this._textEl, "keypress", this.__OnInputKeyPress, this);
    },
    _buttonWidth: 20,
    _closeWidth: 20,
    _doInputLayout: function (doLayout) {

        if (this._closeEl) {
            this._closeEl.style.display = this.showClose ? "inline-block" : "none";
        }
        var w = this._buttonsEl.offsetWidth + 2;
        if (w == 2) {
            this._noLayout = true;
        } else {
            this._noLayout = false;
        }
        this._borderEl.style["paddingRight"] = w + "px";
        if (doLayout !== false) {
            this.doLayout();
        }
    },
    doLayout: function () {
        if (this._noLayout) {
            this._doInputLayout(false);
        }
    },
    setHeight: function (value) {
        if (parseInt(value) == value) value += "px";
        this.height = value;

    },
    focus: function () {
        try {
            this._textEl.focus();
            var sf = this;
            setTimeout(function () {
                if (sf._focused) {
                    sf._textEl.focus();
                }
                //sf._doEmpty();
            }, 10);
        } catch (e) {
        }
    },
    blur: function () {
        try {
            this._textEl.blur();
            //sf._doEmpty();
        } catch (e) {
        }
    },
    selectText: function () {
        this._textEl.select();
    },

    getTextEl: function () {
        return this._textEl;
    },
    setName: function (value) {
        this.name = value;
        //this._valueEl.name = value;
        if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
    },
    setText: function (value) {

        if (value === null || value === undefined) value = "";
        var fire = this.text !== value;
        this.text = value;
        this._textEl.value = value;

        this._doEmpty();
    },
    getText: function () {
        var text = this._textEl.value;
        return text;
        //return text != this.emptyText ? text : "";
    },
    //value是类型值，formattedValue是字符串
    setValue: function (value) {
        if (value === null || value === undefined) value = "";
        var fire = this.value !== value;
        this.value = value;
        this._valueEl.value = this.getFormValue();
        //this._doEmpty();
    },
    getValue: function () {
        return this.value;
    },
    getFormValue: function () {
        var value = this.value;
        if (value === null || value === undefined) value = "";
        return String(value);
    },

    _doEmpty: function () {
        this._textEl.placeholder = this.emptyText;
        if (this.emptyText) {
            mini._placeholder(this._textEl);
        }
        //        mini.removeClass(this.el, this._emptyCls);
        //        if (this._focused) {
        //            if (this._textEl.value == this.emptyText) {
        //                this._textEl.value = "";
        //            }
        //        } else {
        //            if (this._textEl.value == "") {
        //                this._textEl.value = this.emptyText;
        //                mini.addClass(this.el, this._emptyCls);
        //            }
        //        }
    },
    setEmptyText: function (value) {
        if (this.emptyText != value) {
            this.emptyText = value;
            this._doEmpty();
        }
    },
    getEmptyText: function () {
        return this.emptyText;
    },

    setMaxLength: function (value) {
        value = parseInt(value);
        if (isNaN(value)) return;
        this.maxLength = value;
        this._textEl.maxLength = value;
    },
    getMaxLength: function () {
        return this.maxLength;
    },
    setMinLength: function (value) {
        value = parseInt(value);
        if (isNaN(value)) return;
        this.minLength = value;
    },
    getMinLength: function () {
        return this.minLength;
    },
    setEnabled: function (value) {
        mini.ButtonEdit.superclass.setEnabled.call(this, value);

        this._tryValidate();
    },
    _doReadOnly: function () {
        var readOnly = this.isReadOnly();
        if (readOnly || this.allowInput == false) {
            this._textEl.readOnly = true;
        } else {
            this._textEl.readOnly = false;
        }
        if (readOnly) {
            this.addCls(this._readOnlyCls);
        } else {
            this.removeCls(this._readOnlyCls);
        }
        if (this.allowInput) {
            this.removeCls(this._noInputCls);
        } else {
            this.addCls(this._noInputCls);
        }

        if (this.enabled) {
            this._textEl.disabled = false;
        } else {
            this._textEl.disabled = true;
        }
    },
    setAllowInput: function (value) {
        this.allowInput = value;
        this._doReadOnly();
    },
    getAllowInput: function () {
        return this.allowInput;
    },
    setInputAsValue: function (value) {
        this.inputAsValue = value;
    },
    getInputAsValue: function () {
        return this.inputAsValue;
    },

    ////////////////////////////////////   
    //    _errorCls: "mini-buttonedit-error",
    //    _invalidCls: "mini-buttonedit-invalid", //当none时，加上_errorCls，比如红色边框，黄色背景
    _errorIconEl: null,
    getErrorIconEl: function () {
        if (!this._errorIconEl) {
            this._errorIconEl = mini.append(this.el, '<span class="mini-errorIcon"></span>');
        }
        return this._errorIconEl;
    },
    _RemoveErrorIcon: function () {
        if (this._errorIconEl) {
            var el = this._errorIconEl;
            jQuery(el).remove();
        }
        this._errorIconEl = null;
    },
    ///////////////////////////////////////////
    __OnClick: function (e) {
        if (this.isReadOnly() || this.enabled == false) return;

        if (!mini.isAncestor(this._borderEl, e.target)) return;

        var t = new Date();

        if (mini.isAncestor(this._buttonEl, e.target)) {
            this._OnButtonClick(e);
        }
        if (mini.findParent(e.target, this._closeCls)) {
            this.fire("closeclick", { htmlEvent: e });
        }

        //        t = new Date() - t;
        //        if (t > 500) {
        //            var me = this;
        //            me.blur();
        //            setTimeout(function () {
        //                me.blur();
        //            }, 10);
        //        }
        //this._doEmpty();
    },
    __OnMouseDown: function (e) {
        //this._doEmpty();
        if (this.isReadOnly() || this.enabled == false) return;

        if (!mini.isAncestor(this._borderEl, e.target)) return;

        if (!mini.isAncestor(this._textEl, e.target)) {
            this._clickTarget = e.target;
            var sf = this;
            setTimeout(function () {
                sf.focus();
                mini.selectRange(sf._textEl, 1000, 1000);
            }, 1);
            if (mini.isAncestor(this._buttonEl, e.target)) {
                var up = mini.findParent(e.target, "mini-buttonedit-up");
                var down = mini.findParent(e.target, "mini-buttonedit-down");
                if (up) {
                    mini.addClass(up, this._buttonPressedCls);
                    this._OnButtonMouseDown(e, "up");
                }
                else if (down) {
                    mini.addClass(down, this._buttonPressedCls);
                    this._OnButtonMouseDown(e, "down");
                } else {
                    mini.addClass(this._buttonEl, this._buttonPressedCls);
                    this._OnButtonMouseDown(e);
                }
                mini.on(document, "mouseup", this.__OnDocMouseUp, this);
            }
        }
    },
    __OnDocMouseUp: function (e) {
        this._clickTarget = null;
        //        var tds = this._innerEl.firstChild.rows[0].cells;
        //        var sf = this;
        //        setTimeout(function () {
        //            for (var i = 0, l = tds.length; i < l; i++) {
        //                var td = tds[i];
        //                mini.removeClass(td, sf._buttonPressedCls);
        //                var button = sf.getButton(parseInt(td.id));
        //                if (button && button.type == "spin") {
        //                    mini.removeClass(td.firstChild.firstChild, sf._buttonPressedCls);
        //                    mini.removeClass(td.firstChild.lastChild, sf._buttonPressedCls);
        //                }
        //            }
        //            mini.removeClass(sf.el, sf._pressedCls);
        //        }, 80);
        var me = this;
        setTimeout(function () {
            var doms = me._buttonEl.getElementsByTagName("*");
            for (var i = 0, l = doms.length; i < l; i++) {
                mini.removeClass(doms[i], me._buttonPressedCls);
            }
            mini.removeClass(me._buttonEl, me._buttonPressedCls);
            mini.removeClass(me.el, me._pressedCls);
        }, 80);
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
    },
    __OnFocus: function (e) {

        this.doUpdate();
        this._initInputEvents();
        if (this.isReadOnly()) return;
        //if (this.isReadOnly() || this.allowInput == false) return;
        this._focused = true;
        this.addCls(this._focusCls);

        //this._doEmpty();

        if (this.selectOnFocus) {
            this.selectText();
        }
        this.fire("focus", { htmlEvent: e });
    },
    __doFocusCls: function () {
        if (this._focused == false) {
            this.removeCls(this._focusCls);
        }
    },
    __fireBlur: function (e) {

        //if (this._clickTarget) return;
        this._focused = false;
        var sf = this;

        function f() {
            if (sf._focused == false) {
                sf.removeCls(sf._focusCls);
            }
            //this._doEmpty();
        }
        setTimeout(function () {
            f.call(sf);
        }, 2);

        this.fire("blur", { htmlEvent: e });
    },
    __OnBlur: function (e) {

        var me = this;
        setTimeout(function () {
            me.__fireBlur(e);
        }, 10);
        
        if (this.validateOnLeave) {
            this._tryValidate();
        }
    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 13 || e.keyCode == 9) {
            var sf = this;
            sf.__OnInputTextChanged(null);
            if (e.keyCode == 13) {
                var me = this;
                //setTimeout(function () {
                me.fire("enter", ex);
                //}, 10);
            }
        }
        if (e.keyCode == 27) {
            e.preventDefault();
        }
    },
    __OnInputTextChanged: function () {

        var v = this._textEl.value;
        if (v == this.text) return;
        var value = this.getValue();
        //if (this.inputAsValue) {
        this.setValue(v);
        if (value !== this.getFormValue()) {
            this._OnValueChanged();
        }
        //}
    },
    __OnInputKeyUp: function (e) {
        this.fire("keyup", { htmlEvent: e });
    },
    __OnInputKeyPress: function (e) {
        this.fire("keypress", { htmlEvent: e });
    },
    //////////////////////////////////////////// 
    _OnButtonClick: function (htmlEvent) {
        var e = {
            htmlEvent: htmlEvent,
            cancel: false
        };
        this.fire("beforebuttonclick", e);
        if (e.cancel == true) return;

        this.fire("buttonclick", e);
    },
    _OnButtonMouseDown: function (htmlEvent, spinType) {
        this.focus();
        this.addCls(this._focusCls);

        this.fire("buttonmousedown", {
            htmlEvent: htmlEvent,
            spinType: spinType
        });
    },

    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },
    onButtonMouseDown: function (fn, scope) {
        this.on("buttonmousedown", fn, scope);
    },
    onTextChanged: function (fn, scope) {
        this.on("textchanged", fn, scope);
    },

    textName: "",
    setTextName: function (value) {
        this.textName = value;
        if (this._textEl) mini.setAttr(this._textEl, "name", this.textName);
    },
    getTextName: function () {
        return this.textName;
    },

    setSelectOnFocus: function (value) {
        this.selectOnFocus = value;
    },
    getSelectOnFocus: function (value) {
        return this.selectOnFocus;
    },
    setShowClose: function (value) {
        this.showClose = value;
        this._doInputLayout();
    },
    getShowClose: function (value) {
        return this.showClose;
    },
    inputStyle: "",
    setInputStyle: function (value) {
        this.inputStyle = value;
        mini.setStyle(this._textEl, value);
    },

    getAttrs: function (el) {
        var attrs = mini.ButtonEdit.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["value", "text", "textName", "emptyText", "inputStyle", "defaultText",
            "onenter", "onkeydown", "onkeyup", "onkeypress",
            "onbuttonclick", "onbuttonmousedown", "ontextchanged", "onfocus", "onblur",
            "oncloseclick"
             ]
        );
        mini._ParseBool(el, attrs,
            ["allowInput", "inputAsValue", "selectOnFocus", "showClose"
             ]
        );
        mini._ParseInt(el, attrs,
            ["maxLength", "minLength"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.ButtonEdit, 'buttonedit');