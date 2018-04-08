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

mini.ToolBar = function () {
    mini.ToolBar.superclass.constructor.call(this);
}
mini.extend(mini.ToolBar, mini.Container, {
    _clearBorder: false,
    style: "",

    uiCls: "mini-toolbar",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-toolbar";

    },
    _initEvents: function () {

    },
    doLayout: function () {
        if (!this.canLayout()) return;


        var nodes = mini.getChildNodes(this.el, true);
        for (var i = 0, l = nodes.length; i < l; i++) {
            mini.layout(nodes[i]);
        }

    },
    //    setBody: function (value) {
    //        if (!value) return;
    //        if (!mini.isArray(value)) value = [value];
    //        for (var i = 0, l = value.length; i < l; i++) {
    //            mini.append(this._bodyEl, value[i]);
    //        }
    //        mini.parse(this._bodyEl);
    //        this.doLayout();
    //    },
    set_bodyParent: function (value) {

        if (!value) return;

        this.el = value;

        //bodyParent
        //var el = this.el;

        //        var p = value;
        //        while (p.firstChild) {
        //            el.appendChild(p.firstChild);
        //        }
        this.doLayout();
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {

        var attrs = {}; //mini.ToolBar.superclass.getAttrs.call(this, el);
        mini._ParseString(el, attrs,
            ["id", "borderStyle"
             ]
        );

        //attrs.body = mini.getChildNodes(el, true);
        //attrs._bodyParent = el;

        this.el = el;
        this.el.uid = this.uid;
        
        this.addCls(this.uiCls);
        //        this.el.style.width = el.style.width;
        //        this.el.style.height = el.style.height;

        return attrs;
    }
});
mini.regClass(mini.ToolBar, "toolbar");