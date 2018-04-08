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

mini.append = function (to, html) {
    to = mini.byId(to);
    if (!html || !to) return;
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
            if (!html) return;
            to.appendChild(html);
            return html;
        } else {
            if (html.indexOf("<tr") == 0) {
                return jQuery(to).append(html)[0].lastChild;
                return;
            }

            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
            while (d.firstChild) {
                to.appendChild(d.firstChild);
            }
            return html;
        }
    } else {
        to.appendChild(html);
        return html;
    }

    //return jQuery(to).append(html)[0].lastChild;
}
mini.prepend = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    return jQuery(to).prepend(html)[0].firstChild;
}
mini.after = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    if (!html || !to) return;
    to.nextSibling ? to.parentNode.insertBefore(html, to.nextSibling) : to.parentNode.appendChild(html);
    return html;
}
mini.before = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    if (!html || !to) return;
    to.parentNode.insertBefore(html, to);
    return html;
}

mini.__wrap = document.createElement('div');
mini.createElements = function (html) {
    mini.removeChilds(mini.__wrap);
    var isTr = html.indexOf("<tr") == 0;
    if (isTr) {
        html = '<table>' + html + '</table>';
    }
    mini.__wrap.innerHTML = html;
    return isTr ? mini.__wrap.firstChild.rows : mini.__wrap.childNodes;
}

mini_byId = function (id, context) {
    if (typeof id == "string") {
        if (id.charAt(0) == '#') id = id.substr(1);
        var el = document.getElementById(id);
        if (el) return el;
        if (context && !mini.isAncestor(document.body, context)) {
            //return jQuery("#" + id, context)[0];

            var els = context.getElementsByTagName("*");
            for (var i = 0, l = els.length; i < l; i++) {
                var el = els[i];
                if (el.id == id) return el;
            }
            el = null;
        }
        return el;
    } else {
        return id;
    }
}
mini_hasClass = function (el, className) {
    el = mini.byId(el);
    if (!el) return;
    if (!el.className) return false;
    var clss = String(el.className).split(" ");
    return clss.indexOf(className) != -1;
}
mini_addClass = function (el, className) {
    if (!className) return;
    if (mini.hasClass(el, className) == false) {
        jQuery(el).addClass(className);
    }
}
mini_removeClass = function (el, className) {
    if (!className) return;
    jQuery(el).removeClass(className);
    //        el = mini.byId(el);
    //        if (!el) return;
    //        el.className = el.className.replace(className, "");
}

mini_getMargins = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("margin-top"), 10) || 0,
        left: parseInt(jq.css("margin-left"), 10) || 0,
        bottom: parseInt(jq.css("margin-bottom"), 10) || 0,
        right: parseInt(jq.css("margin-right"), 10) || 0
    };
}
mini_getBorders = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("border-top-width"), 10) || 0,
        left: parseInt(jq.css("border-left-width"), 10) || 0,
        bottom: parseInt(jq.css("border-bottom-width"), 10) || 0,
        right: parseInt(jq.css("border-right-width"), 10) || 0
    };
}

