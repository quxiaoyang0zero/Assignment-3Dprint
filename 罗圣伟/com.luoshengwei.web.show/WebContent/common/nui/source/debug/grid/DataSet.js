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

mini.DataSet = function () {
    this._sources = {};
    this._data = {};
    this._links = [];

    this._originals = {};

    mini.DataSet.superclass.constructor.call(this);
}
mini.extend(mini.DataSet, mini.Component, {
    add: function (name, listControl) {
        if (!name || !listControl) return;
        this._sources[name] = listControl;

        this._data[name] = [];

        //自动创建新行id
        listControl._set_autoCreateNewID(true);
        listControl._set_originalIdField(listControl.getIdField());
        listControl._set_clearOriginals(false);

        listControl.on("addrow", this.__OnRowChanged, this);
        listControl.on("updaterow", this.__OnRowChanged, this);
        listControl.on("deleterow", this.__OnRowChanged, this);
        listControl.on("removerow", this.__OnRowChanged, this);
        listControl.on("preload", this.__OnDataPreLoad, this);

        listControl.on("selectionchanged", this.__OnDataSelectionChanged, this);
    },
    addLink: function (name, childName, parentField) {
        if (!name || !childName || !parentField) return;
        if (!this._sources[name] || !this._sources[childName]) return;

        var link = {
            parentName: name,
            childName: childName,
            parentField: parentField
        };
        this._links.push(link);
    },
    clearData: function () {
        this._data = {};
        this._originals = {};
        for (var name in this._sources) {
            this._data = [];
        }
    },
    getData: function () {
        return this._data;
    },
    _getNameByListControl: function (listControl) {
        for (var name in this._sources) {
            var c = this._sources[name];
            if (c == listControl) return name;
        }
    },
    _getRecord: function (name, record, idField) {
        var rows = this._data[name];
        if (!rows) return false;
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            if (row[idField] == record[idField]) return row;
        }
        return null;
    },
    /////////////////////////////////////
    __OnRowChanged: function (e) {
        var type = e.type;
        var record = e.record;
        var name = this._getNameByListControl(e.sender);
        
        var oldRow = this._getRecord(name, record, e.sender.getIdField());

        var rows = this._data[name];
        if (oldRow) {
            var rows = this._data[name];
            rows.remove(oldRow);
        }
        //

        if (type == "removerow" && record._state == "added") {
        } else {
            rows.push(record);
        }

        //this._originals[name] = e.sender._originals;
        this._originals[name] = e.sender._get_originals();

        //处理_parent
        if (record._state == "added") {
            var parentSource = this._getParentSource(e.sender);
            if (parentSource) {
                var current = parentSource.getSelected();
                if (current) {
                    record._parentId = current[parentSource.getIdField()];
                } else {
                    rows.remove(record);    //如果有父source，必须有current才能加入
                }
            }
        }
    },
    __OnDataPreLoad: function (e) {
        var source = e.sender;
        var name = this._getNameByListControl(source);
        var idField = e.sender.getIdField();

        var rows = this._data[name];
        var maps = {};
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            maps[row[idField]] = row;
        }

        //修改的记录：对应ID为idField！
        var ors = this._originals[name]

        if (ors) {

            //source._originals = ors;
            source._set_originals(ors);
        }

        //数据更新: modified, delete, 
        var nowData = e.data || [];
        for (var i = 0, l = nowData.length; i < l; i++) {
            var row = nowData[i];
            var old = maps[row[idField]];
            if (old) {
                delete old._uid;
                mini.copyTo(row, old);
            }
        }

        //added
        var parentSource = this._getParentSource(source);
        
        if (source.getPageIndex && source.getPageIndex() == 0) {
            var adds = [];
            for (var i = 0, l = rows.length; i < l; i++) {
                var row = rows[i];
                if (row._state == "added") {
                    if (parentSource) {
                        var current = parentSource.getSelected();
                        if (current && current[parentSource.getIdField()] == row._parentId) {
                            adds.push(row);
                        }
                    } else {
                        adds.push(row);
                    }
                }
            }
            adds.reverse();
            nowData.insertRange(0, adds);
        }

        //removed
        var removes = [];
        for (var i = nowData.length - 1; i >= 0; i--) {
            var row = nowData[i];
            var old = maps[row[idField]];
            if (old && old._state == "removed") {
                nowData.removeAt(i);
                removes.push(old);
            }
        }


        //如果source有前置source，则需要根据id来对应记录。。。

    },
    /////////////////////////////////////////
    _getParentSource: function (source) {
        var childName = this._getNameByListControl(source);
        for (var i = 0, l = this._links.length; i < l; i++) {
            var link = this._links[i];
            if (link.childName == childName) {
                return this._sources[link.parentName];
            }
        }
    },
    _getLinks: function (source) {
        var name = this._getNameByListControl(source);
        var links = [];
        for (var i = 0, l = this._links.length; i < l; i++) {
            var link = this._links[i];
            if (link.parentName == name) {
                links.push(link);
            }
        }
        return links;
    },
    __OnDataSelectionChanged: function (e) {
        var grid1 = e.sender;
        var record = grid1.getSelected();

        var links = this._getLinks(grid1);
        for (var i = 0, l = links.length; i < l; i++) {
            var link = links[i];
            var grid2 = this._sources[link.childName];

            if (record) {
                var args = {};
                args[link.parentField] = record[grid1.getIdField()];
                grid2.load(args);
            } else {
                grid2.loadData([]);
            }
        }
    }
});
mini.regClass(mini.DataSet, "dataset");