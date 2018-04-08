/***************************************************
* loadJS v1.0
* 
* How to use : http://www.loadjs.org
*
* License : MIT
*
* Date : 2012/04/01
*
***************************************************/

if (typeof window.rootpath == "undefined") {
    rootpath = "/";
}

mini.loadJS = function (src, callback) {
    if (!src) return;
    if (typeof callback == "function") {
        return loadJS._async(src, callback);
    } else {
        return loadJS._sync(src);
    }
}
mini.loadJS._js = {};
mini.loadJS._async = function (src, callback) {
    var state = mini.loadJS._js[src];
    if (!state) {
        state = mini.loadJS._js[src] = { create: false, loaded: false, callbacks: [] };
    }
    if (state.loaded) {
        setTimeout(function () {
            callback();
        }, 1);
        return;
    } else {
        state.callbacks.push(callback);
        if (state.create) return;
    }

    state.create = true;

    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.src = src;
    js.type = 'text/javascript';

    function doCallback() {
        for (var i = 0; i < state.callbacks.length; i++) {
            var fn = state.callbacks[i];
            if (fn) fn();
        }
        state.callbacks.length = 0;
    }

    setTimeout(function () {
        if (document.all) {
            js.onreadystatechange = function () {
                if (js.readyState == 'loaded' || js.readyState == 'complete') {
                    doCallback();
                    state.loaded = true;
                }
            }
        } else {
            js.onload = function () {
                doCallback();
                state.loaded = true;
            }
        }
        head.appendChild(js);
    }, 1);
    return js;
}
mini.loadJS._sync = function (src) {
    if (loadJS._js[src]) return;
    loadJS._js[src] = { create: true, loaded: true, callbacks: [] };

    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.text = loadText(src);
    head.appendChild(js);
    return js;
}

mini.loadText = function (url) {
    var text = "";
    var isLocal = document.all && location.protocol == "file:";


    var xmlhttp = null;
    if (isLocal) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        if (window.XMLHttpRequest) {        // for all new browsers
            xmlhttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {    // for IE5 and IE6
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }


    xmlhttp.onreadystatechange = state_Change;

    var d = '_t=' + new Date().getTime();
    if (url.indexOf("?") == -1) d = "?" + d;
    else d = "&" + d;
    url += d;

    xmlhttp.open("GET", url, false);
    xmlhttp.send(null);

    function state_Change() {
        if (xmlhttp.readyState == 4) {
            var statusCode = isLocal ? 0 : 200;
            if (xmlhttp.status == statusCode) {
                text = xmlhttp.responseText;
            }
            else {
                //error
            }
        }
    }
    return text;
}

mini.loadJSON = function (url) {
    var text = loadText(url);
    var o = eval("(" + text + ")");
    return o;
}


mini.loadCSS = function (src, id) {
    if (!src) return;
    if (loadCSS._css[src]) return;
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    if (id) link.id = id;
    link.href = src;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
    return link;
}
mini.loadCSS._css = {};

/* innerHTML */
mini.innerHTML = function (el, html) {
    if (typeof el == 'string') el = document.getElementById(el);
    if (!el) return;
    html = '<div style="display:none">&nbsp;</div>' + html;
    el.innerHTML = html;
    mini.__executeScripts(el);
    var d = el.firstChild;
    //d.parentNode.removeChild(d);
}
mini.__executeScripts = function (d) {
    var scripts = d.getElementsByTagName("script")
    for (var i = 0, l = scripts.length; i < l; i++) {
        var sc = scripts[i];
        var src = sc.src;
        if (src) {
            mini.loadJS(src);
        } else {
            var ns = document.createElement('script');
            ns.type = "text/javascript";
            ns.text = sc.text;
            d.appendChild(ns);
        }
    }
    for (var i = scripts.length - 1; i >= 0; i--) {
        var sc = scripts[i];
        sc.parentNode.removeChild(sc);
    }
}