mini_getPaddings = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("padding-top"), 10) || 0,
        left: parseInt(jq.css("padding-left"), 10) || 0,
        bottom: parseInt(jq.css("padding-bottom"), 10) || 0,
        right: parseInt(jq.css("padding-right"), 10) || 0
    };
}
mini_setWidth = function (el, width) {
    el = mini.byId(el);
    width = parseInt(width);
    if (isNaN(width) || !el) return;
    if (jQuery.boxModel) {
        var p = mini.getPaddings(el);
        var b = mini.getBorders(el);
        width = width - p.left - p.right - b.left - b.right;
    }
    //    var m = mini.getMargins(el);
    //    width = width - m.left - m.right;
    if (width < 0) width = 0;
    el.style.width = width + "px";
}
mini_setHeight = function (el, height) {
    el = mini.byId(el);
    height = parseInt(height);
    if (isNaN(height) || !el) return;
    if (jQuery.boxModel) {
        var p = mini.getPaddings(el);
        var b = mini.getBorders(el);
        height = height - p.top - p.bottom - b.top - b.bottom;
    }
    //    var m = mini.getMargins(el);
    //    height = height - m.top - m.bottom;
    if (height < 0) height = 0;
    el.style.height = height + "px";
}
mini_getWidth = function (el, content) {
    el = mini.byId(el);
    if (el.style.display == "none" || el.type == "text/javascript") return 0;
    return content ? jQuery(el).width() : jQuery(el).outerWidth();
}
mini_getHeight = function (el, content) {
    el = mini.byId(el);
    if (el.style.display == "none" || el.type == "text/javascript") return 0;
    return content ? jQuery(el).height() : jQuery(el).outerHeight();
}
mini_setBox = function (el, x, y, width, height) {
    if (y === undefined) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
    }
    mini.setXY(el, x, y);
    mini.setWidth(el, width);
    mini.setHeight(el, height);
}
mini_getBox = function (el) {
    var xy = mini.getXY(el);
    var box = {
        x: xy[0],
        y: xy[1],
        width: mini.getWidth(el),
        height: mini.getHeight(el)
    };
    box.left = box.x;
    box.top = box.y;
    box.right = box.x + box.width;
    box.bottom = box.y + box.height;
    return box;
}
mini_setStyle = function (el, style) {
    el = mini.byId(el);
    if (!el || typeof style != "string") return;

    var jq = jQuery(el);
    var styles = style.toLowerCase().split(";");
    for (var i = 0, l = styles.length; i < l; i++) {
        var s = styles[i];
        var ss = s.split(":");
        if (ss.length == 2) {
            jq.css(ss[0].trim(), ss[1].trim());
        }
    }
}
mini_getStyle = function () {
    var f = document.defaultView;
    return new Function('el', 'style', [
        "style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));",
        "style=='float' && (style='",
        f ? 'cssFloat' : 'styleFloat',
        "');return el.style[style] || ",
        f ? 'window.getComputedStyle(el, null)[style]' : 'el.currentStyle[style]',
        ' || null;'].join(''));
} ();
mini_isAncestor = function (p, c) {
    var ret = false;
    p = mini.byId(p);
    c = mini.byId(c);
    if (p === c) return true;
    if (p && c) {
        if (p.contains) {
            try {
                return p.contains(c);
            } catch (e) {
                return false;
            }
        } else
            if (p.compareDocumentPosition) {
                return !!(p.compareDocumentPosition(c) & 16);
            } else {
                while (c = c.parentNode) {
                    ret = c == p || ret;
                }
            }
    }
    return ret;
}
mini_findParent = function (p, cls, maxDepth) {
    p = mini.byId(p);
    var b = document.body, depth = 0, stopEl;
    maxDepth = maxDepth || 50;
    if (typeof maxDepth != "number") {
        stopEl = mini.byId(maxDepth);
        maxDepth = 10;
    }
    while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
        if (mini.hasClass(p, cls)) {
            return p;
        }
        depth++;
        p = p.parentNode;
    }
    return null;
}
mini.copyTo(mini, {
    byId: mini_byId,
    hasClass: mini_hasClass,
    addClass: mini_addClass,
    removeClass: mini_removeClass,

    getMargins: mini_getMargins,
    getBorders: mini_getBorders,
    getPaddings: mini_getPaddings,
    setWidth: mini_setWidth,
    setHeight: mini_setHeight,
    getWidth: mini_getWidth,
    getHeight: mini_getHeight,
    setBox: mini_setBox,
    getBox: mini_getBox,

    setStyle: mini_setStyle,
    getStyle: mini_getStyle,

    repaint: function (el) {
        if (!el) el = document.body;
        mini.addClass(el, "mini-repaint");
        setTimeout(function () {
            mini.removeClass(el, "mini-repaint");
        }, 1);
    },

    getSize: function (el, content) {
        return {
            width: mini.getWidth(el, content),
            height: mini.getHeight(el, content)
        };
    },
    setSize: function (el, width, height) {
        mini.setWidth(el, width);
        mini.setHeight(el, height);
    },
    setX: function (el, x) {
        x = parseInt(x);
        var xy = jQuery(el).offset();
        //var y = xy.top;
        var y = parseInt(xy.top);
        if (y === undefined) y = xy[1];
        mini.setXY(el, x, y);
    },
    setY: function (el, y) {
        y = parseInt(y);
        var xy = jQuery(el).offset();
        var x = parseInt(xy.left);
        if (x === undefined) x = xy[0];
        mini.setXY(el, x, y);
    },
    setXY: function (el, x, y) {

        var xy = {
            left: parseInt(x),
            top: parseInt(y)
        };
        jQuery(el).offset(xy);
        jQuery(el).offset(xy);      //jquery 1.4 bug
    },
    getXY: function (el) {
        var xy = jQuery(el).offset();
        return [parseInt(xy.left), parseInt(xy.top)];
    },
    getViewportBox: function () {
        //debugger
        //  var top = jQuery(window).scrollTop();
        var w = jQuery(window).width(), h = jQuery(window).height();
        var x = jQuery(document).scrollLeft(), y = jQuery(document.body).scrollTop();
        if (document.documentElement) y = document.documentElement.scrollTop;

        return {
            x: x, y: y, width: w, height: h, right: x + w, bottom: y + h
        };
    },

    getChildNodes: function (el, all) {
        el = mini.byId(el);
        if (!el) return;
        var nodes = el.childNodes;
        var cs = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var c = nodes[i];
            if (c.nodeType == 1 || all === true) {
                cs.push(c);
            }
        }
        return cs;
    },
    //    getChildNodes: function (el, all) {
    //        el = mini.byId(el);
    //        if (!el) return [];
    //        var node = el.firstChild;
    //        if (!node) return [];
    //        var arr = [];
    //        while (node) {
    //            if (node.nodeType == 1 || all == true) {
    //                arr.push(node);
    //            }
    //            node = node.nextSibling;
    //        }
    //        return arr;   
    //    },
    removeChilds: function (el, butEl) {
        el = mini.byId(el);
        if (!el) return;
        var cs = mini.getChildNodes(el, true);
        for (var i = 0, l = cs.length; i < l; i++) {
            var c = cs[i];
            if (butEl && c == butEl) {
            } else {
                el.removeChild(cs[i]);
            }
        }
    },
    isAncestor: mini_isAncestor,
    findParent: mini_findParent,
    findChild: function (el, cls) {
        el = mini.byId(el);
        var els = el.getElementsByTagName('*');
        for (var i = 0, l = els.length; i < l; i++) {
            var el = els[i];
            if (mini.hasClass(el, cls)) return el;
        }
    },
    isAncestor: function (p, c) {
        var ret = false;
        p = mini.byId(p);
        c = mini.byId(c);
        if (p === c) return true;
        if (p && c) {
            if (p.contains) {
                try {
                    return p.contains(c);
                } catch (e) { return false }
            } else
                if (p.compareDocumentPosition) {
                    return !!(p.compareDocumentPosition(c) & 16);
                } else {
                    while (c = c.parentNode) {
                        ret = c == p || ret;
                    }
                }
        }
        return ret;
    },
    getOffsetsTo: function (el, target) {
        var o = this.getXY(el), e = this.getXY(target);
        return [o[0] - e[0], o[1] - e[1]];
    },
    scrollIntoView: function (el, container, hscroll) {
        var c = mini.byId(container) || document.body,
        	o = this.getOffsetsTo(el, c),
            l = o[0] + c.scrollLeft,
            t = o[1] + c.scrollTop,
            b = t + el.offsetHeight,
            r = l + el.offsetWidth,
        	ch = c.clientHeight,
        	ct = parseInt(c.scrollTop, 10),
        	cl = parseInt(c.scrollLeft, 10),
        	cb = ct + ch,
        	cr = cl + c.clientWidth;

        if (el.offsetHeight > ch || t < ct) {
            c.scrollTop = t;
        } else if (b > cb) {
            c.scrollTop = b - ch;
        }
        c.scrollTop = c.scrollTop; // corrects IE, other browsers will ignore

        if (hscroll !== false) {
            if (el.offsetWidth > c.clientWidth || l < cl) {
                c.scrollLeft = l;
            } else if (r > cr) {
                c.scrollLeft = r - c.clientWidth;
            }
            c.scrollLeft = c.scrollLeft;
        }
        return this;
    },
    setOpacity: function (el, opacity) {
        jQuery(el).css({
            "opacity": opacity
        });
    },
    selectable: function (el, selected) {
        el = mini.byId(el);
        if (!!selected) {
            jQuery(el).removeClass('mini-unselectable');
            if (isIE) el.unselectable = "off";
            else {
                el.style.MozUserSelect = '';
                el.style.KhtmlUserSelect = '';
                el.style.UserSelect = '';

            }
        } else {
            jQuery(el).addClass('mini-unselectable');
            if (isIE) el.unselectable = 'on';
            else {
                el.style.MozUserSelect = 'none';
                el.style.UserSelect = 'none';
                el.style.KhtmlUserSelect = 'none';
            }
        }
    },
    selectRange: function (el, iStart, iEnd) {
        if (el.createTextRange) {
            var oRange = el.createTextRange();
            oRange.moveStart("character", iStart);
            oRange.moveEnd("character", iEnd - el.value.length);
            oRange.select();
        } else {
            if (el.setSelectionRange) {
                el.setSelectionRange(iStart, iEnd);
            }
        }
        try {
            el.focus();
        } catch (e) {
        }
    },
    getSelectRange: function (el) {
        el = mini.byId(el);
        if (!el) return;
        try {
            el.focus();
        } catch (e) {
        }
        var start = 0, end = 0;
        if (el.createTextRange) {
            //start
            var r = document.selection.createRange().duplicate();
            r.moveEnd('character', el.value.length);
            if (r.text === '') {
                start = el.value.length;
            }
            else {
                start = el.value.lastIndexOf(r.text);
            }

            //end
            var r = document.selection.createRange().duplicate();
            r.moveStart('character', -el.value.length);
            end = r.text.length;

        } else {
            start = el.selectionStart;
            end = el.selectionEnd;
        }

        return [start, end];
    }
    //    setAttr: function (el, attr, value) {
    //        //jQuery(el).attr(attr, value);

    //    },
    //    getAttr: function (el, attr) {
    //        return jQuery(el).attr(attr);
    //    },
    //    removeAttr: function (el, attr) {
    //        jQuery(el).removeAttr(attr, value);
    //    }

});
(function () {
    var fixAttr = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        cellpadding: 'cellPadding',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        usemap: 'useMap',
        frameborder: 'frameBorder',
        contenteditable: 'contentEditable'
    };

    var div = document.createElement('div');
    div.setAttribute('class', 't');
    var supportSetAttr = div.className === 't';

    mini.setAttr = function (el, name, val) {
        el.setAttribute(supportSetAttr ? name : (fixAttr[name] || name), val);
    }

    mini.getAttr = function (el, name) {
        if(name == "value" && (isIE6 || isIE7)){
            var a = el.attributes[name]
            return a ? a.value : null;
        }

        var v = el.getAttribute(supportSetAttr ? name : (fixAttr[name] || name));
        
        if(typeof v == "function"){
            v = el.attributes[name].value;
        }

        //onload
        if(!v && name == "onload"){        
            var node = el.getAttributeNode ? el.getAttributeNode(name) : null;
            if(node){
                v = node.nodeValue;
            }
        }

        return v;
    }
//    mini.getAttr = function (el, name) {
//        if (name == "value" && (isIE6 || isIE7)) {
//            var a = el.attributes[name]
//            return a ? a.value : null;
//        }

//        var v = el.getAttribute(supportSetAttr ? name : (fixAttr[name] || name));

//        if (typeof v == "function") {
//            v = el.attributes[name].value;
//        }

//        return v;
//    }

})()


