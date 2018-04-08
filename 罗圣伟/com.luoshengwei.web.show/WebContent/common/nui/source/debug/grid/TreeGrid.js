/*
描述：TreeGrid
节点对象：{ enabled, expanded, checked, checkState, checkable, asyncLoad, isLeaf, children }
    0.checked(true|false), checkState(indeterminate|unchecked|checked)
    1.checkable 决定是否可以选中。设置false，会隐藏checkbox。
    2.enabled 决定是否灰化显示，禁止点击、选择操作
    3.isLeaf 决定是否显示成父节点样子
    4.asyncLoad 决定是否可以懒加载。设置false，展开时不懒加载
            
    node.showCheckBox?
    是否显示checkbox。   也可以在ondrawcell的时候，e.showCheckBox=false;
    node.checkable
    是否禁用checkbox。
    
    1.isLeaf：没有子节点，有isLeaf="true"，也返回true，显示成一个父节点
    2.hasChildren：只判断子节点。
*/

mini.TreeGrid = function () {
    mini.TreeGrid.superclass.constructor.call(this);
    mini.addClass(this.el, 'mini-tree');

    this.setAjaxAsync(false);
    this.setAutoLoad(true);

    if (this.showTreeLines == true) {
        mini.addClass(this.el, 'mini-tree-treeLine');
    }

    this._AsyncLoader = new mini._Tree_AsyncLoader(this);
    this._Expander = new mini._Tree_Expander(this);
};
mini.copyTo(mini.TreeGrid.prototype, mini._DataTreeApplys);

