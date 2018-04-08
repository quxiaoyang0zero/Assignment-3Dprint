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

/**
拖拽基类
    mouse.init:     初始鼠标点击坐标
    mouse.now:      当前鼠标坐标
    events: onStart, onMove, onStop    
*/
mini.emptyFn = function () { };
mini.Drag = function (options) {
    mini.copyTo(this, options);
};
mini.Drag.prototype = {
    onStart: mini.emptyFn,
    onMove: mini.emptyFn,
    onStop: mini.emptyFn,
    capture: false,
    fps: 20,
    event: null,
    delay: 80,

    //调用start的时候,鼠标已经按下去了.	
    start: function (e) {

        e.preventDefault();
        if (e) this.event = e;

        this.now = this.init = [this.event.pageX, this.event.pageY];  //初始时的mouse坐标	    

        var bd = document;
        mini.on(bd, 'mousemove', this.move, this);
        mini.on(bd, 'mouseup', this.stop, this);
        mini.on(bd, 'contextmenu', this.contextmenu, this);
        if (this.context) mini.on(this.context, 'contextmenu', this.contextmenu, this);

        this.trigger = e.target; //e.trigger;
        mini.selectable(this.trigger, false);
        mini.selectable(bd.body, false);

        if (this.capture) {//ie下,为true的时候,鼠标指针不能得到界面上的do元素
            if (isIE) this.trigger.setCapture(true);
            else if (document.captureEvents) document.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP | Event.MOUSEDOWN);
        }
        this.started = false;

        //定制一个延迟事件
        this.startTime = new Date();
    },
    contextmenu: function (e) {
        if (this.context) mini.un(this.context, 'contextmenu', this.contextmenu, this);
        mini.un(document, 'contextmenu', this.contextmenu, this);
        e.preventDefault();
        e.stopPropagation();
    },
    move: function (e) {
        if (this.delay) { //如果有延迟配置,则判断当前是否超过了延迟时间
            if (new Date() - this.startTime < this.delay) return;
        }

        //2)
        if (!this.started) {
            this.started = true;
            this.onStart(this);             //在第一次move的时候,才开始onStart	        
        }

        //处理!!!        

        var sf = this;

        if (!this.timer) {
            this.timer = setTimeout(function () {
                sf.now = [e.pageX, e.pageY]//e.xy.clone();             //移动中的鼠标坐标	  
                sf.event = e;
                sf.onMove(sf);
                sf.timer = null;
            }, 5);
        }
    },
    stop: function (e) {

        this.now = [e.pageX, e.pageY]//e.xy.clone();             //移动中的鼠标坐标
        this.event = e;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        var bd = document;

        mini.selectable(this.trigger, true);
        mini.selectable(bd.body, true);

        if (isIE) {
            this.trigger.setCapture(false);
            this.trigger.releaseCapture();
        }
        //        if (this.capture) {
        //            if (isIE) this.trigger.releaseCapture();
        //            else if (document.captureEvents) document.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP | Event.MOUSEDOWN);
        //        }

        var success = mini.MouseButton.Right != e.button;
        if (success == false) {
            e.preventDefault();

        }

        //if (this.capture == false) {   
        //if (isIE) this.trigger.setCapture(false);            
        //}

        mini.un(bd, 'mousemove', this.move, this);
        mini.un(bd, 'mouseup', this.stop, this);
        var sf = this;
        setTimeout(function () {
            mini.un(document, 'contextmenu', sf.contextmenu, sf);
            if (sf.context) mini.un(sf.context, 'contextmenu', sf.contextmenu, sf);
        }, 1);

        //if (this.started || isIE9) this.onStop(this, success);
        if (this.started) this.onStop(this, success);
    }
};