/* Html Event 
-----------------------------------------------------------------------------*/

//mini_createOneDelegate = function (fn, scope) {
//    if (!fn) return function () { };
//    return function (e) {
//        e = e || window.event;
//        e.target = e.target || e.srcElement;
//        var ret =  fn.apply(scope, arguments);
//        if(ret === false) return false;
//    }
//}

mini_onOne = function (el, type, fn, scope) {
    //    mini_on(el, type, fn, scope);
    //    return;

    var name = "on" + type.toLowerCase();
    //el[name] = mini_createOneDelegate(fn, scope);
    el[name] = function (e) {
        e = e || window.event;
        e.target = e.target || e.srcElement;
        if (!e.preventDefault) {
            e.preventDefault = function () {
                if (window.event) {
                    window.event.returnValue = false;
                }
            }
        }
        if (!e.stopPropogation) {
            e.stopPropogation = function () {
                if (window.event) {
                    window.event.cancelBubble = true;
                }
            }
        }
        var ret = fn.call(scope, e);
        if (ret === false) return false;
    }
}



mini_on = function (el, type, fn, scope) {
    el = mini.byId(el);
    scope = scope || el;
    if (!el || !type || !fn || !scope) return false
    var listener = mini.findListener(el, type, fn, scope);
    if (listener) return false;
    var method = mini.createDelegate(fn, scope);
    mini.listeners.push([el, type, fn, scope, method]);
    if (isFirefox && type == 'mousewheel') type = 'DOMMouseScroll';
    jQuery(el).bind(type, method);
};
mini_un = function (el, type, fn, scope) {
    el = mini.byId(el);
    scope = scope || el;
    if (!el || !type || !fn || !scope) return false
    var listener = mini.findListener(el, type, fn, scope);
    if (!listener) return false;
    mini.listeners.remove(listener);
    if (isFirefox && type == 'mousewheel') type = 'DOMMouseScroll';
    jQuery(el).unbind(type, listener[4]);
};
mini.copyTo(mini, {
    listeners: [], //[el, type, fn, scope]    
    on: mini_on,
    un: mini_un,
    _getListeners: function () {
        var listeners = mini.listeners;
        for (var i = listeners.length - 1; i >= 0; i--) {
            var listener = listeners[i];
            try {
                if (listener[0] == 1
                    && listener[1] == 1
                    && listener[2] == 1
                    && listener[3] == 1
                ) {
                    var m = 1;
                }
            } catch (ex) {
                //跨iframe的事件绑定后，当iframe销毁，访问就出错
                listeners.removeAt(i);
            }
        }
        return listeners;
    },
    findListener: function (el, type, fn, scope) {
        el = mini.byId(el);
        scope = scope || el;
        if (!el || !type || !fn || !scope) return false
        var listeners = mini._getListeners();

        for (var i = listeners.length - 1; i >= 0; i--) {
            var listener = listeners[i];
            try {
                if (listener[0] == el
                && listener[1] == type
                && listener[2] == fn
                && listener[3] == scope
            ) {
                    return listener;
                }
            } catch (ex) { }

        }
    },
    clearEvent: function (el, type) {
        el = mini.byId(el);
        if (!el) return false;
        var listeners = mini._getListeners();
        for (var i = listeners.length - 1; i >= 0; i--) {
            var listener = listeners[i];
            //try {
            if (listener[0] == el) {
                if (!type || type == listener[1]) {
                    mini.un(el, listener[1], listener[2], listener[3]);
                }
            }
            //} catch (ex) { debugger }
        }
        el.onmouseover = el.onmousedown = null;
    }
    //    ,
    //    fireEvent: function (el, type) {
    //        
    //    }
});


