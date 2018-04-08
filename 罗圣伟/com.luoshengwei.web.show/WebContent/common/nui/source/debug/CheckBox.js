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

mini.CheckBox = function () {
    mini.CheckBox.superclass.constructor.call(this);

}
mini.extend(mini.CheckBox, mini.Control, {
    formField: true,
    _clearText: false, //form.reset/clear的时候，是否自动清除文本

    text: "",
    checked: false,
    defaultValue: false,

    trueValue: true,
    falseValue: false,

    uiCls: "mini-checkbox",
    _create: function () {
        var ckid = this.uid + "$check";
        this.el = document.createElement("span");
        this.el.className = "mini-checkbox";
        this.el.innerHTML = '<input id="' + ckid + '" name="' + this.id + '" type="checkbox" class="mini-checkbox-check"><label for="' + ckid + '" onclick="return false;">' + this.text + '</label>';

        this._checkEl = this.el.firstChild;
        this._labelEl = this.el.lastChild;
    },
    destroy: function (removeEl) {
        if (this._checkEl) {
            this._checkEl.onmouseup = null;
            this._checkEl.onclick = null;
            this._checkEl = null;
        }
        mini.CheckBox.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__onClick, this);

            this._checkEl.onmouseup = function () { return false; }
            var sf = this;
            this._checkEl.onclick = function () { if (sf.isReadOnly()) return false }
        }, this);

    },
    setName: function (value) {
        this.name = value;        
        mini.setAttr(this._checkEl, "name", this.name);
    },
    setText: function (value) {
        if (this.text !== value) {
            this.text = value;
                
            this._labelEl.innerHTML = value;
        }
    },
    getText: function () {
        return this.text;
    },
    setChecked: function (value) {
        if (value === true) value = true;
        else if (value == this.trueValue) value = true;
        else if (value == "true") value = true;
        else if (value === 1) value = true;
        else if (value == "Y") value = true;
        else value = false;

        if (this.checked !== value) {
            this.checked = !!value;
            this._checkEl.checked = this.checked;

            this.value = this.getValue();
        }
    },
    getChecked: function () {
        return this.checked;
    },
    setValue: function (value) {
        if (this.checked != value) {
            
            this.setChecked(value);
            this.value = this.getValue();
        }
    },
    getValue: function () {
        return String(this.checked == true ? this.trueValue : this.falseValue);
    },
    getFormValue: function () {
        return this.getValue();
    },
    setTrueValue: function (value) {
        this._checkEl.value = value;
        this.trueValue = value;
    },
    getTrueValue: function () {
        return this.trueValue;
    },
    setFalseValue: function (value) {
        this.falseValue = value;
    },
    getFalseValue: function () {
        return this.falseValue;
    },
    /////////////////////////////
    __onClick: function (e) {
        
        if (this.isReadOnly()) return;

        this.setChecked(!this.checked);

        this.fire("checkedchanged", { checked: this.checked });
        this.fire("valuechanged", { value: this.getValue() });

        this.fire("click", e, this);

    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.CheckBox.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);
        
        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["text", "oncheckedchanged", "onclick", "onvaluechanged"
             ]
        );

        mini._ParseBool(el, attrs,
            ["enabled"
             ]
        );

        var checked = mini.getAttr(el, "checked");
        
        if (checked) {
            attrs.checked = (checked == "true" || checked == "checked") ? true : false;
        }

        var trueValue = jq.attr("trueValue");
        if (trueValue) {
            attrs.trueValue = trueValue;
            trueValue = parseInt(trueValue);
            if (!isNaN(trueValue)) {
                attrs.trueValue = trueValue;
            }
        }
        var falseValue = jq.attr("falseValue");
        if (falseValue) {
            attrs.falseValue = falseValue;
            falseValue = parseInt(falseValue);
            if (!isNaN(falseValue)) {
                attrs.falseValue = falseValue;
            }
        }

        return attrs;
    }
});

mini.regClass(mini.CheckBox, "checkbox");