mini.extend(mini.TreeGrid, mini.DataGrid, {
    isTree: true,

    uiCls: "mini-treegrid",

    showPager: false,
    showNewRow: false,

    showCheckBox: false,    //checkbox
    showTreeIcon: true,     //节点图标    
    showExpandButtons: true,    //+、-号的连线
    showTreeLines: false,        //连线
    showArrow: false,

    expandOnDblClick: true,
    expandOnNodeClick: false,
    loadOnExpand: true,

    _checkBoxType: "checkbox",

    iconField: "iconCls",

    _treeColumn: null,

    leafIconCls: "mini-tree-leaf",
    folderIconCls: "mini-tree-folder",

    fixedRowHeight: false,  //固定高度

    _checkBoxCls: "mini-tree-checkbox",
    _expandNodeCls: "mini-tree-expand",
    _collapseNodeCls: "mini-tree-collapse",
    _eciconCls: "mini-tree-node-ecicon",
    _inNodeCls: "mini-tree-nodeshow",

    indexOf: function (record) {
        return this._dataSource.indexOfList(record);
    },

    _getDragText: function (dragNodes) {
        return "Nodes " + dragNodes.length;
    },
    _initEvents: function () {
        mini.TreeGrid.superclass._initEvents.call(this);

        this.on("nodedblclick", this.__OnNodeDblClick, this);
        this.on("nodeclick", this.__OnNodeClick, this);


        //adapter events
        this.on("cellclick", function (e) {
            e.node = e.record;
            e.isLeaf = this.isLeaf(e.node);
            this.fire("nodeclick", e);
        }, this);
        this.on("cellmousedown", function (e) {
            e.node = e.record;
            e.isLeaf = this.isLeaf(e.node);
            this.fire("nodemousedown", e);
        }, this);
        this.on("celldblclick", function (e) {
            e.node = e.record;
            e.isLeaf = this.isLeaf(e.node);
            this.fire("nodedblclick", e);
        }, this);

        this.on("beforerowselect", function (e) {
            e.node = e.selected;
            e.isLeaf = this.isLeaf(e.node);
            this.fire("beforenodeselect", e);
        }, this);
        this.on("rowselect", function (e) {
            e.node = e.selected;
            e.isLeaf = this.isLeaf(e.node);
            this.fire("nodeselect", e);
        }, this);

    },
    setValue: function (value, cascade) {
        if (mini.isNull(value)) value = "";
        value = String(value);
        if (this.getValue() != value) {
            var nodes = this.getCheckedNodes();
            this.uncheckNodes(nodes);
            this.value = value;
            if (this.showCheckBox) {
                var ids = String(value).split(",");
                this._dataSource.doCheckNodes(ids, true, cascade !== false);
                //                for (var i = 0, l = ids.length; i < l; i++) {
                //                    this.checkNode(ids[i]);
                //                }
            } else {
                this.selectNode(value);
            }
        }
    },
    getValue: function (mode) {
        if (this.showCheckBox) {
            if (mode === false) mode = 'leaf';
            return this._dataSource.getCheckedNodesId(mode);
        } else {
            return this._dataSource.getSelectedsId();
        }
    },
    getText: function () {
        var nodes = [];
        if (this.showCheckBox) {
            nodes = this.getCheckedNodes();
        } else {
            var node = this.getSelectedNode();
            if (node) nodes.push(node);
        }

        var sb = [], textField = this.getTextField();
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            sb.push(node[textField]);
        }

        return sb.join(',');
    },
    //////////////////////////////////////////////////////////
    isGrouping: function () {
        return false;
    },
    _createSource: function () {
        this._dataSource = new mini.DataTree();
    },
    _bindSource: function () {
        mini.TreeGrid.superclass._bindSource.call(this);
        var source = this._dataSource;

        source.on("expand", this.__OnTreeExpand, this);
        source.on("collapse", this.__OnTreeCollapse, this);

        source.on("checkchanged", this.__OnCheckChanged, this);

        source.on("addnode", this.__OnSourceAddNode, this);
        source.on("removenode", this.__OnSourceRemoveNode, this);
        source.on("movenode", this.__OnSourceMoveNode, this);

        source.on("beforeloadnode", this.__OnBeforeLoadNode, this);
        source.on("loadnode", this.__OnLoadNode, this);
    },
    __OnBeforeLoadNode: function (e) {
        this.__showLoading = this.showLoading;
        this.showLoading = false;
        this.addNodeCls(e.node, "mini-tree-loading");
        this.fire("beforeloadnode", e);
    },
    __OnLoadNode: function (e) {
        this.showLoading = this.__showLoading;
        this.removeNodeCls(e.node, "mini-tree-loading");
        this.fire("loadnode", e);
    },
    __OnSourceAddNode: function (e) {
        this._doAddNodeEl(e.node);
        this.fire("addnode", e);
    },
    __OnSourceRemoveNode: function (e) {
        this._doRemoveNodeEl(e.node);

        //更新父节点        
        var parentNode = this.getParentNode(e.node);
        var nodes = this.getChildNodes(parentNode);
        if (nodes.length == 0) {
            this._doUpdateTreeNodeEl(parentNode);
        }
        this.fire("removenode", e);
    },
    __OnSourceMoveNode: function (e) {
        this._doMoveNodeEl(e.node);
        this.fire("movenode", e);
    },
    _doAddNodeEl: function (node) {
        var columns1 = this.getFrozenColumns();
        var columns2 = this.getUnFrozenColumns();

        var parentNode = this.getParentNode(node);
        var rowIndex = this.indexOf(node);

        var updateParent = false;
        function doAdd(node, columns, viewIndex) {
            var s = this._createRowHTML(node, rowIndex, columns, viewIndex);

            var index = this.indexOfNode(node) + 1;
            var targetNode = this.getChildNodeAt(index, parentNode);
            if (targetNode) {
                var targetEl = this._getNodeEl(targetNode, viewIndex);
                jQuery(targetEl).before(s);
            } else {
                var nodesEl = this._getNodesEl(parentNode, viewIndex);
                if (nodesEl) {
                    mini.append(nodesEl.firstChild, s);
                } else {
                    updateParent = true;
                }
            }
        }

        doAdd.call(this, node, columns2, 2);
        doAdd.call(this, node, columns1, 1);

        if (updateParent) {
            this._doUpdateTreeNodeEl(parentNode);
        }
    },
    _doRemoveNodeEl: function (node) {
        this._doRemoveRowEl(node);
        var nodesEl = this._getNodesEl(node, 1);
        var nodesEl2 = this._getNodesEl(node, 2);
        if (nodesEl) nodesEl.parentNode.removeChild(nodesEl);
        if (nodesEl2) nodesEl2.parentNode.removeChild(nodesEl2);


    },
    _doMoveNodeEl: function (node) {
        //1）删除节点        
        this._doRemoveNodeEl(node);
        //2）更新父节点

        var parentNode = this.getParentNode(node);
        this._doUpdateTreeNodeEl(parentNode);
    },
    _doUpdateNodeTitle: function (node) {
        this._doUpdateTreeNodeEl(node, false);
    },
    _doUpdateTreeNodeEl: function (node, hasChild) {
        //更新：节点、子节点
        hasChild = hasChild !== false;

        var rootNode = this.getRootNode();
        if (rootNode == node) {
            this.doUpdate();
            return;
        }

        var objNode = node;
        var frozenColumns = this.getFrozenColumns();
        var unfrozenColumns = this.getUnFrozenColumns();

        var lockHtml = this._createNodeHTML(node, frozenColumns, 1, null, hasChild);
        var html = this._createNodeHTML(node, unfrozenColumns, 2, null, hasChild);

        var nodeEl1 = this._getNodeEl(node, 1);
        var nodeEl2 = this._getNodeEl(node, 2);
        var nodesEl1 = this._getNodesTr(node, 1);
        var nodesEl2 = this._getNodesTr(node, 2);

        //1）
        var els = mini.createElements(lockHtml);
        var node = els[0];
        var nodes = els[1];
        if (nodeEl1) {
            mini.before(nodeEl1, node);
            if (hasChild) {
                mini.before(nodeEl1, nodes);
            }

            mini.removeNode(nodeEl1);
            if (hasChild) {
                mini.removeNode(nodesEl1);
            }
        }
        //2）
        var els = mini.createElements(html);
        var node = els[0];
        var nodes = els[1];
        if (nodeEl2) {
            mini.before(nodeEl2, node);
            if (hasChild) {
                mini.before(nodeEl2, nodes);
            }

            mini.removeNode(nodeEl2);
            if (hasChild) {
                mini.removeNode(nodesEl2);
            }
        }

        if (node.checked != true && !this.isLeaf(node)) {
            this._doCheckNodeEl(objNode);
        }
    },
    addNodeCls: function (node, cls) {
        this.addRowCls(node, cls);
    },
    removeNodeCls: function (node, cls) {
        this.removeRowCls(node, cls);
    },
    /////////////////////////////////////////////////////////////////
    doUpdate: function () {

        mini.TreeGrid.superclass.doUpdate.apply(this, arguments);
        //this._doUpdate
    },
    setData: function (data) {
        if (!data) data = [];
        this._dataSource.setData(data);
    },
    loadList: function (list, idField, parentField) {
        idField = idField || this.getIdField();
        parentField = parentField || this.getParentField();
        var tree = mini.listToTree(list, this.getNodesField(), idField, parentField);
        this.setData(tree);
    },
    //    _OnDrawNode: function (e) {
    //        var showCheckBox = this.showCheckBox;
    //        if (showCheckBox && this.hasChildren(node)) {
    //            showCheckBox = this.showFolderCheckBox;
    //        }
    //        var nodeHtml = this.getItemText(node);
    //        var e = {
    //            isLeaf: this.isLeaf(node),
    //            node: node,
    //            nodeHtml: nodeHtml,
    //            nodeCls: '',
    //            nodeStyle: "",
    //            showCheckBox: showCheckBox,
    //            iconCls: this.getNodeIcon(node),
    //            img: node[this.imgField],
    //            showTreeIcon: this.showTreeIcon
    //        };
    //        this.fire("drawnode", e);
    //        if (e.nodeHtml === null || e.nodeHtml === undefined || e.nodeHtml === "") e.nodeHtml = "&nbsp;";
    //        return e;
    //    },
    _createDrawCellEvent: function (record, column, rowIndex, columnIndex) {
        var e = mini.TreeGrid.superclass._createDrawCellEvent.call(this, record, column, rowIndex, columnIndex);
        e.node = e.record;
        e.isLeaf = this.isLeaf(e.node);
        if (this._treeColumn && this._treeColumn == column.name) {
            e.isTreeCell = true;

            e.img = record[this.imgField];
            e.iconCls = this._getNodeIcon(record);
            e.nodeCls = "";
            e.nodeStyle = "";
            e.nodeHtml = "";

            e.showTreeIcon = this.showTreeIcon;
            e.checkBoxType = this._checkBoxType;
            e.showCheckBox = this.showCheckBox;
            if (e.showCheckBox && !e.isLeaf) {
                e.showCheckBox = this.showFolderCheckBox;
            }

            e.checkable = this.getCheckable(e.node);
            //            if (this.getOnlyLeafCheckable() && !this.isLeaf(record)) {
            //                e.showCheckBox = false;
            //            }
            //            if (record.checkable === false) {
            //                e.showCheckBox = false;
            //            }
        }
        return e;
    },
    _OnDrawCell: function (record, column, rowIndex, columnIndex) {
        var e = mini.TreeGrid.superclass._OnDrawCell.call(this, record, column, rowIndex, columnIndex);

        if (this._treeColumn && this._treeColumn == column.name) {

            this.fire("drawnode", e);
            if (e.nodeStyle) {
                e.cellStyle = e.nodeStyle;
            }
            if (e.nodeCls) {
                e.cellCls = e.nodeCls;
            }
            if (e.nodeHtml) {
                e.cellHtml = e.nodeHtml;
            }

            this._createTreeColumn(e);
        }
        return e;
    },
    _isViewFirstNode: function (node) {
        if (this._viewNodes) {
            var pnode = this.getParentNode(node);
            var nodes = this._getViewChildNodes(pnode);
            return nodes[0] === node;
        } else {
            return this.isFirstNode(node);
        }
    },
    _isViewLastNode: function (node) {
        if (this._viewNodes) {
            var pnode = this.getParentNode(node);
            var nodes = this._getViewChildNodes(pnode);
            return nodes[nodes.length - 1] === node;
        } else {
            return this.isLastNode(node);
        }
    },
    _isInViewLastNode: function (node, level) {
        if (this._viewNodes) {
            var pnode = null;
            var ans = this.getAncestors(node);
            for (var i = 0, l = ans.length; i < l; i++) {
                var a = ans[i];
                if (this.getLevel(a) == level) {
                    pnode = a;
                }
            }
            if (!pnode || pnode == this.root) return false;
            return this._isViewLastNode(pnode);
        } else {
            return this.isInLastNode(node, level);
        }
    },
    isInLastNode: function (node, level) {
        var pnode = null;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            var a = ans[i];
            if (this.getLevel(a) == level) {
                pnode = a;
            }
        }
        if (!pnode || pnode == this.root) return false;
        return this.isLastNode(pnode);
    },
    _createNodeTitle: function (node, sb, e) {
        var isReturn = !sb;
        if (!sb) sb = [];

        var isLeaf = this.isLeaf(node);
        var level = this.getLevel(node);

        var cls = e.nodeCls;

        if (!isLeaf) {
            cls = this.isExpandedNode(node) ? this._expandNodeCls : this._collapseNodeCls;
        }

        if (node.enabled === false) {
            cls += " mini-disabled";
        }
        if (!isLeaf) {
            cls += " mini-tree-parentNode";
        }

        var subNodes = this.getChildNodes(node);
        var hasChilds = subNodes && subNodes.length > 0;

        sb[sb.length] = '<div class="mini-tree-nodetitle ' + cls + '" style="' + e.nodeStyle + '">';

        //if (!this.showExpandButtons) level -= 1;

        var parentNode = this.getParentNode(node);
        var ii = 0;
        //if (!this.showExpandButtons && parentNode && !hasChilds) ii = 1;
        for (var i = ii; i <= level; i++) {
            if (i == level) continue;

            if (isLeaf) {
                //if (this.showExpandButtons == false && i >= level - 1) {
                if (i > level - 1) {
                    continue;
                }
            }

            var indentStyle = "";
            if (this._isInViewLastNode(node, i)) {
                indentStyle = "background:none";
            }


            sb[sb.length] = '<span class="mini-tree-indent " style="' + indentStyle + '"></span>';
        }


        var ecCls = "";
        if (this._isViewFirstNode(node) && level == 0) {
            ecCls = "mini-tree-node-ecicon-first";
        } else if (this._isViewLastNode(node)) {
            ecCls = "mini-tree-node-ecicon-last";
        }

        if (this._isViewFirstNode(node) && this._isViewLastNode(node)) {
            //ecCls = "mini-tree-node-ecicon-firstAndlast";
            ecCls = "mini-tree-node-ecicon-last";
            if (parentNode == this.root) {
                ecCls = "mini-tree-node-ecicon-firstLast";
            }
        }

        if (!isLeaf) {
            sb[sb.length] = '<a class="' + this._eciconCls + ' ' + ecCls + '" style="' + (this.showExpandButtons ? "" : "display:none") + '" href="javascript:void(0);" onclick="return false;" hidefocus></a>';
        } else {
            sb[sb.length] = '<span class="' + this._eciconCls + ' ' + ecCls + '" style="' + (this.showExpandButtons ? "" : "display:none") + '"></span>';
        }


        sb[sb.length] = '<span class="mini-tree-nodeshow">';
        if (e.showTreeIcon) {
            if (e.img) {
                var img = this.imgPath + e.img;
                sb[sb.length] = '<span class="mini-tree-icon" style="background-image:url(' + img + ');"></span>';
            } else {
                sb[sb.length] = '<span class="' + e.iconCls + ' mini-tree-icon"></span>';
            }
        }

        if (e.showCheckBox) {
            var ckid = this._createCheckNodeId(node);
            var checked = this.isCheckedNode(node);
            var enabled = e.enabled === false ? "disabled" : "";
            if (e.enabled !== false) {
                enabled = e.checkable === false ? "disabled" : "";
            }

            sb[sb.length] = '<input type="checkbox" id="' + ckid + '" class="' + this._checkBoxCls + '" hidefocus ' + (checked ? "checked" : "") + ' ' + (enabled) + ' onclick="return false;"/>';
        }

        sb[sb.length] = '<span class="mini-tree-nodetext">';
        if (this._editingNode == node) {
            var editId = this._id + "$edit$" + node._id;
            var text = e.value;
            sb[sb.length] = '<input id="' + editId + '" type="text" class="mini-tree-editinput" value="' + text + '"/>';
        } else {
            sb[sb.length] = e.cellHtml;
        }

        sb[sb.length] = '</span>';
        sb[sb.length] = '</span>';

        sb[sb.length] = '</div>';


        if (isReturn) return sb.join('');
    },
    _createTreeColumn: function (e) {
        var node = e.record, column = e.column;

        e.headerCls += ' mini-tree-treecolumn';
        e.cellCls += ' mini-tree-treecell';
        e.cellStyle += ';padding:0;vertical-align:top;';


        var isLeaf = this.isLeaf(node);


        e.cellHtml = this._createNodeTitle(node, null, e);
        //e.rowCls += ' ' + cls;

        if (node.checked != true && !isLeaf) {//1）父节点；2）没选中
            var checkState = this.getCheckState(node);
            if (checkState == "indeterminate") {
                this._renderCheckState(node);
            }
        }
    },
    _createCheckNodeId: function (node) {
        return this._id + "$checkbox$" + node._id;
    },
    //    _createTreeColumn: function (e) {
    //        var node = e.record, column = e.column;

    //        //        if (e.showCheckBox) {
    //        //            node.checkable = true;
    //        //        }        

    //        e.headerCls += ' mini-tree-treecolumn';
    //        e.cellCls += ' mini-tree-treecell';
    //        e.cellStyle += ';padding:0;vertical-align:top;';
    //        //e.cellInnerStyle = 'padding:0px';

    //        var isLeaf = this.isLeaf(node);
    //        var level = this.getLevel(node);

    //        if (!isLeaf) {
    //            e.rowCls += " mini-tree-parentNode";
    //        }

    //        var sb = [];
    //        sb[sb.length] = '<div class="mini-tree-nodetitle" style="padding-left:';
    //        sb[sb.length] = (level + 1) * 18;
    //        sb[sb.length] = 'px;">';
    //        //        e.cellInnerCls = 'mini-tree-nodetitle';
    //        //        e.cellInnerStyle = 'padding-left:' + (level + 1) * 18 + "px";

    //        var left = 0;

    //        for (var i = 0; i <= level; i++) {
    //            if (i == level && !isLeaf) break;
    //            if (this.showTreeLine) {
    //                sb[sb.length] = '<span class="mini-tree-indent " style="left:' + left + 'px;"></span>';
    //            }
    //            left += 18;
    //        }
    //        var cls = "";
    //        if (!isLeaf) {
    //            cls = this.isExpandedNode(node) ? 'mini-tree-expand' : 'mini-tree-collapse';
    //            var _left = mini.isIE6 ? left - 18 * (level+1) : left;
    //            sb[sb.length] = '<span class="mini-tree-ec-icon" style="left:' + (_left) + 'px;"></span>';
    //            left += 18;
    //        }
    //        sb[sb.length] = '<div class="mini-tree-nodeshow">';


    //        if (e.showTreeIcon) {
    //            var icon = e.iconCls;
    //            var _left = mini.isIE6 ? left - 18 * (level+1) : left;
    //            sb[sb.length] = '<div class="' + icon + ' mini-tree-nodeicon" style="left:' + _left + 'px;"></div>';
    //        }
    //        var offset = e.showTreeIcon ? 18 : 0;

    //        if (e.showCheckBox) {
    //            left += 18;
    //            offset += 18;
    //            var id = this._id + "$checkbox$" + node._id;
    //            var checked = node.checked ? "checked" : "";
    //            var checkable = this.getCheckable(node) ? "" : "disabled";
    //            var _left = mini.isIE6 ? left - 18 * (level + 1) : left;
    //            sb[sb.length] = '<input type="' + e.checkBoxType + '" id="' + id + '" ' + checked + ' ' + checkable + ' class="mini-tree-checkbox" style="left:' + _left + 'px;" hideFocus onclick="return false"/>';
    //        }

    //        sb[sb.length] = '<div class="mini-tree-nodetext" style="margin-left:' + offset + 'px;">';
    //        sb[sb.length] = e.cellHtml;
    //        sb[sb.length] = '</div></div></div>';

    //        e.cellHtml = sb.join('');
    //        e.rowCls += ' ' + cls;

    //        if (node.checked != true && !isLeaf) {//1）父节点；2）没选中
    //            var checkState = this.getCheckState(node);
    //            if (checkState == "indeterminate") {
    //                this._renderCheckState(node);
    //            }
    //        }
    //    },
    _renderCheckState: function (node) {
        if (!this._renderCheckStateNodes) this._renderCheckStateNodes = [];
        this._renderCheckStateNodes.push(node);
        if (this._renderCheckStateTimer) return;
        var me = this;
        this._renderCheckStateTimer = setTimeout(function () {

            me._renderCheckStateTimer = null;
            var nodes = me._renderCheckStateNodes;
            me._renderCheckStateNodes = null;
            for (var i = 0, l = nodes.length; i < l; i++) {
                me._doCheckNodeEl(nodes[i]);
            }


        }, 1);
    },
    //创建树形层次HTML：非动态模式时有用
    _createNodeHTML: function (node, columns, viewIndex, sb, hasChild) {
        var isReturn = !sb;
        if (!sb) sb = [];

        var source = this._dataSource;

        //node html
        var rowIndex = source.getDataView().indexOf(node); //数据量大，index有点慢
        this._createRowHTML(node, rowIndex, columns, viewIndex, sb);

        //nodes html
        if (hasChild !== false) {
            var cnodes = source.getChildNodes(node);
            var isVisible = this.isVisibleNode(node);
            if (cnodes && cnodes.length > 0) {
                var isExpand = this.isExpandedNode(node);
                if (isExpand == true) {
                    var style = (isExpand && isVisible) ? "" : "display:none";
                    var nodesId = this._createNodesId(node, viewIndex);
                    sb[sb.length] = '<tr class="mini-tree-nodes-tr" style="';
                    if (mini.isIE) sb[sb.length] = style;
                    sb[sb.length] = '" ><td class="mini-tree-nodes-td" colspan="';
                    sb[sb.length] = columns.length;
                    sb[sb.length] = '" >';

                    sb[sb.length] = '<div class="mini-tree-nodes" id="';
                    sb[sb.length] = nodesId;
                    sb[sb.length] = '" style="';
                    sb[sb.length] = style;
                    sb[sb.length] = '">';
                    this._createNodesHTML(cnodes, columns, viewIndex, sb);
                    sb[sb.length] = '</div>';

                    sb[sb.length] = '</td></tr>';
                }
            }
        }
        if (isReturn) return sb.join('');
    },
    _createNodesHTML: function (nodes, columns, viewIndex, sb) {
        if (!nodes) return '';
        var isReturn = !sb;
        if (!sb) sb = [];

        sb.push('<table class="mini-grid-table" cellspacing="0" cellpadding="0" border="0">');
        sb.push(this._createTopRowHTML(columns));
        if (columns.length > 0) {
            for (var j = 0, k = nodes.length; j < k; j++) {
                var node = nodes[j];
                this._createNodeHTML(node, columns, viewIndex, sb);
            }
        }
        sb.push('</table>');
        if (isReturn) return sb.join('');
    },

    _createRowsHTML: function (columns, viewIndex) {
        if (this.isVirtualScroll()) {
            return mini.TreeGrid.superclass._createRowsHTML.apply(this, arguments);
        }

        var source = this._dataSource, me = this;

        var sb = [];

        //第一次进来，不创建节点
        var nodes = [];
        var rootNode = source.getRootNode();
        if (this._useEmptyView !== true) {
            nodes = source.getChildNodes(rootNode);
        }
        //createNodes(nodes);

        var nodesEl = viewIndex == 2 ? this._rowsViewEl.firstChild : this._rowsLockEl.firstChild;
        nodesEl.id = this._createNodesId(rootNode, viewIndex);

        this._createNodesHTML(nodes, columns, viewIndex, sb);

        return sb.join('');
    },
    /////////////////////////////////
    _createNodesId: function (node, viewIndex) {
        var id = this._id + "$nodes" + viewIndex + "$" + node._id;
        return id;
    },
    _getNodeEl: function (node, viewIndex) {
        //if (this.isVisibleNode(node) == false) return null;
        return this._getRowEl(node, viewIndex);
    },
    _getNodesEl: function (node, viewIndex) {
        //if (this.isVisibleNode(node) == false) return null;
        node = this.getNode(node);
        var id = this._createNodesId(node, viewIndex);
        return document.getElementById(id);
    },
    _getNodesTr: function (node, viewIndex) {
        //if (this.isVisibleNode(node) == false) return null;
        var el = this._getNodesEl(node, viewIndex);
        if (el) return el.parentNode.parentNode;
    },
    /////////////////////////////////////////////////
    setTreeColumn: function (value) {
        this._treeColumn = value;
        this.deferUpdate();
    },
    getTreeColumn: function () {
        return this._treeColumn;
    },
    setShowTreeIcon: function (value) {
        this.showTreeIcon = value;
        this.deferUpdate();
    },
    getShowTreeIcon: function () {
        return this.showTreeIcon;
    },
    setShowCheckBox: function (value) {
        this.showCheckBox = value;
        this.deferUpdate();
    },
    getShowCheckBox: function () {
        return this.showCheckBox;
    },

    setCheckBoxType: function (value) {
        this._checkBoxType = value;
        this._doUpdateCheckState();
    },
    getCheckBoxType: function () {
        return this._checkBoxType;
    },
    setIconsField: function (value) {
        this._iconsField = value;
    },
    getIconsField: function () {
        return this._iconsField;
    },
    //////////////////////////////////
    _getNodeIcon: function (node) {
        var icon = node[this.iconField];
        if (!icon) {
            if (this.isLeaf(node)) icon = this.leafIconCls;
            else icon = this.folderIconCls;
        }
        return icon;
    },
    _getCheckBoxEl: function (node) {
        if (this.isVisibleNode(node) == false) return null;
        var id = this._id + "$checkbox$" + node._id;
        return mini.byId(id, this.el);
    },
    //////////////////////////

    //    setRootNodeText: function (value) {
    //        var node = this.getRootNode();
    //        node[this._textField] = value;
    //        this._doUpdateRowEl(node);
    //    },

    //////////////////////////
    useAnimation: true,
    _doExpandCollapseNode: function (node) {

        var sss = new Date();
        if (this.isVirtualScroll() == true) {

            this.doUpdateRows();         //30条，55ms
            //this._stopUpdateTableView();
            this.deferLayout(50);

            //                    setTimeout(function () {
            //                        alert(new Date() - sss);
            //                    }, 20);
            return;
        }

        //

        function onCallback() {
            this._doUpdateTreeNodeEl(node);
            this.deferLayout(20);
        }

        //this._layoutColumns(30);

        //////////////////////////////////////////////////////////////////////
        //if (this._inAniming) {

        if (false || mini.isIE6 || !this.useAnimation) {        //ie6不显示动画
            onCallback.call(this);
        } else {
            var expanded = this.isExpandedNode(node);
            function doExpandAnim(node, viewIndex, onCallback) {
                var nodesEl = this._getNodesEl(node, viewIndex);
                if (nodesEl) {
                    var h = mini.getHeight(nodesEl);
                    nodesEl.style.overflow = "hidden";
                    nodesEl.style.height = "0px";
                    var config = { height: h + "px" };
                    var sf = this;
                    sf._inAniming = true;
                    var jq = jQuery(nodesEl);
                    jq.animate(
                    config,
                    180,
                    function () {
                        nodesEl.style.height = "auto";
                        sf._inAniming = false;
                        sf.doLayout();
                        mini.repaint(nodesEl);
                    }
                );
                } else {
                    //onCallback.call(this);
                }
            }
            function doCollapseAnim(node, viewIndex, onCallback) {
                var nodesEl = this._getNodesEl(node, viewIndex);
                if (nodesEl) {
                    var h = mini.getHeight(nodesEl);
                    var config = { height: 0 + "px" };
                    var sf = this;
                    sf._inAniming = true;
                    var jq = jQuery(nodesEl);
                    jq.animate(
                        config,
                        180,
                        function () {
                            nodesEl.style.height = "auto";
                            sf._inAniming = false;
                            if (onCallback) onCallback.call(sf);
                            sf.doLayout();
                            mini.repaint(nodesEl);

                        }
                    );
                } else {
                    if (onCallback) onCallback.call(this);
                }
            }

            if (expanded) {
                onCallback.call(this);
                doExpandAnim.call(this, node, 2);
                doExpandAnim.call(this, node, 1);
            } else {
                doCollapseAnim.call(this, node, 2, onCallback);
                doCollapseAnim.call(this, node, 1);
            }
        }
    },
    __OnTreeCollapse: function (e) {
        this._doExpandCollapseNode(e.node);
    },
    __OnTreeExpand: function (e) {
        this._doExpandCollapseNode(e.node);
    },
    _doCheckNodeEl: function (node) {
        var ck = this._getCheckBoxEl(node);
        if (ck) {
            var checkModel = this.getCheckModel();
            ck.checked = node.checked;
            if (checkModel == "cascade") {
                //if(node.id == 'base') debugger
                var checkState = this.getCheckState(node);
                if (checkState == "indeterminate") {
                    ck.indeterminate = true;
                } else {
                    ck.indeterminate = false;
                }
            }
        }
    },
    __OnCheckChanged: function (e) {

        //var checkModel = this.getCheckModel();
        for (var i = 0, l = e._nodes.length; i < l; i++) {
            var node = e._nodes[i];
            this._doCheckNodeEl(node);
            //            var ck = this._getCheckBoxEl(node);
            //            if (ck) {
            //                ck.checked = node.checked;

            //                if (checkModel == "cascade") {
            //                    var checkState = this.getCheckState(node);
            //                    if (checkState == "indeterminate") {
            //                        ck.indeterminate = true;
            //                    } else {
            //                        ck.indeterminate = false;
            //                    }
            //                }
            //            }
        }

        if (this._checkChangedTimer) {
            clearTimeout(this._checkChangedTimer);
            this._checkChangedTimer = null;
        }
        var me = this;
        this._checkChangedTimer = setTimeout(function () {
            me._checkChangedTimer = null;
            me.fire("checkchanged");
        }, 1);

    },
    /////////////////////////////////
    //    _doUpdateCheckState: function () {
    //        //第三态
    //        //autoCheckParent

    //    },
    _tryToggleCheckNode: function (node) {
        var checkable = this.getCheckable(node);
        if (checkable == false) return;

        var checked = this.isCheckedNode(node);
        
        var e = { node: node, cancel: false, checked: checked, isLeaf: this.isLeaf(node) };
        this.fire("beforenodecheck", e);
        if (e.cancel) return;

        this._dataSource.doCheckNodes(node, !checked, true);
        //        if (this.getAutoCheckParent()) {
        //        
        //            this._dataSource.doCheckNodes(node, !checked, true);
        //        } else {
        //            this._dataSource.doCheckNodes(node, !checked, true);
        //        }
        //        this._doUpdateCheckState();
        this.fire("nodecheck", e);
    },
    _tryToggleNode: function (node) {
        var isExpanded = this.isExpandedNode(node);
        var e = { node: node, cancel: false };
        
        if (isExpanded) {
            this.fire("beforecollapse", e);
            if (e.cancel == true) return;
            this.collapseNode(node);
            this.fire("collapse", e);
        } else {
            this.fire("beforeexpand", e);
            if (e.cancel == true) return;
            this.expandNode(node);
            this.fire("expand", e);
        }
    },
    _OnCellMouseDown: function (e) {
        //if (mini.findParent(e.htmlEvent.target, 'mini-tree-editinput')) return;
        if (mini.findParent(e.htmlEvent.target, this._eciconCls)) {
        } else if (mini.findParent(e.htmlEvent.target, 'mini-tree-checkbox')) {
        } else {
            this.fire("cellmousedown", e);
        }
    },
    _OnCellClick: function (e) {
        //if (mini.findParent(e.htmlEvent.target, 'mini-tree-editinput')) return;
        //        if (mini.findParent(e.htmlEvent.target, this._eciconCls)) {
        //            //this._tryToggleNode(e.record);
        //        } else 
        if (mini.findParent(e.htmlEvent.target, this._eciconCls)) return;

        if (mini.findParent(e.htmlEvent.target, 'mini-tree-checkbox')) {
            this._tryToggleCheckNode(e.record);
        } else {
            this.fire("cellclick", e);
        }
    },
    __OnNodeDblClick: function (e) {
        //        if (this.expandOnDblClick && !e.isLeaf && !this._inAniming) {
        //            this._tryToggleNode(e.node);
        //        }
    },
    __OnNodeClick: function (e) {
        //        if (this.expandOnNodeClick && !e.isLeaf && !this._inAniming) {
        //            this._tryToggleNode(e.node);
        //        }
    },
    ////////////////////////////////////////////////////////////////////
    setIconField: function (value) {
        this.iconField = value;
    },
    getIconField: function () {
        return this.iconField;
    },
    setAllowSelect: function (value) {
        this.setAllowRowSelect(value);
    },
    getAllowSelect: function () {
        return this.getAllowRowSelect();
    },
    setShowExpandButtons: function (value) {
        if (this.showExpandButtons != value) {
            this.showExpandButtons = value;
            this.doUpdate();
        }
    },
    getShowExpandButtons: function () {
        return this.showExpandButtons;
    },
    setShowTreeLines: function (value) {
        this.showTreeLines = value;
        if (value == true) {
            mini.addClass(this.el, 'mini-tree-treeLine');
        } else {
            mini.removeClass(this.el, 'mini-tree-treeLine');
        }
    },
    getShowTreeLines: function () {
        return this.showTreeLines;
    },
    setShowArrow: function (value) {
        this.showArrow = value;
        if (value == true) {
            mini.addClass(this.el, 'mini-tree-showArrows');
        } else {
            mini.removeClass(this.el, 'mini-tree-showArrows');
        }
    },
    getShowArrow: function () {
        return this.showArrow;
    },
    setLeafIcon: function (value) {
        this.leafIcon = value;
    },
    getLeafIcon: function () {
        return this.leafIcon;
    },
    setFolderIcon: function (value) {
        this.folderIcon = value;
    },
    getFolderIcon: function () {
        return this.folderIcon;
    },
    getExpandOnDblClick: function () {
        return this.expandOnDblClick;
    },
    setExpandOnNodeClick: function (value) {
        this.expandOnNodeClick = value;
        if (value) {
            mini.addClass(this.el, "mini-tree-nodeclick");
        } else {
            mini.removeClass(this.el, "mini-tree-nodeclick");
        }
    },
    getExpandOnNodeClick: function () {
        return this.expandOnNodeClick;
    },
    setLoadOnExpand: function (value) {
        this.loadOnExpand = value;
    },
    getLoadOnExpand: function () {
        return this.loadOnExpand;
    },

    hideNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.visible = false;

        this._doUpdateTreeNodeEl(node);

        //        var el1 = this._getNodeEl(node, 1);
        //        var el2 = this._getNodeEl(node, 2);
        //        if (el1) mini.removeClass(el1, "mini-disabled");
        //        if (el2) mini.removeClass(el2, "mini-disabled");

        //        var el = this._getNodeEl(node);
        //        el.style.display = "none";
    },
    showNode: function (node) {

        node = this.getNode(node);
        if (!node) return;
        node.visible = true;

        this._doUpdateTreeNodeEl(node);
        //        var el = this._getNodeEl(node);
        //        el.style.display = "";
    },
    enableNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.enabled = true;

        var el1 = this._getNodeEl(node, 1);
        var el2 = this._getNodeEl(node, 2);
        if (el1) mini.removeClass(el1, "mini-disabled");
        if (el2) mini.removeClass(el2, "mini-disabled");
        var ck = this._getCheckBoxEl(node);
        if (ck) ck.disabled = false;
    },
    disableNode: function (node) {
        node = this.getNode(node);
        if (!node) return;

        node.enabled = false;
        var el1 = this._getNodeEl(node, 1);
        var el2 = this._getNodeEl(node, 2);
        if (el1) mini.addClass(el1, "mini-disabled");
        if (el2) mini.addClass(el2, "mini-disabled");

        var ck = this._getCheckBoxEl(node);
        if (ck) ck.disabled = true;
    },



    imgPath: '',
    setImgPath: function (value) {
        this.imgPath = value;
    },
    getImgPath: function () {
        return this.imgPath;
    },
    imgField: 'img',
    setImgField: function (value) {
        this.imgField = value;
    },
    getImgField: function () {
        return this.imgField;
    },

    ////////////////////////////////////////////////////////////////////
    // HTML Tags
    ////////////////////////////////////////////////////////////////////    
    getAttrs: function (el) {
        var attrs = mini.TreeGrid.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["value", "url", "idField", "textField", "iconField", "nodesField", "parentField", "valueField", "checkedField",
            "leafIcon", "folderIcon", "leafField",
            "ondrawnode", "onbeforenodeselect", "onnodeselect", "onnodemousedown", "onnodeclick", "onnodedblclick",
                "onbeforenodecheck", "onnodecheck",
                "onbeforeexpand", "onexpand", "onbeforecollapse", "oncollapse",
                "dragGroupName", "dropGroupName", "onendedit",
                "expandOnLoad", "ondragstart", "onbeforedrop", "ondrop", "ongivefeedback",
                "treeColumn", "onaddnode", "onremovenode", "onmovenode", "imgPath", "imgField"
             ]
        );

        mini._ParseBool(el, attrs,
            ["allowSelect", "showCheckBox", "showExpandButtons", "showTreeIcon", "showTreeLines", "checkRecursive",
                "enableHotTrack", "showFolderCheckBox", "resultAsTree",
                "allowDrag", "allowDrop", "showArrow", "expandOnDblClick", "removeOnCollapse",
                "autoCheckParent", "loadOnExpand", "expandOnNodeClick"
             ]
        );

        if (attrs.expandOnLoad) {
            var level = parseInt(attrs.expandOnLoad);
            if (mini.isNumber(level)) {
                attrs.expandOnLoad = level;
            } else {
                attrs.expandOnLoad = attrs.expandOnLoad == "true" ? true : false;
            }
        }

        var idField = attrs.idField || this.getIdField();
        var textField = attrs.textField || this.getTextField();
        var iconField = attrs.iconField || this.getIconField();
        var nodesField = attrs.nodesField || this.getNodesField();

        function parseNodes(nodes) {
            var data = [];

            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                var cnodes = mini.getChildNodes(node);
                var nodeTitle = cnodes[0];
                var nodeChild = cnodes[1];

                if (!nodeTitle || !nodeChild) nodeTitle = node;
                var jqTitle = jQuery(nodeTitle);
                var o = {};
                var id = o[idField] = nodeTitle.getAttribute("value"); //jqTitle.attr("value");

                o[iconField] = jqTitle.attr("iconCls");
                o[textField] = nodeTitle.innerHTML;
                data.add(o);

                //if(nodeTitle.innerHTML == "所有客户") debugger

                var expanded = jqTitle.attr("expanded");
                if (expanded) {
                    o.expanded = expanded == "false" ? false : true;
                }

                var allowSelect = jqTitle.attr("allowSelect");
                if (allowSelect) {
                    o.allowSelect = allowSelect == "false" ? false : true;
                }

                if (!nodeChild) continue;
                var cs = mini.getChildNodes(nodeChild);
                var cdata = parseNodes(cs);
                if (cdata.length > 0) {
                    o[nodesField] = cdata;
                }
            }
            return data;
        }

        var data = parseNodes(mini.getChildNodes(el));
        if (data.length > 0) {
            attrs.data = data;
        }

        if (!attrs.idField && attrs.valueField) {
            attrs.idField = attrs.valueField;
        }
        return attrs;
    }
});