//window resize
mini.__windowResizes = [];
mini.onWindowResize = function (fn, scope) {
    mini.__windowResizes.push([fn, scope]);
}
mini.on(window, "resize", function (e) {
    var events = mini.__windowResizes;
    for (var i = 0, l = events.length; i < l; i++) {
        var event = events[i];
        event[0].call(event[1], e);
    }
});


mini.htmlEncode = function (str) {
    if (typeof str !== "string") return str;
    var s = "";
    if (str.length == 0) return "";
    s = str;
    //s = s.replace(/&/g, "&gt;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    //s = s.replace(/\n/g, "<br>");
    return s;
}

mini.htmlDecode = function (str) {
    if (typeof str !== "string") return str;
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    //s = s.replace(/<br>/g, "\n");
    return s;
}

/* Array 
-----------------------------------------------------------------------------*/

mini.copyTo(Array.prototype, {
    add: Array.prototype.enqueue = function (item) {
        this[this.length] = item;
        return this;
    },
    getRange: function (start, end) {
        var arr = [];
        for (var i = start; i <= end; i++) {
            var o = this[i];
            if (o) {
                arr[arr.length] = o;
            }
        }
        return arr;
    },
    addRange: function (array) {
        for (var i = 0, j = array.length; i < j; i++) this[this.length] = array[i];
        return this;
    },
    clear: function () {
        this.length = 0;
        return this;
    },
    clone: function () {
        if (this.length === 1) {
            return [this[0]];
        }
        else {
            return Array.apply(null, this);
        }
    },
    contains: function (item) {
        return (this.indexOf(item) >= 0);
    },
    indexOf: function (item, from) {
        var len = this.length;
        for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++) {
            if (this[i] === item) return i;
        }
        return -1;
    },
    dequeue: function () {
        return this.shift();
    },
    insert: function (index, item) {
        this.splice(index, 0, item);
        return this;
    },
    insertRange: function (index, items) {
        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            this.splice(index, 0, item);

        }
        return this;
    },
    remove: function (item) {
        var index = this.indexOf(item);
        if (index >= 0) {
            this.splice(index, 1);
        }
        return (index >= 0);
    },
    removeAt: function (index) {
        var ritem = this[index];
        this.splice(index, 1);
        return ritem;
    },
    removeRange: function (items) {
        items = items.clone();
        for (var i = 0, l = items.length; i < l; i++) {
            this.remove(items[i]);
        }
    }
});


//key
mini.Keyboard = {
    Left: 37,
    Top: 38,
    Right: 39,
    Bottom: 40,

    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,

    Enter: 13,
    ESC: 27,
    Space: 32,
    Tab: 9,
    Del: 46,

    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123
};


var ua = navigator.userAgent.toLowerCase(),
    check = function (r) {
        return r.test(ua);
    },
    DOC = document,
    isStrict = DOC.compatMode == "CSS1Compat",
    isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]',
    isChrome = check(/chrome/),
    isWebKit = check(/webkit/),
    isSafari = !isChrome && check(/safari/),
    isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
    isSafari3 = isSafari && check(/version\/3/),
    isSafari4 = isSafari && check(/version\/4/),
    isIE = !!window.attachEvent && !isOpera,
    isIE7 = isIE && check(/msie 7/),
    isIE8 = isIE && check(/msie 8/),
    isIE9 = isIE && check(/msie 9/),
    isIE10 = isIE && document.documentMode == 10,
    isIE6 = isIE && !isIE7 && !isIE8 && !isIE9 && !isIE10,
    isFirefox = navigator.userAgent.indexOf("Firefox") > 0,
    isGecko = !isWebKit && check(/gecko/),
    isGecko2 = isGecko && check(/rv:1\.8/),
    isGecko3 = isGecko && check(/rv:1\.9/),
    isBorderBox = isIE && !isStrict,
    isWindows = check(/windows|win32/),
    isMac = check(/macintosh|mac os x/),
    isAir = check(/adobeair/),
    isLinux = check(/linux/),
    isSecure = /^https/i.test(window.location.protocol);

if (isIE6) {
    try {
        DOC.execCommand("BackgroundImageCache", false, true);
    } catch (e) { }
}
mini.boxModel = !isBorderBox;
mini.isIE = isIE;
mini.isIE6 = isIE6;
mini.isIE7 = isIE7;
mini.isIE8 = isIE8;
mini.isIE9 = isIE9;
mini.isIE10 = isIE10;
mini.isFirefox = isFirefox;
mini.isOpera = isOpera;
mini.isSafari = isSafari;
mini.isChrome = isChrome;

if (jQuery) jQuery.boxModel = mini.boxModel;



//alert(isIE6 + ":" + isIE7 + ":" + isIE8 + ":" + isIE9 + ":" + isIE10);

mini.noBorderBox = false;
if (jQuery.boxModel == false && isIE && isIE9 == false) mini.noBorderBox = true;

mini.MouseButton = {
    Left: 0,
    Middle: 1,
    Right: 2
}
if (isIE && !isIE9 && !isIE10) {
    mini.MouseButton = {
        Left: 1,
        Middle: 4,
        Right: 2
    }
}


