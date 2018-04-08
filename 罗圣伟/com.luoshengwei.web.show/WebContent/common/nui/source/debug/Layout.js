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

mini.Layout = function () {
    this.regions = [];
    this.regionMap = {};
    mini.Layout.superclass.constructor.call(this);
}
mini.extend(mini.Layout, mini.Control, {
    regions: [],
    splitSize: 5,
    collapseWidth: 28,
    collapseHeight: 25,
    regionWidth: 150,
    regionHeight: 80,
    regionMinWidth: 50,
    regionMinHeight: 25,
    regionMaxWidth: 2000,
    regionMaxHeight: 2000,

    uiCls: "mini-layout",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-layout";
        this.el.innerHTML = '<div class="mini-layout-border"></div>';

        this._borderEl = this.el.firstChild;

        this.doUpdate();
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(this.el, "mouseout", this.__OnMouseOut, this);

            mini.on(document, "mousedown", this.__OnDocMouseDown, this);
        }, this);
    },

    getRegionEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._el;
    },
    getRegionHeaderEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._header;
    },
    getRegionBodyEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._body;
    },
    getRegionSplitEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._split
    },
    getRegionProxyEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._proxy;
    },
    getRegionBox: function (region) {
        var el = this.getRegionEl(region);
        if (el) return mini.getBox(el);
        return null;
    },
    getRegion: function (region) {
        if (typeof region == "string") return this.regionMap[region];
        return region;
    },
    _getButton: function (region, name) {
        var buttons = region.buttons;
        for (var i = 0, l = buttons.length; i < l; i++) {
            var button = buttons[i];
            if (button.name == name) return button;
        }
    },
    _createRegion: function (options) {

        var region = mini.copyTo({
            region: "", title: "", iconCls: "", iconStyle: "",

            showCloseButton: false, showCollapseButton: true,
            buttons: [
                { name: "close", cls: "mini-tools-close", html: "", visible: false },
                { name: "collapse", cls: "mini-tools-collapse", html: "", visible: true }
            ],
            showSplitIcon: false, //折叠图标
            showSplit: true,    //拖拽
            showHeader: true,
            splitSize: this.splitSize, collapseSize: this.collapseWidth,
            width: this.regionWidth, height: this.regionHeight,
            minWidth: this.regionMinWidth, minHeight: this.regionMinHeight,
            maxWidth: this.regionMaxWidth, maxHeight: this.regionMaxHeight,
            allowResize: true,

            cls: "", style: "",
            headerCls: "", headerStyle: "",
            bodyCls: "", bodyStyle: "",

            visible: true,
            expanded: true
        }, options);
        return region;
    },
    _CreateRegionEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return;

        //region 
        mini.append(this._borderEl, '<div id="' + region.region + '" class="mini-layout-region"><div class="mini-layout-region-header" style="' + region.headerStyle + '"></div><div class="mini-layout-region-body" style="' + region.bodyStyle + '"></div></div>');
        region._el = this._borderEl.lastChild;
        region._header = region._el.firstChild;
        region._body = region._el.lastChild;

        if (region.cls) mini.addClass(region._el, region.cls);
        if (region.style) mini.setStyle(region._el, region.style);

        mini.addClass(region._el, 'mini-layout-region-' + region.region);

        //split 
        if (region.region != "center") {
            mini.append(this._borderEl, '<div uid="' + this.uid + '" id="' + region.region + '" class="mini-layout-split"><div class="mini-layout-spliticon"></div></div>');
            region._split = this._borderEl.lastChild;
            mini.addClass(region._split, 'mini-layout-split-' + region.region);
        }

        //proxy 
        if (region.region != "center") {
            mini.append(this._borderEl, '<div id="' + region.region + '" class="mini-layout-proxy"></div>');
            region._proxy = this._borderEl.lastChild;
            mini.addClass(region._proxy, 'mini-layout-proxy-' + region.region);
        }

    },
    setRegionControls: function (region, value) {
        var region = this.getRegion(region);
        if (!region) return;
        var el = this.getRegionBodyEl(region);
        __mini_setControls(value, el, this);
    },
    setRegions: function (regions) {
        if (!mini.isArray(regions)) return;
        for (var i = 0, l = regions.length; i < l; i++) {
            this.addRegion(regions[i]);
        }

    },
    addRegion: function (region, index) {
        var r1 = region;
        region = this._createRegion(region);

        if (!region.region) region.region = "center";
        region.region = region.region.toLowerCase();
        if (region.region == "center" && r1 && !r1.showHeader) {
            region.showHeader = false;
        }
        if (region.region == "north" || region.region == "south") {
            if (!r1.collapseSize) {
                region.collapseSize = this.collapseHeight;
            }
        }

        this._measureRegion(region);

        if (typeof index != "number") index = this.regions.length;
        var r = this.regionMap[region.region];
        if (r) {
            //throw new Error(region.region + " region donot repeat");
            return;
        }
        this.regions.insert(index, region);
        this.regionMap[region.region] = region;

        this._CreateRegionEl(region);

        var el = this.getRegionBodyEl(region);

        //body
        var cs = region.body;
        delete region.body;
        if (cs) {
            if (!mini.isArray(cs)) cs = [cs];
            for (var i = 0, l = cs.length; i < l; i++) {
                mini.append(el, cs[i]);
            }
        }

        //bodyParent
        if (region.bodyParent) {
            var p = region.bodyParent;
            while (p.firstChild) {
                el.appendChild(p.firstChild);
            }
        }
        delete region.bodyParent;

        //controls
        if (region.controls) {        
            this.setRegionControls(region, region.controls);
            delete region.controls;
        }

        this.doUpdate();
    },
    removeRegion: function (region) {
        var region = this.getRegion(region);
        if (!region) return;
        this.regions.remove(region);
        delete this.regionMap[region.region];

        jQuery(region._el).remove();
        jQuery(region._split).remove();
        jQuery(region._proxy).remove();

        this.doUpdate();
    },
    moveRegion: function (region, index) {
        var region = this.getRegion(region);
        if (!region) return;
        var t = this.regions[index];
        if (!t || t == region) return;
        this.regions.remove(region);
        var index = this.region.indexOf(t);
        this.regions.insert(index, region);
        this.doUpdate();
    },
    _measureRegion: function (region) {
        var button = this._getButton(region, "close");
        button.visible = region.showCloseButton;
        var button = this._getButton(region, "collapse");
        button.visible = region.showCollapseButton;

        if (region.width < region.minWidth) region.width = mini.minWidth;
        if (region.width > region.maxWidth) region.width = mini.maxWidth;
        if (region.height < region.minHeight) region.height = mini.minHeight;
        if (region.height > region.maxHeight) region.height = mini.maxHeight;
    },
    updateRegion: function (region, options) {
        region = this.getRegion(region);
        if (!region) return;
        if (options) delete options.region;
        mini.copyTo(region, options);

        this._measureRegion(region);

        this.doUpdate();
    },
    expandRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.expanded = true;
        this.doUpdate();
    },
    collapseRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.expanded = false;
        this.doUpdate();
    },
    toggleRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        if (region.expanded) {
            this.collapseRegion(region);
        } else {
            this.expandRegion(region);
        }
    },
    showRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.visible = true;
        this.doUpdate();
    },
    hideRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.visible = false;
        this.doUpdate();
    },
    isExpandRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return null;
        return this.region.expanded;
    },
    isVisibleRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return null;
        return this.region.visible;
    },
    _tryToggleRegion: function (region) {
        region = this.getRegion(region);

        var e = {
            region: region,
            cancel: false
        };
        if (region.expanded) {
            this.fire("BeforeCollapse", e);
            if (e.cancel == false) {
                this.collapseRegion(region);
            }
        } else {
            this.fire("BeforeExpand", e);
            if (e.cancel == false) {
                this.expandRegion(region);
            }
        }
    },
    ////////////////////////////////////////////
    _getProxyElByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-layout-proxy');
        return el;
    },
    _getRegionElByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-layout-region');
        return el;
    },
    __OnClick: function (e) {
        if (this._inAniming) return;
        var proxyEl = this._getProxyElByEvent(e);
        if (proxyEl) {
            var region = proxyEl.id;
            var collapseEl = mini.findParent(e.target, 'mini-tools-collapse');
            if (collapseEl) {
                this._tryToggleRegion(region);
            } else {
                this._VirtualToggle(region);
            }
        }

        var regionEl = this._getRegionElByEvent(e);
        if (regionEl && mini.findParent(e.target, 'mini-layout-region-header')) {
            var region = regionEl.id;
            var collapseEl = mini.findParent(e.target, 'mini-tools-collapse');
            if (collapseEl) {
                this._tryToggleRegion(region);
            }
            var closeEl = mini.findParent(e.target, 'mini-tools-close');
            if (closeEl) {
                this.updateRegion(region, { visible: false });
            }
        }
        if (mini.hasClass(e.target, 'mini-layout-spliticon')) {
            var region = e.target.parentNode.id;
            this._tryToggleRegion(region);
        }

    },
    _OnButtonClick: function (region, button, htmlEvent) {
        this.fire("buttonclick", {
            htmlEvent: htmlEvent,
            region: region,
            button: button,
            index: this.buttons.indexOf(button),
            name: button.name
        });
    },
    _OnButtonMouseDown: function (region, button, htmlEvent) {
        this.fire("buttonmousedown", {
            htmlEvent: htmlEvent,
            region: region,
            button: button,
            index: this.buttons.indexOf(button),
            name: button.name
        });
    },
    hoverProxyEl: null,
    __OnMouseOver: function (e) {
        var proxyEl = this._getProxyElByEvent(e);
        if (proxyEl) {
            mini.addClass(proxyEl, 'mini-layout-proxy-hover');
            this.hoverProxyEl = proxyEl;
        }
    },
    __OnMouseOut: function (e) {
        if (this.hoverProxyEl) {
            mini.removeClass(this.hoverProxyEl, 'mini-layout-proxy-hover');
        }
        this.hoverProxyEl = null;
    },

    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },
    onButtonMouseDown: function (fn, scope) {
        this.on("buttonmousedown", fn, scope);
    }

});

