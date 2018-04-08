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

mini = {
    components: {},
    uids: {},
    ux: {},
    doc: document,
    window: window,

    isReady: false,


    byClass: function (cls, el) {
        if (typeof el == "string") el = mini.byId(el);
        return jQuery("." + cls, el)[0];
    },
    getComponents: function () {
        var cs = [];
        for (var id in mini.components) {
            var c = mini.components[id];
            if (c.isControl) {
                cs.push(c);
            }
        }
        return cs;
    },
    get: function (id) {
        if (!id) return null;
        if (mini.isControl(id)) return id;
        if (typeof id == "string") {
            if (id.charAt(0) == '#') id = id.substr(1);
        }
        if (typeof id == "string") return mini.components[id];
        else {
            var control = mini.uids[id.uid];
            if (control && control.el == id) return control;
        }
        return null;
    },
    getbyUID: function (uid) {
        return mini.uids[uid];
    },
    findControls: function (fn, scope) {
        if (!fn) return [];
        scope = scope || mini;
        var controls = [];
        var uids = mini.uids;
        for (var uid in uids) {
            var control = uids[uid];
            var ret = fn.call(scope, control);
            if (ret === true || ret === 1) {
                controls.push(control);
                if (ret === 1) break;
            }
        }
        return controls;
    },
    getChildControls: function (parent) {
        var pel = parent.el ? parent.el : parent;
        var controls = mini.findControls(function (control) {
            if (!control.el || parent == control) return false;
            if (mini.isAncestor(pel, control.el) && control.within) return true;
            return false;
        });
        return controls;
    },
    emptyFn: function () { },
    //遍历控件内部，将所有子控件，通过this._name的方式映射到控件对象上
    //pre为true，表示首字母大写
    createNameControls: function (obj, pre) {
        if (!obj || !obj.el) return;
        if (!pre) pre = "_";
        var el = obj.el;
        var controls = mini.findControls(function (control) {
            if (!control.el || !control.name) return false;
            if (mini.isAncestor(el, control.el)) return true;
            return false;
        });

        for (var i = 0, l = controls.length; i < l; i++) {
            var c = controls[i];
            var name = pre + c.name;
            if (pre === true) {
                name = c.name[0].toUpperCase() + c.name.substring(1, c.name.length);
            }
            obj[name] = c;
        }

    },

    getsbyName: function (name, parentNode) {
        var isControl = mini.isControl(parentNode);
        var parentControl = parentNode;
        if (parentNode && isControl) {
            parentNode = parentNode.el;
        }
        parentNode = mini.byId(parentNode);
        parentNode = parentNode || document.body;
        var controls = mini.findControls(function (control) {
            if (!control.el) return false;
            if (control.name == name && mini.isAncestor(parentNode, control.el)) return true;
            return false;
        }, this);

        if (isControl && controls.length == 0 && parentControl && parentControl.getbyName) {
            var obj = parentControl.getbyName(name);
            if (obj) controls.push(obj);
        }

        return controls;
    },
    getbyName: function (name, parentNode) {
        return mini.getsbyName(name, parentNode)[0];
    },

    getParams: function (url) {
        if (!url) url = location.href;
        url = url.split("?")[1];
        var params = {};
        if (url) {
            var us = url.split("&");
            for (var i = 0, l = us.length; i < l; i++) {
                var ps = us[i].split("=");
                //params[ps[0]] = decodeURIComponent(ps[1]);
                try {
                    params[ps[0]] = decodeURIComponent(unescape(ps[1]));
                } catch (ex) {

                }
            }
        }
        return params;
    },

    reg: function (cmp) {
        this.components[cmp.id] = cmp;
        this.uids[cmp.uid] = cmp;
        //cmp.type = cmp.constructor
    },
    unreg: function (cmp) {
        delete mini.components[cmp.id];
        delete mini.uids[cmp.uid];
    },

    classes: {},
    uiClasses: {},
    getClass: function (className) {
        if (!className) return null;
        return this.classes[className.toLowerCase()];
    },
    getClassByUICls: function (uiCls) {

        return this.uiClasses[uiCls.toLowerCase()];
    },


    idPre: "mini-",
    idIndex: 1,
    newId: function (idPre) {
        return (idPre || this.idPre) + this.idIndex++;
    },

    copyTo: function (to, from) {
        if (to && from) {
            for (var p in from) {
                to[p] = from[p];
            }
        }
        return to;
    },
    copyIf: function (to, from) {
        if (to && from) {
            for (var p in from) {
                if (mini.isNull(to[p])) {
                    to[p] = from[p];
                }
            }
        }
        return to;
    },
    createDelegate: function (fn, scope) {
        if (!fn) return function () { };
        return function () {
            return fn.apply(scope, arguments);
        }
    },

    isControl: function (obj) {
        return !!(obj && obj.isControl);
    },
    isElement: function (obj) {
        return obj && obj.appendChild;
    },
    isDate: function (value) {
        return value && value.getFullYear;
    },
    isArray: function (value) {
        return value && !!value.unshift
    },
    isNull: function (value) {
        return value === null || value === undefined;
    },

    isNumber: function (value) {
        return !isNaN(value) && typeof value == 'number';
    },
    isEquals: function (a, b) {
        //null, undefined
        if (a !== 0 && b !== 0) {
            if ((mini.isNull(a) || a == "") && (mini.isNull(b) || b == "")) return true;
        }
        //date
        if (a && b && a.getFullYear && b.getFullYear) return a.getTime() === b.getTime();
        //Object
        if (typeof a == 'object' && typeof b == 'object') {
            return a === b;
        }
        //common
        return String(a) === String(b);
    },
    forEach: function (array, method, scope) {
        var list = array.clone();
        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            if (method.call(scope, o, i, array) === false) break;
        }
    },
    sort: function (array, fn, scope) {
        scope = scope || array;
        array.sort(fn);
    },
    ////////////////////////////
    removeNode: function (el) {
        jQuery(el).remove();
    },
    elWarp: document.createElement("div")
    //    ,        
    //    createElement: function (html) {        
    //        html = html.trim();
    //        this.elWarp.innerHTML = html;
    //        var el = this.elWarp.firstChild;
    //        this.elWarp.removeChild(el);
    //        return el;
    //    }
};


if (typeof mini_debugger == "undefined") {
    mini_debugger = true;
}

//mini.getbyDom = function (dom) {
//    var controls = mini.getComponents();
//    for (var i = 0, l = controls.length; i < l; i++) {
//        var c = controls[i];
//        if(e.el && mini.isAn
//    }
//}

mini_regClass = function (clazz, className) {
    className = className.toLowerCase();
    if (!mini.classes[className]) {
        mini.classes[className] = clazz;
        clazz.prototype.type = className;
    }
    var uiCls = clazz.prototype.uiCls;
    if (!mini.isNull(uiCls) && !mini.uiClasses[uiCls]) {
        mini.uiClasses[uiCls] = clazz;
    }
}
mini_extend = function (newClass, sp, overrides) {
    if (typeof sp != 'function') return this;

    var sb = newClass, sbp = sb.prototype, spp = sp.prototype;
    if (sb.superclass == spp) return;
    sb.superclass = spp;
    sb.superclass.constructor = sp;

    for (var p in spp) {
        sbp[p] = spp[p];
    }
    if (overrides) {
        for (var p in overrides) {
            sbp[p] = overrides[p];
        }
    }
    return sb;
}
mini.copyTo(mini, {
    extend: mini_extend,
    regClass: mini_regClass,
    debug: false
});


mini.namespace = function (names) {
    if (typeof names != "string") return;
    names = names.split(".");
    var parent = window;
    for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        var obj = parent[name];
        if (!obj) {
            obj = parent[name] = {};
        }
        parent = obj;
    }
}

mini._BindCallbacks = [];
mini._BindEvents = function (fn, scope) {
    mini._BindCallbacks.push([fn, scope]);
    if (!mini._EventTimer) {
        mini._EventTimer = setTimeout(function () {
            mini._FireBindEvents();
        }, 50);
    }
}
mini._FireBindEvents = function () {
    for (var i = 0, l = mini._BindCallbacks.length; i < l; i++) {
        var e = mini._BindCallbacks[i];
        e[0].call(e[1]);
    }
    mini._BindCallbacks = [];
    mini._EventTimer = null;
}

mini._getFunctoin = function (fnName) {
    if (typeof fnName != "string") return null;
    var names = fnName.split(".");
    var fn = null;
    for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        if (!fn) fn = window[name];
        else fn = fn[name];
        if (!fn) break;
    }
    return fn;
}

mini._getMap = function (name, obj) {
    if (!name) return null;
    var index = name.indexOf(".");
    if (index == -1 && name.indexOf("[") == -1) return obj[name];
    if (index == (name.length - 1)) return obj[name];
    var s = "obj." + name;
    try {
        var v = eval(s);
    } catch (e) {
        return null;
    }
    return v;
}
mini._setMap = function (name, value, obj) {
    if (!obj) return;
    if (typeof name != "string") return;

    var names = name.split(".");

    function createArray(obj, name, num, defaultValue) {
        var arr = obj[name];
        if (!arr) {
            arr = obj[name] = [];
        }
        for (var i = 0; i <= num; i++) {
            var arrObj = arr[i];
            if (!arrObj) {
                if (defaultValue === null || defaultValue === undefined) {
                    arrObj = arr[i] = {};
                } else {
                    arrObj = arr[i] = defaultValue;
                }
            }
        }
        return obj[name][num];
    }

    var obj2 = null;
    for (var i = 0, l = names.length; i <= l - 1; i++) {
        var name = names[i];

        if (i == l - 1) {
            if (name.indexOf(']') == -1) {
                obj[name] = value;
            } else {
                //array
                var as = name.split("[");
                var n1 = as[0], n2 = parseInt(as[1]);
                createArray(obj, n1, n2, "");
                obj[n1][n2] = value;
            }

            break;
        }

        if (name.indexOf(']') == -1) {
            //obj
            obj2 = obj[name];
            if (i <= l - 2 && obj2 == null) {
                obj[name] = obj2 = {};
            }
            obj = obj2;
        } else {
            //array
            var as = name.split("[");
            var n1 = as[0], n2 = parseInt(as[1]);
            obj = createArray(obj, n1, n2);
            //var n3 = parseInt(as[2]), n4 = parseInt(as[3]), n5 = parseInt(as[4]);
        }

    }
    return value;
}

//mini._setMap = function (name, value, obj) {
//    if (!obj) return;
//    if (typeof name != "string") return;

//    var names = name.split(".");

//    function createArray(obj, name, num) {
//        var arr = obj[name];
//        if (!arr) {
//            arr = obj[name] = [];
//        }
//        for (var i = 0; i <= num; i++) {
//            var arrObj = arr[i];
//            if (!arrObj) arrObj = arr[i] = {};
//        }
//        return obj[name][num];
//    }

//    var obj2 = null;
//    for (var i = 0, l = names.length; i <= l - 1; i++) {
//        var name = names[i];

//        if (i == l - 1) {
//            obj[name] = value;
//            break;
//        }

//        if (name.indexOf(']') == -1) {
//            //obj
//            obj2 = obj[name];
//            if (i <= l - 2 && obj2 == null) {
//                obj[name] = obj2 = {};
//            }
//            obj = obj2;
//        } else {
//            //array
//            var as = name.split("[");
//            var n1 = as[0], n2 = parseInt(as[1]);
//            obj = createArray(obj, n1, n2);

//            //var n3 = parseInt(as[2]), n4 = parseInt(as[3]), n5 = parseInt(as[4]);
//        }

//    }
//    return value;
//}

mini.getAndCreate = function (id) {
    if (!id) return null;
    if (typeof id == "string") return mini.components[id];

    if (typeof id == "object") {
        if (mini.isControl(id)) {
            return id;
        } else if (mini.isElement(id)) {
            return mini.uids[id.uid];
        } else {
            return mini.create(id);
        }
    }
    return null;
};
mini.create = function (uiConfig) {
    if (!uiConfig) return null;
    if (mini.get(uiConfig.id) === uiConfig) return uiConfig;
    var clazz = this.getClass(uiConfig.type);
    if (!clazz) return null;
    var ui = new clazz();
    ui.set(uiConfig);
    return ui;
}