//////////////////////////////////////////////////////////
//Mask
//mini.LoadingText = "Loading...";
mini._MaskID = 1;
mini._MaskObjects = {};
mini.mask = function (options) {
    //{html, cls, style, opacity, background}

    var el = mini.byId(options);
    if (mini.isElement(el)) options = { el: el };
    else if (typeof options == "string") options = { html: options };

    options = mini.copyTo({
        html: "",
        cls: "",
        style: "",
        //opacity: .3,
        backStyle: "background:#ccc"
    }, options);
    options.el = mini.byId(options.el);
    if (!options.el) options.el = document.body;
    var el = options.el;

    mini["unmask"](options.el);
    el._maskid = mini._MaskID++;
    mini._MaskObjects[el._maskid] = options;

    var maskEl = mini.append(el, '<div class="mini-mask">' +
        '<div class="mini-mask-background" style="' + options.backStyle + '"></div>' +
                        '<div class="mini-mask-msg ' + options.cls + '" style="' + options.style + '">' + options.html + '</div>'
        + '</div>');
    if (el == document.body) mini.addClass(maskEl, 'mini-fixed');

    options.maskEl = maskEl;
    if (!mini.isNull(options.opacity)) {
        mini.setOpacity(maskEl.firstChild, options.opacity);
    }

    function center() {
        msgEl.style.display = "block";
        var size = mini.getSize(msgEl);
        msgEl.style.marginLeft = -size.width / 2 + "px";
        msgEl.style.marginTop = -size.height / 2 + "px";
    }
    var msgEl = maskEl.lastChild;
    msgEl.style.display = "none";
    //center();
    setTimeout(function () {
        center();
    }, 0);

    //    if (el == document.body) {
    //        var vbox = mini.getViewportBox();
    //        maskEl.style.height = vbox.height + "px";
    //    }
}
mini["unmask"] = function (el) {
    el = mini.byId(el);
    if (!el) el = document.body;
    var options = mini._MaskObjects[el._maskid];
    if (!options) return;
    delete mini._MaskObjects[el._maskid];
    var maskEl = options.maskEl;
    options.maskEl = null;
    if (maskEl && maskEl.parentNode) {
        maskEl.parentNode.removeChild(maskEl);
    }
}

//////////////////////////////////////////
mini.Cookie = {
    get: function (sName) {
        var aCookie = document.cookie.split("; ");
        var lastMatch = null;
        for (var i = 0; i < aCookie.length; i++) {
            var aCrumb = aCookie[i].split("=");
            if (sName == aCrumb[0]) {
                lastMatch = aCrumb;
            }
        }
        if (lastMatch) {
            var v = lastMatch[1];
            if (v === undefined) return v;
            return unescape(v);
        }
        return null;
    },
    set: function (name, value, expires, domain) {
        var LargeExpDate = new Date();
        if (expires != null) {
            //LargeExpDate.setTime(LargeExpDate.getTime() + (expires*1000*3600*24));         

            LargeExpDate = new Date(LargeExpDate.getTime() + (expires * 1000 * 3600 * 24)); //expires天数            
        }

        document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + LargeExpDate.toGMTString())) + ";path=/" + (domain ? "; domain=" + domain : "");
    },
    del: function (name, domain) {
        this.set(name, null, -100, domain);
    }
};

//////////////////////////////////////////
mini.copyTo(mini, {
    /*
    var array = TreeToArray(dataTree.Root.Nodes, 'Nodes');
    var array = TreeToArray(dataTree.Root.Nodes, 'Nodes', 'Id', 'ParentId', -1);
    */
    treeToArray: function (nodes, nodesField, idField, parentIdField, parentId) {
        if (!nodesField) nodesField = 'children';
        var array = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            array[array.length] = node;

            if (parentIdField) node[parentIdField] = parentId;

            var childrenNodes = node[nodesField];
            if (childrenNodes && childrenNodes.length > 0) {
                var id = node[idField];
                var childrenArray = this.treeToArray(childrenNodes, nodesField, idField, parentIdField, id);
                array.addRange(childrenArray);
            }
        }
        return array;
    },
    /*
    数组转树形
    ArrayToTree(array, 'Nodes', '_Id', '_ParentId');
    */
    arrayToTree: function (data, nodesField, idField, parentIdField) {
        if (!nodesField) nodesField = 'children';
        idField = idField || '_id';
        parentIdField = parentIdField || '_pid';

        var nodes = [];

        //建立快速索引
        var idHash = {};
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            if (!o) continue;
            var id = o[idField];
            if (id !== null && id !== undefined) {
                idHash[id] = o;
            }
            delete o[nodesField];
        }

        //数组转树形
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var p = idHash[o[parentIdField]];
            if (!p) {
                nodes.push(o);
                continue;
            }
            if (!p[nodesField]) {
                p[nodesField] = [];
            }
            p[nodesField].push(o);
        }
        return nodes;
    }
});
mini.treeToList = mini.treeToArray;
mini.listToTree = mini.arrayToTree;

function UUID() {
    var s = [], itoh = '0123456789ABCDEF'.split('');
    for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);
    s[14] = 4;
    s[19] = (s[19] & 0x3) | 0x8;
    for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
}


String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    format = format || "";
    return format.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i];
    });
}
String.prototype.trim = function () {
    var re = /^\s+|\s+$/g;
    return function () { return this.replace(re, ""); };
} ();



//////////////////////////////////////////
mini.copyTo(mini, {
    measureText: function (el, text, style) {
        if (!this.measureEl) {
            this.measureEl = mini.append(document.body, '<div></div>');
        }

        this.measureEl.style.cssText = "position:absolute;left:-1000px;top:-1000px;visibility:hidden;";
        if (typeof el == "string") {
            this.measureEl.className = el;

        } else {
            this.measureEl.className = "";

            var j1 = jQuery(el);
            var j2 = jQuery(this.measureEl);
            var csses = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
            for (var i = 0, l = csses.length; i < l; i++) {
                var css = csses[i];
                j2.css(css, j1.css(css));
            }
        }
        if (style) mini.setStyle(this.measureEl, style);
        this.measureEl.innerHTML = text;
        return mini.getSize(this.measureEl);
    }
});


//////////////////////////////////////////////////////////
jQuery(function () {

    var sss = new Date();
    mini.isReady = true;
    mini.parse();
    mini._FireBindEvents();


    //alert(new Date() -sss);
    //判断：如果是ie6/7,把body自动修改overflow:visible    
    if ((mini.getStyle(document.body, "overflow") == "hidden" || mini.getStyle(document.documentElement, "overflow") == "hidden")
        && (isIE6 || isIE7)) {
        //document.body.style.overFlow = "visible";
        //document.documentElement.style.overFlow = "visible";
        jQuery(document.body).css("overflow", "visible");
        jQuery(document.documentElement).css("overflow", "visible");
    }
    mini.__LastWindowWidth = document.documentElement.clientWidth;
    mini.__LastWindowHeight = document.documentElement.clientHeight;

});
mini_onload = function (e) {
    mini.layout(null, false);
    mini.on(window, "resize", mini_onresize);
    //mini.repaint(document.body);    //
}
mini.on(window, "load", mini_onload);

mini.__LastWindowWidth = document.documentElement.clientWidth;
mini.__LastWindowHeight = document.documentElement.clientHeight;
mini.doWindowResizeTimer = null;

mini.allowLayout = true;



