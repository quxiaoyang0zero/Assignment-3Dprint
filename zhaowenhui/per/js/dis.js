// JavaScript Document

    
setTimeout(function() {
    // IE
    if(document.all) {
        document.getElementById("m").click();
    }
    // 其它浏览器
    else {
        var e = document.createEvent("MouseEvents");
        e.initEvent("click", true, true);
        document.getElementById("m").dispatchEvent(e);
    }
}, 10);