/* Component 
-----------------------------------------------------------------------------*/
mini.Component = function () {
    this._events = {};

    this.uid = mini.newId(this._idPre);
    this._id = this.uid;
    if (!this.id) {
        this.id = this.uid;
    }
    mini.reg(this);

    //this._doInit();
}
mini.Component.prototype = {
    isControl: true,
    id: null,
    _idPre: "mini-",
    _idSet: false,
    _canFire: true,

    //    inited: false,
    //    _doInit: function () {
    //        if (this.inited == false) {
    //            this.inited = true;
    //            this.fire("init");
    //        }
    //    },

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }
        var _allowLayout = this._allowLayout;
        this._allowLayout = false;

        var renderTo = kv.renderTo || kv.render;
        delete kv.renderTo;
        delete kv.render;
        //bind events
        for (var key in kv) {
            if (key.toLowerCase().indexOf('on') == 0) {

                var fn = kv[key];
                this.on(key.substring(2, key.length).toLowerCase(), fn);
                delete kv[key];
            }
        }

        //set property
        for (var key in kv) {
            var v = kv[key];
            var n = 'set' + key.charAt(0).toUpperCase() + key.substring(1, key.length);
            var setter = this[n];
            if (setter) {
                setter.call(this, v);
            } else {
                this[key] = v;
            }
        }

        if (renderTo && this.render) {
            this.render(renderTo);
        }

        this._allowLayout = _allowLayout;
        if (this.doLayout) this.doLayout();

        return this;
    },

    fire: function (type, event) {
        if (this._canFire == false) return;
        type = type.toLowerCase();
        var handlers = this._events[type];
        if (handlers) {
            if (!event) event = {};
            if (event && event != this) {
                event.source = event.sender = this;
                if (!event.type) {
                    event.type = type;
                }
            }
            for (var i = 0, l = handlers.length; i < l; i++) {
                var listener = handlers[i];
                if (listener) {
                    listener[0].apply(listener[1], [event]);
                }
            }
        }
    },
    on: function (type, fn, scope) {

        if (typeof fn == "string") {
        
            var f = mini._getFunctoin(fn);
            if (!f) {
                //eval("fn = function(e){   " + fn + ".call(this,e)}");
                var id = mini.newId("__str_");
                window[id] = fn;

                eval("fn = function(e){var s = " + id + ";var fn = mini._getFunctoin(s); if(fn) {fn.call(this, e)}else{eval(s);}}");
            } else {
                fn = f;
            }
        }

        if (typeof fn != 'function' || !type) return false;
        type = type.toLowerCase();
        var event = this._events[type];
        if (!event) {
            event = this._events[type] = [];
        }
        scope = scope || this;
        if (!this.findListener(type, fn, scope)) {
            event.push([fn, scope]);
        }
        return this;
    },
    un: function (type, fn, scope) {
        if (typeof fn != 'function') return false;
        type = type.toLowerCase();
        var event = this._events[type];
        if (event) {
            scope = scope || this;
            var listener = this.findListener(type, fn, scope);
            if (listener) {
                event.remove(listener);
            }
        }
        return this;
    },
    findListener: function (type, fn, scope) {
        type = type.toLowerCase();
        scope = scope || this;
        var handlers = this._events[type];
        if (handlers) {
            for (var i = 0, l = handlers.length; i < l; i++) {
                var listener = handlers[i];
                if (listener[0] === fn && listener[1] === scope) return listener;
            }
        }
    },
    //    removeAllListener: function () {
    //        
    //    },
    setId: function (id) {
        if (!id) throw new Error("id not null");
        if (this._idSet) throw new Error("id just set only one");
        mini["unreg"](this);
        this.id = id;
        if (this.el) this.el.id = id;
        if (this._textEl) this._textEl.id = id + "$text";
        if (this._valueEl) this._valueEl.id = id + "$value";
        this._idSet = true;
        mini.reg(this);
    },
    getId: function () {
        return this.id;
    },
    destroy: function () {
        mini["unreg"](this);
        this.fire("destroy");
    }
}


/* Control 
-----------------------------------------------------------------------------*/

mini.Control = function () {    
    mini.Control.superclass.constructor.call(this);

    this._create();
    this.el.uid = this.uid;

    this._initEvents();

    //this._doInit(); 

    if (this._clearBorder) {
        this.el.style.borderWidth = "0";
    }
    this.addCls(this.uiCls);
    this.setWidth(this.width);
    this.setHeight(this.height);
    
    this.el.style.display = this.visible ? this._displayStyle : "none";
}
mini.extend(mini.Control, mini.Component, {
    jsName: null,

    width: "",
    height: "",

    visible: true,
    readOnly: false,
    enabled: true,
    //rendered: false,
    tooltip: "",

    _readOnlyCls: "mini-readonly",
    _disabledCls: "mini-disabled",

    _create: function () {
        this.el = document.createElement("div");
    },
    _initEvents: function () {
    },
    within: function (e) {

        if (mini.isAncestor(this.el, e.target)) return true;
        return false;
    },

    name: "",
    setName: function (value) {
        this.name = value;
        //if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
    },
    getName: function () {
        return this.name;
    },

    isAutoHeight: function () {
        var v = this.el.style.height;
        return v == "auto" || v == "";
    },
    isAutoWidth: function () {
        var v = this.el.style.width;
        return v == "auto" || v == "";
    },
    isFixedSize: function () {
        //        var el = this.el;
        //        var width = String(el.style.width);
        //        var height = String(el.style.height);

        var width = this.width;
        var height = this.height;
        if (parseInt(width) + "px" == width && parseInt(height) + "px" == height) return true;
        return false;
    },

    isRender: function (parentNode) {

        return !!(this.el && this.el.parentNode && this.el.parentNode.tagName);
    },
    render: function (parent, position) {
        if (typeof parent === 'string') {
            if (parent == "#body") parent = document.body;
            else parent = mini.byId(parent);
        }
        if (!parent) return;
        if (!position) position = "append";
        position = position.toLowerCase();

        if (position == "before") {
            jQuery(parent).before(this.el);
        } else if (position == "preend") {
            jQuery(parent).preend(this.el);
        } else if (position == "after") {
            jQuery(parent).after(this.el);
        } else {
            parent.appendChild(this.el);
        }

        //this.rendered = true;
        this.el.id = this.id;

        this.doLayout();
        this.fire("render");
    },
    //    isTopControl: function () {
    //        var doc = document;
    //        var p = this.el.parentNode;
    //        while (p != doc && p != null) {
    //            var pcontrol = mini.get(p);
    //            if (pcontrol) {
    //                if (mini.isControl(pcontrol)) return true;                
    //            }
    //            p = p.parentNode;
    //        }
    //        return true;
    //    },

    getEl: function () {
        return this.el;
    },
    setJsName: function (value) {
        this.jsName = value;
        window[value] = this;
    },
    getJsName: function () {
        return this.jsName;
    },
    setTooltip: function (value) {
        this.tooltip = value;
        this.el.title = value;
    },
    getTooltip: function () {
        return this.tooltip;
    },
    _sizeChaned: function () {
        this.doLayout();
    },
    setWidth: function (value) {
        if (parseInt(value) == value) value += "px";
        this.width = value;
        this.el.style.width = value;
        this._sizeChaned();
    },
    getWidth: function (content) {
        var w = content ? jQuery(this.el).width() : jQuery(this.el).outerWidth();
        if (content && this._borderEl) {
            var b2 = mini.getBorders(this._borderEl);
            w = w - b2.left - b2.right;
        }
        return w;
    },
    setHeight: function (value) {
        if (parseInt(value) == value) value += "px";
        this.height = value;
        this.el.style.height = value;
        this._sizeChaned();
    },
    getHeight: function (content) {
        var h = content ? jQuery(this.el).height() : jQuery(this.el).outerHeight();
        if (content && this._borderEl) {
            var b2 = mini.getBorders(this._borderEl);
            h = h - b2.top - b2.bottom;
        }
        return h;
    },
    getBox: function () {
        return mini.getBox(this.el);
    },
    setBorderStyle: function (value) {
        var el = this._borderEl || this.el;
        mini.setStyle(el, value);
        this.doLayout();
    },
    getBorderStyle: function () {
        return this.borderStyle;
    },
    _clearBorder: true,
    setStyle: function (value) {
        this.style = value;
        mini.setStyle(this.el, value);
        if (this._clearBorder) {
            this.el.style.borderWidth = "0";
            this.el.style.padding = "0px";
        }
        //        this.width = mini.getWidth(this.el);
        //        this.height = mini.getHeight(this.el);
        this.width = this.el.style.width;
        this.height = this.el.style.height;
        this._sizeChaned();
    },
    getStyle: function () {
        return this.style;
    },
    setCls: function (cls) {

        this.addCls(cls);
    },
    getCls: function () {
        return this.cls;
    },
    addCls: function (cls) {
        mini.addClass(this.el, cls);
    },
    removeCls: function (cls) {
        mini.removeClass(this.el, cls);
    },
    _doReadOnly: function () {
        if (this.readOnly) {
            this.addCls(this._readOnlyCls);
        } else {
            this.removeCls(this._readOnlyCls);
        }
    },
    setReadOnly: function (value) {
        this.readOnly = value;
        this._doReadOnly();
    },
    getReadOnly: function () {
        return this.readOnly;
    },
    getParent: function (uiCls) {
        var doc = document;
        var p = this.el.parentNode;
        while (p != doc && p != null) {
            var pcontrol = mini.get(p);
            if (pcontrol) {
                if (!mini.isControl(pcontrol)) return null;
                if (!uiCls || pcontrol.uiCls == uiCls) return pcontrol;
            }
            p = p.parentNode;
        }
        return null;
    },
    isReadOnly: function () {
        if (this.readOnly || !this.enabled) return true;
        var p = this.getParent();
        if (p) return p.isReadOnly();
        return false;
    },
    setEnabled: function (value) {
        this.enabled = value;
        if (this.enabled) {
            this.removeCls(this._disabledCls);
        } else {
            this.addCls(this._disabledCls);
        }
        this._doReadOnly();
    },
    getEnabled: function () {
        return this.enabled;
    },
    enable: function () {
        this.setEnabled(true);
    },
    disable: function () {
        this.setEnabled(false);
    },
    _displayStyle: "",
    setVisible: function (value) {
        this.visible = value;
        if (this.el) {
            this.el.style.display = value ? this._displayStyle : "none";
            this.doLayout();
        }
    },
    getVisible: function () {
        return this.visible;
    },
    show: function () {
        this.setVisible(true);
    },
    hide: function () {
        this.setVisible(false);
    },
    isDisplay: function (ignoresFn) {

        if (mini.WindowVisible == false) return false;
        //

        var doc = document.body;
        var p = this.el;
        while (1) {
            if (p == null || !p.style) return false;
            if (p && p.style && p.style.display == "none") {
                //return false;
                if (ignoresFn) {
                    
                    if (ignoresFn(p) !== true) return false;
                }
                else return false;
            }
            if (p == doc) return true;

            p = p.parentNode;

        }
        return true;
    },

    _allowUpdate: true,
    beginUpdate: function () {
        this._allowUpdate = false;
    },
    endUpdate: function () {
        this._allowUpdate = true;
        this.doUpdate();
    },
    doUpdate: function () {

    },
    canLayout: function () {
        //return false;
        if (this._allowLayout == false) return false;
        return this.isDisplay();
    },
    doLayout: function () {

    },
    layoutChanged: function () {
        if (this.canLayout() == false) return;
        this.doLayout();
    },
    _destroyChildren: function (removeEl) {
        if (this.el) {
            var cs = mini.getChildControls(this);
            for (var i = 0, l = cs.length; i < l; i++) {
                var control = cs[i];
                if (control.destroyed !== true) {
                    control.destroy(removeEl);
                }
            }
        }
    },
    destroy: function (removeEl) {

        if (this.destroyed !== true) {
            this._destroyChildren(removeEl);
        }

        if (this.el) {
            //if (this.type == "popup" ) debugger
            //if (this.type == "window") debugger
            //try {
            mini.clearEvent(this.el);
            //            } catch (ex) {
            //                if (this.type == "window") debugger
            //            }
            //mini.removeChilds(this.el);   
            //jQuery(this.el).remove();
            if (removeEl !== false) {
                var p = this.el.parentNode;
                if (p) p.removeChild(this.el);
            }
        }
        this._borderEl = null;
        this.el = null;
        mini["unreg"](this);
        this.destroyed = true;
        this.fire("destroy");
    },

    focus: function () {
        try {
            var me = this;
            //setTimeout(function () {
            me.el.focus();
            //}, 1);
        } catch (e) { };
    },
    blur: function () {
        try {
            var me = this;
            //setTimeout(function () {
            me.el.blur();
            //}, 1);
        } catch (e) { };
    },

    allowAnim: true,
    setAllowAnim: function (value) {
        this.allowAnim = value;
    },
    getAllowAnim: function () {
        return this.allowAnim;
    },
    //////////////////////
    /////////////////////////////////////////////////////////////////////////
    _getMaskWrapEl: function () {
        return this.el;
    },
    mask: function (options) {

        if (typeof options == "string") options = { html: options };
        options = options || {};
        options.el = this._getMaskWrapEl();
        if (!options.cls) options.cls = this._maskCls;

        mini.mask(options);

    },
    unmask: function () {

        mini.unmask(this._getMaskWrapEl());

        this.isLoading = false;
    },
    _maskCls: "mini-mask-loading",
    loadingMsg: "Loading...",
    loading: function (msg) {
        //this.isLoading = true;
        this.mask(msg || this.loadingMsg);
    },
    setLoadingMsg: function (value) {
        this.loadingMsg = value;
    },
    getLoadingMsg: function () {
        return this.loadingMsg;
    },
    //////////////////////
    _getContextMenu: function (value) {
        var ui = value;
        if (typeof value == "string") {
            ui = mini.get(value);
            if (!ui) {
                mini.parse(value);
                ui = mini.get(value);
            }
        } else if (mini.isArray(value)) {
            ui = {
                type: "menu",
                items: value
            };
        } else if (!mini.isControl(value)) {
            ui = mini.create(value);
        }
        return ui;
    },
    __OnHtmlContextMenu: function (e) {
        var ev = {
            popupEl: this.el,
            htmlEvent: e,
            cancel: false
        };
        this.contextMenu.fire("BeforeOpen", ev);
        if (ev.cancel == true) return;
        this.contextMenu.fire("opening", ev);
        if (ev.cancel == true) return;

        this.contextMenu.showAtPos(e.pageX, e.pageY);
        this.contextMenu.fire("Open", ev);
        return false;
    },
    contextMenu: null,
    setContextMenu: function (value) {
        var ui = this._getContextMenu(value);
        if (!ui) return;
        if (this.contextMenu !== ui) {
            this.contextMenu = ui;
            this.contextMenu.owner = this;
            mini.on(this.el, "contextmenu", this.__OnHtmlContextMenu, this);
        }
    },
    getContextMenu: function () {
        return this.contextMenu;
    },
    setDefaultValue: function (value) {
        this.defaultValue = value;
    },
    getDefaultValue: function () {
        return this.defaultValue;
    },
    setValue: function (value) {
        this.value = value;
    },
    getValue: function () {
        return this.value;
    },
    //////////////////////
    ajaxData: null,
    ajaxType: "",
    setAjaxData: function (value) {
        this.ajaxData = value;
    },
    getAjaxData: function () {
        return this.ajaxData;
    },
    setAjaxType: function (value) {
        this.ajaxType = value;
    },
    getAjaxType: function () {
        return this.ajaxType;
    },
    //    setApplyTo: function (el) {
    //        this.applyTo(el);
    //    },

    _afterApply: function (el) {
        //        var cs = mini.getChildNodes(el, true);
        //        for (var i = 0, l = cs.length; i < l; i++) {
        //            var nodeEl = cs[i];
        //            this._contentEl.appendChild(nodeEl);
        //        }
    },
    //_tagName: "",
    dataField: "",
    setDataField: function (value) {
        this.dataField = value;
    },
    getDataField: function () {
        return this.dataField;
    },
    getAttrs: function (el) {
        //        if (el.tagName.toLowerCase() != this._tagName) {
        //            throw new Error(this.type + " must be Tag \"" + this._tagName+"\"");
        //        }

        var attrs = {};

        var cls = el.className;
        if (cls) attrs.cls = cls;

        if (el.value) attrs.value = el.value;
        mini._ParseString(el, attrs,
            ["id", "name", "width", "height", "borderStyle", "value", "defaultValue",
            "contextMenu", "tooltip", "ondestroy", "data-options", "ajaxData", "ajaxType", "dataField"
             ]
        );

        mini._ParseBool(el, attrs,
            ["visible", "enabled", "readOnly"
             ]
        );

        if (el.readOnly && el.readOnly != "false") attrs.readOnly = true;

        var style = el.style.cssText;
        if (style) {
            attrs.style = style;
        }
        //ie9 background bug
        if (isIE9) {
            var bg = el.style.background;
            if (bg) {
                if (!attrs.style) attrs.style = "";
                attrs.style += ";background:" + bg;
            }
        }
        if (this.style) {
            if (attrs.style) attrs.style = this.style + ";" + attrs.style;
            else attrs.style = this.style;
        }
        if (this.borderStyle) {
            if (attrs.borderStyle) attrs.borderStyle = this.borderStyle + ";" + attrs.borderStyle;
            else attrs.borderStyle = this.borderStyle;
        }
        //if (this.type == "menu") debugger
        //if(attrs.id == "folderTree") debugger

        //用户自定义标签参数
        var ts = mini._attrs;
        if (ts) {
            for (var i = 0, l = ts.length; i < l; i++) {
                var t = ts[i];
                var name = t[0];
                var type = t[1];
                if (!type) type = "string";
                if (type == "string") mini._ParseString(el, attrs, [name]);
                else if (type == "bool") mini._ParseBool(el, attrs, [name]);
                else if (type == "int") mini._ParseInt(el, attrs, [name]);
            }
        }

        //data-options
        var options = attrs["data-options"];
        if (options) {
            options = eval("(" + options + ")");
            if (options) {
                //attrs["data-options"] = options;
                mini.copyTo(attrs, options);
            }
        }



        return attrs;
    }
});

