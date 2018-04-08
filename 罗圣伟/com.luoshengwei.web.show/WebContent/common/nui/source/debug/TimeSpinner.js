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

mini.TimeSpinner = function () {
    mini.TimeSpinner.superclass.constructor.call(this);
    
    this.setValue("00:00:00");
}
mini.extend(mini.TimeSpinner, mini.ButtonEdit, {

    value: null,
    format: 'H:mm:ss', //(当前只处理一个格式，以后处理更多格式，先满足国内习惯，后满足国际习惯，如h:mm:ss tt）

    uiCls: "mini-timespinner",
    _getButtonHtml: function () {
        var hover = 'onmouseover="mini.addClass(this, \'' + this._buttonHoverCls + '\');" '
                        + 'onmouseout="mini.removeClass(this, \'' + this._buttonHoverCls + '\');"';
        return '<span class="mini-buttonedit-button" ' + hover + '><span class="mini-buttonedit-up"><span></span></span><span class="mini-buttonedit-down"><span></span></span></span>';
    },
    _initEvents: function () {
        mini.TimeSpinner.superclass._initEvents.call(this);

        mini._BindEvents(function () {
            this.on("buttonmousedown", this.__OnButtonMouseDown, this);
            mini.on(this.el, "mousewheel", this.__OnMousewheel, this);
            mini.on(this._textEl, "keydown", this.__OnKeyDown, this);
        }, this);

    },
    setFormat: function (value) {
        if (typeof value != "string") return;
        var formats = ['H:mm:ss', 'HH:mm:ss', 'H:mm', 'HH:mm', 'H', 'HH', 'mm:ss'];
        //if (formats.indexOf(value) == -1) return;

        if (this.format != value) {
            this.format = value;
            this.text = this._textEl.value = this.getFormattedValue();
        }
    },
    getFormat: function () {
        return this.format;
    },
    setValue: function (value) {
        value = mini.parseTime(value, this.format);
        if (!value) value = null; //mini.parseTime("00:00:00", this.format);

        if (mini.isDate(value)) value = new Date(value.getTime());

        //if (mini.formatDate(this.value, "H:mm:ss") != mini.formatDate(value, "H:mm:ss")) {
        this.value = value;
        this.text = this._textEl.value = this.getFormattedValue();
        this._valueEl.value = this.getFormValue();
        //}
    },
    getValue: function () {
        return this.value == null ? null : new Date(this.value.getTime());
    },
    getFormValue: function () {
        if (!this.value) return "";
        return mini.formatDate(this.value, this.format);
    },
    getFormattedValue: function () {
        if (!this.value) return "";
        return mini.formatDate(this.value, this.format);
    },
    _ChangeValue: function (Increment, timeType) {
        var value = this.getValue();
        if (value) {
            switch (timeType) {
                case "hours":
                    var hours = value.getHours() + Increment;
                    if (hours > 23) hours = 23;
                    if (hours < 0) hours = 0;
                    value.setHours(hours);
                    break;
                case "minutes":
                    var minutes = value.getMinutes() + Increment;
                    if (minutes > 59) minutes = 59;
                    if (minutes < 0) minutes = 0;
                    value.setMinutes(minutes);
                    break;
                case "seconds":
                    var seconds = value.getSeconds() + Increment;
                    if (seconds > 59) seconds = 59;
                    if (seconds < 0) seconds = 0;
                    value.setSeconds(seconds);
                    break;
            }
        } else {
            value = "00:00:00";
        }

        this.setValue(value);
        //this._OnValueChanged();
    },
    ////////////////////////////////////////////////    
    _SpinTimer: null,
    _StartSpin: function (Increment, time, count) {
        this._StopSpin();

        this._ChangeValue(Increment, this._timeType);
        //        this.setValue(this.value + Increment);
        //        this._OnValueChanged();

        var sf = this;
        var sourceCount = count;
        var now = new Date();
        this._SpinTimer = setInterval(function () {

            sf._ChangeValue(Increment, sf._timeType);

            count--;
            if (count == 0 && time > 50) {
                sf._StartSpin(Increment, time - 100, sourceCount + 3);

            }

            //防止alert
            var now2 = new Date();
            if (now2 - now > 500) sf._StopSpin();
            now = now2;
        }, time);
        mini.on(document, "mouseup", this._OnDocumentMouseUp, this);
        //document.title = time +":"+count;
    },
    _StopSpin: function () {
        clearInterval(this._SpinTimer);
        this._SpinTimer = null;
        //this._timeType = null;
    },
    __OnButtonMouseDown: function (e) {
        this._DownValue = this.getFormValue();
        this._timeType = "hours";
        if (e.spinType == "up") {
            this._StartSpin(1, 230, 2);
        } else {
            this._StartSpin(-1, 230, 2);
        }
    },
    //    __OnKeyDown: function (e) {
    //        var KEY = mini.Keyboard;
    //        switch (e.keyCode) {
    //            case KEY.Top:
    //                this.setValue(this.value + 1);
    //                this._OnValueChanged();
    //                break;
    //            case KEY.Bottom:
    //                this.setValue(this.value - 1);
    //                this._OnValueChanged();
    //                break;
    //        }
    //    },
    //    __OnMousewheel: function (e) {
    //        var wheelDelta = e.wheelDelta;
    //        if (mini.isNull(wheelDelta)) wheelDelta = -e.detail * 24;
    //        var increment = this.increment;
    //        if (wheelDelta < 0) increment = -increment;
    //        this.setValue(this.value + increment);
    //        this._OnValueChanged();
    //        return false;
    //    },
    _OnDocumentMouseUp: function (e) {
        this._StopSpin();
        mini.un(document, "mouseup", this._OnDocumentMouseUp, this);

        if (this._DownValue != this.getFormValue()) {
            this._OnValueChanged();
        }
    },
    __OnInputTextChanged: function (e) {

        var _value = this.getFormValue();

        this.setValue(this._textEl.value);

        if (_value != this.getFormValue()) {
            this._OnValueChanged();
        }
    },
    ////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.TimeSpinner.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["format"
                ]
        );

        return attrs;
    }

});
mini.regClass(mini.TimeSpinner, 'timespinner');