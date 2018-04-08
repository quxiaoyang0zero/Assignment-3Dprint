
mini.MenuBarX = function () {
    mini.MenuBarX.superclass.constructor.call(this);
}
mini.extend(mini.MenuBarX, mini.MenuBar, {
    uiCls: "mini-menubarx",
    _itemType: "menuitemx"
});
mini.regClass(mini.MenuBarX, 'menubarx');


mini.MenuItemX = function () {
    mini.MenuItemX.superclass.constructor.call(this);    
}
mini.extend(mini.MenuItemX, mini.MenuItem, {
    setMenu: function (value) {
        if (mini.isArray(value)) {
            value = {
                type: "menu",
                items: value
            };
        }
        if (this.menu !== value) {
            var topMini = mini._getTopMINI();
            this.menu = topMini.getAndCreate(value);
            this.menu.hide();
            this.menu.ownerItem = this;
            this.doUpdate();
            this.menu.on("itemschanged", this.__OnItemsChanged, this);
            this.menu.window = topMini.window;
        }
    },
    showMenu: function () {

        if (this.menu && this.menu.isDisplay() == false) {
            this.menu.setHideAction("outerclick");

            var options = {
                xAlign: "outright",
                yAlign: "top",
                outXAlign: "outleft",
                //xOffset: -1,
                popupCls: "mini-menu-popup"
            };

            if (this.ownerMenu && this.ownerMenu.vertical == false) {

                options.xAlign = "left";
                options.yAlign = "below";
                options.outXAlign = null;
            }


            options.window = window;
            options.topWindow = this.menu.window;

            this.menu.showAtEl(this.el, options);

        }
    }
});
mini.regClass(mini.MenuItemX, 'menuitemx');


/////////////////////////////////////////////////
mini.Menu.prototype._getWindowOffset = function (options) {
    var win = options.window, topWin = options.topWindow;
    if (win && topWin && win != topWin) {       
        return mini._getWindowOffset(win, topWin);
    } else {
        return [0, 0];
    }
};
mini._getTopMINI = function () {
    var ps = [];
    function getParent(me) {
        try {
            me["___try"] = 1;
            if (!me.mini) return;
            ps.push(me);
        } catch (ex) {
        }
        if (me.parent && me.parent != me) {
            getParent(me.parent);
        }
    }
    getParent(window);

    return ps[ps.length - 1].mini;
};

//计算两个window的偏移
mini._getWindowOffset = function (win, topWin) {
    
    //1）找iframe链，组织成一个数组
    var iframes = [];
    function findIframe(win) {
        var p = win.parent;
        var els = p.document.getElementsByTagName("iframe");
        for (var i = 0, l = els.length; i < l; i++) {
            var el = els[i];
            if (el.contentWindow == win) {
                iframes.add(el);
                break;
            }
        }
        if (p != topWin) {
            findIframe(p);
        }

    }
    findIframe(win);

    iframes.reverse();

    //2）遍历iframe，一级级计算偏移
    var x = 0, y = 0;
    var mini = topWin.mini;
    for (var i = 0, l = iframes.length; i < l; i++) {
        var el = iframes[i];
        var box = mini.getBox(el);
        x += box.x;
        y += box.y;

        var borders = mini.getBorders(el);
        x += borders.left;
        y += borders.top;

        mini = el.contentWindow.mini;
    }

    return [x, y];
}


/////////////////////////////////////////////////
var __TopMINI =  mini._getTopMINI();

mini.DatePickerX = function () {
    mini.DatePickerX.superclass.constructor.call(this);
    
}
mini.extend(mini.DatePickerX, mini.DatePicker, {
    uiCls: "mini-datepickerx",

    destroy: function (removeEl) {
        
        if (this._calendar) {
            this._calendar.destroy();
            this._calendar = null;

        }
        var topMini = __TopMINI;
        topMini.DatePicker._Calendar = null;

        mini.DatePickerX.superclass.destroy.call(this, removeEl);
    },

    _createPopup: function () {
        var topMini = __TopMINI;
        this.popup = new topMini.Popup();
        this.popup.setShowAction("none");
        this.popup.setHideAction("outerclick");
        this.popup.setPopupEl(this.el);

        this.popup.on("BeforeClose", this.__OnPopupBeforeClose, this);
        topMini.on(this.popup.el, "keydown", this.__OnPopupKeyDown, this);

        this._calendar = this._getCalendar();
    },
    _getCalendar: function () {
        var topMini = __TopMINI;
        if (!topMini.DatePicker._Calendar) {
            var calendar = topMini.DatePicker._Calendar = new topMini.Calendar();

            calendar.setStyle("border:0;");
        }
        return topMini.DatePicker._Calendar;
    },
    _doShowAtEl: function (el, options) {
        var popup = this.getPopup();
        popup._getWindowOffset = mini.Menu.prototype._getWindowOffset;
        options.window = window;
        options.topWindow = __TopMINI.window;
        popup.showAtEl(el, options);
    }
});
mini.regClass(mini.DatePickerX, 'DatePickerX');