mini._attrs = null;
mini.regHtmlAttr = function (attr, type) {
    if (!attr) return;
    if (!type) type = "string";
    if (!mini._attrs) mini._attrs = [];
    mini._attrs.push([attr, type]);
}




/* Container
-----------------------------------------------------------------------------*/

__mini_setControls = function (controls, contentEl, scope) {
    contentEl = contentEl || this._contentEl;
    scope = scope || this;
    if (!controls) controls = [];
    if (!mini.isArray(controls)) controls = [controls];
    //controls = controls.clone();        

    for (var i = 0, l = controls.length; i < l; i++) {
        var c = controls[i];
        if (typeof c == "string") {                     //string
            if (c.indexOf("#") == 0) c = mini.byId(c);
        } else if (mini.isElement(c)) {                 //dom
        } else {                                        //object
            c = mini.getAndCreate(c);
            c = c.el;
        }
        if (!c) continue;
        //mini.innerHTML
        mini.append(contentEl, c);


    }
    
    
    mini.parse(contentEl);
    scope.doLayout();
    return scope;
}

mini.Container = function () {
    mini.Container.superclass.constructor.call(this);
    this._contentEl = this.el;
}
mini.extend(mini.Container, mini.Control, {
    setControls: __mini_setControls,
    getContentEl: function () {
        return this._contentEl;
    },
    getBodyEl: function () {
        return this._contentEl;
    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        var controls = mini.getChildControls(this);

        for (var i = 0, l = controls.length; i < l; i++) {
            var c = controls[i];
            //if (mini.isAncestor(c.el, e.target)) return true;
            if (c.within(e)) return true;
        }

        return false;
    }
});



/* ValidatorBase 
-----------------------------------------------------------------------------*/

mini.ValidatorBase = function () {
    mini.ValidatorBase.superclass.constructor.call(this);    
}
mini.extend(mini.ValidatorBase, mini.Control, {
    required: false,
    requiredErrorText: "This field is required.",
    _requiredCls: "mini-required",

    errorText: "",
    _errorCls: "mini-error",
    _invalidCls: "mini-invalid", //当none时，加上_errorCls，比如红色边框，黄色背景

    errorMode: "icon",      //icon、border、none
    validateOnChanged: true,  //值改变时验证
    validateOnLeave: true,  //离开失去焦点时验证
    _IsValid: true,

    _tryValidate: function () {
        if (this._tryValidateTimer) clearTimeout(this._tryValidateTimer);
        var me = this;
        this._tryValidateTimer = setTimeout(function () {
            me.validate();
        }, 30);
    },
    validate: function () {
        //if (this.isReadOnly() || this.enabled == false) return true;
        if (this.enabled == false) {
            this.setIsValid(true);
            return true;
        }

        var e = {
            value: this.getValue(),
            errorText: "",
            isValid: true
        };

        if (this.required) {
            if (mini.isNull(e.value) || String(e.value).trim() === "") {
                e.isValid = false;
                e.errorText = this.requiredErrorText;
            }
        }

        this.fire("validation", e);

        this.errorText = e.errorText;
        this.setIsValid(e.isValid);
        return this.isValid();
    },
    isValid: function () {
        return this._IsValid;
    },
    setIsValid: function (value) {
        //if (this._IsValid != value) {
        this._IsValid = value;
        this.doUpdateValid();
        //}
    },
    getIsValid: function () {
        return this._IsValid;
    },
    setValidateOnChanged: function (value) {
        this.validateOnChanged = value;
    },
    getValidateOnChanged: function (value) {
        return this.validateOnChanged;
    },
    setValidateOnLeave: function (value) {
        this.validateOnLeave = value;
    },
    getValidateOnLeave: function (value) {
        return this.validateOnLeave;
    },

    setErrorMode: function (value) {
        if (!value) value = "none";
        this.errorMode = value.toLowerCase();
        if (this._IsValid == false) this.doUpdateValid();
    },
    getErrorMode: function () {
        return this.errorMode;
    },
    setErrorText: function (value) {
        this.errorText = value;
        if (this._IsValid == false) this.doUpdateValid();
    },
    getErrorText: function () {
        return this.errorText;
    },
    setRequired: function (value) {
        this.required = value;
        if (this.required) {
            this.addCls(this._requiredCls);
        } else {
            this.removeCls(this._requiredCls);
        }
    },
    getRequired: function () {
        return this.required;
    },
    setRequiredErrorText: function (value) {
        this.requiredErrorText = value;
    },
    getRequiredErrorText: function () {
        return this.requiredErrorText;
    },
    errorIconEl: null,
    getErrorIconEl: function () {
        return this._errorIconEl;
    },
    _RemoveErrorIcon: function () {

    },
    doUpdateValid: function () {
        var me = this;
        this._doUpdateValidTimer = setTimeout(function () {
            me.__doUpdateValid();
        }, 1);
    },
    __doUpdateValid: function () {
        if (!this.el) return;
        this.removeCls(this._errorCls);
        this.removeCls(this._invalidCls);
        this.el.title = "";
        if (this._IsValid == false) {
            switch (this.errorMode) {
                case "icon":
                    this.addCls(this._errorCls);
                    var icon = this.getErrorIconEl();
                    if (icon) icon.title = this.errorText;
                    break;
                case "border":
                    this.addCls(this._invalidCls);
                    this.el.title = this.errorText;
                default:
                    this._RemoveErrorIcon();
                    break;
            }
        } else {
            this._RemoveErrorIcon();
        }
        this.doLayout();
    },
    doValueChanged: function () {
        this._OnValueChanged();
    },
    _OnValueChanged: function () {
        if (this.validateOnChanged) {
            this._tryValidate();
        }
        this.fire("valuechanged", { value: this.getValue() });
    },
    onValueChanged: function (fn, scope) {
        this.on("valuechanged", fn, scope);
    },
    onValidation: function (fn, scope) {
        this.on("validation", fn, scope);
    },
    getAttrs: function (el) {
        var attrs = mini.ValidatorBase.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["onvaluechanged", "onvalidation",
            "requiredErrorText", "errorMode"
             ]
        );

        mini._ParseBool(el, attrs,
            ["validateOnChanged", "validateOnLeave"
             ]
        );

        var required = el.getAttribute("required");
        if (!required) required = el.required;
        if (!required) {
            var o = el.attributes["required"];
            if (o) {//fix ie10
                required = o.value == 'null' ? null : 'true';
            }
        }
        if (required) {
            attrs.required = required != "false" ? true : false;
        }

        return attrs;
    }
});