//var count = 0;
mini_onresize = function (e) {

    //document.title = count++;
    if (mini.doWindowResizeTimer) {
        clearTimeout(mini.doWindowResizeTimer);
    }
    mini.WindowVisible = mini.isWindowDisplay();
    if (mini.WindowVisible == false || mini.allowLayout == false) return;

    if (typeof Ext != "undefined") {
        mini.doWindowResizeTimer = setTimeout(function () {
            var __LastWindowWidth = document.documentElement.clientWidth;
            var __LastWindowHeight = document.documentElement.clientHeight;
            if (mini.__LastWindowWidth == __LastWindowWidth && mini.__LastWindowHeight == __LastWindowHeight) {
            } else {

                mini.__LastWindowWidth = __LastWindowWidth;
                mini.__LastWindowHeight = __LastWindowHeight;
                mini.layout(null, false);
            }
            mini.doWindowResizeTimer = null;
        }, 300);
    } else {
        var deferTime = 100;
        try {
            if (parent && parent != window && parent.mini) {
                deferTime = 0;
            }
        } catch (ex) {
        }
        mini.doWindowResizeTimer = setTimeout(function () {
            var __LastWindowWidth = document.documentElement.clientWidth;
            var __LastWindowHeight = document.documentElement.clientHeight;
            //            if (__LastWindowHeight == 0 || __LastWindowHeight == 0) {
            //                mini.doWindowResizeTimer = null;
            //                return;
            //            }
            if (mini.__LastWindowWidth == __LastWindowWidth && mini.__LastWindowHeight == __LastWindowHeight) {
            } else {

                mini.__LastWindowWidth = __LastWindowWidth;
                mini.__LastWindowHeight = __LastWindowHeight;
                mini.layout(null, false);
            }
            mini.doWindowResizeTimer = null;
        }, deferTime);
    }
}



//////////////////////////////////////////////////
mini.isDisplay = function (p, body) {
    var doc = body || document.body;
    while (1) {
        if (p == null || !p.style) return false;
        if (p && p.style && p.style.display == "none") return false;
        if (p == doc) return true;

        p = p.parentNode;

    }
    return true;
};


mini.isWindowDisplay = function () {
    try {
        var parentWindow = window.parent;
        var isIFrame = parentWindow != window;

        if (isIFrame) {
            var _iframes = parentWindow.document.getElementsByTagName("iframe");
            var _frames = parentWindow.document.getElementsByTagName("frame");
            var iframes = [];
            for (var i = 0, l = _iframes.length; i < l; i++) {
                iframes.push(_iframes[i]);
            }
            for (var i = 0, l = _frames.length; i < l; i++) {
                iframes.push(_frames[i]);
            }

            var iframe = null;
            for (var i = 0, l = iframes.length; i < l; i++) {
                var el = iframes[i];
                if (el.contentWindow == window) {
                    iframe = el;
                    break;
                }
            }
            if (!iframe) return false;

            return mini.isDisplay(iframe, parentWindow.document.body);


        } else {
            return true;
        }
    } catch (e) {
        return true;
    }
};
/////////////////////////////////////////////////////

mini.WindowVisible = mini.isWindowDisplay();

//var __MiniWindowTimer = setInterval(function () {
//    var visible = mini.isWindowDisplay();    
//    if (visible == true) {
//        mini.WindowVisible = true;
//        clearInterval(__MiniWindowTimer);
//        if (visible != mini.WindowVisible) {
//            mini.layout();
//        }
//    }
//}, 150);

/*
是否跟mini加一个定时判断。
判断iframe什么时候被隐藏，再次显示的时候，就layout一下？

是否定义一个方法，专门用来调用iframe的layout，以达到自适应尺寸的目的？
mini.layout();
mini.layoutIFrames();

*/
//以后去除的话，提供一个全局变量
mini.layoutIFrames = function (parentNode) {
    if (!document.body) return;
    if (!parentNode) parentNode = document.body;
    var iframes = parentNode.getElementsByTagName("iframe");
    setTimeout(function () {
        for (var i = 0, l = iframes.length; i < l; i++) {
            var el = iframes[i];
            try {
                if (mini.isDisplay(el) && mini.isAncestor(parentNode, el)) {
                    if (el.contentWindow.mini) {
                        if (el.contentWindow.mini.WindowVisible == false) {
                            el.contentWindow.mini.WindowVisible = el.contentWindow.mini.isWindowDisplay();
                            el.contentWindow.mini.layout();
                        } else {
                            el.contentWindow.mini.layout(null, false);
                        }
                    }
                    el.contentWindow.mini.layoutIFrames();
                }
            } catch (ex) { }
        }
    }, 30);
}


$.ajaxSetup({
    cache: false
})

/////////////
if (isIE) {
    setInterval(function () {
        CollectGarbage();
    }, 10000);
}

//__fixFlash = function () {
//    var found = window["__flash__removeCallback"];
//    if (found) {
//        clearInterval(__fixFlash_timer);
//        window["__flash__removeCallback"] = function (instance, name) {
//            try {
//                if (instance) {
//                    instance[name] = null;
//                }
//            } catch (flashEx) {
//            }
//        }
//    }
//}
//__fixFlash_timer = setInterval(__fixFlash, 100);

mini_unload = function (e) {
    //var sss = new Date();
    
    try {
        var win = mini._getTopWindow();
        win[mini._WindowID] = '';
        delete win[mini._WindowID];
    } catch (ex) {

    }

    //iframe
    var iframes = document.body.getElementsByTagName("iframe");
    if (iframes.length > 0) {

        var IFrames = [];
        for (var i = 0, l = iframes.length; i < l; i++) {
            IFrames.push(iframes[i]);
        }

        for (var i = 0, l = IFrames.length; i < l; i++) {
            try {
                var iframe = IFrames[i];
                iframe._ondestroy = null;
                iframe.src = "";
                try {
                    iframe.contentWindow.document.write("");
                    iframe.contentWindow.document.close();
                } catch (ex) { }
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            } catch (e) { }
        }
    }
    
    var cs = mini.getComponents();
    for (var i = 0, l = cs.length; i < l; i++) {
        var control = cs[i];
        if (control.destroyed !== true) {
            control.destroy(false);
        }
    }

    cs.length = 0;
    cs = null;

    mini.un(window, "unload", mini_unload);
    mini.un(window, "load", mini_onload);
    mini.un(window, "resize", mini_onresize);

    mini.components = {};
    mini.classes = {};
    mini.uiClasses = {};
    mini.uids = {};

    mini._topWindow = null;
    window.mini = null;
    window.Owner = null;
    window.CloseOwnerWindow = null;

    try {
        CollectGarbage();
    } catch (e) { }

    //alert(new Date() - sss);

    //会造成小的内存泄漏
    //window.onerror = function () { return true; };
}
mini.on(window, "unload", mini_unload);


