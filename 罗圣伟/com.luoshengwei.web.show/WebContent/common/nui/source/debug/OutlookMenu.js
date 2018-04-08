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

mini.OutlookMenu = function () {
    mini.OutlookMenu.superclass.constructor.call(this);

    this.data = [];
}
mini.extend(mini.OutlookMenu, mini.OutlookBar, {
    url: "",
    textField: "text",
    iconField: "iconCls",
    urlField: "url",

    resultAsTree: false,
    itemsField: "children",
    idField: "id",
    parentField: "pid",

    style: "width:100%;height:100%;",
    //borderStyle: "border:0;",

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var url = kv.url;
        delete kv.url;
        var activeIndex = kv.activeIndex;
        delete kv.activeIndex;

        mini.OutlookMenu.superclass.set.call(this, kv);

        if (url) {
            this.setUrl(url);
        }
        if (mini.isNumber(activeIndex)) {
            this.setActiveIndex(activeIndex);
        }
        return this;
    },
    uiCls: "mini-outlookmenu",
    destroy: function (removeEl) {
        if (this._menus) {
            var cs = this._menus.clone();
            for (var i = 0, l = cs.length; i < l; i++) {
                var p = cs[i];
                p.destroy();
            }
            this._menus.length = 0;
        }

        mini.OutlookMenu.superclass.destroy.call(this, removeEl);
    },
    //    _create: function () {
    //        this.el = document.createElement("div");

    //        this.el.className = "mini-outlookmenu";

    //    },
    //    _initEvents: function () {

    //    },
    ///////////////////////////////////
    _doParseFields: function (list) {
        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            o.text = o[this.textField];
            o.url = o[this.urlField];
            o.iconCls = o[this.iconField];
        }
    },
    _doLoad: function () {
        var items = [];
        try {
            items = mini.getData(this.url);
        } catch (ex) {

            if (mini_debugger == true) {
                alert("outlooktree json is error.");
            }
        }

        if (this.dataField) {
            items = mini._getMap(this.dataField, items);
        }
        if (!items) items = [];

        if (this.resultAsTree == false) {
            items = mini.arrayToTree(items, this.itemsField, this.idField, this.parentField)
        }

        var list = mini.treeToArray(items, this.itemsField, this.idField, this.parentField)
        this._doParseFields(list);
        //        for (var i = 0, l = list.length; i < l; i++) {
        //            var o = list[i];
        //            o.text = o[this.textField];
        //            o.url = o[this.urlField];
        //            o.iconCls = o[this.iconField];
        //        }

        this.createNavBarMenu(items);
        this.fire("load");
    },
    loadList: function (list, idField, parentField) {
        idField = idField || this.idField;
        parentField = parentField || this.parentField;
        this._doParseFields(list);
        var tree = mini.arrayToTree(list, this.nodesField, idField, parentField);
        this.load(tree);
    },
    load: function (value) {
        if (typeof value == "string") {
            this.setUrl(value);
        } else {
            var list = mini.treeToArray(value, this.itemsField, this.idField, this.parentField)
            this._doParseFields(list);

            this.createNavBarMenu(value);
        }
    },
    setData: function (value) {
        this.load(value);
    },
    setUrl: function (value) {
        this.url = value;
        this._doLoad();
    },
    getUrl: function () {
        return this.url;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    setIconField: function (value) {
        this.iconField = value;
    },
    getIconField: function () {
        return this.iconField;
    },
    setUrlField: function (value) {
        this.urlField = value;
    },
    getUrlField: function () {
        return this.urlField;
    },
    setResultAsTree: function (value) {
        this.resultAsTree = value;
    },
    getResultAsTree: function () {
        return this.resultAsTree;
    },
    setNodesField: function (value) {
        this.nodesField = value;
    },
    getNodesField: function () {
        return this.nodesField;
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
    _selected: null,
    getSelected: function () {
        return this._selected;
    },
    selectNode: function (node) {

        node = this.getNode(node);
        if (!node) return;

        var menu = this._getOwnerMenu(node);
        if (!menu) return;
        this.expandGroup(menu._ownerGroup);

        setTimeout(function () {
            try {
                menu.setSelectedItem(node);
            } catch (ex) { }
        }, 100);

    },
    findNodes: function (fn, scope) {
        var nodes = [];
        scope = scope || this;
        for (var i = 0, l = this._menus.length; i < l; i++) {
            var items = this._menus[i].getItems();
            var nds = [];
            for (var j = 0, k = items.length; j < k; j++) {
                var item = items[j];
                if (fn && fn.call(scope, item) === true) {
                    nds.push(item);
                }
            }
            nodes.addRange(nds);
        }
        return nodes;
    },
    getNode: function (node) {
        for (var i = 0, l = this._menus.length; i < l; i++) {
            var menu = this._menus[i];
            var n = menu.getItem(node);
            if (n) return n;
        }
        return null;
    },
    getList: function () {
        var list = [];
        for (var i = 0, l = this._menus.length; i < l; i++) {
            var menu = this._menus[i];
            var items = menu.getItems();
            list.addRange(items);
        }
        return list;
    },
    _getOwnerMenu: function (node) {
        if (!node) return;
        for (var i = 0, l = this._menus.length; i < l; i++) {
            var menu = this._menus[i];
            var n = menu.getItem(node);
            if (n) return menu;
        }
    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.OutlookMenu.superclass.getAttrs.call(this, el);

        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["url", "textField", "urlField", "idField", "parentField", "itemsField", "iconField",
                "onitemclick", "onitemselect"]
        );
        mini._ParseBool(el, attrs,
            ["resultAsTree"]
        );

        return attrs;
    },
    ////////////////////////////////////
    autoCollapse: true,
    activeIndex: 0,
    createNavBarMenu: function (tree) {
        if (!mini.isArray(tree)) tree = [];
        this.data = tree;
                
        //生成groups
        var groups = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            var group = {};
            group.title = o.text;
            group.iconCls = o.iconCls;
            groups.push(group);

            group._children = o[this.itemsField];
        }

        this.setGroups(groups);
        this.setActiveIndex(this.activeIndex);


        //生成menu
        this._menus = [];
        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            var groupBodyEl = this.getGroupBodyEl(group);

            var menu = new mini.Menu();
            menu._ownerGroup = group;
            menu.set({
                showNavArrow: false,
                style: "width:100%;height:100%;border:0;background:none",
                borderStyle: "border:0",
                allowSelectItem: true,
                items: group._children
            });
            menu.render(groupBodyEl);
            menu.on("itemclick", this.__OnItemClick, this);
            menu.on("itemselect", this.__OnItemSelect, this);

            this._menus.push(menu);
            delete group._children


        }
    },
    __OnItemClick: function (e) {
        var eve = {
            item: e.item,
            htmlEvent: e.htmlEvent
        };
        this.fire("itemclick", eve);
    },
    __OnItemSelect: function (e) {
        if (!e.item) return;
        for (var i = 0, l = this._menus.length; i < l; i++) {
            var menu = this._menus[i];
            if (menu != e.sender) {
                menu.setSelectedItem(null);
            }
        }
        var eve = {
            item: e.item,
            htmlEvent: e.htmlEvent
        };
        this._selected = e.item;
        this.fire("itemselect", eve);
    }
});
mini.regClass(mini.OutlookMenu, "outlookmenu");