/* ListControl 
-----------------------------------------------------------------------------*/


mini.ListControl = function () {
    this.data = [];
    this._selecteds = [];
    mini.ListControl.superclass.constructor.call(this);
    this.doUpdate();
}
mini.ListControl.ajaxType = "get";
mini.extend(mini.ListControl, mini.ValidatorBase, {
    defaultValue: '',
    value: '',
    valueField: "id",
    textField: "text",
    dataField: "",
    delimiter: ',',

    data: null,
    url: "",

    _itemCls: "mini-list-item",
    _itemHoverCls: "mini-list-item-hover",
    _itemSelectedCls: "mini-list-item-selected",

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;
        var url = kv.url;
        delete kv.url;
        var data = kv.data;
        delete kv.data;

        mini.ListControl.superclass.set.call(this, kv);

        if (!mini.isNull(data)) {
            this.setData(data);
        }
        if (!mini.isNull(url)) {
            this.setUrl(url);
        }
        if (!mini.isNull(value)) {
            this.setValue(value);
        }

        return this;
    },

    uiCls: "mini-list",
    _create: function () {

    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, 'click', this.__OnClick, this);
            mini_onOne(this.el, 'dblclick', this.__OnDblClick, this);

            mini_onOne(this.el, 'mousedown', this.__OnMouseDown, this);
            mini_onOne(this.el, 'mouseup', this.__OnMouseUp, this);
            mini_onOne(this.el, 'mousemove', this.__OnMouseMove, this);
            mini_onOne(this.el, 'mouseover', this.__OnMouseOver, this);
            mini_onOne(this.el, 'mouseout', this.__OnMouseOut, this);

            mini_onOne(this.el, 'keydown', this.__OnKeyDown, this);
            mini_onOne(this.el, 'keyup', this.__OnKeyUp, this);

            mini_onOne(this.el, 'contextmenu', this.__OnContextMenu, this);

            //            mini.on(this.el, 'click', this.__OnClick, this);
            //            mini.on(this.el, 'dblclick', this.__OnDblClick, this);

            //            mini.on(this.el, 'mousedown', this.__OnMouseDown, this);
            //            mini.on(this.el, 'mouseup', this.__OnMouseUp, this);
            //            mini.on(this.el, 'mousemove', this.__OnMouseMove, this);
            //            mini.on(this.el, 'mouseover', this.__OnMouseOver, this);
            //            mini.on(this.el, 'mouseout', this.__OnMouseOut, this);

            //            mini.on(this.el, 'keydown', this.__OnKeyDown, this);
            //            mini.on(this.el, 'keyup', this.__OnKeyUp, this);

            //            mini.on(this.el, 'contextmenu', this.__OnContextMenu, this);
        }, this);
    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onclick = null;
            this.el.ondblclick = null;
            this.el.onmousedown = null;
            this.el.onmouseup = null;
            this.el.onmousemove = null;
            this.el.onmouseover = null;
            this.el.onmouseout = null;
            this.el.onkeydown = null;
            this.el.onkeyup = null;
            this.el.oncontextmenu = null;
        }
        mini.ListControl.superclass.destroy.call(this, removeEl);
    },

    name: "",
    setName: function (value) {
        this.name = value;
        if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
    },

    getItemByEvent: function (event) {
        var domItem = mini.findParent(event.target, this._itemCls);
        if (domItem) {

            var index = parseInt(mini.getAttr(domItem, "index"));

            return this.data[index];
        }
    },
    addItemCls: function (item, cls) {
        var itemEl = this.getItemEl(item);
        if (itemEl) mini.addClass(itemEl, cls);
    },
    removeItemCls: function (item, cls) {
        var itemEl = this.getItemEl(item);
        if (itemEl) mini.removeClass(itemEl, cls);
    },
    getItemEl: function (item) {
        item = this.getItem(item);
        var index = this.data.indexOf(item);
        var id = this._createItemId(index);
        return document.getElementById(id);
    },
    _focusItem: function (item, view) {

        item = this.getItem(item);
        if (!item) return;
        var dom = this.getItemEl(item);
        if (view && dom) {
            this.scrollIntoView(item);
        }
        if (this._focusedItem == item) {
            if (dom) mini.addClass(dom, this._itemHoverCls);
            return;
        }
        this._blurItem();
        this._focusedItem = item;
        if (dom) mini.addClass(dom, this._itemHoverCls);
    },
    _blurItem: function () {
        if (!this._focusedItem) return;

        var dom = this.getItemEl(this._focusedItem);
        if (dom) {
            mini.removeClass(dom, this._itemHoverCls);
        }
        this._focusedItem = null;
    },
    getFocusedItem: function () {
        return this._focusedItem;
    },
    getFocusedIndex: function () {
        return this.data.indexOf(this._focusedItem);
    },
    _scrollViewEl: null,
    scrollIntoView: function (item) {
        try {
            var itemEl = this.getItemEl(item);
            var _scrollViewEl = this._scrollViewEl || this.el;
            mini.scrollIntoView(itemEl, _scrollViewEl, false);
        } catch (e) { }
    },
    ////////////////////////////////////////////
    getItem: function (item) {
        if (typeof item == "object") return item;
        if (typeof item == "number") return this.data[item];
        return this.findItems(item)[0];
    },
    getCount: function () {
        return this.data.length;
    },
    indexOf: function (item) {
        return this.data.indexOf(item);
    },
    getAt: function (index) {
        return this.data[index];
    },
    updateItem: function (item, options) {
        item = this.getItem(item);
        if (!item) return;
        mini.copyTo(item, options);
        this.doUpdate();
    },
    load: function (data) {
        if (typeof data == "string") this.setUrl(data);
        else this.setData(data);
    },
    loadData: function (data) {
        this.setData(data);
    },
    setData: function (data) {
        if (typeof data == "string") {
            data = eval(data);
        }
        if (!mini.isArray(data)) data = [];
        this.data = data;




        //        this._checkSelecteds();

        this.doUpdate();

        if (this.value != "") {
            this.deselectAll();
            var records = this.findItems(this.value);
            this.selects(records);
        }
    },
    getData: function () {
        return this.data.clone();
    },
    setUrl: function (url) {
        //if (this.url != url) {
        this.url = url;
        this._doLoad({});
        //}
    },
    getUrl: function () {
        return this.url;
    },


    ajaxData: null,
    _doLoad: function (params) {

        try {
            var url = eval(this.url);
            if (url != undefined) {
                this.url = url;
            }
        } catch (e) { }
        var url = this.url;

        var ajaxMethod = mini.ListControl.ajaxType;
        if (url) {
            if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
                ajaxMethod = "get";
            }
        }

        var obj = mini._evalAjaxData(this.ajaxData, this);
        mini.copyTo(params, obj);

        var e = {
            url: this.url,
            async: false,
            type: this.ajaxType ? this.ajaxType : ajaxMethod,
            data: params,
            params: params,
            cache: false,
            cancel: false
        };
        this.fire("beforeload", e);
        if (e.data != e.params && e.params != params) {
            e.data = e.params;
        }
        if (e.cancel == true) return;

        var sf = this;
        var url = e.url;
        mini.copyTo(e, {
            success: function (text) {
                var data = null;
                try {
                    data = mini.decode(text);
                } catch (ex) {
                    data = []
                    if (mini_debugger == true) {
                        alert(url + "\njson is error.");
                    }
                }
                if (sf.dataField) {
                    data = mini._getMap(sf.dataField, data);
                }
                if (!data) data = [];
                var ex = { data: data, cancel: false }
                sf.fire("preload", ex);
                if (ex.cancel == true) return;

                sf.setData(ex.data);

                sf.fire("load");

                setTimeout(function () {
                    sf.doLayout();
                }, 100);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                var e = {
                    xmlHttp: jqXHR,
                    errorMsg: jqXHR.responseText,
                    errorCode: jqXHR.status
                };
                if (mini_debugger == true) {
                    alert(url + "\n" + e.errorCode + "\n" + e.errorMsg);
                }
                sf.fire("loaderror", e);
            }
        });

        this._ajaxer = mini.ajax(e);
    },
    setValue: function (value) {
        if (mini.isNull(value)) value = "";
        if (this.value !== value) {
            //var records = this.findItems(this.value);
            this.deselectAll();

            this.value = value;
            if (this._valueEl) this._valueEl.value = value;

            var records = this.findItems(this.value);
            this.selects(records);
        }
    },
    getValue: function () {
        return this.value;
    },
    getFormValue: function () {
        return this.value;
    },
    setValueField: function (valueField) {
        this.valueField = valueField;
    },
    getValueField: function () {
        return this.valueField;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },

    ////////////////////////////////////////////////////////
    getItemValue: function (item) {
        return String(mini._getMap(this.valueField, item));
    },
    getItemText: function (item) {
        var t = mini._getMap(this.textField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    getValueAndText: function (records) {
        if (mini.isNull(records)) records = [];
        if (!mini.isArray(records)) {
            records = this.findItems(records);
        }
        var values = [];
        var texts = [];
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (record) {
                values.push(this.getItemValue(record));
                texts.push(this.getItemText(record));
            }
        }
        return [values.join(this.delimiter), texts.join(this.delimiter)];
    },
    findItems: function (value) {
        if (mini.isNull(value) || value === "") return [];
        if (typeof value == 'function') {
            var fn = value;
            var items = [];
            var data = this.data;
            for (var j = 0, k = data.length; j < k; j++) {
                var record = data[j];
                if (fn(record, j) === true) {
                    items.push(record);
                }
            }
            return items;
        }

        var values = String(value).split(this.delimiter);

        var data = this.data;
        var valueRecords = {};
        for (var j = 0, k = data.length; j < k; j++) {
            var record = data[j];
            var v = record[this.valueField];
            valueRecords[v] = record;
        }

        var records = [];
        for (var i = 0, l = values.length; i < l; i++) {
            var v = values[i];
            var record = valueRecords[v];
            if (record) {
                records.push(record);
            }
        }
        return records;
    },

    /////////////////////////////////////////////
    removeAll: function () {
        var items = this.getData();
        this.removeItems(items);
    },
    addItems: function (items, index) {
        if (!mini.isArray(items)) return;
        if (mini.isNull(index)) index = this.data.length;
        this.data.insertRange(index, items);
        this.doUpdate();
    },
    addItem: function (item, index) {
        if (!item) return;
        if (this.data.indexOf(item) != -1) return;
        if (mini.isNull(index)) index = this.data.length;
        this.data.insert(index, item);
        this.doUpdate();
    },
    removeItems: function (items) {
        if (!mini.isArray(items)) return;
        this.data.removeRange(items);

        this._checkSelecteds();
        this.doUpdate();
    },
    removeItem: function (item) {
        var index = this.data.indexOf(item);
        if (index != -1) {
            this.data.removeAt(index);
            this._checkSelecteds();
            this.doUpdate();
        }
    },
    moveItem: function (item, index) {
        if (!item || !mini.isNumber(index)) return;
        //        var target = this.data[index];
        //        if (target == item) return;
        if (index < 0) index = 0;
        if (index > this.data.length) index = this.data.length;
        this.data.remove(item);
        //index = this.data.indexOf(target);
        this.data.insert(index, item);
        this.doUpdate();
    },
    ///////////////////////////////////////////// 

    _selected: null,
    _selecteds: [],
    multiSelect: false,
    _checkSelecteds: function () {
        for (var i = this._selecteds.length - 1; i >= 0; i--) {
            var record = this._selecteds[i];
            if (this.data.indexOf(record) == -1) {
                this._selecteds.removeAt(i);
            }
        }
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;
    },
    setMultiSelect: function (value) {
        this.multiSelect = value;
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    isSelected: function (record) {
        if (!record) return false;
        return this._selecteds.indexOf(record) != -1;
    },
    getSelecteds: function () {
        var arr = this._selecteds.clone();
        var me = this;
        mini.sort(arr, function (a, b) {
            var index1 = me.indexOf(a);
            var index2 = me.indexOf(b);
            if (index1 > index2) return 1;
            if (index1 < index2) return -1;
            return 0;
        });
        return arr;
    },
    setSelected: function (record) {
        if (record) {
            this._selected = record;
            this.select(record);
        }
    },
    getSelected: function () {
        return this._selected;
    },
    select: function (record) {
        record = this.getItem(record);
        if (!record) return;
        if (this.isSelected(record)) return;
        this.selects([record]);
    },
    deselect: function (record) {
        record = this.getItem(record);
        if (!record) return;
        if (!this.isSelected(record)) return;
        this.deselects([record]);
    },
    selectAll: function () {
        var data = this.data.clone();
        this.selects(data);
    },
    deselectAll: function () {
        this.deselects(this._selecteds);
    },
    clearSelect: function () {
        this.deselectAll();
    },
    selects: function (records) {
        if (!records || records.length == 0) return;
        records = records.clone();
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (!this.isSelected(record)) {
                this._selecteds.push(record);
            }
        }
        var me = this;
        //setTimeout(function () {
        me._doSelects();
        //}, 1);
    },
    deselects: function (records) {
        if (!records || records.length == 0) return;
        records = records.clone();
        for (var i = records.length - 1; i >= 0; i--) {
            var record = records[i];
            if (this.isSelected(record)) {
                this._selecteds.remove(record);
            }
        }

        var me = this;
        //setTimeout(function () {
        me._doSelects();
        //}, 1);
    },
    _doSelects: function () {
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;

        for (var i = 0, l = this.data.length; i < l; i++) {
            var record = this.data[i];
            var select = this.isSelected(record);
            if (select) {
                this.addItemCls(record, this._itemSelectedCls);
            } else {
                this.removeItemCls(record, this._itemSelectedCls);
            }

            var index = this.data.indexOf(record);
            var id = this._createCheckId(index);
            var checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = !!select;
        }
    },
    _OnSelectionChanged: function (records, select) {
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;

        var e = {
            selecteds: this.getSelecteds(),
            selected: this.getSelected(),
            value: this.getValue()
        };
        this.fire("SelectionChanged", e);
    },
    _createCheckId: function (index) {
        return this.uid + "$ck$" + index;
    },
    _createItemId: function (index) {
        return this.uid + "$" + index;
    },

    /////////////////////////////////////////////
    __OnClick: function (e) {
        this._fireEvent(e, 'Click');
    },
    __OnDblClick: function (e) {
        this._fireEvent(e, 'Dblclick');
    },
    __OnMouseDown: function (e) {
        this._fireEvent(e, 'MouseDown');
    },
    __OnMouseUp: function (e) {
        this._fireEvent(e, 'MouseUp');
    },
    __OnMouseMove: function (e) {
        this._fireEvent(e, 'MouseMove');
    },
    __OnMouseOver: function (e) {
        this._fireEvent(e, 'MouseOver');
    },
    __OnMouseOut: function (e) {
        this._fireEvent(e, 'MouseOut');
    },
    __OnKeyDown: function (e) {
        this._fireEvent(e, 'KeyDown');
    },
    __OnKeyUp: function (e) {
        this._fireEvent(e, 'KeyUp');
    },
    __OnContextMenu: function (e) {
        this._fireEvent(e, 'ContextMenu');
    },
    _fireEvent: function (e, name) {
        if (!this.enabled) return;
        //this.focus();

        var item = this.getItemByEvent(e);
        if (!item) return;
        var fn = this['_OnItem' + name];
        if (fn) {
            fn.call(this, item, e);
        } else {
            var eve = {
                item: item,
                htmlEvent: e
            };
            this.fire("item" + name, eve);
        }
    },
    _OnItemClick: function (item, e) {

        if (this.isReadOnly() || this.enabled == false || item.enabled === false) {
            e.preventDefault();
            return;
        }

        var value = this.getValue();

        if (this.multiSelect) {
            if (this.isSelected(item)) {
                this.deselect(item);
                if (this._selected == item) {
                    this._selected = null;
                }
            } else {
                this.select(item);
                this._selected = item;
            }
            this._OnSelectionChanged();
        } else {
            if (!this.isSelected(item)) {
                this.deselectAll();
                this.select(item);
                this._selected = item;
                this._OnSelectionChanged();
            }
        }

        if (value != this.getValue()) {
            this._OnValueChanged();
        }

        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemclick", e);
    },
    _blurOnOut: true,
    _OnItemMouseOut: function (item, e) {
        mini.repaint(this.el);
        if (!this.enabled) return;
        if (this._blurOnOut) {
            this._blurItem();
        }
        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemmouseout", e);
    },
    _OnItemMouseMove: function (item, e) {
        mini.repaint(this.el);
        if (!this.enabled || item.enabled === false) return;

        this._focusItem(item);
        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemmousemove", e);
    },
    onItemClick: function (fn, scope) {
        this.on("itemclick", fn, scope);
    },
    onItemMouseDown: function (fn, scope) {
        this.on("itemmousedown", fn, scope);
    },
    onBeforeLoad: function (fn, scope) {
        this.on("beforeload", fn, scope);
    },
    onLoad: function (fn, scope) {
        this.on("load", fn, scope);
    },
    onLoadError: function (fn, scope) {
        this.on("loaderror", fn, scope);
    },
    onPreLoad: function (fn, scope) {
        this.on("preload", fn, scope);
    },
    ////////////////////////////////////
    getAttrs: function (el) {
        var attrs = mini.ListControl.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["url", "data", "value", "textField", "valueField",
            "onitemclick", "onitemmousemove", "onselectionchanged", "onitemdblclick",
            "onbeforeload", "onload", "onloaderror", "ondataload"
             ]
        );
        mini._ParseBool(el, attrs,
            ["multiSelect"
             ]
        );

        var valueField = attrs.valueField || this.valueField;
        var textField = attrs.textField || this.textField;
        if (el.nodeName.toLowerCase() == "select") {
            var data = [];
            for (var i = 0, l = el.length; i < l; i++) {
                var op = el.options[i];
                var o = {};
                o[textField] = op.text;
                o[valueField] = op.value;

                data.push(o);
            }
            if (data.length > 0) {
                attrs.data = data;
            }
        }

        return attrs;
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
mini._Layouts = {};
mini.layout = function (el, mustLayout) {
    if (!document.body) return;
    function doLayout(el) {
        if (!el) return;
        var control = mini.get(el);
        if (control) {
            //判断control的width和height，是否是绝对值。如果都是绝对值，则不doLayout
            if (control.doLayout) {
                if (!mini._Layouts[control.uid]) {
                    mini._Layouts[control.uid] = control;

                    //                    var el = control.getEl();
                    //                    var width = String(el.style.width);
                    //                    var height = String(el.style.height);
                    //                    if (!mini.isNumber(width) || !mini.isNumber(height)) {
                    //                        control.doLayout(false);
                    //                    }                    
                    if (mustLayout !== false || control.isFixedSize() == false) {
                        control.doLayout(false);
                    }

                    delete mini._Layouts[control.uid];
                }
            }
        } else {
            var cs = el.childNodes;
            if (cs) {
                for (var i = 0, l = cs.length; i < l; i++) {
                    var cel = cs[i];
                    doLayout(cel);
                }
            }
        }
    }

    if (!el) el = document.body;
    doLayout(el);

    if (el == document.body) {
        mini.layoutIFrames();
    }
}

////////////////////////////////////////////////////////////////////////
mini.applyTo = function (el) {
    el = mini.byId(el);
    if (!el) return this;
    if (mini.get(el)) throw new Error("not applyTo a mini control");
    //mini.setAttr(el, "parse", 1);

    var config = this.getAttrs(el);
    delete config._applyTo;

    if (mini.isNull(config.defaultValue) && !mini.isNull(config.value)) {
        config.defaultValue = config.value;
    }

    if (mini.isNull(config.defaultText) && !mini.isNull(config.text)) {
        config.defaultText = config.text;
    }
    
    var p = el.parentNode;
    if (p && this.el != el) {    //
        //            var script1 = document.getElementById("script1");
        //            alert(script1);
        //            document.body.appendChild(script1);

        p.replaceChild(this.el, el);

        //                        p.insertBefore(this.el, el);
        //                        p.removeChild(el);

    }

    this.set(config);


    //this.doLayout();

    this._afterApply(el);

    return this;
}
mini._doParse = function (el) {
    if (!el) return;
    var nodeName = el.nodeName.toLowerCase();
    if (!nodeName) return;
    //if(el.id == "twin_constrainttype") debugger
    var className = el.className;
    if (className) {
        var control = mini.get(el);        
        if (!control) {
            var classes = className.split(" ");
            for (var i = 0, l = classes.length; i < l; i++) {
                var cls = classes[i];
                var clazz = mini.getClassByUICls(cls);
                if (clazz) {
                    mini.removeClass(el, cls);
                    var ui = new clazz();
                    
                    mini.applyTo.call(ui, el);
                    el = ui.el;
                    break;
                }
            }
        }
    }

    if (nodeName == "select"
            || mini.hasClass(el, "mini-menu")
            || mini.hasClass(el, "mini-datagrid")
            || mini.hasClass(el, "mini-treegrid")
            || mini.hasClass(el, "mini-tree")
            || mini.hasClass(el, "mini-button")
            || mini.hasClass(el, "mini-textbox")
            || mini.hasClass(el, "mini-buttonedit")
        ) {
        return;
    }

    var children = mini.getChildNodes(el, true);
    for (var i = 0, l = children.length; i < l; i++) {
        var node = children[i];
        if (node.nodeType == 1) {
            if (node.parentNode == el) {
                mini._doParse(node);
            }
        }
    }
}
mini._Removes = [];
mini.parse = function (el) {        
    //document.body.style.display = "block";
    if (typeof el == "string") {
        var id = el;
        el = mini.byId(id);
        if (!el) el = document.body;
        //        if (!el) {
        //            var context = mini._getParseContext();
        //            if (context && context != document.body) {
        //                el = jQuery("#" + id, context)[0];
        //            }
        //            if (!el) return;
        //        }
    }
    if (el && !mini.isElement(el)) el = el.el;
    if (!el) el = document.body;
    //if (!context) context = el;

    var visible = mini.WindowVisible;
    if (isIE) {
        mini.WindowVisible = false;
    }

    //var sss = new Date();
    mini._doParse(el);
    //  alert(new Date() - sss);
    mini.WindowVisible = visible;

    //    for (var i = mini._Removes.length - 1; i >= 0; i--) {
    //        var el = mini._Removes[i];
    //        var p = el.parentNode;
    //        if (p) p.removeChild(el);
    //        mini._Removes.removeAt(i);
    //    }

    mini.layout(el);
}
mini._ParseString = function (el, config, attrs) {
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];
        //if(property == "onclick") debugger
        var value = mini.getAttr(el, property);
        if (value) {
            config[property] = value;
        }
    }
}
mini._ParseBool = function (el, config, attrs) {
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];
        var value = mini.getAttr(el, property);
        if (value) {
            config[property] = value == "true" ? true : false;
        }
    }
}
mini._ParseInt = function (el, config, attrs) {    
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];
        var value = parseInt(mini.getAttr(el, property));
        if (!isNaN(value)) {
            config[property] = value;
        }
    }
}