mini.regClass(mini.TreeGrid, "TreeGrid");


//Tree
mini.Tree = function () {
    mini.Tree.superclass.constructor.call(this);

    var columns = [
        { name: "node", header: "", field: this.getTextField(), width: 'auto', allowDrag: true,
            editor: { type: "textbox" }
        }
    ];
    this._columnModel.setColumns(columns);
    this._column = this._columnModel.getColumn("node");

    mini.removeClass(this.el, 'mini-treegrid');
    mini.addClass(this.el, 'mini-tree-nowrap');
    this.setBorderStyle("border:0"); 
};
mini.extend(mini.Tree, mini.TreeGrid, {
    setTextField: function (value) {
        this._dataSource.setTextField(value);
        this._columnModel.updateColumn('node', { field: value });
        this.textField = value;
    },

    uiCls: "mini-tree",

    _rowHoverCls: "mini-tree-node-hover",
    _rowSelectedCls: "mini-tree-selectedNode",
    _getRecordByEvent: function (e, inNodeShow) {

        var row = mini.Tree.superclass._getRecordByEvent.call(this, e);
        if (inNodeShow === false) return row;
        if (row && mini.findParent(e.target, "mini-tree-nodeshow")) {
            return row;
        }
        return null;
    },

    _treeColumn: "node",
    //_fitColumns: false,

    defaultRowHeight: 22,
    _getRowHeight: function (record) {
        var h = this.defaultRowHeight;
        if (record._height) {
            h = parseInt(record._height);
            if (isNaN(parseInt(record._height))) h = rowHeight;
        }
        //        h -= 4; //padding-top/padding-bottom
        //        //if (!mini.isOpera) {
        //        h -= 1;
        //}
        return h;
    },

    showHeader: false,
    showTopbar: false,
    showFooter: false,
    showColumns: false,

    showHGridLines: false,
    showVGridLines: false,

    showTreeLines: true,

    setTreeColumn: null,
    setColumns: null,
    getColumns: null,

    frozen: null,
    unFrozen: null,

    showModified: false,

    /////////////////////////////
    setNodeText: function (node, text) {
        node = this.getNode(node);
        if (!node) return;
        var obj = {};
        obj[this.getTextField()] = text;
        this.updateNode(node, obj);
        //        node[this.getTextField()] = text;
        //        this._doUpdateNodeTitle(node);
        //this._changed = true;
    },
    setNodeIconCls: function (node, iconCls) {
        node = this.getNode(node);
        if (!node) return;
        var obj = {};
        obj[this.iconField] = iconCls;
        this.updateNode(node, obj);
        //        node[this.iconField] = iconCls;
        //        this._doUpdateNodeTitle(node);
        //this._changed = true;
    },
    /////////////////////////////
    _OnCellMouseDown: function (e) {
        if (this._editInput) this._editInput.blur();
        this.fire("cellmousedown", e);
    },
    isEditingNode: function (node) {
        return this._editingNode == node;
    },
    beginEdit: function (node) {
        node = this.getNode(node);
        if (!node) return;

        var column = this.getColumn(0);
        var value = mini._getMap(column.field, node);
        var e = { record: node, node: node, column: column, field: column.field, value: value, cancel: false };
        this.fire("cellbeginedit", e);
        if (e.cancel == true) return;

        this._editingNode = node;
        this._doUpdateNodeTitle(node);

        var editId = this._id + "$edit$" + node._id;
        this._editInput = document.getElementById(editId);

        this._editInput.focus();

        mini.selectRange(this._editInput, 0, 1000);
        mini.on(this._editInput, "keydown", this.__OnEditInputKeyDown, this);
        mini.on(this._editInput, "blur", this.__OnEditInputBlur, this);
    },
    cancelEdit: function () {
        var node = this._editingNode;
        this._editingNode = null;
        if (node) {
            this._doUpdateNodeTitle(node);
            mini.un(this._editInput, "keydown", this.__OnEditInputKeyDown, this);
            mini.un(this._editInput, "blur", this.__OnEditInputBlur, this);
        }
        this._editInput = null;
        //this.fire("endedit", {node: });
    },
    __OnEditInputKeyDown: function (e) {
        if (e.keyCode == 13) {
            var node = this._editingNode;
            var text = this._editInput.value;
            this.setNodeText(node, text);
            this.cancelEdit();
            this.fire("endedit", { node: node, text: text });
        } else if (e.keyCode == 27) {
            this.cancelEdit();
        }
    },
    __OnEditInputBlur: function (e) {
        //if (mini.findParent(e.target, 'mini-tree-editinput')) return;
        var node = this._editingNode;
        if (node) {
            var text = this._editInput.value;
            this.cancelEdit();
            this.setNodeText(node, text);
            this.fire("endedit", { node: node, text: text });
        }
    },
    /////////////////////////
    //ie6 bug
    addRowCls: function (row, cls) {
        var d1 = this._getRowEl(row, 1);
        var d2 = this._getRowEl(row, 2);
        if (d1) mini.addClass(d1.firstChild, cls);
        if (d2) mini.addClass(d2.firstChild, cls);
    },
    removeRowCls: function (row, cls) {
        var d1 = this._getRowEl(row, 1);
        var d2 = this._getRowEl(row, 2);
        if (d1) {
            mini.removeClass(d1, cls);
            mini.removeClass(d1.firstChild, cls);
        }
        if (d2) {
            mini.removeClass(d2, cls);
            mini.removeClass(d2.firstChild, cls);
        }
    },
    scrollIntoView: function (node) {
        node = this.getNode(node);
        if (!node) return;

        if (!this.isVisibleNode(node)) {
            this.expandPath(node);
        }
        var that = this;
        setTimeout(function () {
            var itemEl = that._getNodeEl(node, 2);
            mini.scrollIntoView(itemEl, that._rowsViewEl, false);
        }, 10);
    }
});
mini.regClass(mini.Tree, "Tree");

