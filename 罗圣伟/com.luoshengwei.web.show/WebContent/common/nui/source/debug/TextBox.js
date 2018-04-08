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

mini.TextBox = function () {
    mini.TextBox.superclass.constructor.call(this);

    //this._textEl.maxLenght = this.maxLength;
}
mini.extend(mini.TextBox, mini.ValidatorBase, {
    name: "",
    formField: true,

    selectOnFocus: false,

    minWidth: 10,
    minHeight: 15,

    maxLength: 5000,

    emptyText: "",

    text: "",
    value: "",
    defaultValue: "",

    //width: 125,
    height: 21,

    _emptyCls: "mini-textbox-empty",
    _focusCls: "mini-textbox-focus",
    _disabledCls: "mini-textbox-disabled",

    uiCls: "mini-textbox",
    _InputType: "text",
    _create: function () {
        var html = '<input  type="' + this._InputType + '" class="mini-textbox-input" autocomplete="off"/>';
        if (this._InputType == "textarea") {
            html = '<textarea  class="mini-textbox-input" autocomplete="off"/></textarea>';
        }
        html = '<span class="mini-textbox-border">' + html + '</span>';
        html += '<input type="hidden"/>';

        this.el = document.createElement("span");
        this.el.className = "mini-textbox";
        this.el.innerHTML = html;


        this._borderEl = this.el.firstChild;
        this._textEl = this._borderEl.firstChild;
        this._valueEl = this._borderEl.lastChild;

        //        var me = this;
        //        //alert(me._textEl.value);
        //        setTimeout(function () {
        //            alert(me._textEl.value);
        //        }, 1);

        //        me._textEl.value = "";
        this._doEmpty();
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            
            mini_onOne(this._textEl, "drop", this.__OnDropText, this);
            mini_onOne(this._textEl, "change", this.__OnInputTextChanged, this);
            mini_onOne(this._textEl, "focus", this.__OnFocus, this);
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);


            //                        mini.on(this._textEl, "drop", this.__OnDropText, this);
            //                        mini.on(this._textEl, "change", this.__OnInputTextChanged, this);
            //                        mini.on(this._textEl, "focus", this.__OnFocus, this);
            //                        mini.on(this.el, "mousedown", this.__OnMouseDown, this);

            //

            var v = this.value;
            this.value = null;
            this.setValue(v);


        }, this);
        this.on("validation", this.__OnValidation, this); //一定要放这里
    },
    _inputEventsInited: false,
    _initInputEvents: function () {
        if (this._inputEventsInited) return;
        this._inputEventsInited = true;

        //出于优化考虑：将blur, change, keydown, keyup, keypress等时间，在focus的时候，才进行绑定
        //在_initEvents的时候，只绑定focus就可以了
        mini.on(this._textEl, "blur", this.__OnBlur, this);
        mini.on(this._textEl, "keydown", this.__OnInputKeyDown, this);
        mini.on(this._textEl, "keyup", this.__OnInputKeyUp, this);
        mini.on(this._textEl, "keypress", this.__OnInputKeyPress, this);
    },
    destroy: function (removeEl) {
        if (this.el) {

            this.el.onmousedown = null;
        }
        if (this._textEl) {
            this._textEl.ondrop = null;
            this._textEl.onchange = null;
            this._textEl.onfocus = null;


            mini.clearEvent(this._textEl);
            this._textEl = null;
        }
        if (this._valueEl) {
            mini.clearEvent(this._valueEl);
            this._valueEl = null;
        }
        mini.TextBox.superclass.destroy.call(this, removeEl);
    },
    //    _sizeChaned: function () {
    //        var w = mini.getWidth(this.el);
    //        if (this._errorIconEl) {
    //            w -= 18;
    //        }
    //        w -= 4;     //border + padding
    //        if (this.el.style.width == "100%") w -= 1;
    //        if (w < 0) w = 0;
    //        this._textEl.style.width = w + "px";
    //    },

    doLayout: function () {
        
    },


    setHeight: function (value) {
        if (parseInt(value) == value) value += "px";
        this.height = value;
        if (this._InputType == "textarea") {
            this.el.style.height = value;
            this.doLayout();
        }
    },
    setName: function (value) {
        if (this.name != value) {
            this.name = value;
            //this._valueEl.name = value;
            if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
        }
    },
    setValue: function (value) {
        if (value === null || value === undefined) value = "";
        value = String(value);
        if (value.length > this.maxLength) {
            value = value.substring(0, this.maxLength);
        }
        if (this.value !== value) {
            this.value = value;
            this._valueEl.value = this._textEl.value = value;
            this._doEmpty();
        }
        //        else {
        //            this._textEl.value = value;
        //        }
    },
    getValue: function () {
        //return this._textEl.value;
        return this.value;
    },
    getFormValue: function () {
        var value = this.value;
        if (value === null || value === undefined) value = "";
        return String(value);
    },
    setAllowInput: function (value) {
        if (this.allowInput != value) {
            this.allowInput = value;
            this.doUpdate();
        }
    },
    getAllowInput: function () {
        return this.allowInput;
    },
    _placeholdered: false,
    _doEmpty: function () {
        this._textEl.placeholder = this.emptyText;
        if (this.emptyText) {
            mini._placeholder(this._textEl);
        }

        //        if (this._focused) return;
        //        if (this.value == "" && this.emptyText) {
        //            this._textEl.value = this.emptyText;
        //            mini.addClass(this.el, this._emptyCls);
        //        } else {
        //            mini.removeClass(this.el, this._emptyCls);
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
        this.maxLength = value;
        //
        mini.setAttr(this._textEl, "maxLength", value);

        if (this._InputType == "textarea" && mini.isIE) {
            mini.on(this._textEl, "keypress", this.__OnMaxLengthKeyUp, this);
        }
    },
    __OnMaxLengthKeyUp: function (e) {

        if (this._textEl.value.length >= this.maxLength) {

            e.preventDefault();

        }
    },
    getMaxLength: function () {
        return this.maxLength;
    },
    setReadOnly: function (value) {
        if (this.readOnly != value) {
            this.readOnly = value;
            this.doUpdate();
        }
    },
    setEnabled: function (value) {
        if (this.enabled != value) {
            this.enabled = value;
            this.doUpdate();
            this._tryValidate();
        }
    },
    doUpdate: function () {
        if (this.enabled) {
            this.removeCls(this._disabledCls);
        } else {
            this.addCls(this._disabledCls);
        }
        if (this.isReadOnly() || this.allowInput == false) {
            this._textEl.readOnly = true;
            mini.addClass(this.el, "mini-textbox-readOnly");
        } else {

            this._textEl.readOnly = false;
            mini.removeClass(this.el, "mini-textbox-readOnly");
        }
        if (this.required) {
            this.addCls(this._requiredCls);
        } else {
            this.removeCls(this._requiredCls);
        }

        if (this.enabled) {
            this._textEl.disabled = false;
        } else {
            this._textEl.disabled = true;
        }
    },
    focus: function () {
        try {
            this._textEl.focus();
        } catch (e) {
        }
    },
    blur: function () {
        try {
            this._textEl.blur();
        } catch (e) {
        }
    },
    selectText: function () {
        var me = this;
        function doSelect() {
            try {
                me._textEl.select();
            } catch (ex) { }
        }
        doSelect();
        setTimeout(function () {
            doSelect();
        }, 30);
    },
    getTextEl: function () {
        return this._textEl;
    },
    getInputText: function () {
        return this._textEl.value;
    },
    setSelectOnFocus: function (value) {
        this.selectOnFocus = value;
    },
    getSelectOnFocus: function (value) {
        return this.selectOnFocus;
    },
    ///////////////////////////////////////////////
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
    ///////////////////////////////////////////////
    __OnMouseDown: function (e) {

        var sf = this;
        if (!mini.isAncestor(this._textEl, e.target)) {
            setTimeout(function () {
                sf.focus();
                mini.selectRange(sf._textEl, 1000, 1000);
            }, 1);
        } else {
            setTimeout(function () {
                try {
                    sf._textEl.focus();
                } catch (ex) { }
            }, 1);
        }
    },
    __OnInputTextChanged: function (e, valid) {
        //this._inputChangedTime = new Date();

        var value = this.value;
        this.setValue(this._textEl.value);

        if (value !== this.getValue() || valid === true) {
            this._OnValueChanged();
        }
    },
    __OnDropText: function (e) {
        var me = this;
        setTimeout(function () {
            me.__OnInputTextChanged(e);
        }, 0);
    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);

        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 13 || e.keyCode == 9) {
            if (this._InputType == "textarea" && e.keyCode == 13) {    //不影响textarea换行
            }
            else {
                this.__OnInputTextChanged(null, true);
                if (e.keyCode == 13) {
                    var me = this;
                    //setTimeout(function () {
                    me.fire("enter", ex);
                    //}, 10);
                }
            }

        }
        if (e.keyCode == 27) {
            e.preventDefault();
        }
        //        if (e.keyCode == 13 && this._InputType == "textarea") {
        //            if (e.ctrlKey == false) {
        //                e.stopPropagation();
        //            } else {
        //                this.__OnInputTextChanged();
        //            }
        //        }
    },
    __OnInputKeyUp: function (e) {
        this.fire("keyup", { htmlEvent: e });
    },
    __OnInputKeyPress: function (e) {
        this.fire("keypress", { htmlEvent: e });
    },
    __OnFocus: function (e) {
        //e.preventDefault();
        this.doUpdate();
        //if (this.isReadOnly() || this.allowInput == false) return;        
        if (this.isReadOnly()) {
            return;
        }
        this._focused = true;
        this.addCls(this._focusCls);
        this._initInputEvents();

        //        mini.removeClass(this.el, this._emptyCls);
        //        if (this.emptyText && this._textEl.value == this.emptyText) {
        //            this._textEl.value = "";
        //            this._textEl.select();
        //        }

        if (this.selectOnFocus) {
            this.selectText();
        }

        this.fire("focus", { htmlEvent: e });
    },
    __OnBlur: function (e) {
        this._focused = false;
        var sf = this;
        setTimeout(function () {
            if (sf._focused == false) {
                sf.removeCls(sf._focusCls);
            }
        }, 2);

        //        if (this.emptyText && this._textEl.value == "") {
        //            this._textEl.value = this.emptyText;
        //            mini.addClass(this.el, this._emptyCls);
        //        }

        //        if (!this._inputChangedTime || new Date() - this._inputChangedTime < 50) {
        //            this.__OnInputTextChanged();
        //        }
        //        this._inputChangedTime = null;

        this.fire("blur", { htmlEvent: e });

        if (this.validateOnLeave) {
            this._tryValidate();
        }
    },
    inputStyle: "",
    setInputStyle: function (value) {
        this.inputStyle = value;
        mini.setStyle(this._textEl, value);
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.TextBox.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["value", "text", "emptyText", "inputStyle",
            "onenter", "onkeydown", "onkeyup", "onkeypress",
            "maxLengthErrorText", "minLengthErrorText", "onfocus", "onblur",

            "vtype",
            "emailErrorText", "urlErrorText", "floatErrorText", "intErrorText", "dateErrorText",
            "minErrorText", "maxErrorText", "rangeLengthErrorText", "rangeErrorText", "rangeCharErrorText"
             ]
        );
        mini._ParseBool(el, attrs,
            ["allowInput", "selectOnFocus"
             ]
        );
        mini._ParseInt(el, attrs,
            ["maxLength", "minLength", "minHeight", "minWidth"
             ]
        );

        return attrs;
    },
    ///////////////////////////////////////
    vtype: "",  //email;url;float;int;date:yyyy-MM-dd;max:20,min:10,maxLength:100,minLength:5;rangeLength:0,5;range:0,5
    setVtype: function (value) {
        this.vtype = value;
    },
    getVtype: function () {
        return this.vtype;
    },
    __OnValidation: function (e) {

        if (e.isValid == false) return;
        
        mini._ValidateVType(this.vtype, e.value, e, this);
        //        var vtypes = this.vtype.split(";");
        //        for (var i = 0, l = vtypes.length; i < l; i++) {
        //            var vtype = vtypes[i].trim();
        //            var vv = vtype.split(":");
        //            var vt = vv[0];
        //            var args = vv[1];
        //            if (args) args = args.split(",");
        //            else args = [];

        //            var fn = mini.VTypes[vt]; //this["__" + vt];
        //            if (fn) {
        //                var isValid = fn(e.value, args);
        //                if (isValid !== true) {
        //                    e.isValid = false;
        //                    var vtext = vv[0] + "ErrorText";
        //                    e.errorText = this[vtext] || mini.VTypes[vtext] || "";
        //                    e.errorText = String.format(e.errorText, args[0], args[1], args[2], args[3], args[4]);
        //                    break;
        //                }
        //            }
        //        }
    },
    setEmailErrorText: function (value) {
        this.emailErrorText = value;
    },
    getEmailErrorText: function () {
        return this.emailErrorText;
    },
    setUrlErrorText: function (value) {
        this.urlErrorText = value;
    },
    getUrlErrorText: function () {
        return this.urlErrorText;
    },
    setFloatErrorText: function (value) {
        this.floatErrorText = value;
    },
    getFloatErrorText: function () {
        return this.floatErrorText;
    },
    setIntErrorText: function (value) {
        this.intErrorText = value;
    },
    getIntErrorText: function () {
        return this.intErrorText;
    },
    setDateErrorText: function (value) {
        this.dateErrorText = value;
    },
    getDateErrorText: function () {
        return this.dateErrorText;
    },
    setMaxLengthErrorText: function (value) {
        this.maxLengthErrorText = value;
    },
    getMaxLengthErrorText: function () {
        return this.maxLengthErrorText;
    },
    setMinLengthErrorText: function (value) {
        this.minLengthErrorText = value;
    },
    getMinLengthErrorText: function () {
        return this.minLengthErrorText;
    },
    setMaxErrorText: function (value) {
        this.maxErrorText = value;
    },
    getMaxErrorText: function () {
        return this.maxErrorText;
    },
    setMinErrorText: function (value) {
        this.minErrorText = value;
    },
    getMinErrorText: function () {
        return this.minErrorText;
    },
    setRangeLengthErrorText: function (value) {
        this.rangeLengthErrorText = value;
    },
    getRangeLengthErrorText: function () {
        return this.rangeLengthErrorText;
    },
    setRangeCharErrorText: function (value) {
        this.rangeCharErrorText = value;
    },
    getRangeCharErrorText: function () {
        return this.rangeCharErrorText;
    },
    setRangeErrorText: function (value) {
        this.rangeErrorText = value;
    },
    getRangeErrorText: function () {
        return this.rangeErrorText;
    }

});

mini.regClass(mini.TextBox, 'textbox');


mini.Password = function () {
    mini.Password.superclass.constructor.call(this);
}
mini.extend(mini.Password, mini.TextBox, {
    uiCls: "mini-password",
    _InputType: "password",
    setEmptyText: function (value) {
        this.emptyText = "";          
    }
});
mini.regClass(mini.Password, 'password');


mini.TextArea = function () {
    mini.TextArea.superclass.constructor.call(this);
}
mini.extend(mini.TextArea, mini.TextBox, {
    maxLength: 10000000,

    //width: 180,
    //height: 50,
    height: '',
    minHeight: 50,
    _InputType: "textarea",
    uiCls: "mini-textarea",
    doLayout: function () {
        if (!this.canLayout()) return;
        mini.TextArea.superclass.doLayout.call(this);

        var h = mini.getHeight(this.el);
        
        if(mini.isIE6){
            mini.setHeight(this._borderEl, h);
        }
        h -= 2;
        if (h < 0) h = 0;
        this._textEl.style.height = h + "px";
    }
});
mini.regClass(mini.TextArea, 'textarea');