//暂时不特殊处理IE：在IE7下，width/height/style等属性需要特殊处理。这个也节省不了多少时间。
//轻易不要修改，关联影响的东西挺多的
//if (jQuery.browser.msie) {
//    //getAttribute 方法确实提高了一些. IE专用
//    mini._ParseString = function (el, config, attrs) {
//        for (var i = 0, l = attrs.length; i < l; i++) {
//            var property = attrs[i];
//            var value = null;
//            var a = el.attributes[property];
//            if (a) value = a.value;     
//            //if(       
//            if (value) {
//                config[property] = value;
//            }
//        }
//    }
//    mini._ParseBool = function (el, config, attrs) {
//        for (var i = 0, l = attrs.length; i < l; i++) {
//            var property = attrs[i];
//            var value = null;
//            var a = el.attributes[property];
//            if (a) value = a.value;
//            if (value) {
//                config[property] = value == "true" ? true : false;
//            }
//        }
//    }
//    mini._ParseInt = function (el, config, attrs) {
//        for (var i = 0, l = attrs.length; i < l; i++) {
//            var property = attrs[i];
//            var value = null;
//            var a = el.attributes[property];
//            if (a) value = a.value;
//            value = parseInt(value);
//            if (!isNaN(value)) {
//                config[property] = value;
//            }
//        }
//    }
//}
mini._ParseColumns = function (el) {
    var columns = [];
    var cs = mini.getChildNodes(el);
    for (var i = 0, l = cs.length; i < l; i++) {
        var node = cs[i];
        var jq = jQuery(node);

        var column = {};

        var editor = null, filter = null;

        //sub columns
        var subCs = mini.getChildNodes(node);
        if (subCs) {
            for (var ii = 0, li = subCs.length; ii < li; ii++) {
                var subNode = subCs[ii];
                var property = jQuery(subNode).attr("property");
                if (!property) continue;
                property = property.toLowerCase();
                if (property == "columns") {
                    column.columns = mini._ParseColumns(subNode);
                    jQuery(subNode).remove();
                }
                if (property == "editor" || property == "filter") {

                    var className = subNode.className;
                    var classes = className.split(" ");
                    for (var i3 = 0, l3 = classes.length; i3 < l3; i3++) {
                        var cls = classes[i3];
                        var clazz = mini.getClassByUICls(cls);
                        if (clazz) {
                            var ui = new clazz();

                            if (property == "filter") {
                                filter = ui.getAttrs(subNode);
                                filter.type = ui.type;
                            } else {
                                editor = ui.getAttrs(subNode);
                                editor.type = ui.type;
                            }
                            break;
                        }
                    }

                    jQuery(subNode).remove();
                }
            }
        }

        column.header = node.innerHTML;
        mini._ParseString(node, column,
            ["name", "header", "field", "editor", "filter", "renderer", "width", "type", "renderer",
                "headerAlign", "align", "headerCls", "cellCls", "headerStyle", "cellStyle"
                , "displayField"
                , "dateFormat", "listFormat", "mapFormat",
                'trueValue', "falseValue", "dataType", 'vtype', "currencyUnit",
                "summaryType", "summaryRenderer", "groupSummaryType", "groupSummaryRenderer",
                "defaultValue", "defaultText", "decimalPlaces", "data-options"
             ]
        );
        mini._ParseBool(node, column,
            ["visible", "readOnly", "allowSort", "allowResize", "allowMove", "allowDrag", "autoShowPopup",
            "unique", "autoEscape", "enabled"
             ]
        );
        //if(column.field == "loginname") debugger
        if (editor) column.editor = editor;
        if (filter) column.filter = filter;

        if (column.dataType) column.dataType = column.dataType.toLowerCase();

        if (column.defaultValue === "true") column.defaultValue = true;
        if (column.defaultValue === "false") column.defaultValue = false;

        columns.push(column);

        //data-options
        var options = column["data-options"];
        if (options) {
            options = eval("(" + options + ")");
            if (options) {
                //attrs["data-options"] = options;
                mini.copyTo(column, options);
            }
        }
    }
    return columns;
}


