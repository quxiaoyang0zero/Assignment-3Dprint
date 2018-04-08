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

mini.RadioButtonList = function () {
    mini.RadioButtonList.superclass.constructor.call(this);
}
mini.extend(mini.RadioButtonList, mini.CheckBoxList, {
    multiSelect: false,

    _itemCls: "mini-radiobuttonlist-item",
    _itemHoverCls: "mini-radiobuttonlist-item-hover",
    _itemSelectedCls: "mini-radiobuttonlist-item-selected",

    _tableCls: "mini-radiobuttonlist-table",
    _tdCls: "mini-radiobuttonlist-td",
    _checkType: "radio",

    uiCls: "mini-radiobuttonlist"
});
mini.regClass(mini.RadioButtonList, "radiobuttonlist");