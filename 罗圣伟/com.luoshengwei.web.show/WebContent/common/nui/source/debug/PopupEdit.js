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

mini.PopupEdit = function () {
    mini.PopupEdit.superclass.constructor.call(this);
    this._createPopup();

    this.el.className += ' mini-popupedit';
}
mini.extend(mini.PopupEdit, mini.ButtonEdit, {
    uiCls: "mini-popupedit",
    popup: null,

    popupCls: "mini-buttonedit-popup",

    _hoverCls: "mini-buttonedit-hover",
    _pressedCls: "mini-buttonedit-pressed",

    _destroyPopup: true,
    destroy: function (removeEl) {
        if (this.isShowPopup()) {
            this.hidePopup();
        }
        if (this.popup) {
            if (this._destroyPopup) {
                this.popup.destroy();
            }
            this.popup = null;
        }
        if (this._popupInner) {
            this._popupInner.owner = null;
            this._popupInner = null;
        }
        mini.PopupEdit.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini.PopupEdit.superclass._initEvents.call(this);

        mini._BindEvents(function () {
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
            mini_onOne(this.el, "mouseout", this.__OnMouseOut, this);

            //            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            //            mini.on(this.el, "mouseout", this.__OnMouseOut, this);
        }, this);
    },
    _initButtons: function () {
        this.buttons = [];

        var button = this.createButton({ cls: "mini-buttonedit-popup", iconCls: "mini-buttonedit-icons-popup", name: "popup" });
        this.buttons.push(button);
    },
    __OnBlur: function (e) {
        this._focused = false;
        if (this._clickTarget && mini.isAncestor(this.el, this._clickTarget)) return;
        if (this.isShowPopup()) return;
        mini.PopupEdit.superclass.__OnBlur.call(this, e);
    },
    __OnMouseOver: function (e) {
        if (this.isReadOnly() || this.allowInput) return;
        if (mini.findParent(e.target, "mini-buttonedit-border")) {
            this.addCls(this._hoverCls);
        }
    },
    __OnMouseOut: function (e) {
        if (this.isReadOnly() || this.allowInput) return;
        this.removeCls(this._hoverCls);
    },
    __OnMouseDown: function (e) {
        if (this.isReadOnly()) return;
        mini.PopupEdit.superclass.__OnMouseDown.call(this, e);
        if (this.allowInput == false && mini.findParent(e.target, "mini-buttonedit-border")) {
            mini.addClass(this.el, this._pressedCls);

            mini.on(document, "mouseup", this.__OnDocMouseUp, this);
        }
    },
    __OnInputKeyDown: function (e) {
        this.fire("keydown", { htmlEvent: e });
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 9) {
            this.hidePopup();
            return;
        }
        if (e.keyCode == 27) {
            this.hidePopup();
            return;
        }
        if (e.keyCode == 13) {
            this.fire("enter");
        }

        if (this.isShowPopup()) {

            if (e.keyCode == 13 || e.keyCode == 27) {
                e.stopPropagation();
            }
        }
    },
    ///////////////////////////////////////////////////
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this.popup.within(e)) return true;
        return false;
    },

    popupWidth: "100%", //"","100%", 200
    popupMinWidth: 50,
    popupMaxWidth: 2000,

    popupHeight: "",   // "", 30
    popupMinHeight: 30,
    popupMaxHeight: 2000,

    setPopup: function (value) {
        if (typeof value == "string") {
            mini.parse(value);
            value = mini.get(value);
        }
        var p = mini.getAndCreate(value);
        if (!p) return;
        p.setVisible(false);
        //p.render(this.popup._contentEl);
        this._popupInner = p;

        p.owner = this;

        p.on("beforebuttonclick", this.__OnPopupButtonClick, this);
    },

    getPopup: function () {
        if (!this.popup) {
            this._createPopup();
        }
        return this.popup;
    },
    _createPopup: function () {
        this.popup = new mini.Popup();
        this.popup.setShowAction("none");
        this.popup.setHideAction("outerclick");
        this.popup.setPopupEl(this.el);

        this.popup.on("BeforeClose", this.__OnPopupBeforeClose, this);
        mini.on(this.popup.el, "keydown", this.__OnPopupKeyDown, this);
    },
    __OnPopupBeforeClose: function (e) {
        if (this.within(e.htmlEvent)) e.cancel = true;
    },
    __OnPopupKeyDown: function (e) {
    },
    showPopup: function () {
        var ex = { cancel: false };
        this.fire("beforeshowpopup", ex);
        if (ex.cancel == true) return;

        var popup = this.getPopup();



        //if (this.id == "cityCombo") debugger
        this._syncShowPopup();

        popup.on("Close", this.__OnPopupHide, this);

        this.fire("showpopup");
    },
    doLayout: function () {
        //if(this.id == 'lookup2') debugger
        mini.PopupEdit.superclass.doLayout.call(this);
        if (this.isShowPopup()) {
            //this._syncShowPopup();
        }
    },
    _syncShowPopup: function () {
        var popup = this.getPopup();

        if (this._popupInner && this._popupInner.el.parentNode != this.popup._contentEl) {
            this.popup._contentEl.appendChild(this._popupInner.el);
            this._popupInner.setVisible(true);
        }

        var box = this.getBox();

        var w = this.popupWidth;
        if (this.popupWidth == "100%") w = box.width;

        popup.setWidth(w);

        var h = parseInt(this.popupHeight);
        if (!isNaN(h)) {
            popup.setHeight(h);
        } else {
            popup.setHeight("auto");
        }

        popup.setMinWidth(this.popupMinWidth);
        popup.setMinHeight(this.popupMinHeight);
        popup.setMaxWidth(this.popupMaxWidth);
        popup.setMaxHeight(this.popupMaxHeight);

        var options = {
            xAlign: "left",
            yAlign: "below",
            outYAlign: "above",
            outXAlign: "right",
            popupCls: this.popupCls
        };

        this._doShowAtEl(this.el, options);
    },
    _doShowAtEl: function (el, options) {
        var popup = this.getPopup();
        popup.showAtEl(el, options);
    },
    __OnPopupHide: function (e) {
        this.__doFocusCls();
        this.fire("hidepopup");
    },
    hidePopup: function () {
        if (this.isShowPopup()) {
            var popup = this.getPopup();
            popup.close();

            this.blur();

            //this.fire("hidepopup");
        }
    },
    isShowPopup: function () {
        if (this.popup && this.popup.isDisplay()) return true;
        else return false;
    },

    setPopupWidth: function (value) {
        this.popupWidth = value;
    },
    setPopupMaxWidth: function (value) {
        this.popupMaxWidth = value;
    },
    setPopupMinWidth: function (value) {
        this.popupMinWidth = value;
    },
    getPopupWidth: function (value) {
        return this.popupWidth;
    },
    getPopupMaxWidth: function (value) {
        return this.popupMaxWidth;
    },
    getPopupMinWidth: function (value) {
        return this.popupMinWidth;
    },
    setPopupHeight: function (value) {
        this.popupHeight = value;
    },
    setPopupMaxHeight: function (value) {
        this.popupMaxHeight = value;
    },
    setPopupMinHeight: function (value) {
        this.popupMinHeight = value;
    },
    getPopupHeight: function (value) {
        return this.popupHeight;
    },
    getPopupMaxHeight: function (value) {
        return this.popupMaxHeight;
    },
    getPopupMinHeight: function (value) {
        return this.popupMinHeight;
    },
    __OnClick: function (e) {
        if (this.isReadOnly()) return;

        if (mini.isAncestor(this._buttonEl, e.target)) {
            this._OnButtonClick(e);
        }
        if (mini.findParent(e.target, this._closeCls)) {
            if (this.isShowPopup()) {
                this.hidePopup();
            }
            this.fire("closeclick", { htmlEvent: e });
            return;
        }
        if (this.allowInput == false || mini.isAncestor(this._buttonEl, e.target)) {
            if (this.isShowPopup()) {
                this.hidePopup();
            } else {
                var sf = this;
                setTimeout(function () {
                    sf.showPopup();
                }, 1);
            }
        }
    },
    __OnPopupButtonClick: function (e) {
        if (e.name == "close") this.hidePopup();
        e.cancel = true;
    },
    getAttrs: function (el) {
        var attrs = mini.PopupEdit.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["popupWidth", "popupHeight", "popup", "onshowpopup", "onhidepopup", "onbeforeshowpopup"
             ]
        );
        mini._ParseInt(el, attrs,
            ["popupMinWidth", "popupMaxWidth", "popupMinHeight", "popupMaxHeight"
             ]
        );

        return attrs;
    }

});
mini.regClass(mini.PopupEdit, 'popupedit');