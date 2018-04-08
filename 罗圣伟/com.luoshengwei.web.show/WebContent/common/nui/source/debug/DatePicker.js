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

mini.DatePicker = function () {
    mini.DatePicker.superclass.constructor.call(this);
    mini.addClass(this.el, "mini-datepicker");

    this.on("validation", this.__OnValidation, this); 
}

mini.extend(mini.DatePicker, mini.PopupEdit, {
    valueFormat: "",
    format: "yyyy-MM-dd",       //displayFormat可以是任意的
    //editFormat: 'yyyy-MM-dd',   //固定几个editFormat，这样可以做成JS的优化处理

    maxDate: null,
    minDate: null,

    popupWidth: "",

    viewDate: new Date(),
    showTime: false,
    timeFormat: 'H:mm',

    showTodayButton: true,
    showClearButton: true,
    showOkButton: false,

    uiCls: "mini-datepicker",

    _getCalendar: function () {
        if (!mini.DatePicker._Calendar) {
            var calendar = mini.DatePicker._Calendar = new mini.Calendar();

            calendar.setStyle("border:0;");
        }
        return mini.DatePicker._Calendar;
    },

    destroy: function (removeEl) {
        if (this._destroyPopup) {
            mini.DatePicker._Calendar = null;
        }
        mini.DatePicker.superclass.destroy.call(this, removeEl);
    },
    _createPopup: function () {
        mini.DatePicker.superclass._createPopup.call(this);

        this._calendar = this._getCalendar();
    },
    showPopup: function () {
        var ex = { cancel: false };
        this.fire("beforeshowpopup", ex);
        if (ex.cancel == true) return;

        this._calendar = this._getCalendar();
        this._calendar.beginUpdate();
        this._calendar._allowLayout = false;
        if (this._calendar.el.parentNode != this.popup._contentEl) {
            this._calendar.render(this.popup._contentEl);
        }

        this._calendar.set({
            showTime: this.showTime,
            timeFormat: this.timeFormat,
            showClearButton: this.showClearButton,
            showTodayButton: this.showTodayButton,
            showOkButton: this.showOkButton
        });

        this._calendar.setValue(this.value);

        if (this.value) {
            this._calendar.setViewDate(this.value);
        } else {
            this._calendar.setViewDate(this.viewDate);
        }

        mini.DatePicker.superclass.showPopup.call(this);

        function doUpdate() {
            if (this._calendar._target) {
                var obj = this._calendar._target;
                this._calendar.un("timechanged", obj.__OnTimeChanged, obj);
                this._calendar.un("dateclick", obj.__OnDateClick, obj);
                this._calendar.un("drawdate", obj.__OnDrawDate, obj);
            }
            this._calendar.on("timechanged", this.__OnTimeChanged, this);
            this._calendar.on("dateclick", this.__OnDateClick, this);
            this._calendar.on("drawdate", this.__OnDrawDate, this);

            this._calendar.endUpdate();

            this._calendar._allowLayout = true;
            this._calendar.doLayout();

            this._calendar.focus();

            this._calendar._target = this;
        }

        var me = this;
        //setTimeout(function () {
        doUpdate.call(me);
        //}, 1);


    },
    hidePopup: function () {
        mini.DatePicker.superclass.hidePopup.call(this);

        this._calendar.un("timechanged", this.__OnTimeChanged, this);
        this._calendar.un("dateclick", this.__OnDateClick, this);
        this._calendar.un("drawdate", this.__OnDrawDate, this);

    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this._calendar.within(e)) return true;
        return false;
    },
    __OnPopupKeyDown: function (e) {
        if (e.keyCode == 13) {
            this.__OnDateClick();
        }
        if (e.keyCode == 27) {
            this.hidePopup();
            this.focus();
        }
    },
    minDateErrorText: '', //'不能小于日期 {0}',
    maxDateErrorText: '', //'不能大于日期 {0}',
    __OnValidation: function (e) {

        if (e.isValid == false) return;
        var date = this.value;

        if (!mini.isDate(date)) return;
        var maxDate = mini.parseDate(this.maxDate);
        var minDate = mini.parseDate(this.minDate);
        var maxDateErrorText = this.maxDateErrorText || mini.VTypes.maxDateErrorText;
        var minDateErrorText = this.minDateErrorText || mini.VTypes.minDateErrorText;
        if (mini.isDate(maxDate)) {
            if (date.getTime() > maxDate.getTime()) {
                e.isValid = false;
                e.errorText = String.format(maxDateErrorText, mini.formatDate(maxDate, this.format));
            }
        }
        if (mini.isDate(minDate)) {
            if (date.getTime() < minDate.getTime()) {
                e.isValid = false;
                e.errorText = String.format(minDateErrorText, mini.formatDate(minDate, this.format));
            }
        }

    },
    __OnDrawDate: function (e) {
        var date = e.date;
        var maxDate = mini.parseDate(this.maxDate);
        var minDate = mini.parseDate(this.minDate);
        if (mini.isDate(maxDate)) {
            if (date.getTime() > maxDate.getTime()) {
                e.allowSelect = false;
            }
        }
        if (mini.isDate(minDate)) {
            if (date.getTime() < minDate.getTime()) {
                e.allowSelect = false;
            }
        }

        this.fire("drawdate", e);
    },
    __OnDateClick: function (e) {

        if (this.showOkButton && e.action != "ok") return;

        var date = this._calendar.getValue();
        var value = this.getFormValue('U');

        this.setValue(date);

        if (value !== this.getFormValue('U')) {
            this._OnValueChanged();
        }

        this.focus();

        this.hidePopup();
    },
    __OnTimeChanged: function (e) {
        if (this.showOkButton) return;
        var date = this._calendar.getValue();
        this.setValue(date);
        this._OnValueChanged();
    },
    setFormat: function (value) {
        if (typeof value != "string") return;
        if (this.format != value) {
            this.format = value;
            this._textEl.value = this._valueEl.value = this.getFormValue();
        }
    },
    getFormat: function () {
        return this.format;
    },
    setValueFormat: function (value) {
        if (typeof value != "string") return;
        if (this.valueFormat != value) {
            this.valueFormat = value;
        }
    },
    getValueFormat: function () {
        return this.valueFormat;
    },

    setValue: function (value) {
        value = mini.parseDate(value);
        if (mini.isNull(value)) value = "";
        if (mini.isDate(value)) value = new Date(value.getTime());
        if (this.value != value) {
            this.value = value;
            this.text = this._textEl.value = this._valueEl.value = this.getFormValue();
            //this._doEmpty();
        }
    },
    nullValue: "",
    setNullValue: function (value) {
        if (value == "null") value = null;
        this.nullValue = value;
    },
    getNullValue: function () {
        return this.nullValue;
    },

    getValue: function () {
        if (!mini.isDate(this.value)) return this.nullValue;
        var v = this.value;
        if (this.valueFormat) {
            v = mini.formatDate(v, this.valueFormat);
        }
        return v;
    },
    getFormValue: function (format) {
        if (!mini.isDate(this.value)) return "";
        format = format || this.format;
        return mini.formatDate(this.value, format);
    },
    setViewDate: function (value) {
        value = mini.parseDate(value);
        if (!mini.isDate(value)) return;
        this.viewDate = value;
    },
    getViewDate: function () {
        return this._calendar.getViewDate();
    },
    setShowTime: function (value) {
        if (this.showTime != value) {
            this.showTime = value;
            //this._calendar.setShowTime(value);
        }
    },
    getShowTime: function () {
        return this.showTime;
    },
    setTimeFormat: function (value) {
        if (this.timeFormat != value) {
            this.timeFormat = value;
            //this._calendar.setTimeFormat(value);
        }
    },
    getTimeFormat: function () {
        return this.timeFormat;
    },
    setShowTodayButton: function (value) {
        this.showTodayButton = value;
        //this.doUpdate();
    },
    getShowTodayButton: function () {
        return this.showTodayButton;
    },
    setShowClearButton: function (value) {
        this.showClearButton = value;
        //this.doUpdate();
    },
    getShowClearButton: function () {
        return this.showClearButton;
    },
    setShowOkButton: function (value) {
        this.showOkButton = value;
    },
    getShowOkButton: function () {
        return this.showOkButton;
    },

    setMaxDate: function (value) {
        this.maxDate = value;
    },
    getMaxDate: function () {
        return this.maxDate;
    },
    setMinDate: function (value) {
        this.minDate = value;
    },
    getMinDate: function () {
        return this.minDate;
    },

    setMaxDateErrorText: function (value) {
        this.maxDateErrorText = value;
    },
    getMaxDateErrorText: function () {
        return this.maxDateErrorText;
    },
    setMinDateErrorText: function (value) {
        this.minDateErrorText = value;
    },
    getMinDateErrorText: function () {
        return this.minDateErrorText;
    },
    //////////////////////////////////
    __OnInputTextChanged: function (e) {
        var v = this._textEl.value;
        var d = mini.parseDate(v);

        if (!d || isNaN(d) || d.getFullYear() == 1970) {
            d = null;
        }

        var value = this.getFormValue('U');

        this.setValue(d);
        if (d == null) this._textEl.value = "";
        //        if (d) this.setValue(d);
        //        else {
        //            if (this.required) {
        //                this._textEl.value = this.getFormValue();
        //            } else {
        //                this.setValue(d)
        //            }
        //        }

        if (value !== this.getFormValue('U')) {
            this._OnValueChanged();
        }

    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }

        if (e.keyCode == 9) {   //tab
            if (this.isShowPopup()) {
                this.hidePopup();
            }
            return;
        }

        if (this.isReadOnly()) return;

        switch (e.keyCode) {
            case 27:        //esc
                e.preventDefault();
                if (this.isShowPopup()) {
                    e.stopPropagation();
                }

                this.hidePopup();
                break;
            case 9:     //tab
            case 13:     //enter                
                if (this.isShowPopup()) {
                    e.preventDefault();
                    e.stopPropagation();


                    this.hidePopup();

                } else {
                    this.__OnInputTextChanged(null);
                    var me = this;
                    setTimeout(function () {
                        me.fire("enter", ex);
                    }, 10);
                }
                break;
            case 37:    //left
                break;
            case 38:    //top      
                e.preventDefault();
                break;
            case 39:    //right
                break;
            case 40:    //bottom
                e.preventDefault();
                this.showPopup();
                break;
            default:
                break;
        }
    },

    getAttrs: function (el) {
        var attrs = mini.DatePicker.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["format", "viewDate", "timeFormat", "ondrawdate", "minDate", "maxDate",
            "valueFormat", "nullValue", "minDateErrorText", "maxDateErrorText"
             ]
        );
        mini._ParseBool(el, attrs,
            ["showTime", "showTodayButton", "showClearButton", "showOkButton"
             ]
        );


        return attrs;
    }
});

mini.regClass(mini.DatePicker, 'datepicker');