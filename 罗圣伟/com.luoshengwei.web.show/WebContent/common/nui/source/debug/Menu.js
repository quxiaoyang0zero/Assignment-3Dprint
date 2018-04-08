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

mini.Menu = function () {
    this.items = [];
    mini.Menu.superclass.constructor.call(this);

    //this.el.style.background = "none";
}
mini.extend(mini.Menu, mini.Control);
mini.copyTo(mini.Menu.prototype, mini.Popup_prototype);
var mini_Popup_prototype_hide = mini.Popup_prototype.hide;

mini.copyTo(mini.Menu.prototype, {
    height: "auto",
    width: "auto",
    minWidth: 140,
    vertical: true,
    allowSelectItem: false,
    _selectedItem: null,
    _itemSelectedCls: "mini-menuitem-selected",

    textField: "text",
    resultAsTree: false,
    idField: "id",
    parentField: "pid",
    itemsField: "children",

    showNavArrow: true,

    //autoShowArrow: 

    _clearBorder: false,

    showAction: "none", //none, leftclick, rightclick, mouseover
    hideAction: "outerclick", //none, outerclick, mouseout

    getbyName: function (name) {

        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.name == name) {
                return item;
            }
            if (item.menu) {
                var control = item.menu.getbyName(name);
                if (control) return control;
            }
        }
        return null;
    },

    set: function (obj) {
        if (typeof obj == 'string') {
            return this;
        }

        var url = obj.url;
        delete obj.url;

        mini.Menu.superclass.set.call(this, obj);

        if (url) {
            this.setUrl(url);
        }

        return this;
    },
    ////////////////////////
    uiCls: "mini-menu",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-menu";
        this.el.innerHTML = '<div class="mini-menu-border"><a class="mini-menu-topArrow" href="#" onclick="return false"></a><div class="mini-menu-inner"></div><a class="mini-menu-bottomArrow" href="#" onclick="return false"></a></div>';
        this._borderEl = this.el.firstChild;

        this._topArrowEl = this._borderEl.childNodes[0];
        this._bottomArrowEl = this._borderEl.childNodes[2];

        this._innerEl = this._borderEl.childNodes[1];
        this._innerEl.innerHTML = '<div class="mini-menu-float"></div><div class="mini-menu-toolbar"></div><div style="clear:both;"></div>';
        this._contentEl = this._innerEl.firstChild;
        this._toolbarEl = this._innerEl.childNodes[1];


        //this._topArrowEl.style.display = this._bottomArrowEl.style.display = "none";

        if (this.isVertical() == false) mini.addClass(this.el, 'mini-menu-horizontal');

    },
    destroy: function (removeEl) {
        if (this._topArrowEl) {
            this._topArrowEl.onmousedown = this._bottomArrowEl.onmousedown = null;
        }

        this._popupEl = this.popupEl = this._borderEl = this._innerEl = this._contentEl = null;
        this._topArrowEl = this._bottomArrowEl = null;
        this.owner = null;
        this.window = null;
        mini.un(document, "mousedown", this.__OnBodyMouseDown, this);
        mini.un(window, "resize", this.__OnWindowResize, this);

        mini.Menu.superclass.destroy.call(this, removeEl);

    },
    _disableContextMenu: false,
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(document, "mousedown", this.__OnBodyMouseDown, this);
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(window, "resize", this.__OnWindowResize, this);
            if (this._disableContextMenu) {
                mini_onOne(this.el, "contextmenu", function (e) {
                    e.preventDefault();
                    //e.stopPropagation();
                }, this);
            }

            mini_onOne(this._topArrowEl, "mousedown", this.__OnTopMouseDown, this);
            mini_onOne(this._bottomArrowEl, "mousedown", this.__OnBottomMouseDown, this);

        }, this);

    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.within(e)) return true;
        }
        return false;
    },
    //    _getClearEl: function () {
    //        if (!this._clearEl) {
    //            this._clearEl = mini.append(this._contentEl, '<div style="clear:both;"></div>');
    //        }
    //        return this._clearEl;
    //    },
    setVertical: function (value) {
        this.vertical = value;
        if (!value) {
            mini.addClass(this.el, 'mini-menu-horizontal');
        } else {
            mini.removeClass(this.el, 'mini-menu-horizontal');
        }
        //mini.append(this._contentEl, this._getClearEl());
    },
    getVertical: function () {
        return this.vertical;
    },
    isVertical: function () {
        return this.vertical;
    },

    show: function () {
        this.setVisible(true);
    },
    hide: function () {
        this.hideItems();
        mini_Popup_prototype_hide.call(this);
    },
    hideItems: function () {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            menuitem.hideMenu();
        }
    },

    showItemMenu: function (item) {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            if (menuitem == item) {
                menuitem.showMenu();
            } else {
                menuitem.hideMenu();
            }
        }
    },
    hasShowItemMenu: function () {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            if (menuitem && menuitem.menu && menuitem.menu.isPopup) {
                return true;
            }
        }
        return false;
    },

    setData: function (value) {
        if (!mini.isArray(value)) value = [];
        this.setItems(value);
    },
    getData: function () {
        return this.getItems();
    },
    setItems: function (items) {
        if (!mini.isArray(items)) items = [];

        this.removeAll();
        var sss = new Date();

        for (var i = 0, l = items.length; i < l; i++) {
            this.addItem(items[i]);
        }
        //alert(new Date() - sss);
    },
    getItems: function () {
        return this.items;
    },
    _itemType: "menuitem",
    addItem: function (item) {
        if (item == "-" || item == "|" || item.type == "separator") {
            mini.append(this._contentEl, '<span id="' + item.id + '" class="mini-separator"></span>');
            return;
        }

        if (!mini.isControl(item) && !mini.getClass(item.type)) {
            item.type = this._itemType;
        }
        item = mini.getAndCreate(item);

        this.items.push(item);
        //if (this.vertical) {
        this._contentEl.appendChild(item.el);
        //}
        item.ownerMenu = this;

        //mini.append(this._contentEl, this._getClearEl());

        this.fire("itemschanged");
    },
    removeItem: function (item) {
        item = mini.get(item);
        if (!item) return;
        this.items.remove(item);
        //if (this.vertical) {
        this._contentEl.removeChild(item.el);
        //}
        this.fire("itemschanged");
    },
    removeItemAt: function (index) {
        var item = this.items[index];
        this.removeItem(item);
    },
    removeAll: function () {
        var items = this.items.clone();
        for (var i = items.length - 1; i >= 0; i--) {
            this.removeItem(items[i]);
        }
        this._contentEl.innerHTML = "";
    },
    getGroupItems: function (name) {
        if (!name) return [];
        var items = [];
        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.groupName == name) items.push(item);
        }
        return items;
    },
    getItem: function (item) {
        if (typeof item == "number") return this.items[item];
        if (typeof item == "string") {
            for (var i = 0, l = this.items.length; i < l; i++) {
                var it = this.items[i];
                if (it.id == item) return it;
            }
            return null;
        }
        if (item && this.items.indexOf(item) != -1) return item;
        return null;
    },

    setAllowSelectItem: function (value) {
        this.allowSelectItem = value;
    },
    getAllowSelectItem: function () {
        return this.allowSelectItem;
    },
    setSelectedItem: function (item) {
        item = this.getItem(item);
        this._OnItemSelect(item);
    },
    getSelectedItem: function (item) {
        return this._selectedItem;
    },

    setShowNavArrow: function (value) {
        this.showNavArrow = value;
    },
    getShowNavArrow: function () {
        return this.showNavArrow;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    setResultAsTree: function (value) {
        this.resultAsTree = value;
    },
    getResultAsTree: function () {
        return this.resultAsTree;
    },
    setIdField: function (value) {
        this.idField = value;
    },
    getIdField: function () {
        return this.idField;
    },
    setParentField: function (value) {
        this.parentField = value;
    },
    getParentField: function () {
        return this.parentField;
    },
    ////////////////////////////////////////
    doLayout: function () {

        if (!this.canLayout()) return;

        if (!this.isAutoHeight()) {
            //var height = this.getHeight(true);
            var height = mini.getHeight(this.el, true);

            mini.setHeight(this._borderEl, height);
            this._topArrowEl.style.display = this._bottomArrowEl.style.display = "none";
            //this._topArrowEl.style.width = "auto";
            this._contentEl.style.height = "auto";

            if (this.showNavArrow && this._borderEl.scrollHeight > this._borderEl.clientHeight) {
                this._topArrowEl.style.display = this._bottomArrowEl.style.display = "block";
                height = mini.getHeight(this._borderEl, true);
                var th = mini.getHeight(this._topArrowEl);
                var bh = mini.getHeight(this._bottomArrowEl);
                var h = height - th - bh;
                if (h < 0) h = 0;
                mini.setHeight(this._contentEl, h);

                //fix ie7
                var width = mini.getWidth(this._borderEl, true);
                mini.setWidth(this._topArrowEl, width);
                mini.setWidth(this._bottomArrowEl, width);

            } else {
                this._contentEl.style.height = "auto";
            }
        } else {
            this._borderEl.style.height = "auto";
            this._contentEl.style.height = "auto";
        }
    },
    _measureSize: function () {
        if (this.height == "auto") {
            this.el.style.height = "auto";
            this._borderEl.style.height = "auto";
            this._contentEl.style.height = "auto";
            this._topArrowEl.style.display = this._bottomArrowEl.style.display = "none";

            var vbox = mini.getViewportBox();
            var box = mini.getBox(this.el);
            this.maxHeight = vbox.height - 25;
            if (this.ownerItem) {
                var box = mini.getBox(this.ownerItem.el);
                var topH = box.top;
                var bottomH = vbox.height - box.bottom;
                var maxHeight = topH > bottomH ? topH : bottomH;
                maxHeight -= 10;
                this.maxHeight = maxHeight;
            }
        }
        //this.maxHeight = 200;
        this.el.style.display = "";
        var box = mini.getBox(this.el);
        //min, max
        if (box.width > this.maxWidth) {
            mini.setWidth(this.el, this.maxWidth);
            box = mini.getBox(this.el);
        }
        if (box.height > this.maxHeight) {
            mini.setHeight(this.el, this.maxHeight);
            box = mini.getBox(this.el);
        }
        if (box.width < this.minWidth) {
            mini.setWidth(this.el, this.minWidth);
            box = mini.getBox(this.el);
        }
        if (box.height < this.minHeight) {
            mini.setHeight(this.el, this.minHeight);
            box = mini.getBox(this.el);
        }
    },
    ////////////////////////////////////////
    url: "",
    _doLoad: function () {

        var items = mini.getData(this.url);

        if (this.dataField) {
            items = mini._getMap(this.dataField, items);
        }
        if (!items) items = [];

        if (this.resultAsTree == false) {
            items = mini.arrayToTree(items, this.itemsField, this.idField, this.parentField)
        }

        var list = mini.treeToArray(items, this.itemsField, this.idField, this.parentField)
        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            o.text = mini._getMap(this.textField, o);
            if (mini.isNull(o.text)) o.text = "";
        }
        var sss = new Date();
        this.setItems(items);
        //alert(new Date() - sss);
        this.fire("load");
    },
    loadList: function (list, idField, parentField) {
        if (!list) return;

        idField = idField || this.idField;
        parentField = parentField || this.parentField;

        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            o.text = mini._getMap(this.textField, o);
            if (mini.isNull(o.text)) o.text = "";
        }

        var tree = mini.arrayToTree(list, this.itemsField, idField, parentField);

        this.load(tree);
    },
    load: function (url) {
        if (typeof url == "string") {
            this.setUrl(url);
        } else {
            this.setItems(url);
        }
    },
    setUrl: function (value) {
        this.url = value;

        this._doLoad();
    },
    getUrl: function () {
        return this.url;
    },
    hideOnClick: true,
    setHideOnClick: function (value) {
        this.hideOnClick = value;
    },
    getHideOnClick: function () {
        return this.hideOnClick;
    },
    ////////////////////////////////////////
    _OnItemClick: function (item, htmlEvent) {
        var e = {
            item: item,
            isLeaf: !item.menu,
            htmlEvent: htmlEvent
        };
        if (this.hideOnClick) {
            if (this.isPopup) {
                this.hide();
            } else {
                this.hideItems();
            }
        }

        if (this.allowSelectItem && this._selectedItem != item) {
            this.setSelectedItem(item);
        }

        this.fire("itemclick", e);
        if (this.ownerItem) {

        }
    },
    _OnItemSelect: function (item) {
        if (this._selectedItem) {
            this._selectedItem.removeCls(this._itemSelectedCls);
        }
        this._selectedItem = item;

        if (this._selectedItem) {
            this._selectedItem.addCls(this._itemSelectedCls);
        }
        var e = {
            item: this._selectedItem
        };
        this.fire("itemselect", e);
    },
    onItemClick: function (fn, scope) {
        this.on("itemclick", fn, scope);
    },
    onItemSelect: function (fn, scope) {
        this.on("itemselect", fn, scope);
    },
    /////////////////////////////////////
    __OnTopMouseDown: function (e) {
        this._startScrollMove(-20);
    },
    __OnBottomMouseDown: function (e) {
        this._startScrollMove(20);
    },
    _startScrollMove: function (value) {
        clearInterval(this._scrollTimer);
        var fn = function () {
            clearInterval(me._scrollTimer);
            mini.un(document, "mouseup", fn);
        };
        mini.on(document, "mouseup", fn);

        var me = this;
        this._scrollTimer = setInterval(function () {
            me._contentEl.scrollTop += value;
            //document.title = new Date().getTime();
        }, 50);
    },
    setToolbar: function (value) {
        __mini_setControls(value, this._toolbarEl, this);
    },
    ////////////////////////////////////
    parseItems: function (nodes) {

        var data = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            if (node.className == "separator") {
                var o = { type: 'separator', id: node.id, name: node.name };
                data.add(o);
                continue;
            }

            var cnodes = mini.getChildNodes(node);

            var nodeItem = cnodes[0];
            var nodeChild = cnodes[1];

            var o = new mini.MenuItem();

            if (!nodeChild) {
                //o.applyTo(node);
                mini.applyTo.call(o, node);
                data.add(o);
                continue;
            }
            //o.applyTo(nodeItem);
            mini.applyTo.call(o, nodeItem);
            o.render(document.body);


            var menu = new mini.Menu();
            //menu.applyTo(nodeChild);
            mini.applyTo.call(menu, nodeChild);

            o.setMenu(menu);

            menu.render(document.body);
            //jQuery(node).remove();

            data.add(o);
        }
        return data.clone();
    },
    getAttrs: function (el) {

        var attrs = mini.Menu.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["popupEl", "popupCls", "showAction", "hideAction", "xAlign", "yAlign", "modalStyle",
            "onbeforeopen", "open", "onbeforeclose", "onclose", "url", "onitemclick", "onitemselect",
            "textField", "idField", "parentField", "toolbar"
                ]
        );
        mini._ParseBool(el, attrs,
            ["resultAsTree", "hideOnClick", "showNavArrow"
                ]
        );
        //alert(this.el.outerHTML);

        //var toolbar = jQuery("div[property=toolbar]", this.el)[0];
        //alert(toolbar);

        //toobar
        var nodes = mini.getChildNodes(el);
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            var property = jQuery(node).attr("property");
            if (!property) continue;
            property = property.toLowerCase();
            if (property == "toolbar") {
                attrs.toolbar = node;
                node.parentNode.removeChild(node);
            }
        }

        var nodes = mini.getChildNodes(el);

        var items = this.parseItems(nodes);
        if (items.length > 0) {
            attrs.items = items;
        }

        var vertical = jq.attr("vertical");
        if (vertical) {

            attrs.vertical = vertical == "true" ? true : false;
        }
        var allowSelectItem = jq.attr("allowSelectItem");
        if (allowSelectItem) {
            attrs.allowSelectItem = allowSelectItem == "true" ? true : false;
        }

        return attrs;
    }

});
mini.regClass(mini.Menu, 'menu');

