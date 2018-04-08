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

mini.OutlookTree = function () {
    mini.OutlookTree.superclass.constructor.call(this);

    this.data = [];
}
mini.extend(mini.OutlookTree, mini.OutlookBar, {
    url: "",
    textField: "text",
    iconField: "iconCls",
    urlField: "url",

    resultAsTree: false,
    nodesField: "children",
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

        mini.OutlookTree.superclass.set.call(this, kv);

        if (url) {
            this.setUrl(url);
        }
        if (mini.isNumber(activeIndex)) {
            this.setActiveIndex(activeIndex);
        }
        return this;
    },
    uiCls: "mini-outlooktree",
    destroy: function (removeEl) {
        if (this._trees) {
            var cs = this._trees.clone();
            for (var i = 0, l = cs.length; i < l; i++) {
                var p = cs[i];
                p.destroy();
            }
            this._trees.length = 0;
        }

        mini.OutlookTree.superclass.destroy.call(this, removeEl);
    },
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
            items = mini.arrayToTree(items, this.nodesField, this.idField, this.parentField)
        }

        var list = mini.treeToArray(items, this.nodesField, this.idField, this.parentField)
        this._doParseFields(list);

        this.createNavBarTree(items);
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

            this.createNavBarTree(value);
        }
    },
    setData: function (value) {
        this.load(value);
    },
    getData: function () {
        return this.data;
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
        var tree = this._getOwnerTree(node);
        tree.selectNode(node);
    },
    expandPath: function (node) {
        node = this.getNode(node);
        if (!node) return;
        var tree = this._getOwnerTree(node);
        tree.expandPath(node);
        this.expandGroup(tree._ownerGroup);
    },
    findNodes: function (fn, scope) {
        var nodes = [];
        scope = scope || this;
        for (var i = 0, l = this._trees.length; i < l; i++) {
            var tree = this._trees[i];
            var nds = tree.findNodes(fn, scope);
            nodes.addRange(nds);
        }
        return nodes;
    },
    getNode: function (node) {

        for (var i = 0, l = this._trees.length; i < l; i++) {
            var tree = this._trees[i];
            var n = tree.getNode(node);
            if (n) return n;
        }
        return null;
    },

    getList: function () {
        var list = [];
        for (var i = 0, l = this._trees.length; i < l; i++) {
            var tree = this._trees[i];
            var nodes = tree.getList();
            list.addRange(nodes);
        }
        return list;
    },
    _getOwnerTree: function (node) {
        if (!node) return;
        for (var i = 0, l = this._trees.length; i < l; i++) {
            var tree = this._trees[i];
            if (tree.getby_id(node._id)) return tree;
        }
    },
    expandOnLoad: false,
    setExpandOnLoad: function (value) {
        this.expandOnLoad = value;
    },
    getExpandOnLoad: function () {
        return this.expandOnLoad;
    },
    ////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.OutlookTree.superclass.getAttrs.call(this, el);

        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["url", "textField", "urlField", "idField", "parentField", "nodesField", "iconField",
                "onnodeclick", "onnodeselect", "onnodemousedown",
                "expandOnLoad"
            ]
        );
        mini._ParseBool(el, attrs,
            ["resultAsTree"]
        );


        if (attrs.expandOnLoad) {
            var level = parseInt(attrs.expandOnLoad);
            if (mini.isNumber(level)) {
                attrs.expandOnLoad = level;
            } else {
                attrs.expandOnLoad = attrs.expandOnLoad == "true" ? true : false;
            }
        }

        return attrs;
    },
    ////////////////////////////////////    
    autoCollapse: true,
    activeIndex: 0,
    createNavBarTree: function (tree) {
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

            group._children = o[this.nodesField];
        }

        this.setGroups(groups);
        this.setActiveIndex(this.activeIndex);

        //生成tree
        this._trees = [];
        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            var groupBodyEl = this.getGroupBodyEl(group);

            var tree = new mini.Tree();
            tree.set({
                idField: this.idField,
                parentField: this.parentField,
                textField: this.textField,
                expandOnLoad: this.expandOnLoad,
                showTreeIcon: true,
                style: "width:100%;height:100%;border:0;background:none",
                data: group._children
            });
            tree.render(groupBodyEl);
            tree.on("nodeclick", this.__OnNodeClick, this);
            tree.on("nodeselect", this.__OnNodeSelect, this);
            tree.on("nodemousedown", this.__OnNodeMouseDown, this);

            this._trees.push(tree);
            delete group._children

            tree._ownerGroup = group;

            //            var expandOnLoad = this.expandOnLoad;
            //            tree.cascadeChild(tree.root, function (node) {
            //                if (mini.isNull(node.expanded)) {
            //                    var level = this.getLevel(node);
            //                    if (expandOnLoad === true
            //                    || (mini.isNumber(this.expandOnLoad) && level <= this.expandOnLoad)) {
            //                        node.expanded = true;
            //                    } else {
            //                        node.expanded = false;
            //                    }
            //                }
            //            }, tree);
        }
    },
    __OnNodeMouseDown: function (e) {
        var eve = {
            node: e.node,
            isLeaf: e.sender.isLeaf(e.node),
            htmlEvent: e.htmlEvent
        };
        this.fire("nodemousedown", eve);
    },
    __OnNodeClick: function (e) {
        var eve = {
            node: e.node,
            isLeaf: e.sender.isLeaf(e.node),
            htmlEvent: e.htmlEvent
        };
        this.fire("nodeclick", eve);
    },
    __OnNodeSelect: function (e) {
        if (!e.node) return;
        for (var i = 0, l = this._trees.length; i < l; i++) {
            var tree = this._trees[i];
            if (tree != e.sender) {
                tree.selectNode(null);
            }
        }

        var eve = {
            node: e.node,
            isLeaf: e.sender.isLeaf(e.node),
            htmlEvent: e.htmlEvent
        };
        this._selected = e.node;
        this.fire("nodeselect", eve);
    }
});
mini.regClass(mini.OutlookTree, "outlooktree");

///////////////////////////////////////////////////
//兼容性考虑，不建议新版本使用

//NavBar
mini.NavBar = function () {
    mini.NavBar.superclass.constructor.call(this);
}
mini.extend(mini.NavBar, mini.OutlookBar, {
    uiCls: "mini-navbar"
});
mini.regClass(mini.NavBar, "navbar");

//NavBarMenu
mini.NavBarMenu = function () {
    mini.NavBarMenu.superclass.constructor.call(this);
}
mini.extend(mini.NavBarMenu, mini.OutlookMenu, {
    uiCls: "mini-navbarmenu"
});
mini.regClass(mini.NavBarMenu, "navbarmenu");

//NavBarTree
mini.NavBarTree = function () {
    mini.NavBarTree.superclass.constructor.call(this);
}
mini.extend(mini.NavBarTree, mini.OutlookTree, {
    uiCls: "mini-navbartree"
});
mini.regClass(mini.NavBarTree, "navbartree");