///////////////////////////
//iframe mousedown/click
function __OnIFrameMouseDown() {
    jQuery(document).trigger("mousedown");
}
function __BindIFrames() {
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0, l = iframes.length; i < l; i++) {
        var iframe = iframes[i];

        try {
            if (iframe.contentWindow && iframe.contentWindow.document) {
                iframe.contentWindow.document.onmousedown = __OnIFrameMouseDown;
            }
        } catch (e) {
            
         }

    }
}
setInterval(function () {
    __BindIFrames();
}, 1500);


mini.zIndex = 1000;
mini.getMaxZIndex = function () {
    return mini.zIndex++;
}

/////////////////////////
function js_isTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}
function js_touchScroll(id) {
    if (js_isTouchDevice()) { //if touch events exist...
        var el = typeof id == "string" ? document.getElementById(id) : id;
        var scrollStartPos = 0;

        el.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
            event.preventDefault();
        }, false);

        el.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
            event.preventDefault();
        }, false);
    }
}



///////////////////////////////////////////////////////////
/* position 
-----------------------------------------------------------------------------*/
//mini.showAtEl = function (options) {
//    var c = {
//        atCls: "",

//        el: null,
//        atEl: null,
//        xAlign: "left",         //outleft,left,center,right,outright
//        yAlign: "below",        //above, top, middle, bottom, below
//        xOffset: 0,
//        yOffset: 0,
//        renderBody: true,
//        onbeforeopen: function () { },
//        onopen: function () { },
//        onoutclick: function (htmlEvent) { },

//        width: "",          //auto的时候，才measure
//        height: "",         //auto的时候，才measure
//        minWidth: 0,        //只有当width|height为auto的时候生效
//        minHeight: 0,
//        maxWidth: 2000,
//        maxHeight: 2000
//    };
//    mini.copyTo(c, options);

//    var el = mini.byId(c.el);
//    var atEl = mini.byId(c.atEl);
//    if (!atEl || !el) return;

//    if (c.onbeforeopen() === false) return;

//    //popupCls
//    mini.addClass(atEl, c.atCls);

//    //render
//    if (!mini.isRendered(el) || (c.renderBody && el.parentNode != document.body)) {
//        document.body.appendChild(el);
//    }

//    //do show    
//    el.style.display = "block";
//    el.style.position = "absolute";
//    el.style.zIndex = __js_getMaxZIndex();

//    //size
//    mini.measureSize(c);

//    //xy

//    var vbox = mini.getBox(el.parentNode);
//    var box = mini.getBox(el);
//    var pbox = mini.getBox(atEl);

//    var h = c.xAlign, v = c.yAlign;

//    switch (c.xAlign) {
//        case "outleft":
//            x = pbox.x - box.width;
//            break;
//        case "left":
//            x = pbox.x;
//            break;
//        case "center":
//            x = pbox.x + pbox.width / 2 - box.width / 2;
//            break;
//        case "right":
//            x = pbox.right - box.width;
//            break;
//        case "outright":
//            x = pbox.right;
//            break;
//        default:

//            break;
//    }

//    switch (c.yAlign) {
//        case "above":
//            y = pbox.y - box.height;
//            break;
//        case "top":
//            y = pbox.y;
//            break;
//        case "middle":
//            y = pbox.y + pbox.height / 2 - box.height / 2;
//            break;
//        case "bottom":
//            y = pbox.bottom - box.height;
//            break;
//        case "below":
//            y = pbox.bottom;
//            break;
//        default:

//            break;
//    }

//    //out xAlign
//    if (c.xAlign == "outright") {   //一般用于menu
//        if (x + box.width > vbox.right) {
//            var left = pbox.x - vbox.x;
//            var right = vbox.right - pbox.right;
//            if (left > right) {
//                x = pbox.x - box.width;
//            }
//        }
//    }
//    //out xAlign
//    if (c.xAlign == "left") {
//        if (x + box.width > vbox.right) {
//            var left = pbox.x - vbox.x;
//            var right = vbox.right - pbox.right;
//            if (left > right) {
//                x = pbox.right - box.width;
//            }
//        }
//    }

//    //out yAlign
//    if (c.yAlign == "below") {   //一般用于combobox/datepicker            
//        if (y + box.height > vbox.bottom) {
//            var top = pbox.y - vbox.y;
//            var bottom = vbox.bottom - pbox.bottom;
//            if (top > bottom) {
//                y = pbox.y - box.height;
//            }
//        }
//    }
//    //out yAlign
//    if (c.yAlign == "top") {
//        if (y + box.height > vbox.bottom) {
//            var top = pbox.y - vbox.y;
//            var bottom = vbox.bottom - pbox.bottom;
//            if (top > bottom) {
//                y = pbox.bottom - box.height;
//            }
//        }
//    }

//    x = parseInt(x);
//    y = parseInt(y);

//    mini.setXY(el, x, y);

//    __js_addShowOptions(c);

//    mini.layout(c.el);

//    c.onopen();
//    return c;
//}
//mini.showAtPos = function (options) {
//    var c = {
//        el: null,
//        x: "center",            //outleft,left,center,right,outright
//        y: "middle",            //above, top, middle, bottom, below
//        xOffset: 0,
//        yOffset: 0,
//        renderBody: false,
//        onbeforeopen: function () { },
//        onopen: function () { },
//        onoutclick: function (htmlEvent) { },

//        width: "",          //auto的时候，才measure
//        height: "",         //auto的时候，才measure
//        minWidth: 0,        //只有当width|height为auto的时候生效
//        minHeight: 0,
//        maxWidth: 2000,
//        maxHeight: 2000,

//        fixed: false,

//        animate: false
//    };
//    mini.copyTo(c, options);

//    var el = mini.byId(c.el);
//    if (!el) return;

//    if (c.onbeforeopen() === false) return;

//    //render
//    var renderBody = c.renderBody || c.fixed;
//    if (!mini.isRendered(el) || (renderBody && el.parentNode != document.body)) {
//        document.body.appendChild(el);
//    }