/* Grid Columns
-----------------------------------------------------------------------------*/

mini._Columns = {};
mini._getColumn = function (columnType) {
    var columnFn = mini._Columns[columnType.toLowerCase()];
    if (!columnFn) return {};
    return columnFn();
}

//IndexColumn
mini.IndexColumn = function (config) {
    return mini.copyTo({ width: 30, cellCls: "", align: "center", draggable: false, allowDrag: true,
        init: function (grid) {
            grid.on("addrow", this.__OnIndexChanged, this);
            grid.on("removerow", this.__OnIndexChanged, this);
            grid.on("moverow", this.__OnIndexChanged, this);
            

            //treegrid
            if (grid.isTree) {

                grid.on("addnode", this.__OnIndexChanged, this);
                grid.on("removenode", this.__OnIndexChanged, this);
                grid.on("movenode", this.__OnIndexChanged, this);


                grid.on("loadnode", this.__OnIndexChanged, this);
                this._gridUID = grid.uid;
                this._rowIdField = "_id";
            }
        },
        getNumberId: function (record) {
            return this._gridUID + "$number$" + record[this._rowIdField];
        },
        createNumber: function (grid, rowIndex) {
            if (mini.isNull(grid.pageIndex)) {
                return rowIndex + 1;
            }
            else return (grid.pageIndex * grid.pageSize) + rowIndex + 1;
        },
        renderer: function (e) {
            var grid = e.sender;
            if (this.draggable) {
                if (!e.cellStyle) e.cellStyle = "";
                e.cellStyle += ";cursor:move;";
            }
            var s = '<div id="' + this.getNumberId(e.record) + '">';
            if (mini.isNull(grid.getPageIndex)) s += e.rowIndex + 1;
            else s += (grid.getPageIndex() * grid.getPageSize()) + e.rowIndex + 1;
            s += '</div>';
            return s;
        },
        __OnIndexChanged: function (e) {
            var grid = e.sender;
            
            var records = grid.toArray();
            
            for (var i = 0, l = records.length; i < l; i++) {
                var record = records[i];
                var id = this.getNumberId(record);
                var ck = document.getElementById(id);
                if (ck) ck.innerHTML = this.createNumber(grid, i);
            }

        }
    }, config);
}
mini._Columns["indexcolumn"] = mini.IndexColumn;

//CheckColumn
mini.CheckColumn = function (config) {
    return mini.copyTo(
        { width: 30, cellCls: "mini-checkcolumn", headerCls: "mini-checkcolumn",
            _multiRowSelect: true,   //
            header: function (column) {

                //if(this.multiSelect == false) debugger
                var id = this.uid + "checkall";
                var s = '<input type="checkbox" id="' + id + '" />';
                if (this.multiSelect == false) s = "";
                return s;
            },
            getCheckId: function (record, column) {
                return this._gridUID + "$checkcolumn$" + record[this._rowIdField] + "$" + column._id;
            },
            init: function (grid) {
                grid.on("selectionchanged", this.__OnSelectionChanged, this);
                grid.on("HeaderCellClick", this.__OnHeaderCellClick, this);
            },
            renderer: function (e) {
                var id = this.getCheckId(e.record, e.column);
                var selected = e.sender.isSelected ? e.sender.isSelected(e.record) : false;

                var type = "checkbox";

                var grid = e.sender;
                if (grid.getMultiSelect() == false) type = "radio";

                return '<input type="' + type + '" id="' + id + '" ' + (selected ? "checked" : "") + ' hidefocus style="outline:none;" onclick="return false"/>';
            },
            __OnHeaderCellClick: function (e) {
                var grid = e.sender;
                if (e.column != this) return;
                var id = grid.uid + "checkall";
                var ck = document.getElementById(id);
                if (ck) {

                    if (grid.getMultiSelect()) {
                        if (ck.checked) {
                            grid.selectAll();
                        } else {
                            grid.deselectAll();
                        }
                    } else {
                        grid.deselectAll();
                        if (ck.checked) {
                            grid.select(0);
                        }
                    }
                    grid.fire("checkall");
                }
            },
            __OnSelectionChanged: function (e) {
                var grid = e.sender;
                var records = grid.toArray();
                var me = this;

                for (var i = 0, l = records.length; i < l; i++) {
                    var record = records[i];
                    var select = grid.isSelected(record);
                    var id = me.getCheckId(record, me); //grid.uid + "$checkcolumn$" + record[grid._rowIdField];
                    var ck = document.getElementById(id);

                    if (ck) ck.checked = select;
                }
                
                if (!this._timer) {
                    this._timer = setTimeout(function () {
                        me._doCheckState(grid);
                        me._timer = null;
                    }, 10);
                }
            },
            _doCheckState: function (grid) {

                //处理顶部的checkbox
                var id = grid.uid + "checkall";
                var ck = document.getElementById(id);
                if (ck && grid._getSelectAllCheckState) {

                    var state = grid._getSelectAllCheckState();
                    if (state == "has") {
                        ck.indeterminate = true;
                        ck.checked = true;
                    } else {
                        ck.indeterminate = false;
                        ck.checked = state;
                    }
                }
            }
        }, config);
};
mini._Columns["checkcolumn"] = mini.CheckColumn;

//ExpandColumn
mini.ExpandColumn = function (config) {
    return mini.copyTo({ width: 30, headerAlign: "center", align: "center", draggable: false, cellStyle: "padding:0", cellCls: "mini-grid-expandCell",
        renderer: function (e) {
            return '<a class="mini-grid-ecIcon" href="javascript:#" onclick="return false"></a>';
        },
        init: function (grid) {
            grid.on("cellclick", this.__OnCellClick, this);
        },
        __OnCellClick: function (e) {
            var grid = e.sender;
            if (e.column == this && grid.isShowRowDetail) {
                if (mini.findParent(e.htmlEvent.target, "mini-grid-ecIcon")) {
                    var isShow = grid.isShowRowDetail(e.record);

                    if (!isShow) {
                        e.cancel = false;
                        grid.fire("beforeshowrowdetail", e);
                        if (e.cancel === true) return;
                    } else {
                        e.cancel = false;
                        grid.fire("beforehiderowdetail", e);
                        if (e.cancel === true) return;
                    }

                    if (grid.autoHideRowDetail) {
                        grid.hideAllRowDetail();
                    }
                    if (isShow) {
                        grid.hideRowDetail(e.record);
                    } else {
                        grid.showRowDetail(e.record);
                    }
                }
            }
        }
    }, config);
}
mini._Columns["expandcolumn"] = mini.ExpandColumn;

//checkboxcolumn
mini.CheckBoxColumn = function (config) {
    return mini.copyTo({
        _type: "checkboxcolumn",
        header: "", headerAlign: "center", cellCls: "mini-checkcolumn", trueValue: true, falseValue: false,
        readOnly: false,
        getCheckId: function (record, column) {
            return this._gridUID + "$checkbox$" + record[this._rowIdField] + "$" + column._id;
        },
        getCheckBoxEl: function (record, column) {
            return document.getElementById(this.getCheckId(record, column));
        },
        renderer: function (e) {
            var id = this.getCheckId(e.record, e.column);
            //var v = e.record[e.field];
            var v = mini._getMap(e.field, e.record);
            var checked = v == this.trueValue ? true : false;
            var type = "checkbox";

            //if (this.grid.multiSelect == false) type = "radio";
            return '<input type="' + type + '" id="' + id + '" ' + (checked ? "checked" : "") + ' hidefocus style="outline:none;" onclick="return false;"/>';
        },
        //        __getValue: function (v) {
        //            var value = v == this.trueValue ? this.falseValue : this.trueValue;
        //            return value;
        //        },
        init: function (grid) {
            this.grid = grid;
            function oneditchange(e) {
                if (grid.isReadOnly() || this.readOnly) return;
                e.value = mini._getMap(e.field, e.record); //e.record[e.field];
                grid.fire("cellbeginedit", e);

                if (e.cancel !== true) {

                    //                    var v = mini._getMap(e.column.field, e.record);
                    //                    var value = v == this.trueValue ? this.falseValue : this.trueValue;
                    //alert(value);
                    var v = mini._getMap(e.column.field, e.record);
                    var value = v == this.trueValue ? this.falseValue : this.trueValue;
                    if (grid._OnCellCommitEdit) {
                        grid._OnCellCommitEdit(e.record, e.column, value);

                        //                                var checked = value == this.trueValue;
                        //                                setTimeout(function () {
                        //                                    ck.checked = checked;
                        //                                    alert(checked);
                        //                                }, 1);
                    }
                }
            }
            function onEdit(e) {

                if (e.column == this) {
                    var id = this.getCheckId(e.record, e.column);
                    var ck = e.htmlEvent.target;
                    if (ck.id == id) {
                        if (grid.allowCellEdit) {
                            e.cancel = false;
                            oneditchange.call(this, e);
                        } else {
                            if (grid.isEditingRow && grid.isEditingRow(e.record)) {
                                setTimeout(function () {
                                    ck.checked = !ck.checked;
                                }, 1);
                            }
                        }
                    }
                }
            }
            grid.on("cellclick", onEdit, this);
            mini.on(this.grid.el, "keydown", function (e) {

                if (e.keyCode == 32 && grid.allowCellEdit) {
                    var currentCell = grid.getCurrentCell();
                    if (!currentCell) return;
                    if (currentCell[1] != this) return;

                    var ex = { record: currentCell[0], column: currentCell[1] };
                    ex.field = ex.column.field;
                    oneditchange.call(this, ex);
                    e.preventDefault();
                }
            }, this);


            var tv = parseInt(this.trueValue), fv = parseInt(this.falseValue);
            if (!isNaN(tv)) this.trueValue = tv;
            if (!isNaN(fv)) this.falseValue = fv;
        }
    }, config);
};
mini._Columns["checkboxcolumn"] = mini.CheckBoxColumn;


