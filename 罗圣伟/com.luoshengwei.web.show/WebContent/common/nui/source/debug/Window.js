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

mini.Window = function () {
    
    mini.Window.superclass.constructor.call(this);

    this.addCls("mini-window");
    
    this.setVisible(false);
    this.setAllowDrag(this.allowDrag);
    this.setAllowResize(this.allowResize);
}

mini.extend(mini.Window, mini.Panel, {
    x: 0,
    y: 0,
    state: "restore", //restore, max

    _dragCls: "mini-window-drag",
    _resizeCls: "mini-window-resize",
    allowDrag: true,
    //allowResize: false,
    showCloseButton: true,
    showMaxButton: false,
    showMinButton: false,
    showCollapseButton: false,

    showModal: true,

    minWidth: 150,
    minHeight: 80,
    maxWidth: 2000,
    maxHeight: 2000,

    uiCls: "mini-window",

    _create: function () {
        mini.Window.superclass._create.call(this);


    },
    _initButtons: function () {
        this.buttons = [];

        var close = this.createButton({ name: "close", cls: "mini-tools-close", visible: this.showCloseButton });
        this.buttons.push(close);

        var max = this.createButton({ name: "max", cls: "mini-tools-max", visible: this.showMaxButton });
        this.buttons.push(max);

        var min = this.createButton({ name: "min", cls: "mini-tools-min", visible: this.showMinButton });
        this.buttons.push(min);

        var collapse = this.createButton({ name: "collapse", cls: "mini-tools-collapse", visible: this.showCollapseButton });
        this.buttons.push(collapse);
    },
    _initEvents: function () {
        mini.Window.superclass._initEvents.call(this);

        mini._BindEvents(function () {
            //mini.on(document, "mousedown", this.__OnBodyMouseDown, this);
            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(window, "resize", this.__OnWindowResize, this);

            mini.on(this.el, "mousedown", this.__OnWindowMouseDown, this);
        }, this);


    },
    doLayout: function () {
        if (!this.canLayout()) return;
        //        if (this.state == "max") {
        //            this._doShow();
        //        }

        if (this.state == "max") {
            var vbox = this.getParentBox();
            this.el.style.left = "0px";
            this.el.style.top = "0px";
            mini.setSize(this.el, vbox.width, vbox.height);
        }

        mini.Window.superclass.doLayout.call(this);
        //this._doShadow();

        if (this.allowDrag) {
            mini.addClass(this.el, this._dragCls);
        }
        if (this.state == "max") {
            this._resizeGridEl.style.display = "none";
            mini.removeClass(this.el, this._dragCls);
        }

        //modal
        this._doModal();
    },
    _doModal: function () {

        var show = this.showModal && this.isDisplay() && this.visible;
        if (!this._modalEl && this.showModal == false) return;
        //if (this.showModal && this.visible) show = true;
        //this.el.style.display = "none";
        if (!this._modalEl) {
            var iframe = "<iframe frameborder='0' style='position: absolute; z-index: -1; width: 100%; height: 100%; top: 0;left:0;scrolling:no;'></iframe>";
            this._modalEl = mini.append(document.body, '<div class="mini-modal" style="display:none">' + iframe + '</div>');
        }
        //this._modalEl.style.display = "none";
        //        this._modalEl.style.width = "100px";
        //        this._modalEl.style.height = "100px";
        //        function resizeModal() {
        //            //mini.repaint(document.body);
        //            var dd = document.documentElement;
        //            var scrollWidth = parseInt(Math.max(document.body.scrollWidth, dd ? dd.scrollWidth : 0));
        //            var scrollHeight = parseInt(Math.max(document.body.scrollHeight, dd ? dd.scrollHeight : 0));

        //            var vbox = mini.getViewportBox();
        //            var height = vbox.height;
        //            if (height < scrollHeight) height = scrollHeight;

        //            var width = vbox.width;
        //            if (width < scrollWidth) width = scrollWidth;

        //            this._modalEl.style.display = show ? "block" : "none";

        //            this._modalEl.style.height = height + "px";
        //            this._modalEl.style.width = width + "px"; //"100%";
        //            this._modalEl.style.zIndex = mini.getStyle(this.el, 'zIndex') - 1;
        //        }
        if (show) {
            this._modalEl.style.display = "block";
            this._modalEl.style.zIndex = mini.getStyle(this.el, 'zIndex') - 1;
            //            var me = this;

            //            setTimeout(function () {
            //                if (me._modalEl) {
            //                    me._modalEl.style.display = "none";
            //                    resizeModal.call(me);
            //                }
            //            }, 1);
        } else {
            this._modalEl.style.display = "none";
        }
    },
    getParentBox: function () {
        var vbox = mini.getViewportBox();
        var containerEl = this._containerEl || document.body;
        if (containerEl != document.body) {
            vbox = mini.getBox(containerEl);
        }
        return vbox;
    },
    ////////////////////////////////////////////////////////
    setShowModal: function (value) {

        this.showModal = value;
    },
    getShowModal: function () {
        return this.showModal;
    },
    setMinWidth: function (value) {
        if (isNaN(value)) return;
        this.minWidth = value;
    },
    getMinWidth: function () {
        return this.minWidth;
    },
    setMinHeight: function (value) {
        if (isNaN(value)) return;
        this.minHeight = value;
    },
    getMinHeight: function () {
        return this.minHeight;
    },
    setMaxWidth: function (value) {
        if (isNaN(value)) return;
        this.maxWidth = value;
    },
    getMaxWidth: function () {
        return this.maxWidth;
    },
    setMaxHeight: function (value) {
        if (isNaN(value)) return;
        this.maxHeight = value;
    },
    getMaxHeight: function () {
        return this.maxHeight;
    },
    setAllowDrag: function (value) {
        this.allowDrag = value;
        mini.removeClass(this.el, this._dragCls);
        if (value) {
            mini.addClass(this.el, this._dragCls);
        }
    },
    getAllowDrag: function () {
        return this.allowDrag;
    },
    //    setAllowResize: function (value) {
    //        if (this.allowResize != value) {
    //            this.allowResize = value;
    //            this.doLayout();
    //        }
    //    },
    //    getAllowResize: function () {
    //        return this.allowResize;
    //    },
    setShowMaxButton: function (value) {
        this.showMaxButton = value;
        var button = this.getButton("max");
        button.visible = value;
        this._doTools();
    },
    getShowMaxButton: function () {
        return this.showMaxButton;
    },
    setShowMinButton: function (value) {
        this.showMinButton = value;
        var button = this.getButton("min");
        button.visible = value;
        this._doTools();
    },
    getShowMinButton: function () {
        return this.showMinButton;
    },
    ///////////////////////////////////////////////////
    max: function () {
        this.state = "max";
        this.show();

        var button = this.getButton("max");
        if (button) {
            button.cls = "mini-tools-restore";
            this._doTools();
        }
    },
    restore: function () {
        this.state = "restore";
        this.show(this.x, this.y);

        var button = this.getButton("max");
        if (button) {
            button.cls = "mini-tools-max";
            this._doTools();
        }
    },
    showInBody: true,
    setShowInBody: function (value) {
        this.showInBody = value;
    },
    getShowInBody: function () {
        return this.showInBody;
    },
    containerEl: null,
    showAtPos: function (x, y, options) {
        this.show(x, y, options);
    },
    show: function (x, y, options) {
        this._allowLayout = false;

        var containerEl = this._containerEl || document.body;
        if (!this.isRender() || (this.el.parentNode != containerEl && this.showInBody)) {
            this.render(containerEl);
        }

        this.el.style.zIndex = mini.getMaxZIndex();

        this._doShow(x, y);

        this._allowLayout = true;
        this.setVisible(true);

        if (this.state != "max") {
            var box = this.getBox();
            this.x = box.x;
            this.y = box.y;
        }


        //mini.repaint(this.el);

        //this.focus();
        try {
            this.el.focus();
        } catch (e) { }
    },
    hide: function () {
        this.setVisible(false);
        this._doModal();
    },
    getWidth: function () {
        this._headerEl.style.width = "50px";
        var width = mini.getWidth(this.el);
        this._headerEl.style.width = "auto";
        return width;
    },
    getBox: function () {
        this._headerEl.style.width = "50px";
        this.el.style.display = "";
        var width = mini.getWidth(this.el);
        this._headerEl.style.width = "auto";
        var box = mini.getBox(this.el);
        box.width = width;
        box.right = box.x + width;
        return box;
    },
    _measureSize: function () {
        this.el.style.display = "";
        var box = this.getBox();
        //min, max
        if (box.width > this.maxWidth) {
            mini.setWidth(this.el, this.maxWidth);
            box = this.getBox();
        }
        if (box.height > this.maxHeight) {
            mini.setHeight(this.el, this.maxHeight);
            box = this.getBox();
        }
        if (box.width < this.minWidth) {
            mini.setWidth(this.el, this.minWidth);
            box = this.getBox();
        }
        if (box.height < this.minHeight) {
            mini.setHeight(this.el, this.minHeight);
            box = this.getBox();
        }
    },
    _doShow: function (x, y) {
        var vbox = this.getParentBox();

        if (this.state == "max") {
            if (!this._width) {
                var box = this.getBox();
                this._width = box.width;
                this._height = box.height;

                this.x = box.x;
                this.y = box.y;
            }
        } else {
            if (mini.isNull(x)) x = "center";
            if (mini.isNull(y)) y = "middle";

            this.el.style.position = "absolute";
            this.el.style.left = "-2000px";
            this.el.style.top = "-2000px";
            this.el.style.display = "";

            if (this._width) {
                this.setWidth(this._width);
                this.setHeight(this._height);
                delete this._width;
                delete this._height;
            } else {
                //mini.setSize(this.el, this.width, this.height);
            }
            this._measureSize();

            var box = this.getBox();

            //x, y的获取        
            if (x == "left") x = 0;
            if (x == 'center') x = vbox.width / 2 - box.width / 2;
            if (x == "right") x = vbox.width - box.width;

            if (y == "top") y = 0;
            if (y == "middle") y = vbox.y + vbox.height / 2 - box.height / 2;
            if (y == "bottom") y = vbox.height - box.height;

            if (x + box.width > vbox.right) x = vbox.right - box.width;
            if (y + box.height > vbox.bottom) y = vbox.bottom - box.height;
            if (x < 0) x = 0;
            if (y < 0) y = 0;

            this.el.style.display = "";
            //document.title = x+":"+y;
            mini.setX(this.el, x);
            mini.setY(this.el, y);

            this.el.style.left = x + "px";
            this.el.style.top = y + "px";
            //alert(x);
        }
        this.doLayout();
    },
    ///////////////////////////////////////////////////
    //    __OnClick: function (e) {
    //        mini.Window.superclass.__OnClick.call(this, e);
    //        if(this.el) this.el.style.zIndex = mini.getMaxZIndex();
    //    },
    _OnButtonClick: function (button, htmlEvent) {
        var e = mini.Window.superclass._OnButtonClick.call(this, button, htmlEvent);
        if (e.cancel == true) return e;

        if (e.name == "max") {
            if (this.state == "max") {
                this.restore();
            } else {
                this.max();
            }
        }
        return e;
    },
    __OnWindowResize: function (e) {
        if (this.state == "max") {
            this.doLayout();


        }
        if (!mini.isIE6) {
            this._doModal();
        }
    },
    __OnWindowMouseDown: function (e) {
        if (this.el) {
            this.el.style.zIndex = mini.getMaxZIndex();
        }
        var sf = this;
        //drag
        if (e.button != mini.MouseButton.Left) return;
        if (this.state != "max" && this.allowDrag && mini.isAncestor(this._headerEl, e.target) && !mini.findParent(e.target, "mini-tools")) {
            var sf = this;
            var box = this.getBox();
            var drag = new mini.Drag({
                capture: false,
                onStart: function () {
                    sf._maskProxy = mini.append(document.body, '<div class="mini-resizer-mask"></div>');
                    sf._dragProxy = mini.append(document.body, '<div class="mini-drag-proxy"></div>');

                    sf.el.style.display = "none";
                },
                onMove: function (drag) {
                    //document.title = "move" + new Date().getTime();
                    var x = drag.now[0] - drag.init[0], y = drag.now[1] - drag.init[1];

                    x = box.x + x;
                    y = box.y + y;
                    //限制在浏览器范围内
                    var vbox = sf.getParentBox();

                    var right = x + box.width;
                    var bottom = y + box.height;
                    if (right > vbox.width) x = vbox.width - box.width;
                    //if (bottom > vbox.bottom) y = vbox.bottom - box.height;

                    if (x < 0) x = 0;
                    if (y < 0) y = 0;

                    //mini.setXY(sf.el, x, y);
                    //                    if (sf.shadowEl) {
                    //                        mini.setXY(sf.shadowEl, x, y);
                    //                    }
                    sf.x = x;
                    sf.y = y;

                    //_dragProxy
                    var dbox = { x: x, y: y, width: box.width, height: box.height };

                    mini.setBox(sf._dragProxy, dbox);

                    this.moved = true;
                },
                onStop: function () {
                    sf.el.style.display = "block";
                    //if (!sf._dragProxy) return;
                    if (this.moved) {
                        var box = mini.getBox(sf._dragProxy);
                        mini.setBox(sf.el, box);
                    }

                    jQuery(sf._maskProxy).remove();
                    sf._maskProxy = null;

                    jQuery(sf._dragProxy).remove();
                    sf._dragProxy = null;


                }
            });
            drag.start(e);
        }
    },
    destroy: function (removeEl) {
        //mini.un(document, "mousedown", this.__OnBodyMouseDown, this);
        mini.un(window, "resize", this.__OnWindowResize, this);
        if (this._modalEl) {
            jQuery(this._modalEl).remove();
            this._modalEl = null;
        }
        if (this.shadowEl) {
            jQuery(this.shadowEl).remove();
            this.shadowEl = null;
        }
        mini.Window.superclass.destroy.call(this, removeEl);
    },
    getAttrs: function (el) {
        var attrs = mini.Window.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["modalStyle"
                ]
        );
        mini._ParseBool(el, attrs,
            ["showModal", "showShadow", "allowDrag", "allowResize",
            "showMaxButton", "showMinButton", "showInBody"
                ]
        );
        mini._ParseInt(el, attrs,
            ["minWidth", "minHeight", "maxWidth", "maxHeight"
                ]
        );

        return attrs;
    },
    ////////////////////////////////////////////
    showAtEl: function (atEl, options) {
        atEl = mini.byId(atEl);
        if (!atEl) return;
        if (!this.isRender() || this.el.parentNode != document.body) {
            this.render(document.body);
        }

        var c = {
            xAlign: this.xAlign,
            yAlign: this.yAlign,
            xOffset: 0,
            yOffset: 0,
            popupCls: this.popupCls
        };
        mini.copyTo(c, options);

        //        mini.addClass(atEl, c.popupCls);
        //        atEl.popupCls = c.popupCls;
        this._popupEl = atEl;

        this.el.style.position = "absolute";
        this.el.style.left = "-2000px";
        this.el.style.top = "-2000px";
        this.el.style.display = "";

        this.doLayout();
        this._measureSize();

        var vbox = mini.getViewportBox();
        var box = this.getBox();
        var pbox = mini.getBox(atEl);
        var xy = c.xy;
        var h = c.xAlign, v = c.yAlign;

        var x = vbox.width / 2 - box.width / 2, y = 0;
        if (xy) {
            x = xy[0];
            y = xy[1];
        }

        switch (c.xAlign) {
            case "outleft":
                x = pbox.x - box.width;
                break;
            case "left":
                x = pbox.x;
                break;
            case "center":
                x = pbox.x + pbox.width / 2 - box.width / 2;
                break;
            case "right":
                x = pbox.right - box.width;
                break;
            case "outright":
                x = pbox.right;
                break;
            default:

                break;
        }

        switch (c.yAlign) {
            case "above":
                y = pbox.y - box.height;
                break;
            case "top":
                y = pbox.y;
                break;
            case "middle":
                y = pbox.y + pbox.height / 2 - box.height / 2;
                break;
            case "bottom":
                y = pbox.bottom - box.height;
                break;
            case "below":
                y = pbox.bottom;
                break;
            default:

                break;
        }
        x = parseInt(x);
        y = parseInt(y);


        if (c.outYAlign || c.outXAlign) {
            if (c.outYAlign == "above") {
                if (y + box.height > vbox.bottom) {
                    var top = pbox.y - vbox.y;
                    var bottom = vbox.bottom - pbox.bottom;
                    if (top > bottom) {
                        y = pbox.y - box.height;
                    }
                }

            }
            if (c.outXAlign == "outleft") {
                if (x + box.width > vbox.right) {
                    var left = pbox.x - vbox.x;
                    var right = vbox.right - pbox.right;
                    if (left > right) {
                        x = pbox.x - box.width;
                    }
                }
            }
            if (c.outXAlign == "right") {
                if (x + box.width > vbox.right) {
                    x = pbox.right - box.width;
                    //                    var right = vbox.right - pbox.right;
                    //                    if (left > right) {
                    //                        x = pbox.x - box.width;
                    //                    }
                }
            }
            this._Show(x, y);
        } else {
            this.showAtPos(x + c.xOffset, y + c.yOffset);
        }
    }
});

