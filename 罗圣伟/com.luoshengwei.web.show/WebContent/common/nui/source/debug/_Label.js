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

mini.Label = function () {
    mini.Label.superclass.constructor.call(this);
}
mini.extend(mini.Label, mini.Control, {
    _clearBorder: false,
    style: "",

    uiCls: "mini-label",
    _create: function () {
        this.el = document.createElement("span");
        this.el.className = "mini-label";

    },
    setValue: function (value) {
        this.el.innerHTML = value;
    },
    getValue: function (value) {
        return this.el.innerHTML;
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {

        var attrs = {};
        mini._ParseString(el, attrs,
            ["id", "borderStyle"
             ]
        );

        this.el = el;
        this.el.uid = this.uid;

        this.addCls(this.uiCls);

        return attrs;
    }
});
mini.regClass(mini.Label, "toolbar");