mini.copyTo(mini.Layout.prototype, {
    _createHeader: function (region, proxy) {
        var s = '<div class="mini-tools">';
        if (proxy) {
            s += '<span class="mini-tools-collapse"></span>';
        } else {
            for (var i = region.buttons.length - 1; i >= 0; i--) {
                var button = region.buttons[i];
                s += '<span class="' + button.cls + '" style="'
                s += button.style + ';' + (button.visible ? "" : "display:none;") + '">' + button.html + '</span>';
            }
        }
        s += '</div>';

        s += '<div class="mini-layout-region-icon ' + region.iconCls + '" style="' + region.iconStyle + ';' + ((region.iconStyle || region.iconCls) ? "" : "display:none;") + '"></div>';
        s += '<div class="mini-layout-region-title">' + region.title + '</div>';
        return s;
    },
    doUpdate: function () {
        for (var i = 0, l = this.regions.length; i < l; i++) {
            var region = this.regions[i];
            var type = region.region;
            var el = region._el, split = region._split, proxy = region._proxy;

            if (region.cls) mini.addClass(el, region.cls);

            region._header.style.display = region.showHeader ? "" : "none";
            region._header.innerHTML = this._createHeader(region);
            if (region._proxy) region._proxy.innerHTML = this._createHeader(region, true);

            if (split) {
                mini.removeClass(split, 'mini-layout-split-nodrag');
                if (region.expanded == false || !region.allowResize) {
                    mini.addClass(split, 'mini-layout-split-nodrag')
                }
            }

        }

        this.doLayout();
    },
    doLayout: function () {

        if (!this.canLayout()) {

            return;
        }

        if (this._inAniming) {
            //alert(2);
            return;
        }
        //if(mini.getHeight(this.el, true) == 0) debugger
        var h = mini.getHeight(this.el, true); //jQuery(this.el).height();
        var w = mini.getWidth(this.el, true); //jQuery(this.el).width();
        var box = { x: 0, y: 0, width: w, height: h };

        var regions = this.regions.clone();
        var center = this.getRegion("center");
        regions.remove(center);
        if (center) {
            regions.push(center);
        }

        for (var i = 0, l = regions.length; i < l; i++) {
            var region = regions[i];
            region._Expanded = false;
            mini.removeClass(region._el, "mini-layout-popup");

            var type = region.region;
            var el = region._el, split = region._split, proxy = region._proxy;
            if (region.visible == false) {
                el.style.display = "none";
                if (type != "center") split.style.display = proxy.style.display = "none";
                continue;
            }
            el.style.display = "";
            if (type != "center") split.style.display = proxy.style.display = "";

            var x = box.x, y = box.y, w = box.width, h = box.height;
            var cw = region.width, ch = region.height;
            //如果是折叠起来的
            if (!region.expanded) {
                if (type == "west" || type == "east") {
                    cw = region.collapseSize;
                    mini.setWidth(el, region.width);
                } else if (type == "north" || type == "south") {
                    ch = region.collapseSize;
                    mini.setHeight(el, region.height);
                }
            }

            switch (type) {
                case "north":
                    h = ch;
                    box.y += ch;
                    box.height -= ch;
                    break;
                case "south":
                    h = ch;
                    y = box.y + box.height - ch;
                    box.height -= ch;
                    break;
                case "west":
                    w = cw;
                    box.x += cw;
                    box.width -= cw;
                    break;
                case "east":
                    w = cw;
                    x = box.x + box.width - cw;
                    box.width -= cw;
                    break;
                case "center":
                    break;
                default:
                    continue;
            }
            if (w < 0) w = 0;
            if (h < 0) h = 0;

            //没有折叠开，也要把region设置好，并设置出去
            if (type == "west" || type == "east") {
                mini.setHeight(el, h);
            }
            if (type == "north" || type == "south") {
                mini.setWidth(el, w);
            }

            var style = "left:" + x + "px;top:" + y + "px;";
            var d = el;
            if (!region.expanded) {
                d = proxy;
                el.style.top = "-100px";
                el.style.left = "-1500px";
            } else {
                if (proxy) {
                    proxy.style.left = "-1500px";
                    proxy.style.top = "-100px";
                }
            }
            d.style.left = x + "px";
            d.style.top = y + "px";
            mini.setWidth(d, w);
            mini.setHeight(d, h);

            //body handle
            var regionH = jQuery(region._el).height()
            var headerH = region.showHeader ? jQuery(region._header).outerHeight() : 0;
            mini.setHeight(region._body, regionH - headerH);

            //split handle
            if (type == "center") continue;

            cw = ch = region.splitSize;
            var x = box.x, y = box.y, w = box.width, h = box.height;
            switch (type) {
                case "north":
                    h = ch;
                    box.y += ch;
                    box.height -= ch;
                    break;
                case "south":
                    h = ch;
                    y = box.y + box.height - ch;
                    box.height -= ch;
                    break;
                case "west":
                    w = cw;
                    box.x += cw;
                    box.width -= cw;
                    break;
                case "east":
                    w = cw;
                    x = box.x + box.width - cw;
                    box.width -= cw;
                    break;
                case "center":
                    break;
            }
            if (w < 0) w = 0;
            if (h < 0) h = 0;

            //showSplit
            split.style.left = x + "px";
            split.style.top = y + "px";
            mini.setWidth(split, w);
            mini.setHeight(split, h);

            if (region.showSplit && region.expanded && region.allowResize == true) {
                mini.removeClass(split, 'mini-layout-split-nodrag');
            } else {
                mini.addClass(split, 'mini-layout-split-nodrag');
            }
            //split.style.display = region.showSplit ? "block" : "none";

            //showSplitIcon
            split.firstChild.style.display = region.showSplitIcon ? "block" : "none";
            if (region.expanded) {
                mini.removeClass(split.firstChild, 'mini-layout-spliticon-collapse');
            } else {
                mini.addClass(split.firstChild, 'mini-layout-spliticon-collapse');
            }
        }
        mini.layout(this._borderEl);

        this.fire("layout");
    },
    ///////////////////////////////
    //Drag
    __OnMouseDown: function (e) {
        if (this._inAniming) return;
        if (mini.findParent(e.target, "mini-layout-split")) {
            var uid = jQuery(e.target).attr("uid");
            if (uid != this.uid) return;
            var region = this.getRegion(e.target.id);
            if (region.expanded == false || !region.allowResize || !region.showSplit) return;
            this.dragRegion = region;
            var drag = this._getDrag();
            drag.start(e);
        }
    },
    _getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        this._maskProxy = mini.append(document.body, '<div class="mini-resizer-mask"></div>');

        this._dragProxy = mini.append(document.body, '<div class="mini-proxy"></div>');
        this._dragProxy.style.cursor = "n-resize";
        if (this.dragRegion.region == "west" || this.dragRegion.region == "east") {
            this._dragProxy.style.cursor = "w-resize";
        }

        this.splitBox = mini.getBox(this.dragRegion._split);
        mini.setBox(this._dragProxy, this.splitBox);

        this.elBox = mini.getBox(this.el, true);
    },
    _OnDragMove: function (drag) {
        var xOffset = drag.now[0] - drag.init[0];
        var x = this.splitBox.x + xOffset;
        var yOffset = drag.now[1] - drag.init[1];
        var y = this.splitBox.y + yOffset;
        var right = x + this.splitBox.width;
        var bottom = y + this.splitBox.height;

        var west = this.getRegion("west"),
            east = this.getRegion("east"),
            north = this.getRegion("north"),
            south = this.getRegion("south"),
            center = this.getRegion("center");
        var westWidth = west && west.visible ? west.width : 0;
        var eastWidth = east && east.visible ? east.width : 0;
        var northHeight = north && north.visible ? north.height : 0;
        var southHeight = south && south.visible ? south.height : 0;
        var westSplitWidth = west && west.showSplit ? mini.getWidth(west._split) : 0;
        var eastSplitWidth = east && east.showSplit ? mini.getWidth(east._split) : 0;
        var northSplitHeight = north && north.showSplit ? mini.getHeight(north._split) : 0;
        var southSplitHeight = south && south.showSplit ? mini.getHeight(south._split) : 0;

        var region = this.dragRegion, type = region.region;
        if (type == "west") {
            var maxWidth = this.elBox.width - eastWidth - eastSplitWidth - westSplitWidth - center.minWidth;
            if (x - this.elBox.x > maxWidth) x = maxWidth + this.elBox.x;

            if (x - this.elBox.x < region.minWidth) x = region.minWidth + this.elBox.x;
            if (x - this.elBox.x > region.maxWidth) x = region.maxWidth + this.elBox.x;

            mini.setX(this._dragProxy, x);
        } else if (type == "east") {
            var maxWidth = this.elBox.width - westWidth - westSplitWidth - eastSplitWidth - center.minWidth;
            if (this.elBox.right - (x + this.splitBox.width) > maxWidth) {
                x = this.elBox.right - maxWidth - this.splitBox.width;
            }

            if (this.elBox.right - (x + this.splitBox.width) < region.minWidth) {
                x = this.elBox.right - region.minWidth - this.splitBox.width;
            }
            if (this.elBox.right - (x + this.splitBox.width) > region.maxWidth) {
                x = this.elBox.right - region.maxWidth - this.splitBox.width;
            }

            mini.setX(this._dragProxy, x);
        } else if (type == "north") {
            var maxHeight = this.elBox.height - southHeight - southSplitHeight - northSplitHeight - center.minHeight;
            if (y - this.elBox.y > maxHeight) y = maxHeight + this.elBox.y;

            if (y - this.elBox.y < region.minHeight) y = region.minHeight + this.elBox.y;
            if (y - this.elBox.y > region.maxHeight) y = region.maxHeight + this.elBox.y;

            mini.setY(this._dragProxy, y);
        } else if (type == "south") {
            var maxHeight = this.elBox.height - northHeight - northSplitHeight - southSplitHeight - center.minHeight;
            if (this.elBox.bottom - (y + this.splitBox.height) > maxHeight) {
                y = this.elBox.bottom - maxHeight - this.splitBox.height;
            }

            if (this.elBox.bottom - (y + this.splitBox.height) < region.minHeight) {
                y = this.elBox.bottom - region.minHeight - this.splitBox.height;
            }
            if (this.elBox.bottom - (y + this.splitBox.height) > region.maxHeight) {
                y = this.elBox.bottom - region.maxHeight - this.splitBox.height;
            }

            mini.setY(this._dragProxy, y);
        }
    },
    _OnDragStop: function (drag) {
        var box = mini.getBox(this._dragProxy);

        var region = this.dragRegion, type = region.region;
        if (type == "west") {
            var width = box.x - this.elBox.x;
            this.updateRegion(region, { width: width });
        } else if (type == "east") {
            var width = this.elBox.right - box.right;
            this.updateRegion(region, { width: width });
        } else if (type == "north") {
            var height = box.y - this.elBox.y;
            this.updateRegion(region, { height: height });
        } else if (type == "south") {
            var height = this.elBox.bottom - box.bottom;
            this.updateRegion(region, { height: height });
        }

        jQuery(this._dragProxy).remove();
        this._dragProxy = null;
        this.elBox = this.handlerBox = null;

        jQuery(this._maskProxy).remove();
        this._maskProxy = null;
    },
    ////////////////////////////////////////////
    //滑动面板展示
    _VirtualToggle: function (region) {
        region = this.getRegion(region);

        if (region._Expanded === true) {
            this._VirtualCollapse(region);
        } else {
            this._VirtualExpand(region);
        }
    },
    _VirtualExpand: function (region) {
        if (this._inAniming) return;

        this.doLayout();

        var type = region.region, el = region._el;
        region._Expanded = true;
        mini.addClass(el, "mini-layout-popup");
        var proxyBox = mini.getBox(region._proxy);
        var box = mini.getBox(region._el);

        var config = {};
        if (type == "east") {
            var x = proxyBox.x;
            var y = proxyBox.y;
            var h = proxyBox.height;

            mini.setHeight(el, h);
            mini.setX(el, x);
            el.style.top = region._proxy.style.top;

            var left = parseInt(el.style.left);
            config = { left: left - box.width };
        } else if (type == "west") {
            var x = proxyBox.right - box.width;
            var y = proxyBox.y;
            var h = proxyBox.height;

            mini.setHeight(el, h);
            mini.setX(el, x);
            el.style.top = region._proxy.style.top;
            //mini.setXY(el, x, y);
            //alert(y);
            var left = parseInt(el.style.left);
            config = { left: left + box.width };
        } else if (type == "north") {
            var x = proxyBox.x;
            var y = proxyBox.bottom - box.height;
            var w = proxyBox.width;

            mini.setWidth(el, w);
            mini.setXY(el, x, y);

            var top = parseInt(el.style.top);
            config = { top: top + box.height };
        } else if (type == "south") {
            var x = proxyBox.x;
            var y = proxyBox.y;
            var w = proxyBox.width;

            mini.setWidth(el, w);
            mini.setXY(el, x, y);

            var top = parseInt(el.style.top);
            config = { top: top - box.height };
        }

        mini.addClass(region._proxy, "mini-layout-maxZIndex");
        this._inAniming = true;
        var sf = this;
        var jq = jQuery(el);
        jq.animate(
            config,
            250,
            function () {
                mini.removeClass(region._proxy, "mini-layout-maxZIndex");
                sf._inAniming = false;
            }
        );
    },
        _VirtualCollapse: function (region) {
    
        if (this._inAniming) return;
        region._Expanded = false;
        var type = region.region, el = region._el;

        var box = mini.getBox(el);

        var config = {};
        if (type == "east") {
            var left = parseInt(el.style.left);
            config = { left: left + box.width };
        } else if (type == "west") {
            var left = parseInt(el.style.left);
            config = { left: left - box.width };
        } else if (type == "north") {
            var top = parseInt(el.style.top);
            config = { top: top - box.height };
        } else if (type == "south") {
            var top = parseInt(el.style.top);
            config = { top: top + box.height };
        }

        mini.addClass(region._proxy, "mini-layout-maxZIndex");
        this._inAniming = true;
        var sf = this;
        var jq = jQuery(el);
        jq.animate(
            config,
            250,
            function () {
                mini.removeClass(region._proxy, "mini-layout-maxZIndex");
                sf._inAniming = false;
                sf.doLayout();
            }
        );
    },
    __OnDocMouseDown: function (e) {
        if (this._inAniming) return;
        
        for (var i = 0, l = this.regions.length; i < l; i++) {
            var region = this.regions[i];
            if (!region._Expanded) continue;
            if (mini.isAncestor(region._el, e.target)
              || mini.isAncestor(region._proxy, e.target)
              || e.target.location
              ) {

            } else {
                this._VirtualCollapse(region);
            }
        }
    },
    ///////////////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.Layout.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        var splitSize = parseInt(jq.attr("splitSize"));
        if (!isNaN(splitSize)) {
            attrs.splitSize = splitSize;
        }

        var regions = [];
        var nodes = mini.getChildNodes(el);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            var o = {};
            regions.push(o);

            o.cls = node.className;

            o.style = node.style.cssText;
            mini._ParseString(node, o,
                ["region", "title", "iconCls", "iconStyle", "cls", "headerCls", "headerStyle",
                    "bodyCls", "bodyStyle"
                 ]
            );
            mini._ParseBool(node, o,
                ["allowResize", "visible", "showCloseButton", "showCollapseButton", "showSplit", "showHeader", "expanded",
                "showSplitIcon"
                 ]
            );
            mini._ParseInt(node, o,
                ["splitSize", "collapseSize", "width", "height", "minWidth", "minHeight"
                , "maxWidth", "maxHeight"
                 ]
            );

            //            var cs = mini.getChildNodes(node, true);
            //            o.body = cs;
            o.bodyParent = node;
        }
        attrs.regions = regions;

        return attrs;
    }
});
mini.regClass(mini.Layout, "layout");