/////////////////////////////////////////
//1)树折叠
mini._Tree_Expander = function (grid) {
    this.owner = grid;

    mini.on(grid.el, "click", this.__OnClick, this);
    mini.on(grid.el, "dblclick", this.__OnDblClick, this);    
}
mini._Tree_Expander.prototype = {
    _canToggle: function () {
        return !this.owner._dataSource._isNodeLoading();
    },
    __OnClick: function (e) {
        var tree = this.owner;
        var node = tree._getRecordByEvent(e, false);
        if (!node || node.enabled === false) return;
        if (mini.findParent(e.target, 'mini-tree-checkbox')) return;

        var isLeaf = tree.isLeaf(node);

        if (mini.findParent(e.target, tree._eciconCls)) {
            if (this._canToggle() == false) return;
            tree._tryToggleNode(node);
        }
        else if (tree.expandOnNodeClick && !isLeaf && !tree._inAniming) {
            if (this._canToggle() == false) return;
            tree._tryToggleNode(node);
        }
    },
    __OnDblClick: function (e) {
        var tree = this.owner;
        var node = tree._getRecordByEvent(e, false);
        if (!node || node.enabled === false) return;

        var isLeaf = tree.isLeaf(node);

        if (tree._inAniming) return;

        if (mini.findParent(e.target, tree._eciconCls)) {
            return;
        }
        if (tree.expandOnNodeClick) {
            return;
        }
        if (tree.expandOnDblClick && !isLeaf) {
            if (this._canToggle() == false) return;
            tree._tryToggleNode(node);
        }

    }
}
//2)异步加载子节点
mini._Tree_AsyncLoader = function (grid) {
    this.owner = grid;
    grid.on("beforeexpand", this.__OnBeforeNodeExpand, this);
}
mini._Tree_AsyncLoader.prototype = {
    __OnBeforeNodeExpand: function (e) {
        var tree = this.owner;
        var node = e.node;
        var isLeaf = tree.isLeaf(node);
        var cs = node[tree.getNodesField()];

        if (!isLeaf && (!cs || cs.length == 0)) {
            if (tree.loadOnExpand && node.asyncLoad !== false) {
                e.cancel = true;
                tree.loadNode(node);
            }
        }
    }
}