//radiobuttoncolumn
mini.RadioButtonColumn = function (config) {
    return mini.copyTo({
        _type: "radiobuttoncolumn",
        header: "", headerAlign: "center", cellCls: "mini-checkcolumn", trueValue: true, falseValue: false,
        readOnly: false,
        getCheckId: function (record, column) {
            return this._gridUID + "$radio$" + record[this._rowIdField] + "$" + column._id;
        },
        getCheckBoxEl: function (record, column) {
            return document.getElementById(this.getCheckId(record, column));
        },
        renderer: function (e) {
            var grid = e.sender;
            var id = this.getCheckId(e.record, e.column);
            var v = mini._getMap(e.field, e.record);
            var checked = v == this.trueValue ? true : false;
            var type = "radio";
            var name = grid._id + e.column.field;

            var disabled = '';
            //            if (!grid.allowCellEdit) {
            //                disabled = ' disabled ';
            //            }
            var s = '<div style="position:relative;">';
            s += '<input name="' + name + '" type="' + type + '" id="' + id + '" ' + (checked ? "checked" : "") + ' hidefocus style="outline:none;" onclick="return false;" style="position:relative;z-index:1;"/>';
            if (!grid.allowCellEdit) {
                if (!grid.isEditingRow(e.record)) {
                    s += '<div class="mini-grid-radio-mask"></div>';
                }
            }
            s += '</div>';
            return s;
        },
        //        __getValue: function (v) {
        //            var value = v == this.trueValue ? this.falseValue : this.trueValue;
        //            return value;
        //        },
        init: function (grid) {
            this.grid = grid;

            function oneditchange(e) {
                if (grid.isReadOnly() || this.readOnly) return;
                e.value = mini._getMap(e.field, e.record); //e.record[e.field];
                grid.fire("cellbeginedit", e);

                if (e.cancel !== true) {
                    var v = mini._getMap(e.column.field, e.record);
                    if (v == this.trueValue) return;
                    var value = v == this.trueValue ? this.falseValue : this.trueValue;

                    //将其他行设置false
                    var data = grid.getData();

                    for (var i = 0, l = data.length; i < l; i++) {
                        var row = data[i];
                        if (row == e.record) continue;
                        var v = mini._getMap(e.column.field, row);
                        if (v != this.falseValue) {

                            //var o = {};
                            //mini._setMap(e.column.field, this.falseValue, o);

                            grid.updateRow(row, e.column.field, this.falseValue);
                        }
                    }

                    if (grid._OnCellCommitEdit) {
                        grid._OnCellCommitEdit(e.record, e.column, value);
                    }
                }
            }
            function onEdit(e) {
                if (e.column == this) {
                    
                    var id = this.getCheckId(e.record, e.column);
                    var ck = e.htmlEvent.target;
                    if (ck.id == id) {
                        if (grid.allowCellEdit) {
                            e.cancel = false;
                            oneditchange.call(this, e);
                        } else {
                            if (grid.isEditingRow && grid.isEditingRow(e.record)) {
                                var that = this;
                                setTimeout(function () {
                                    ck.checked = true;

                                    //将其他行设置false
                                    var data = grid.getData();
                                    for (var i = 0, l = data.length; i < l; i++) {
                                        var row = data[i];
                                        if (row == e.record) continue;
                                        var field = e.column.field;
                                        var v = mini._getMap(field, row);
                                        if (v != that.falseValue) {
                                            if (row != e.record) {
                                                if (grid._dataSource) {
                                                    mini._setMap(e.column.field, that.falseValue, row);
                                                    grid._dataSource._setModified(row, field, v);
                                                } else {
                                                    var o = {};
                                                    mini._setMap(field, that.falseValue, o);
                                                    grid._doUpdateRow(row, o);
                                                }
                                            }
                                        }
                                    }


                                }, 1);
                            }
                        }
                    }
                }
            }
            grid.on("cellclick", onEdit, this);

            mini.on(this.grid.el, "keydown", function (e) {
                if (e.keyCode == 32 && grid.allowCellEdit) {
                    var currentCell = grid.getCurrentCell();
                    if (!currentCell) return;
                    if (currentCell[1] != this) return;
                    var ex = { record: currentCell[0], column: currentCell[1] };
                    ex.field = ex.column.field;
                    oneditchange.call(this, ex);
                    e.preventDefault();
                }
            }, this);


            var tv = parseInt(this.trueValue), fv = parseInt(this.falseValue);
            if (!isNaN(tv)) this.trueValue = tv;
            if (!isNaN(fv)) this.falseValue = fv;
        }
    }, config);
};
mini._Columns["radiobuttoncolumn"] = mini.RadioButtonColumn;


//ComboBoxColumn
mini.ComboBoxColumn = function (config) {
    return mini.copyTo(
        {
            renderer: function (e) {
                var value = !mini.isNull(e.value) ? String(e.value) : "";
                var values = value.split(",");

                var valueField = "id", textField = "text";
                var valueMaps = {};

                var editor = e.column.editor;
                if (editor && editor.type == "combobox") {
                    var combo = this.__editor;
                    if (!combo) {

                        if (mini.isControl(editor)) {
                            combo = editor;
                        } else {
                            editor = mini.clone(editor);                            
                            combo = mini.create(editor); //必须同步加载combobox
                        }
                        this.__editor = combo;
                    }

                    valueField = combo.getValueField();
                    textField = combo.getTextField();

                    valueMaps = this._valueMaps;
                    if (!valueMaps) {
                        valueMaps = {};
                        var data = combo.getData();
                        for (var i = 0, l = data.length; i < l; i++) {
                            var o = data[i];
                            valueMaps[o[valueField]] = o;
                        }
                        this._valueMaps = valueMaps;
                    }
                }

                var texts = [];
                for (var i = 0, l = values.length; i < l; i++) {
                    var id = values[i];
                    var o = valueMaps[id];
                    if (o) {
                        var text = o[textField];
                        if (text === null || text === undefined) {
                            text = "";
                        }
                        texts.push(text);
                    }
                }
                return texts.join(',');
            }
        }, config);
};
mini._Columns["comboboxcolumn"] = mini.ComboBoxColumn;


