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

mini.Button = function () {
    
    mini.Button.superclass.constructor.call(this);
    
}
mini.extend(mini.Button, mini.Control, {
    //_tagName: "a",

    text: "",
    iconCls: "",
    iconStyle: "",
    plain: false,

    checkOnClick: false,
    checked: false,
    groupName: "",

    _plainCls: "mini-button-plain",
    _hoverCls: "mini-button-hover",
    _pressedCls: "mini-button-pressed",
    _checkedCls: "mini-button-checked",
    _disabledCls: "mini-button-disabled",

    allowCls: "",

    _clearBorder: false,

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        this._allowUpdate = kv.text || kv.iconStyle || kv.iconCls || kv.iconPosition;

        mini.Button.superclass.set.call(this, kv);

        if (this._allowUpdate === false) {
            this._allowUpdate = true;
            this.doUpdate();
        }

        return this;
    },
    uiCls: "mini-button",
    _create: function () {
        this.el = document.createElement("a");

        this.el.className = "mini-button";
        this.el.hideFocus = true;
        this.el.href = "javascript:void(0)";
        //this.el.onclick = function () { return false; };

        this.doUpdate();
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);
            mini_onOne(this.el, "click", this.__OnClick, this);

            //            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            //            mini.on(this.el, "click", this.__OnClick, this);
        }, this);
    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onclick = null;
            this.el.onmousedown = null;
        }
        if (this.menu) this.menu.owner = null;
        this.menu = null;
        mini.Button.superclass.destroy.call(this, removeEl);
    },
    doUpdate: function () {
        if (this._allowUpdate === false) return;
        //var jq = jQuery(this.el);

        var cls = "", text = this.text;

        if (this.iconCls && text) {
            cls = " mini-button-icon " + this.iconCls;
        } else if (this.iconCls && text === "") {
            cls = " mini-button-iconOnly " + this.iconCls;
            text = "&nbsp;";
        } else {
            if (text == "") text = "&nbsp;";
        }
        var s = '<span class="mini-button-text ' + cls + '">' + text + '</span>';
        if (this.allowCls) {
            s = s + '<span class="mini-button-allow ' + this.allowCls + '"></span>';
        }
        this.el.innerHTML = s;



    },
    href: "",
    setHref: function (value) {
        this.href = value;
        this.el.href = value;
        var el = this.el;
        setTimeout(function () {
            el.onclick = null;
        }, 100);
    },
    getHref: function () {
        return this.href;
    },
    target: "",
    setTarget: function (value) {
        this.target = value;
        this.el.target = value;
    },
    getTarget: function () {
        return this.target;
    },
    setText: function (value) {
        if (this.text != value) {
            this.text = value;
            this.doUpdate();
        }
    },
    getText: function () {
        return this.text;
    },
    setIconCls: function (value) {
        this.iconCls = value;
        this.doUpdate();
    },
    getIconCls: function () {
        return this.iconCls;
    },
    setIconStyle: function (value) {
        this.iconStyle = value;
        this.doUpdate();
    },
    getIconStyle: function () {
        return this.iconStyle;
    },
    setIconPosition: function (value) {
        this.iconPosition = "left";
        this.doUpdate();
    },
    getIconPosition: function () {
        return this.iconPosition;
    },

    setPlain: function (value) {
        this.plain = value;
        if (value) this.addCls(this._plainCls);
        else this.removeCls(this._plainCls);
    },
    getPlain: function () {
        return this.plain;
    },
    setGroupName: function (value) {
        this.groupName = value;
    },
    getGroupName: function () {
        return this.groupName;
    },
    setCheckOnClick: function (value) {
        this.checkOnClick = value;
    },
    getCheckOnClick: function () {
        return this.checkOnClick;
    },
    setChecked: function (value) {

        var fire = this.checked != value;
        this.checked = value;
        if (value) this.addCls(this._checkedCls);
        else this.removeCls(this._checkedCls);
        if (fire) {
            this.fire("CheckedChanged");
        }
    },
    getChecked: function () {
        return this.checked;
    },
    doClick: function () {
        this.__OnClick(null);
    },
    /////////////////////////
    __OnClick: function (e) {
        if (!this.href) {
            e.preventDefault();
        }
        if (this.readOnly || this.enabled == false) return;
        this.focus();
        if (this.checkOnClick) {
            if (this.groupName) {
                var groupName = this.groupName;
                var buttons = mini.findControls(function (control) {
                    if (control.type == "button" && control.groupName == groupName) return true;
                });
                if (buttons.length > 0) {
                    for (var i = 0, l = buttons.length; i < l; i++) {
                        var button = buttons[i];
                        if (button != this) button.setChecked(false);
                    }
                    this.setChecked(true);
                } else {
                    this.setChecked(!this.checked);
                }
            } else {
                this.setChecked(!this.checked);
            }
        }

        this.fire("click", {
            htmlEvent: e
        });
        //return false;
    },
    __OnMouseDown: function (e) {
        if (this.isReadOnly()) return;

        this.addCls(this._pressedCls);
        mini.on(document, "mouseup", this.__OnDocMouseUp, this);
    },
    __OnDocMouseUp: function (e) {
        this.removeCls(this._pressedCls);
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
    },
    onClick: function (fn, scope) {
        this.on("click", fn, scope);
    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.Button.superclass.getAttrs.call(this, el);
        //return attrs;
        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["text", "href", "iconCls", "iconStyle", "iconPosition", "groupName", "menu",
                "onclick", "oncheckedchanged", "target"
             ]
        );
        mini._ParseBool(el, attrs,
            ["plain", "checkOnClick", "checked"
             ]
        );
        return attrs;
    }
});
mini.regClass(mini.Button, "button");

/* MenuButton 
-----------------------------------------------------------------------------*/

mini.MenuButton = function () {

    mini.MenuButton.superclass.constructor.call(this);
}
mini.extend(mini.MenuButton, mini.Button, {
    uiCls: "mini-menubutton",
    allowCls: "mini-button-menu",
    setMenu: function (value) {
        
        if (mini.isArray(value)) {
            value = {
                type: "menu",
                items: value
            };
        }
        if (typeof value == "string") {
            var el = mini.byId(value);
            if (!el) return;
            
            mini.parse(value);
            value = mini.get(value);
        }

        if (this.menu !== value) {
            this.menu = mini.getAndCreate(value);
            this.menu.setPopupEl(this.el);
            this.menu.setPopupCls("mini-button-popup");
            this.menu.setShowAction("leftclick");
            this.menu.setHideAction("outerclick");
            this.menu.setXAlign("left");
            this.menu.setYAlign("below");

            this.menu.hide();
            this.menu.owner = this;
        }
    },
    setEnabled: function (value) {
        this.enabled = value;
        if (value) {
            this.removeCls(this._disabledCls);
        } else {
            this.addCls(this._disabledCls);
        }
        //this.el.allowPopup = !!value;
        jQuery(this.el).attr("allowPopup", !!value)
    }
});
mini.regClass(mini.MenuButton, "menubutton");

/* SplitButton 
-----------------------------------------------------------------------------*/

mini.SplitButton = function () {
    mini.SplitButton.superclass.constructor.call(this);
}
mini.extend(mini.SplitButton, mini.MenuButton, {
    uiCls: "mini-splitbutton",
    allowCls: "mini-button-split"
});
mini.regClass(mini.SplitButton, "splitbutton");