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

mini.Panel = function () {
    this._initButtons();
    mini.Panel.superclass.constructor.call(this);

    if (this.url) this.setUrl(this.url);

    this._contentEl = this._bodyEl;

    this._doVisibleEls();

    this._Resizer = new mini._Resizer(this);

    this._doTools();
}
mini.extend(mini.Panel, mini.Container, {
    width: 250,
    title: "",
    iconCls: "",
    iconStyle: "",

    allowResize: false,

    url: "",

    refreshOnExpand: false,
    maskOnLoad: true,

    collapseOnTitleClick: false,

    showCollapseButton: false,
    showCloseButton: false,
    closeAction: "display", //"destroy"
    showHeader: true,
    showToolbar: false,
    showFooter: false,

    headerCls: "",
    headerStyle: "",
    bodyCls: "",
    bodyStyle: "",
    footerCls: "",
    footerStyle: "",
    toolbarCls: "",
    toolbarStyle: "",

    minWidth: 180,
    minHeight: 100,
    maxWidth: 5000,
    maxHeight: 3000,

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var _allowLayout = this._allowLayout;
        this._allowLayout = false;

        var toolbar = kv.toolbar;
        delete kv.toolbar;
        var footer = kv.footer;
        delete kv.footer;
        var url = kv.url;
        delete kv.url;

        mini.Panel.superclass.set.call(this, kv);

        if (toolbar) {
            this.setToolbar(toolbar);
        }
        if (footer) {
            this.setFooter(footer);
        }
        if (url) {
            this.setUrl(url);
        }

        this._allowLayout = _allowLayout;
        this.doLayout();

        return this;
    },

    uiCls: "mini-panel",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-panel";

        var s = '<div class="mini-panel-border">'
            + '<div class="mini-panel-header" ><div class="mini-panel-header-inner" ><span class="mini-panel-icon"></span><div class="mini-panel-title" ></div><div class="mini-tools" ></div></div></div>'
            + '<div class="mini-panel-viewport">'
                + '<div class="mini-panel-toolbar"></div>'
                + '<div class="mini-panel-body" ></div>'
                + '<div class="mini-panel-footer"></div>'
                + '<div class="mini-resizer-trigger"></div>'
            + '</div>'
            + '</div>';
        this.el.innerHTML = s;

        this._borderEl = this.el.firstChild;
        this._headerEl = this._borderEl.firstChild;
        this._viewportEl = this._borderEl.lastChild;

        this._toolbarEl = mini.byClass('mini-panel-toolbar', this.el);
        this._bodyEl = mini.byClass('mini-panel-body', this.el);
        this._footerEl = mini.byClass('mini-panel-footer', this.el);
        this._resizeGridEl = mini.byClass('mini-resizer-trigger', this.el);

        var hi = mini.byClass('mini-panel-header-inner', this.el);
        this._iconEl = mini.byClass('mini-panel-icon', this.el);
        this._titleEl = mini.byClass('mini-panel-title', this.el);
        this._toolsEl = mini.byClass('mini-tools', this.el);

        mini.setStyle(this._bodyEl, this.bodyStyle);


        this._doTitle();
    },
    destroy: function (removeEl) {

        this._doRemoveIFrame();
        this._iframeEl = null;

        //        mini.removeChilds(this._toolbarEl);
        //        mini.removeChilds(this._bodyEl);
        //        mini.removeChilds(this._footerEl); 
        this._viewportEl = this._borderEl = this._bodyEl = this._footerEl = this._toolbarEl = null;
        this._toolsEl = this._titleEl = this._iconEl = this._resizeGridEl = null;
        mini.Panel.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
        }, this);
    },

    _doVisibleEls: function () {
        this._headerEl.style.display = this.showHeader ? "" : "none";
        this._toolbarEl.style.display = this.showToolbar ? "" : "none";
        this._footerEl.style.display = this.showFooter ? "" : "none";
    },
    _setBodyWidth: true,
    doLayout: function () {
        if (!this.canLayout()) return;

        this._resizeGridEl.style.display = this.allowResize ? "" : "none";


        var autoHeight = this.isAutoHeight();
        var autoWidth = this.isAutoWidth();

        var w = mini.getWidth(this._viewportEl, true);
        var elWidth = w;

        //mini.setWidth(this._bodyEl, w);

        if (!autoHeight) {
            var vh = this.getViewportHeight();
            mini.setHeight(this._viewportEl, vh);

            var bh = this.getBodyHeight();

            mini.setHeight(this._bodyEl, bh);
        } else {
            this._viewportEl.style.height = "auto";
            this._bodyEl.style.height = "auto";
        }

        mini.layout(this._borderEl);

        this.fire("layout");
    },
    deferLayout: function (time) {
        if (!time) time = 10;
        if (this._layoutTimer) return;
        var me = this;
        this._layoutTimer = setTimeout(function () {
            me._layoutTimer = null;
            me.doLayout();
        }, time);
    },
    _stopLayout: function () {
        clearTimeout(this._layoutTimer);
        this._layoutTimer = null;
    },
    getViewportWidth: function (content) {
        return mini.getWidth(this._viewportEl, content);
    },
    getViewportHeight: function (content) {
        var h = this.getHeight(true) - this.getHeaderHeight();
        if (content) {
            var padding2 = mini.getPaddings(this._viewportEl);
            var border2 = mini.getBorders(this._viewportEl);
            var margin2 = mini.getMargins(this._viewportEl);
            if (jQuery.boxModel) {
                h = h - padding2.top - padding2.bottom - border2.top - border2.bottom;
            }
            h = h - margin2.top - margin2.bottom;
        }
        return h;
    },
    getBodyHeight: function (content) {
        var h = this.getViewportHeight();
        var h = h - this.getToolbarHeight() - this.getFooterHeight();
        if (content) {
            var padding = mini.getPaddings(this._bodyEl);
            var border = mini.getBorders(this._bodyEl);
            var margin = mini.getMargins(this._bodyEl);
            if (jQuery.boxModel) {
                h = h - padding.top - padding.bottom - border.top - border.bottom;
            }
            h = h - margin.top - margin.bottom;
        }
        //if (isIE9) h -= 1;
        if (h < 0) h = 0;
        return h;
    },
    getHeaderHeight: function () {
        var h = this.showHeader ? jQuery(this._headerEl).outerHeight() : 0;
        return h;
    },
    getToolbarHeight: function () {
        var h = this.showToolbar ? jQuery(this._toolbarEl).outerHeight() : 0;
        return h;
    },
    getFooterHeight: function () {
        var h = this.showFooter ? jQuery(this._footerEl).outerHeight() : 0;
        return h;
    },

    setHeaderStyle: function (value) {
        this.headerStyle = value;
        mini.setStyle(this._headerEl, value);
        this.doLayout();
    },
    getHeaderStyle: function () {
        return this.headerStyle;
    },
    setBodyStyle: function (value) {
        this.bodyStyle = value;
        mini.setStyle(this._bodyEl, value);
        this.doLayout();
    },
    getBodyStyle: function () {
        return this.bodyStyle;
    },
    setToolbarStyle: function (value) {
        this.toolbarStyle = value;
        mini.setStyle(this._toolbarEl, value);
        this.doLayout();
    },
    getToolbarStyle: function () {
        return this.toolbarStyle;
    },
    setFooterStyle: function (value) {
        this.footerStyle = value;
        mini.setStyle(this._footerEl, value);
        this.doLayout();
    },
    getFooterStyle: function () {
        return this.footerStyle;
    },
    setHeaderCls: function (cls) {
        jQuery(this._headerEl).removeClass(this.headerCls);
        jQuery(this._headerEl).addClass(cls);
        this.headerCls = cls;
        this.doLayout();
    },
    getHeaderCls: function () {
        return this.headerCls;
    },
    setBodyCls: function (cls) {
        jQuery(this._bodyEl).removeClass(this.bodyCls);
        jQuery(this._bodyEl).addClass(cls);
        this.bodyCls = cls;
        this.doLayout();
    },
    getBodyCls: function () {
        return this.bodyCls;
    },
    setToolbarCls: function (cls) {
        jQuery(this._toolbarEl).removeClass(this.toolbarCls);
        jQuery(this._toolbarEl).addClass(cls);
        this.toolbarCls = cls;
        this.doLayout();
    },
    getToolbarCls: function () {
        return this.toolbarCls;
    },
    setFooterCls: function (cls) {
        jQuery(this._footerEl).removeClass(this.footerCls);
        jQuery(this._footerEl).addClass(cls);
        this.footerCls = cls;
        this.doLayout();
    },
    getFooterCls: function () {
        return this.footerCls;
    },
    _doTitle: function () {
        this._titleEl.innerHTML = this.title;

        this._iconEl.style.display = (this.iconCls || this.iconStyle) ? "inline" : "none";
        this._iconEl.className = "mini-panel-icon " + this.iconCls;
        mini.setStyle(this._iconEl, this.iconStyle);

    },
    setTitle: function (value) {
        this.title = value;
        this._doTitle();
    },
    getTitle: function () {
        return this.title;
    },
    setIconCls: function (value) {
        this.iconCls = value;
        this._doTitle();
    },
    getIconCls: function () {
        return this.iconCls;
    },
    _doTools: function () {
        var s = "";
        for (var i = this.buttons.length - 1; i >= 0; i--) {
            var button = this.buttons[i];
            s += '<span id="' + i + '" class="' + button.cls + ' '
                + (button.enabled ? "" : "mini-disabled") + '" style="'
                + button.style + ';' + (button.visible ? "" : "display:none;") + '"></span>';
        }
        this._toolsEl.innerHTML = s;
    },
    setShowCloseButton: function (value) {
        this.showCloseButton = value;
        var button = this.getButton("close");
        button.visible = value;
        this._doTools();
    },
    getShowCloseButton: function () {
        return this.showCloseButton;
    },
    setCloseAction: function (value) {
        this.closeAction = value;
    },
    getCloseAction: function () {
        return this.closeAction;
    },
    setShowCollapseButton: function (value) {
        this.showCollapseButton = value;
        var button = this.getButton("collapse");
        button.visible = value;
        this._doTools();
    },
    getShowCollapseButton: function () {
        return this.showCollapseButton;
    },
    setShowHeader: function (value) {
        this.showHeader = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    getShowHeader: function () {
        return this.showHeader;
    },
    setShowToolbar: function (value) {
        this.showToolbar = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    getShowToolbar: function () {
        return this.showToolbar;
    },
    setShowFooter: function (value) {
        this.showFooter = value;
        this._doVisibleEls();
        this.deferLayout();
    },
    getShowFooter: function () {
        return this.showFooter;
    },
    ////////////////////////////////////////
    __OnClick: function (e) {
        if (mini.isAncestor(this._headerEl, e.target)) {
            var toolsEl = mini.findParent(e.target, 'mini-tools');
            if (toolsEl) {
                var button = this.getButton(parseInt(e.target.id));
                if (button) {
                    this._OnButtonClick(button, e);
                }
            } else {
                if (this.collapseOnTitleClick) {
                    this.toggle();
                }
            }
        }
    },
    _OnButtonClick: function (button, htmlEvent) {
        var e = {
            button: button,
            index: this.buttons.indexOf(button),
            name: button.name.toLowerCase(),
            htmlEvent: htmlEvent,
            cancel: false
        };
        this.fire("beforebuttonclick", e);

        //
        try {
            if (e.name == "close" && this.closeAction == "destroy" && this._iframeEl && this._iframeEl.contentWindow) {
                var ret = true;
                if (this._iframeEl.contentWindow.CloseWindow) {
                    ret = this._iframeEl.contentWindow.CloseWindow("close");
                } else if (this._iframeEl.contentWindow.CloseOwnerWindow) {
                    ret = this._iframeEl.contentWindow.CloseOwnerWindow("close");
                }
                if (ret === false) {
                    e.cancel = true;
                }
            }
        } catch (ex) { }

        if (e.cancel == true) return e;

        this.fire("buttonclick", e);

        if (e.name == "close") {
            if (this.closeAction == "destroy") {
                this.__HideAction = "close";
                this.destroy();
            } else {
                this.hide();
            }
        }
        if (e.name == "collapse") {
            this.toggle();
            if (this.refreshOnExpand && this.expanded && this.url) {
                this.reload();
            }
        }
        return e;
    },
    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },

    /*
    buttons: close, max, min, restore, collapse, expand
    */
    _initButtons: function () {
        this.buttons = [];

        var close = this.createButton({ name: "close", cls: "mini-tools-close", visible: this.showCloseButton });
        this.buttons.push(close);

        var collapse = this.createButton({ name: "collapse", cls: "mini-tools-collapse", visible: this.showCollapseButton });
        this.buttons.push(collapse);
    },
    createButton: function (options) {
        var button = mini.copyTo({
            name: "",
            cls: "",
            style: "",
            visible: true,
            enabled: true,
            html: ""
        }, options);
        return button;
    },
    addButton: function (button, index) {
        if (typeof button == "string") {
            button = { iconCls: button };
        }
        button = this.createButton(button);
        if (typeof index != "number") index = this.buttons.length;
        this.buttons.insert(index, button);
        this._doTools();
    },
    updateButton: function (index, options) {
        var button = this.getButton(index);
        if (!button) return;
        mini.copyTo(button, options);
        this._doTools();
    },
    removeButton: function (index) {
        var button = this.getButton(index);
        if (!button) return;
        this.buttons.remove(button);
        this._doTools();
    },
    getButton: function (index) {
        if (typeof index == "number") {
            return this.buttons[index];
        } else {
            for (var i = 0, l = this.buttons.length; i < l; i++) {
                var button = this.buttons[i];
                if (button.name == index) return button;
            }
        }
    },
    setBody: function (value) {
        __mini_setControls(value, this._bodyEl, this);
    },
    set_bodyParent: function (value) {

    },
    setToolbar: function (value) {
        __mini_setControls(value, this._toolbarEl, this);
    },
    setFooter: function (value) {
        __mini_setControls(value, this._footerEl, this);
    },
    getHeaderEl: function () {
        return this._headerEl;
    },
    getToolbarEl: function () {
        return this._toolbarEl;
    },
    getBodyEl: function () {
        return this._bodyEl;
    },
    getFooterEl: function () {
        return this._footerEl;
    },
    getIFrameEl: function (index) {
        return this._iframeEl;
    },
    ///////////////////////////////////////////////
    _getMaskWrapEl: function () {
        return this._bodyEl;
    },
    _doRemoveIFrame: function (removeAll) {
        if (this._iframeEl) {
            var iframe = this._iframeEl;
            //setTimeout(function () {
            iframe.src = "";
            try {
                iframe.contentWindow.document.write("");
                iframe.contentWindow.document.close();
            } catch (ex) { }
            if (iframe._ondestroy) iframe._ondestroy();
            //}, 1);
            try {
                this._iframeEl.parentNode.removeChild(this._iframeEl);
                this._iframeEl.removeNode(true);
            } catch (ex) { }
        }
        this._iframeEl = null;
        //        try {
        //            CollectGarbage();
        //        } catch (e) { }

        //删除bodyEl内所有元素
        if (removeAll === true) {
            mini.removeChilds(this._bodyEl);
        }
    },
    _deferLoadingTime: 80,
    _doLoad: function () {

        this._doRemoveIFrame(true);

        var st = new Date();
        var sf = this;

        this.loadedUrl = this.url;
        if (this.maskOnLoad) this.loading();

        jQuery(this._bodyEl).css("overflow", "hidden");

        var iframe = mini.createIFrame(this.url,
            function (_iframe, firstLoad) {
                var t = (st - new Date()) + sf._deferLoadingTime;

                if (t < 0) t = 0;
                setTimeout(function () {
                    sf.unmask();
                }, t);

                //window.close
                try {
                    sf._iframeEl.contentWindow.Owner = sf.Owner;
                    sf._iframeEl.contentWindow.CloseOwnerWindow = function (action) {

                        sf.__HideAction = action;

                        //__onDestroy
                        var ret = true;
                        if (sf.__onDestroy) ret = sf.__onDestroy(action);
                        if (ret === false) {
                            return false;
                        }

                        var e = {
                            iframe: sf._iframeEl,
                            action: action
                        };

                        sf.fire("unload", e);

                        setTimeout(function () {
                            sf.destroy();
                        }, 10);

                    }
                } catch (e) { }

                //firstLoad
                if (firstLoad) {
                    if (sf.__onLoad) sf.__onLoad();

                    var e = {
                        iframe: sf._iframeEl
                    };

                    //mini.repaint(sf.el);
                    sf.fire("load", e);
                }
            }
        );
        this._bodyEl.appendChild(iframe);
        this._iframeEl = iframe;

    },

    load: function (url, onload, ondestroy) {
        this.setUrl(url, onload, ondestroy);
    },
    reload: function () {
        this.setUrl(this.url);
    },
    setUrl: function (value, onload, ondestroy) {
        this.url = value;
        this.__onLoad = onload;
        this.__onDestroy = ondestroy;
        if (this.expanded) {
            this._doLoad();
        }
    },
    getUrl: function () {
        return this.url;
    },
    setRefreshOnExpand: function (value) {
        this.refreshOnExpand = value;
    },
    getRefreshOnExpand: function () {
        return this.refreshOnExpand;
    },
    setMaskOnLoad: function (value) {
        this.maskOnLoad = value;
    },
    getMaskOnLoad: function (value) {
        return this.maskOnLoad;
    },
    setAllowResize: function (value) {
        if (this.allowResize != value) {
            this.allowResize = value;
            this.doLayout();
        }
    },
    getAllowResize: function () {
        return this.allowResize;
    },
    /////////////////////////////////////////
    expanded: true,
    setExpanded: function (value) {
        if (this.expanded != value) {
            this.expanded = value;
            if (this.expanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    },
    toggle: function () {
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    collapse: function () {
        this.expanded = false;

        if (this.state != "max") {
        
            this._height = this.el.style.height;
        }
        this.el.style.height = "auto";
        this._viewportEl.style.display = "none";

        mini.addClass(this.el, "mini-panel-collapse");
        this.doLayout();
    },
    expand: function () {
        this.expanded = true;
        
        this.el.style.height = this._height;
        this._viewportEl.style.display = "block";

        if (this.state != "max") {
            delete this._height;
        }

        mini.removeClass(this.el, "mini-panel-collapse");

        //
        if (this.url && this.url != this.loadedUrl) {
            this._doLoad();
        }
        this.doLayout();
    },
    setCollapseOnTitleClick: function (value) {
        this.collapseOnTitleClick = value;
        mini.removeClass(this.el, 'mini-panel-titleclick');
        if (value) mini.addClass(this.el, 'mini-panel-titleclick');
    },
    getCollapseOnTitleClick: function () {
        return this.collapseOnTitleClick;
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.Panel.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["title", "iconCls", "iconStyle", "headerCls", "headerStyle", "bodyCls", "bodyStyle",
            "footerCls", "footerStyle", "toolbarCls", "toolbarStyle", "footer", "toolbar",
            "url", "closeAction", "loadingMsg",
            "onbeforebuttonclick", "onbuttonclick", "onload"
             ]
        );
        mini._ParseBool(el, attrs,
            ["allowResize", "showCloseButton", "showHeader", "showToolbar", "showFooter",
            "showCollapseButton", "refreshOnExpand", "maskOnLoad", "expanded", "collapseOnTitleClick"
             ]
        );

        var cs = mini.getChildNodes(el, true);
        for (var i = cs.length - 1; i >= 0; i--) {
            var node = cs[i];
            var property = jQuery(node).attr("property");
            if (!property) continue;
            property = property.toLowerCase();
            if (property == "toolbar") {
                attrs.toolbar = node;
            } else if (property == "footer") {
                attrs.footer = node;
            }
        }
        attrs.body = cs;

        return attrs;
    }


});
mini.regClass(mini.Panel, "panel");


//mini._PanelResizer = function (panel) {
//    this.owner = panel;
//    mini.on(panel.el, "mousedown", this.__OnMouseDown, this);
//}
//mini._PanelResizer.prototype = {
//    __OnMouseDown: function (e) {
//        var panel = this.owner;
//        
//        if (mini.isAncestor(panel._resizeGridEl, e.target) && panel.allowResize) {
//            var drag = this._getResizeDrag();
//            drag.start(e);
//        }
//    },
//    _getResizeDrag: function () {
//        if (!this._resizeDragger) {
//            this._resizeDragger = new mini.Drag({
//                capture: true,
//                onStart: mini.createDelegate(this._OnDragStart, this),
//                onMove: mini.createDelegate(this._OnDragMove, this),
//                onStop: mini.createDelegate(this._OnDragStop, this)
//            });
//        }
//        return this._resizeDragger;
//    },
//    _OnDragStart: function (drag) {

//        this.proxy = mini.append(document.body, '<div class="mini-resizer-proxy"></div>');
//        this.proxy.style.cursor = "se-resize";

//        this.elBox = mini.getBox(this.el);
//        mini.setBox(this.proxy, this.elBox);
//    },
//    _OnDragMove: function (drag) {
//        var xOffset = drag.now[0] - drag.init[0];
//        var yOffset = drag.now[1] - drag.init[1];

//        var w = this.elBox.width + xOffset;
//        var h = this.elBox.height + yOffset;
//        if (w < this.minWidth) w = this.minWidth;
//        if (h < this.minHeight) h = this.minHeight;
//        if (w > this.maxWidth) w = this.maxWidth;
//        if (h > this.maxHeight) h = this.maxHeight;

//        mini.setSize(this.proxy, w, h);
//    },
//    _OnDragStop: function (drag) {
//        var box = mini.getBox(this.proxy);

//        jQuery(this.proxy).remove();
//        this.proxy = null;
//        this.elBox = null;

//        this.setWidth(box.width);
//        this.setHeight(box.height);

//        delete this._width;
//        delete this._height;

//        //mini.repaint(this.el);
//    }
//}