//    //do show
//    el.style.display = "block";
//    el.style.position = "absolute";
//    el.style.zIndex = __js_getMaxZIndex();

//    //size
//    mini.measureSize(c);

//    //x, y

//    var vbox = mini.getBox(el.parentNode);
//    var box = mini.getBox(el);

//    var x = c.x;
//    var y = c.y;
//    if (!x) x = "center";
//    if (!y) y = "middle";

//    if (!c.fixed || mini.isIE6) {
//        if (x == "left") x = vbox.x + c.xOffset;
//        if (x == 'center') x = vbox.x + vbox.width / 2 - box.width / 2;
//        if (x == "right") x = vbox.right - box.width - c.xOffset;

//        if (y == "top") y = vbox.y + c.yOffset;
//        if (y == "middle") y = vbox.y + vbox.height / 2 - box.height / 2;
//        if (y == "bottom") y = vbox.bottom - box.height - c.yOffset;

//        if (x + box.width > vbox.right) x = vbox.right - box.width;
//        if (y + box.height > vbox.bottom) y = vbox.bottom - box.height;

//        mini.setXY(el, x, y);
//    } else {
//        //fixed
//        var s = el.style;
//        s.margin = 0;
//        s.position = "fixed";
//        s.left = s.top = s.right = s.bottom = "auto";
//        s["margin-top"] = s["margin-left"] = "0px";
//        //x
//        if (mini.isNumber(x)) s.left = x + "px";
//        if (x == "left") {
//            s.left = c.xOffset + "px";
//        }
//        if (x == "center") {
//            s.left = "50%";
//            s["margin-left"] = (-box.width / 2) + "px";
//        }
//        if (x == "right") {
//            s.right = c.xOffset + "px";
//        }
//        //y
//        if (mini.isNumber(y)) s.top = y + "px";
//        if (y == "top") {
//            s.top = c.yOffset + "px";
//        }
//        if (y == "middle") {
//            s.top = "50%";
//            s["margin-top"] = (-box.height / 2) + "px";
//        }
//        if (y == "bottom") {
//            s.bottom = c.yOffset + "px";
//        }
//    }
//    __js_addShowOptions(c);

//    mini.layout(c.el);

//    c.onopen();

//    //__js_pos_animate(c);

//    return c;
//}
//mini.measureSize = function (options) {
//    var c = {
//        el: null,
//        width: "",          //auto的时候，才measure
//        height: "",         //auto的时候，才measure
//        minWidth: 0,        //只有当width|height为auto的时候生效
//        minHeight: 0,
//        maxWidth: 2000,
//        maxHeight: 2000
//    };
//    mini.copyTo(c, options);
//    var el = mini.byId(c.el);
//    if (!el || mini.isDisplay(el) == false) return;

//    //min, max
//    if (c.width == "auto") {
//        el.style.width = "auto";
//        var size = mini.getSize(el);
//        if (size.width > c.maxWidth) {
//            mini.setWidth(el, c.maxWidth);
//            size = mini.getSize(el);
//        }
//        if (size.width < c.minWidth) {
//            mini.setWidth(el, c.minWidth);
//            box = mini.getSize(el);
//        }
//    }
//    if (c.height == "auto") {
//        el.style.height = "auto";
//        var size = mini.getSize(el);
//        if (size.height > c.maxHeight) {
//            mini.setHeight(el, c.maxHeight);
//            box = mini.getSize(el);
//        }
//        if (size.height < c.minHeight) {
//            mini.setHeight(el, c.minHeight);
//        }
//    }
//}

//__js__showOptions = [];
//__js_addShowOptions = function (op) {
//    for (var i = __js__showOptions.length - 1; i >= 0; i--) {
//        var o = __js__showOptions[i];
//        if (o.el == op.el) {
//            __js__showOptions.removeAt(i);
//        }
//    }
//    __js__showOptions.push(op);
//}
//mini.on(document, "mousedown", function (e) {

//    function within(e, el) {
//        if (mini.isAncestor(el, e.target)) return true;
//        var controls = mini.getChildControls(el);
//        for (var i = 0, l = controls.length; i < l; i++) {
//            var c = controls[i];
//            if (c.within(e)) return true;
//        }
//        return false;
//    }

//    for (var i = __js__showOptions.length - 1; i >= 0; i--) {
//        var o = __js__showOptions[i];
//        var el = o.el;
//        if (mini.isDisplay(el) == false) continue;
//        var atEl = o.atEl;
//        var ret1 = within(e, el);
//        var ret2 = within(e, atEl);
//        if (ret1 || ret2) {
//        } else {
//            var ret = o.onoutclick(e);
//            if (ret !== false) {
//                if (atEl) mini.removeClass(atEl, o.atCls);
//            }
//        }
//    }

//});


/////////////////////////////////////
mini._placeholder = function (el) {
    el = mini.byId(el);
    if (!el || !isIE || isIE10) return;

    function doLabel() {
        var label = el._placeholder_label;

        if (!label) return;

        var placeholder = el.getAttribute("placeholder");
        if (!placeholder) placeholder = el.placeholder;
        if (!el.value && !el.disabled) {
            label.innerHTML = placeholder;
            label.style.display = "";
        } else {
            label.style.display = "none";
        }
    }

    if (el._placeholder) {
        doLabel();
        return;
    }
    el._placeholder = true;

    var label = document.createElement("label");
    label.className = "mini-placeholder-label";
    el.parentNode.appendChild(label);
    el._placeholder_label = label;

    label.onmousedown = function () {
        el.focus();
    }

    //ie 专用
    el.onpropertychange = function (e) {
        e = e || window.event;
        if (e.propertyName == "value") {

            doLabel();
        }
    }

    doLabel();

    //events
    mini.on(el, "focus", function (e) {
        if (!el.readOnly) {
            label.style.display = "none";
        }
    });
    mini.on(el, "blur", function (e) {
        doLabel();
    });

}


////////////////////////////////////////////////
mini.ajax = function (options) {
    if (!options.dataType) {
        options.dataType = "text";
    }
    //    if (!options.contentType) {
    //        options.dataType = "text";
//    }    
    return window.jQuery.ajax(options);
}
////////////////////////////////////////////////
mini._evalAjaxData = function (ajaxData, scope) {
    var obj = ajaxData;
    var t = typeof ajaxData;
    if (t == "string") {
        obj = eval("(" + ajaxData + ")");
        if (typeof obj == "function") {
            obj = obj.call(scope);
        }
    }
    return obj;
}