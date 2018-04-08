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

mini.ToolTip = function () {
    mini.ToolTip.superclass.constructor.call(this);

    
}
mini.extend(mini.ToolTip, mini.Control, {

    target: null,


    uiCls: "mini-tooltip",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-tooltip";
        this._contentEl = this._bodyEl;
    },
    _initEvents: function () {
        
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.ToolTip.superclass.getAttrs.call(this, el);
        mini._ParseString(el, attrs,
            ["target"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.ToolTip, "tooltip");