mini.regClass(mini.Window, "window");


/* MessageBox
-----------------------------------------------------------------------------*/
mini.MessageBox = {
    //    INFO: 'mini-messagebox-info',
    //    WARNING: 'mini-messagebox-warning',
    //    QUESTION: 'mini-messagebox-question',
    //    ERROR: 'mini-messagebox-error',
    //    WAITING: 'mini-messagebox-waiting',

    alertTitle: "提醒",
    confirmTitle: "确认",
    prompTitle: "输入",
    prompMessage: "请输入内容：",
    buttonText: {
        ok: "确定", //"OK",
        cancel: "取消", //"Cancel",
        yes: "是", //"Yes",
        no: "否"//"No"
    },
    show: function (options) {

        options = mini.copyTo({
            width: "auto",
            height: "auto",
            showModal: true,

            minWidth: 150,
            maxWidth: 800,
            minHeight: 100,
            maxHeight: 350,

            showHeader: true,
            title: "",
            titleIcon: "",
            iconCls: "",
            iconStyle: "",
            message: "",
            html: "",

            spaceStyle: "margin-right:15px",

            showCloseButton: true,
            buttons: null,
            buttonWidth: 58,
            callback: null
        }, options);

        var callback = options.callback;

        var control = new mini.Window();

        control.setBodyStyle("overflow:hidden");
        control.setShowModal(options.showModal);
        control.setTitle(options.title || "");
        control.setIconCls(options.titleIcon);
        control.setShowHeader(options.showHeader);

        control.setShowCloseButton(options.showCloseButton);

        var id1 = control.uid + "$table", id2 = control.uid + "$content";

        var icon = '<div class="' + options.iconCls + '" style="' + options.iconStyle + '"></div>';
        var s = '<table class="mini-messagebox-table" id="' + id1 + '" style="" cellspacing="0" cellpadding="0"><tr><td>'
                + icon + '</td><td id="' + id2 + '" class="mini-messagebox-content-text">'
                + (options.message || "") + '</td></tr></table>';

        //var s = "";
        //control.setShowHeader(false);

        var ws = '<div class="mini-messagebox-content"></div>'
             + '<div class="mini-messagebox-buttons"></div>';
        control._bodyEl.innerHTML = ws;
        var contentEl = control._bodyEl.firstChild;
        if (options.html) {
            if (typeof options.html == "string") {
                contentEl.innerHTML = options.html;
            } else if (mini.isElement(options.html)) {
                contentEl.appendChild(options.html);
            }
        } else {
            contentEl.innerHTML = s;
        }

        control._Buttons = [];

        var buttonsEl = control._bodyEl.lastChild;
        if (options.buttons && options.buttons.length > 0) {
            for (var i = 0, l = options.buttons.length; i < l; i++) {
                var button = options.buttons[i];
                var text = mini.MessageBox.buttonText[button];
                if (!text) text = button;

                var btn = new mini.Button();
                btn.setText(text);
                btn.setWidth(options.buttonWidth);
                btn.render(buttonsEl);
                btn.action = button;
                btn.on("click", function (e) {
                    var button = e.sender;
                    if (callback) callback(button.action);
                    mini.MessageBox.hide(control);
                });

                if (i != l - 1) {
                    btn.setStyle(options.spaceStyle);
                }

                control._Buttons.push(btn);
            }
        } else {
            buttonsEl.style.display = "none";
        }

        control.setMinWidth(options.minWidth);
        control.setMinHeight(options.minHeight);
        control.setMaxWidth(options.maxWidth);
        control.setMaxHeight(options.maxHeight);
        control.setWidth(options.width);
        control.setHeight(options.height);
        control.show();




        var width = control.getWidth();
        control.setWidth(width);
        var height = control.getHeight();
        control.setHeight(height);

        var tb = document.getElementById(id1);
        if (tb) {
            tb.style.width = "100%";
        }
        var td = document.getElementById(id2);
        if (td) {
            td.style.width = "100%";
        }
        //}

        var firstButton = control._Buttons[0];
        if (firstButton) {
            firstButton.focus();
        } else {
            control.focus();
        }

        control.on("beforebuttonclick", function (e) {
            if (callback) callback("close");
            e.cancel = true;
            mini.MessageBox.hide(control);
        });
        mini.on(control.el, "keydown", function (e) {            
//            if (e.keyCode == 27) {
//                if (callback) callback("close");
//                e.cancel = true;
//                mini.MessageBox.hide(control);
//            }
        });

        return control.uid;
    },
    hide: function (id) {
        if (!id) return;
        var control = typeof id == "object" ? id : mini.getbyUID(id);
        if (!control) return;

        //destroy buttons        
        for (var i = 0, l = control._Buttons.length; i < l; i++) {
            var button = control._Buttons[i];
            button.destroy();
        }
        control._Buttons = null;

        control.destroy();
    },
    alert: function (message, title, callback) {
        return mini.MessageBox.show({
            minWidth: 250,
            title: title || mini.MessageBox.alertTitle,
            buttons: ["ok"],
            message: message,
            iconCls: "mini-messagebox-warning",
            callback: callback
        });
    },
    confirm: function (message, title, callback) {
        return mini.MessageBox.show({
            minWidth: 250,
            title: title || mini.MessageBox.confirmTitle,
            buttons: ["ok", "cancel"],
            message: message,
            iconCls: "mini-messagebox-question",
            callback: callback
        });
    },
    prompt: function (message, title, callback, multi) {
        var id = "prompt$" + new Date().getTime();
        var s = message || mini.MessageBox.promptMessage;
        if (multi) {
            s = s + '<br/><textarea id="' + id + '" style="width:200px;height:60px;margin-top:3px;"></textarea>';
        } else {
            s = s + '<br/><input id="' + id + '" type="text" style="width:200px;margin-top:3px;"/>';
        }
        var uid = mini.MessageBox.show({
            title: title || mini.MessageBox.promptTitle,
            buttons: ["ok", "cancel"],
            width: 250,
            html: '<div style="padding:5px;padding-left:10px;">' + s + '</div>',
            callback: function (action) {
                var input = document.getElementById(id);
                if (callback) callback(action, input.value);
            }
        });
        var input = document.getElementById(id);
        input.focus();
        return uid;
    },
    loading: function (message, title) {
        return mini.MessageBox.show({
            minHeight: 50,
            title: title,
            showCloseButton: false,
            message: message,
            iconCls: "mini-messagebox-waiting"
        });
    }
};
mini.alert = mini.MessageBox.alert;
mini.confirm = mini.MessageBox.confirm;
mini.prompt = mini.MessageBox.prompt;
mini.loading = mini.MessageBox.loading;
mini.showMessageBox = mini.MessageBox.show;
mini.hideMessageBox = mini.MessageBox.hide;