/* Resizer
-----------------------------------------------------------------------------*/
mini._Resizer = function (grid) {
    this.owner = grid;
    mini.on(this.owner.el, "mousedown", this.__OnMouseDown, this);
}
mini._Resizer.prototype = {
    __OnMouseDown: function (e) {
        
        var has = mini.hasClass(e.target, "mini-resizer-trigger");        
        if (has && this.owner.allowResize) {        
            var drag = this._getResizeDrag();
            drag.start(e);
        }
    },
    _getResizeDrag: function () {
        if (!this._resizeDragger) {
            this._resizeDragger = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this._resizeDragger;
    },
    _OnDragStart: function (drag) {

        this.mask = mini.append(document.body, '<div class="mini-resizer-mask mini-fixed"></div>');

        this.proxy = mini.append(document.body, '<div class="mini-resizer-proxy"></div>');
        this.proxy.style.cursor = "se-resize";

        this.elBox = mini.getBox(this.owner.el);
        mini.setBox(this.proxy, this.elBox);
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var xOffset = drag.now[0] - drag.init[0];
        var yOffset = drag.now[1] - drag.init[1];

        var w = this.elBox.width + xOffset;
        var h = this.elBox.height + yOffset;
        if (w < grid.minWidth) w = grid.minWidth;
        if (h < grid.minHeight) h = grid.minHeight;
        if (w > grid.maxWidth) w = grid.maxWidth;
        if (h > grid.maxHeight) h = grid.maxHeight;

        mini.setSize(this.proxy, w, h);
    },
    _OnDragStop: function (drag, success) {
        if (!this.proxy) return;
        var box = mini.getBox(this.proxy);

        jQuery(this.mask).remove();
        jQuery(this.proxy).remove();
        this.proxy = null;
        this.elBox = null;

        if (success) {
            this.owner.setWidth(box.width);
            this.owner.setHeight(box.height);
            this.owner.fire("resize");
        }
    }
};


/////////////////////////////////////////
//function __UnLoadIFrame() {
//    
//}
mini._topWindow = null;
mini._getTopWindow = function (hasMini) {
    if (mini._topWindow) return mini._topWindow;
    var ps = [];
    function getParents(me) {
        try {
            me["___try"] = 1;
            ps.push(me);
        } catch (ex) {
        }
        if (me.parent && me.parent != me) {
            getParents(me.parent);
        }
    }
    getParents(window);
    mini._topWindow = ps[ps.length - 1];
    return mini._topWindow;
}

var __ps = mini.getParams();

if (__ps._winid) {
    try {
        window.Owner = mini._getTopWindow()[__ps._winid];
    } catch (ex) {
    }
}

//if (window.Owner) {
//    setTimeout(function () {
//        alert(window.Owner.location);
//    }, 100);
//}

mini._WindowID = "w" + Math.floor(Math.random() * 10000);
mini._getTopWindow()[mini._WindowID] = window;

mini.__IFrameCreateCount = 1;
mini.createIFrame = function (url, onIFrameLoad) {

    var fnName = "__iframe_onload" + mini.__IFrameCreateCount++;
    window[fnName] = __OnLoad;

    if (!url) url = "";
    var urls = url.split("#");
    url = urls[0];

    var t = '_t=' + Math.floor(Math.random() * 1000000); // "&_winid=" + mini._WindowID;
    if (url.indexOf("?") == -1) {
        url += "?" + t;
    } else {
        url += "&" + t;
    }
    if (urls[1]) {
        url = url + "#" + urls[1];
    }


    var s = '<iframe style="width:100%;height:100%;" onload="' + fnName + '()"  frameborder="0"></iframe>';

    var div = document.createElement("div");
    var iframe = mini.append(div, s);
    //iframe.src = "";
    var canFireLoad = false;
    setTimeout(function () {
        if (iframe) {
            iframe.src = url;
            canFireLoad = true;
        }
    }, 5);

    //load
    var firstLoad = true;
    function __OnLoad() {

        if (canFireLoad == false) return;

        setTimeout(function () {
            if (onIFrameLoad) onIFrameLoad(iframe, firstLoad);
            firstLoad = false;
            //onload = null;
            //iframe.onload = null;
            //
        }, 1);
    }

    //destroy
    iframe._ondestroy = function () {

        window[fnName] = mini.emptyFn;

        iframe.src = "";
        try {
            iframe.contentWindow.document.write("");
            iframe.contentWindow.document.close();
        } catch (ex) { }
        iframe._ondestroy = null;
        iframe = null;

    }


    //    iframe.onunload = function () {

    //        if (ondestroy) ondestroy(iframe);
    //        iframe.src = "";
    //        iframe = null;
    //        iframe.onunload = null;
    //    }
    //    iframe._ondestroy = function () {
    //        var ret = true;
    //        if (ondestroy) ret = ondestroy(iframe);

    //        if (ret !== false) {
    //            window[fnName] = mini.emptyFn;

    //            iframe.src = "";
    //            iframe._ondestroy = null;
    //            iframe = null;
    //        }
    //        return ret;
    //    }

    return iframe;
}

mini._doOpen = function (options) {
    if (typeof options == "string") {
        options = { url: options };
    }

    options = mini.copyTo({
        width: 700,
        height: 400,
        allowResize: true,
        allowModal: true,
        closeAction: "destroy",

        title: "",
        titleIcon: "",
        iconCls: "",
        iconStyle: "",
        bodyStyle: "padding: 0",

        url: "",

        showCloseButton: true,
        showFooter: false
    }, options);

    options.closeAction = "destroy";

    var onload = options.onload;
    delete options.onload;
    var ondestroy = options.ondestroy;
    delete options.ondestroy;
    var url = options.url;
    delete options.url;

    var box = mini.getViewportBox();
    if (options.width && String(options.width).indexOf('%') != -1) {
        var w = parseInt(options.width);
        options.width = parseInt(box.width * (w / 100));
    }
    if (options.height && String(options.height).indexOf('%') != -1) {
        var h = parseInt(options.height);
        options.height = parseInt(box.height * (h / 100));
    }

    var win = new mini.Window();
    win.set(options);
    win.load(url,
        onload,
        ondestroy
    );
    win.show();

    return win;
}



mini.open = function (options) {
    if (!options) return;

    var url = options.url;
    if (!url) url = "";
    var urls = url.split("#");
    var url = urls[0];

    var t = "_winid=" + mini._WindowID;
    if (url.indexOf("?") == -1) {
        url += "?" + t;
    } else {
        url += "&" + t;
    }
    if (urls[1]) {
        url = url + "#"+ urls[1];
    }

    options.url = url;

    options.Owner = window;
    var ps = [];
    function getParents(me) {
        if (me.mini) ps.push(me);
        if (me.parent && me.parent != me) {
            getParents(me.parent);
        }
    }
    getParents(window);

    var win = ps[ps.length - 1];
    return win["mini"]._doOpen(options);
}
mini.openTop = mini.open;

//////////////////////////////
mini.getData = function (url, params, success, error, type) {
    var text = mini.getText(url, params, success, error, type);
    var data = mini.decode(text);
    return data;
}
mini.getText = function (url, params, success, error, type) {
    var returnText = null;
    mini.ajax({
        url: url,
        data: params,
        async: false,
        type: type ? type : "get",
        cache: false,
        dataType: "text",
        success: function (text, http) {
            returnText = text;
            if (success) success(text, http);
        },
        error: error
    });
    return returnText;
}

////////////////////////////////////
//JSPath, RootPath
if (!window.mini_RootPath) {
    mini_RootPath = "/";
}
mini_CreateJSPath = function (js) {
    var scripts = document.getElementsByTagName("script");
    var path = "";
    for (var i = 0, l = scripts.length; i < l; i++) {
        var src = scripts[i].src;
        if (src.indexOf(js) != -1) {
            var ss = src.split(js);
            path = ss[0];
            break;
        }
    }
    var href = location.href;
    href = href.split("#")[0];
    href = href.split("?")[0];
    var ss = href.split("/");
    ss.length = ss.length - 1;
    href = ss.join("/");

    if (path.indexOf("http:") == -1 && path.indexOf("file:") == -1) {
        path = href + "/" + path;
    }
    return path;
}
if (!window.mini_JSPath) {
    mini_JSPath = mini_CreateJSPath("miniui.js");
}

/////////////////////////////////////
//加载页面片段HTML：是否处理css，javascipt？
//内部，销毁元素内部的所有组件对象，保持低内存。
mini.update = function (options, el) {
    if (typeof options == "string") options = { url: options };
    if (el) options.el = el;
    var html = mini.loadText(options.url);
    mini.innerHTML(options.el, html);
    mini.parse(options.el);
}
//mini.update = function (options, el) {
//    if (typeof options == "string") options = { url: options };
//    if (el) options.el = el;
//    options = mini.copyTo({
//        el: null,
//        url: "",
//        async: false,
//        type: "get",
//        cache: false,
//        dataType: "text",
//        success: function (text) {
//            var el = options.el;
//            if (el) {
//                //处理CSS、js后。。。

//                //el.innerHTML = text;
//                $(el).html(text);
//                mini.parse(el);
//            }
//        },
//        error: function (jqXHR, textStatus, errorThrown) {

//        }
//    }, options);

//    jQuery.ajax(options);
//}


///////////////////////////////////////////////////
mini.createSingle = function (Type) {
    if (typeof Type == "string") {
        Type = mini.getClass(Type);
    }
    if (typeof Type != "function") return;
    var obj = Type.single;
    if (!obj) {
        obj = Type.single = new Type();
    }
    return obj;
}
mini.createTopSingle = function (Type) {
    if (typeof Type != "function") return;
    
    var typeName = Type.prototype.type;
    if (top && top != window && top.mini && top.mini.getClass(typeName)) {
        return top.mini.createSingle(typeName);
    } else {
        return mini.createSingle(Type);
    }
}


////////////////////////////////////////////////////////
mini.sortTypes = {
    "string": function (s) {
        return String(s).toUpperCase();
    },
    "date": function (s) {
        if (!s) {
            return 0;
        }
        if (mini.isDate(s)) {
            return s.getTime();
        }
        return mini.parseDate(String(s));
    },
    "float": function (s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    },
    "int": function (s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    },
    "currency": function (s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    }
};

////////////////////////////////////////////////
mini._ValidateVType = function (vtype, value, e, scope) {
    var vtypes = vtype.split(";");
    
    for (var i = 0, l = vtypes.length; i < l; i++) {
        var vtype = vtypes[i].trim();
        var vv = vtype.split(":");
        var vt = vv[0];
        
        var args = vtype.substr(vt.length+1, 1000); //vv[1];
        if (args) args = args.split(",");
        else args = [];

        var fn = mini.VTypes[vt];
        if (fn) {
            var isValid = fn(value, args);
            if (isValid !== true) {
                e.isValid = false;
                var vtext = vv[0] + "ErrorText";
                e.errorText = scope[vtext] || mini.VTypes[vtext] || "";
                e.errorText = String.format(e.errorText, args[0], args[1], args[2], args[3], args[4]);
                break;
            }
        }
    }
}
mini._getErrorText = function (obj, field) {
    if(obj && obj[field]){
        return  obj[field];
    }else{
        return mini.VTypes[field]
    }
    
}
mini.VTypes = {
    minDateErrorText: 'Date can not be less than {0}',
    maxDateErrorText: 'Date can not be greater than {0}',

    uniqueErrorText: "This field is unique.",
    requiredErrorText: "This field is required.",
    emailErrorText: "Please enter a valid email address.",
    urlErrorText: "Please enter a valid URL.",
    floatErrorText: "Please enter a valid number.",
    intErrorText: "Please enter only digits",
    dateErrorText: "Please enter a valid date. Date format is {0}",
    maxLengthErrorText: "Please enter no more than {0} characters.",
    minLengthErrorText: "Please enter at least {0} characters.",
    maxErrorText: "Please enter a value less than or equal to {0}.",
    minErrorText: "Please enter a value greater than or equal to {0}.",
    rangeLengthErrorText: "Please enter a value between {0} and {1} characters long.",
    rangeCharErrorText: "Please enter a value between {0} and {1} characters long.",
    rangeErrorText: "Please enter a value between {0} and {1}.",

    required: function (v, args) {
        if (mini.isNull(v) || v === "") return false;
        return true;
    },
    email: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        if (v.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
            return true;
        else
            return false;
    },
    url: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        function IsURL(str_url) {
            str_url = str_url.toLowerCase();
            //            
            //            var re = new RegExp("[0-9a-z]{1,100}");
            //            if (re.test(str_url)) return false;

            var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)"
                        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@   
                        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184   
                        + "|" // 允许IP和DOMAIN（域名）  
                        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.   
                        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名   
                        + "[a-z]{2,6})" // first level domain- .com or .museum   
                        + "(:[0-9]{1,4})?" // 端口- :80
                        + "((/?)|" // a slash isn't required if there is no file name   
                        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
            var re = new RegExp(strRegex);

            if (re.test(str_url)) {
                return (true);
            } else {
                return (false);
            }
        }
        return IsURL(v);
    },
    "int": function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        function isInteger(s) {
            if (s < 0) {
                s = -s;
            }
            var n = String(s);
            return n.length > 0 && !(/[^0-9]/).test(n);
        }
        return isInteger(v);
        //        var v2 = parseInt(v);
        //        if (isNaN(v2)) return false;
        //        return typeof v2 == 'number' && String(v) == String(v2);
    },
    "float": function (v, args) {

        if (mini.isNull(v) || v === "") return true;
        function isFloat(s) {
            if (s < 0) {
                s = -s;
            }
            var n = String(s);
            if (n.split(".").length > 2) return false;
            return n.length > 0 && !(/[^0-9.]/).test(n); // && (/\.\d/).test(n);
        }
        return isFloat(v);
        //        var v2 = parseFloat(v);
        //        if (isNaN(v2)) return false;
        //        return typeof v2 == 'number' && v == v2;
    },
    "date": function (v, args) {
        
        if (mini.isNull(v) || v === "") return true;
        if (!v) return false;
        var d = null;
        var format = args[0];

        if (format) {
            d = mini.parseDate(v, format);
            if (d && d.getFullYear) {
                if (mini.formatDate(d, format) == v) return true;
            }
        } else {
            d = mini.parseDate(v, "yyyy-MM-dd");
            if (!d) d = mini.parseDate(v, "yyyy/MM/dd");
            if (!d) d = mini.parseDate(v, "MM/dd/yyyy");
            if (d && d.getFullYear) return true;
        }

        return false;
    },
    maxLength: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        var n = parseInt(args);
        if (!v || isNaN(n)) return true;
        if (v.length <= n) return true;
        else return false;
    },
    minLength: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        var n = parseInt(args);
        if (isNaN(n)) return true;
        if (v.length >= n) return true;
        else return false;
    },
    rangeLength: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        if (!v) return false;
        var min = parseFloat(args[0]), max = parseFloat(args[1]);
        if (isNaN(min) || isNaN(max)) return true;
        if (min <= v.length && v.length <= max) return true;
        return false;
    },
    rangeChar: function (v, args) {
        if (mini.isNull(v) || v === "") return true;
        //if (!v) return false;
        var min = parseFloat(args[0]), max = parseFloat(args[1]);
        if (isNaN(min) || isNaN(max)) return true;

        function isChinese(v) {
            var re = new RegExp("^[\u4e00-\u9fa5]+$");
            if (re.test(v)) return true;
            return false;
        }

        var len = 0;
        var ss = String(v).split("");
        for (var i = 0, l = ss.length; i < l; i++) {
            if (isChinese(ss[i])) {
                len += 2;
            } else {
                len += 1;
            }
        }

        if (min <= len && len <= max) return true;
        return false;
    },
    range: function (v, args) {
        if (mini.VTypes["float"](v, args) == false) return false;
        if (mini.isNull(v) || v === "") return true;
        v = parseFloat(v);
        if (isNaN(v)) return false;
        var min = parseFloat(args[0]), max = parseFloat(args[1]);
        if (isNaN(min) || isNaN(max)) return true;
        if (min <= v && v <= max) return true;
        return false;
    },
    min: function (v, args) {
        if (mini.VTypes["float"](v, args) == false) return false;
        if (mini.isNull(v) || v === "") return true;
        v = parseFloat(v);
        if (isNaN(v)) return false;
        var min = parseFloat(args[0]);
        if (isNaN(min)) return true;
        if (min <= v ) return true;
        return false;
    },
    max: function (v, args) {        
        if (mini.VTypes["float"](v, args) == false) return false;
        if (mini.isNull(v) || v === "") return true;
        v = parseFloat(v);
        if (isNaN(v)) return false;
        var max = parseFloat(args[0]);
        if (isNaN(max)) return true;
        if (v <= max) return true;
        return false;
    }
};


mini.summaryTypes = {
    "count": function (data) {
        if (!data) data = [];
        return data.length;
    },
    "max": function (data, field) {
        if (!data) data = [];
        var max = null;
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var value = parseFloat(o[field]);
            if (value === null || value === undefined || isNaN(value)) continue;
            if (max == null || max < value) {
                max = value;
            }
        }
        return max;
    },
    "min": function (data, field) {
        if (!data) data = [];
        var min = null;
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var value = parseFloat(o[field]);
            if (value === null || value === undefined || isNaN(value)) continue;
            if (min == null || min > value) {
                min = value;
            }
        }
        return min;
    },
    "avg": function (data, field) {
        if (!data) data = [];
        if (data.length == 0) return 0;
        var total = 0;
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var value = parseFloat(o[field]);
            if (value === null || value === undefined || isNaN(value)) continue;
            total += value;
        }
        var v = total / data.length;
        return v;
    },
    "sum": function (data, field) {
        if (!data) data = [];
        var total = 0;
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var value = parseFloat(o[field]);
            if (value === null || value === undefined || isNaN(value)) continue;
            total += value;
        }
        return total;
    }
};


mini.formatCurrency = function (num, prefix) {
    if (num === null || num === undefined) null == "";
    num = String(num).replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = "0" + cents;
    }
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }
    prefix = prefix || '';
    return prefix + (((sign) ? '' : '-') + num + '.' + cents);
}

//var num = 9988812345.123;
//alert(formatCurrency(num, "￥"));
