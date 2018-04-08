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

mini.Hidden = function () {
    mini.Hidden.superclass.constructor.call(this);

}
mini.extend(mini.Hidden, mini.Control, {
    _clearBorder: false,
    formField: true,
    value: "",

    uiCls: "mini-hidden",
    _create: function () {
        this.el = document.createElement("input");
        this.el.type = "hidden";
        this.el.className = "mini-hidden";
    },
    setName: function (value) {

        this.name = value;
        this.el.name = value;
    },
    setValue: function (value) {
        if (value === null || value === undefined) value = "";
        this.value = value;
        if (mini.isDate(value)) {
            var y = value.getFullYear();
            var m = value.getMonth() + 1;
            var d = value.getDate();
            m = m < 10 ? "0" + m : m;
            d = d < 10 ? "0" + d : d;
            this.el.value = y + "-" + m + "-" + d;
        } else {
            this.el.value = value;
        }
    },
    getValue: function () {
        return this.value;
    },
    getFormValue: function () {
        return this.el.value;
    }
});

mini.regClass(mini.Hidden, "hidden");