/* MenuBar */
mini.MenuBar = function () {
    mini.MenuBar.superclass.constructor.call(this);
}
mini.extend(mini.MenuBar, mini.Menu, {
    uiCls: "mini-menubar",
    vertical: false,
    setVertical: function (value) {
        this.vertical = false;
    }
});
mini.regClass(mini.MenuBar, 'menubar');

/* ContextMenu */
mini.ContextMenu = function () {
    mini.ContextMenu.superclass.constructor.call(this);
}
mini.extend(mini.ContextMenu, mini.Menu, {
    uiCls: "mini-contextmenu",
    vertical: true,
    visible: false,
    _disableContextMenu: true,
    setVertical: function (value) {
        this.vertical = true;
    }
});
mini.regClass(mini.ContextMenu, 'contextmenu');

/* MenuItem */
mini.MenuItem = function () {
    mini.MenuItem.superclass.constructor.call(this);
}
mini.extend(mini.MenuItem, mini.Control, {
    text: "",
    iconCls: "",
    iconStyle: "",
    iconPosition: "left", //left/top

    showIcon: true,
    showAllow: true,

    checked: false,
    checkOnClick: false,
    groupName: "",

    _hoverCls: "mini-menuitem-hover",
    _pressedCls: "mini-menuitem-pressed",
    _checkedCls: "mini-menuitem-checked",

    _clearBorder: false,

    menu: null,

    uiCls: "mini-menuitem",
    _create: function () {
        var el = this.el = document.createElement("div");
        this.el.className = "mini-menuitem";

        this.el.innerHTML = '<div class="mini-menuitem-inner"><div class="mini-menuitem-icon"></div><div class="mini-menuitem-text"></div><div class="mini-menuitem-allow"></div></div>';
        this._innerEl = this.el.firstChild;
        this._iconEl = this._innerEl.firstChild;
        this._textEl = this._innerEl.childNodes[1];
        this.allowEl = this._innerEl.lastChild;
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
        }, this);

    },
    _inputEventsInited: false,
    _initInputEvents: function () {
        if (this._inputEventsInited) return;
        this._inputEventsInited = true;

        mini_onOne(this.el, "click", this.__OnClick, this);
        mini_onOne(this.el, "mouseup", this.__OnMouseUp, this);

        mini_onOne(this.el, "mouseout", this.__OnMouseOut, this);


    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmouseover = null
        }
        this.menu = this._innerEl = this._iconEl = this._textEl = this.allowEl = null;
        mini.MenuItem.superclass.destroy.call(this, removeEl);
    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this.menu && this.menu.within(e)) return true;
        return false;
    },
    _doUpdateIcon: function () {
        //if(this.text == "序号") debugger

        var hasIcon = this.iconStyle || this.iconCls || this.checkOnClick;
        if (this._iconEl) {
            mini.setStyle(this._iconEl, this.iconStyle);
            mini.addClass(this._iconEl, this.iconCls);
            this._iconEl.style.display = hasIcon ? "block" : "none";
        }
        if (this.iconPosition == "top") {
            mini.addClass(this.el, "mini-menuitem-icontop");
        } else {
            mini.removeClass(this.el, "mini-menuitem-icontop");
        }
    },
    _hasChildMenu: function () {
        return this.menu && this.menu.items.length > 0;
    },
    doUpdate: function () {
        if (this._textEl) this._textEl.innerHTML = this.text;
        this._doUpdateIcon();

        
        if (this.checked) {
            mini.addClass(this.el, this._checkedCls);
        } else {
            mini.removeClass(this.el, this._checkedCls);
        }
        if (this.allowEl) {
            
            if (this._hasChildMenu()) {

                this.allowEl.style.display = "block";
            } else {
                this.allowEl.style.display = "none";
            }
        }
    },
    setText: function (value) {
        this.text = value;
        //this.doUpdate();
        if (this._textEl) this._textEl.innerHTML = this.text;
    },
    getText: function () {
        return this.text;
    },
    setIconCls: function (value) {
        mini.removeClass(this._iconEl, this.iconCls);
        this.iconCls = value;
        //this.doUpdate();
        this._doUpdateIcon();
    },
    getIconCls: function () {
        return this.iconCls;
    },
    setIconStyle: function (value) {
        this.iconStyle = value;
        //this.doUpdate();
        this._doUpdateIcon();
    },
    getIconStyle: function () {
        return this.iconStyle;
    },
    setIconPosition: function (value) {
        this.iconPosition = value;
        //this.doUpdate();
        this._doUpdateIcon();
    },
    getIconPosition: function () {
        return this.iconPosition;
    },
    setCheckOnClick: function (value) {
        this.checkOnClick = value;
        if (value) {
            mini.addClass(this.el, "mini-menuitem-showcheck");
        } else {
            mini.removeClass(this.el, "mini-menuitem-showcheck");
        }
        this.doUpdate();
    },
    getCheckOnClick: function () {
        return this.checkOnClick;
    },
    setChecked: function (value) {
        if (this.checked != value) {
            this.checked = value;
            this.doUpdate();
            this.fire("checkedchanged");
        }
    },
    getChecked: function () {
        return this.checked;
    },
    setGroupName: function (value) {
        if (this.groupName != value) {
            this.groupName = value;
        }
    },
    getGroupName: function () {
        return this.groupName;
    },
    setChildren: function (value) {
        this.setMenu(value);
    },
    setMenu: function (value) {

        if (mini.isArray(value)) {
            value = {
                type: "menu",
                items: value
            };
        }
        if (this.menu !== value) {
            this.menu = mini.getAndCreate(value);
            this.menu.hide();
            this.menu.ownerItem = this;
            this.doUpdate();
            this.menu.on("itemschanged", this.__OnItemsChanged, this);

        }
    },
    getMenu: function () {
        return this.menu;
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
                        
            this.menu.showAtEl(this.el, options);

        }
    },
    hideMenu: function () {
        if (this.menu) this.menu.hide();
    },
    hide: function () {
        this.hideMenu();
        this.setVisible(false);
    },

    __OnItemsChanged: function (e) {
        this.doUpdate();
    },
    getTopMenu: function () {
        if (this.ownerMenu) {
            if (this.ownerMenu.ownerItem) return this.ownerMenu.ownerItem.getTopMenu();
            else return this.ownerMenu;
        }
        return null;
    },
    ///////////////////////////
    __OnClick: function (e) {

        if (this.isReadOnly()) return;

        if (this.checkOnClick) {
            if (this.ownerMenu && this.groupName) {
                var groups = this.ownerMenu.getGroupItems(this.groupName);
                if (groups.length > 0) {
                    if (this.checked == false) {
                        for (var i = 0, l = groups.length; i < l; i++) {
                            var item = groups[i];
                            if (item != this) {

                                item.setChecked(false);
                            }
                        }
                        this.setChecked(true);
                    }
                } else {
                    this.setChecked(!this.checked);
                }
            } else {
                this.setChecked(!this.checked);
            }
        }

        this.fire("click");

        var topMenu = this.getTopMenu();
        if (topMenu) {
            topMenu._OnItemClick(this, e);
        }
    },
    __OnMouseUp: function (e) {
        if (this.isReadOnly()) return;

        if (this.ownerMenu) {
            var me = this;
            setTimeout(function () {
                if (me.isDisplay()) {
                    me.ownerMenu.showItemMenu(me);

                }
            }, 1);
        }
    },
    __OnMouseOver: function (e) {
        //if(this.text == "Ajax") debugger
        if (this.isReadOnly()) return;
        this._initInputEvents();
        mini.addClass(this.el, this._hoverCls);

        this.el.title = this.text;

        if (this._textEl.scrollWidth > this._textEl.clientWidth) {
            this.el.title = this.text;
        } else {
            this.el.title = "";
        }

        if (this.ownerMenu) {
            if (this.ownerMenu.isVertical() == true) {
                this.ownerMenu.showItemMenu(this);
            } else if (this.ownerMenu.hasShowItemMenu()) {
                this.ownerMenu.showItemMenu(this);
            }
        }
    },

    __OnMouseOut: function (e) {
        mini.removeClass(this.el, this._hoverCls);
    },
    onClick: function (fn, scope) {
        this.on("click", fn, scope);
    },
    onCheckedChanged: function (fn, scope) {
        this.on("checkedchanged", fn, scope);
    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.MenuItem.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["text", "iconCls", "iconStyle", "iconPosition", "groupName", "onclick", "oncheckedchanged"
             ]
        );
        mini._ParseBool(el, attrs,
            ["checkOnClick", "checked"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.MenuItem, 'menuitem');


///////////////////////////////////////////
mini.Separator = function () {
    mini.Separator.superclass.constructor.call(this);
}
mini.extend(mini.Separator, mini.Control, {
    _clearBorder: false,
    uiCls: "mini-separator",
    _create: function () {
        this.el = document.createElement("span");
        this.el.className = "mini-separator";
    }
});
mini.regClass(mini.Separator, 'separator');