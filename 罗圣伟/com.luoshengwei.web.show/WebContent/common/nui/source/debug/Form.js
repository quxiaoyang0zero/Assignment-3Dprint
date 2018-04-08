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

mini.Form = function (el) {
    this.el = mini.byId(el);
    if (!this.el) throw new Error("form element not null");
    
    mini.Form.superclass.constructor.call(this);

}
mini.extend(mini.Form, mini.Component, {
    el: null,

    getFields: function () {
        if (!this.el) return [];
        var controls = mini.findControls(function (control) {
            if (!control.el || control.formField != true) return false;
            if (mini.isAncestor(this.el, control.el)) return true;
            return false;
        }, this);
        return controls;
    },
    getFieldsMap: function () {
        var fields = this.getFields();
        var map = {};
        for (var i = 0, l = fields.length; i < l; i++) {
            var field = fields[i];
            if (field.name) map[field.name] = field;
        }
        return map;
    },
    getField: function (name) {
        if (!this.el) return null;
        return mini.getbyName(name, this.el);
    },

    getData: function (formatted, deep) {
        if (mini.isNull(deep)) deep = true;
        var valueFn = formatted ? "getFormValue" : "getValue";
        var controls = this.getFields();
        var data = {};
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            var fn = control[valueFn];
            if (!fn) continue;
            if (control.name) {
                if (deep == true) {
                    mini._setMap(control.name, fn.call(control), data);
                } else {
                    data[control.name] = fn.call(control);
                }
            }
            if (control.textName && control.getText) {
                if (deep == true) {
                    mini._setMap(control.textName, control.getText(), data);
                } else {
                    data[control.textName] = control.getText();
                }
            }
        }
        return data;
    },
    setData: function (options, all, deep) {
        if (mini.isNull(deep)) deep = true;
        if (typeof options != "object") options = {};
        var map = this.getFieldsMap();
        for (var name in map) {
            var control = map[name];
            if (!control) continue;
            if (control.setValue) {
                var v = options[name];
                if (deep == true) {
                    v = mini._getMap(name, options);
                }
                if (v === undefined && all === false) continue;
                if (v === null) v = "";
                control.setValue(v);
            }
            if (control.setText && control.textName) {
                var text = options[control.textName];
                if (deep == true) {
                    text = mini._getMap(control.textName, options);
                }
                if (mini.isNull(text)) text = "";
                control.setText(text);
            }
        }
        //mini.repaint(document.body);
    },
    reset: function () {
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (!control.setValue) continue;
            if (control.setText && control._clearText !== false) {
                var text = control.defaultText;
                if (mini.isNull(text)) text = "";
                control.setText(text);
            }
            control.setValue(control.defaultValue);
        }
        this.setIsValid(true);
    },
    clear: function () {
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (!control.setValue) continue;
            if (control.setText && control._clearText !== false) {
                control.setText("");
            }
            control.setValue("");

        }
        this.setIsValid(true);
    },
    getValidateFields: function () {
        function isDisplay(control) {
            return control.isDisplay(function (p) {
                if (mini.hasClass(p, 'mini-tabs-body')) return true;                
            });
        }

        var fields = [];
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (!control.validate || !control.isDisplay) continue;
            if (isDisplay(control)) { //
                fields.push(control);
            }
        }
        return fields;
    },
    validate: function (all) {
        var controls = this.getValidateFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            var succ = control.validate();
            if (succ == false && all === false) {
                break;
            }
        }
        return this.isValid();
    },
    isValid: function () {
        var controls = this.getValidateFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (control.isValid() == false) return false;
        }
        return true;
    },
    setIsValid: function (isValid) {
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (!control.setIsValid) continue;
            control.setIsValid(isValid);
        }
    },

    getErrorTexts: function () {
        var errorTexts = [];
        var errors = this.getErrors();
        for (var i = 0, l = errors.length; i < l; i++) {
            var control = errors[i];
            errorTexts.push(control.errorText);
        }
        return errorTexts;
    },
    getErrors: function () {
        var errors = [];
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            if (!control.isValid) continue;
            if (control.isValid() == false) {
                errors.push(control);
            }
        }
        return errors;
    },
    ///////////////////////////////////////////////////////////
    mask: function (options) {
        if (typeof options == "string") options = { html: options };
        options = options || {};
        options.el = this.el;
        if (!options.cls) options.cls = this._maskCls;
        mini.mask(options);
    },
    unmask: function () {
        mini.unmask(this.el);
    },
    _maskCls: "mini-mask-loading",
    loadingMsg: "数据加载中，请稍后...",
    loading: function (msg) {
        this.mask(msg || this.loadingMsg);
    },
    /////////////////////////////////////////////////////////
    __OnValueChanged: function (e) {

        this._changed = true;
    },
    _changed: false,
    setChanged: function (value) {
        this._changed = value;

        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            control.on("valuechanged", this.__OnValueChanged, this);
        }
    },
    isChanged: function () {
        return this._changed;
    },
    //////////////////////////////
    setEnabled: function (value) {
        var controls = this.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            control.setEnabled(value);
        }
    }

});
