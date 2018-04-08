


/* Date
-----------------------------------------------------------------------------*/

var DAY_MS = 86400000,
	HOUR_MS = 3600000,
	MINUTE_MS = 60000;

mini.copyTo(mini, {
    clearTime: function (date) {
        if (!date) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },
    maxTime: function (date) {
        if (!date) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    },
    cloneDate: function (date) {
        if (!date) return null;
        return new Date(date.getTime());
    },
    addDate: function (date, num, type) {
        if (!type) type = "D";
        date = new Date(date.getTime());
        switch (type.toUpperCase()) {
            case "Y":
                date.setFullYear(date.getFullYear() + num);
                break;
            case "MO":
                date.setMonth(date.getMonth() + num);
                break;
            case "D":
                date.setDate(date.getDate() + num);
                break;
            case "H":
                date.setHours(date.getHours() + num);
                break;
            case "M":
                date.setMinutes(date.getMinutes() + num);
                break;
            case "S":
                date.setSeconds(date.getSeconds() + num);
                break;
            case "MS":
                date.setMilliseconds(date.getMilliseconds() + num);
                break;
        }
        return date;
    },
    getWeek: function (year, month, day) {
        month += 1; //use 1-12

        var a = Math.floor((14 - (month)) / 12);
        var y = year + 4800 - a;
        var m = (month) + (12 * a) - 3;
        var jd = day + Math.floor(((153 * m) + 2) / 5) +
                     (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) +
                     Math.floor(y / 400) - 32045;

        var d4 = (jd + 31741 - (jd % 7)) % 146097 % 36524 % 1461;
        var L = Math.floor(d4 / 1460);
        var d1 = ((d4 - L) % 365) + L;
        NumberOfWeek = Math.floor(d1 / 7) + 1;
        return NumberOfWeek;
    },
    //获得日期本周第一天的日期
    getWeekStartDate: function (date, weekStartDay) {
        if (!weekStartDay) weekStartDay = 0;
        if (weekStartDay > 6 || weekStartDay < 0) throw new Error("out of weekday");
        var day = date.getDay();
        var num = weekStartDay - day;
        if (day < weekStartDay) {
            num -= 7;
        }
        var d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + num);
        return d;
    },
    getShortWeek: function (week) {
        var weeks = this.dateInfo.daysShort;
        return weeks[week];
    },
    getLongWeek: function (week) {
        var weeks = this.dateInfo.daysLong;
        return weeks[week];
    },
    getShortMonth: function (month) {
        var months = this.dateInfo.monthsShort;
        return months[month];
    },
    getLongMonth: function (month) {
        var months = this.dateInfo.monthsLong;
        return months[month];
    },
    dateInfo: {
        monthsLong: ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        daysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        quarterLong: ['Q1', 'Q2', 'Q3', 'Q4'],
        quarterShort: ['Q1', 'Q2', 'Q3', 'Q4'],
        halfYearLong: ['first half', 'second half'],
        patterns: {
            "d": "M/d/yyyy",
            "D": "dddd, MMMM dd, yyyy",
            "f": "dddd, MMMM dd, yyyy H:mm tt",
            "F": "dddd, MMMM dd, yyyy H:mm:ss tt",
            "g": "M/d/yyyy H:mm tt",
            "G": "M/d/yyyy H:mm:ss tt",
            "m": "MMMM dd",
            "o": "yyyy-MM-ddTHH:mm:ss.fff",
            "s": "yyyy-MM-ddTHH:mm:ss",
            "t": "H:mm tt",
            "T": "H:mm:ss tt",
            "U": "dddd, MMMM dd, yyyy HH:mm:ss tt",
            "y": "MMM, yyyy"
        },
        tt: {
            "AM": "AM",
            "PM": "PM"
        },
        ten: {
            "Early": "Early",
            "Mid": "Mid",
            "Late": "Late"
        },
        today: 'Today',
        clockType: 24
    }
});
Date.prototype.getHalfYear = function () {
    if (!this.getMonth) return null;
    var m = this.getMonth();
    if (m < 6) return 0;
    return 1;
}
Date.prototype.getQuarter = function () {
    if (!this.getMonth) return null;
    var m = this.getMonth();
    if (m < 3) return 0;
    if (m < 6) return 1;
    if (m < 9) return 2;
    return 3;
}


/* Date Format
-----------------------------------------------------------------------------*/


mini.formatDate = function (date, format, locale) {
    if (!date || !date.getFullYear || isNaN(date)) return "";
    var fd = date.toString();

    var dateFormat = mini.dateInfo;
    if (!dateFormat) dateFormat = mini.dateInfo;

    if (typeof (dateFormat) !== "undefined") {
        var pattern = typeof (dateFormat.patterns[format]) !== "undefined" ? dateFormat.patterns[format] : format;

        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();

        if (format == "yyyy-MM-dd") { //yyyy-MM-dd
            month = month + 1 < 10 ? "0" + (month + 1) : month + 1;
            day = day < 10 ? "0" + day : day;
            return year + "-" + month + "-" + day;
        }
        if (format == "MM/dd/yyyy") { //MM/dd/yyyy
            month = month + 1 < 10 ? "0" + (month + 1) : month + 1;
            day = day < 10 ? "0" + day : day;
            return month + "/" + day + "/" + year;
        }



        fd = pattern.replace(/yyyy/g, year);
        fd = fd.replace(/yy/g, (year + "").substring(2));

        //
        var halfyear = date.getHalfYear();
        fd = fd.replace(/hy/g, dateFormat.halfYearLong[halfyear]);

        //
        var quarter = date.getQuarter();
        fd = fd.replace(/Q/g, dateFormat.quarterLong[quarter]);
        fd = fd.replace(/q/g, dateFormat.quarterShort[quarter]);


        fd = fd.replace(/MMMM/g, dateFormat.monthsLong[month].escapeDateTimeTokens());
        fd = fd.replace(/MMM/g, dateFormat.monthsShort[month].escapeDateTimeTokens());
        fd = fd.replace(/MM/g, month + 1 < 10 ? "0" + (month + 1) : month + 1);
        fd = fd.replace(/(\\)?M/g, function ($0, $1) { return $1 ? $0 : month + 1; });

        var dayOfWeek = date.getDay();
        fd = fd.replace(/dddd/g, dateFormat.daysLong[dayOfWeek].escapeDateTimeTokens());
        fd = fd.replace(/ddd/g, dateFormat.daysShort[dayOfWeek].escapeDateTimeTokens());


        fd = fd.replace(/dd/g, day < 10 ? "0" + day : day);
        fd = fd.replace(/(\\)?d/g, function ($0, $1) { return $1 ? $0 : day; });

        var hour = date.getHours();
        var halfHour = hour > 12 ? hour - 12 : hour;
        if (dateFormat.clockType == 12) {
            if (hour > 12) {
                hour -= 12;
            }
        }

        //HH
        fd = fd.replace(/HH/g, hour < 10 ? "0" + hour : hour);
        fd = fd.replace(/(\\)?H/g, function ($0, $1) { return $1 ? $0 : hour; });

        //hh        
        fd = fd.replace(/hh/g, halfHour < 10 ? "0" + halfHour : halfHour);
        fd = fd.replace(/(\\)?h/g, function ($0, $1) { return $1 ? $0 : halfHour; });

        var minutes = date.getMinutes();
        fd = fd.replace(/mm/g, minutes < 10 ? "0" + minutes : minutes);
        fd = fd.replace(/(\\)?m/g, function ($0, $1) { return $1 ? $0 : minutes; });

        var seconds = date.getSeconds();
        fd = fd.replace(/ss/g, seconds < 10 ? "0" + seconds : seconds);
        fd = fd.replace(/(\\)?s/g, function ($0, $1) { return $1 ? $0 : seconds; });

        fd = fd.replace(/fff/g, date.getMilliseconds());

        fd = fd.replace(/tt/g, date.getHours() > 12 || date.getHours() == 0 ? dateFormat.tt["PM"] : dateFormat.tt["AM"]);

        //
        var date = date.getDate();
        var tenF = '';
        if (date <= 10) tenF = dateFormat.ten['Early'];
        else if (date <= 20) tenF = dateFormat.ten['Mid'];
        else tenF = dateFormat.ten['Late'];
        fd = fd.replace(/ten/g, tenF);
    }

    return fd.replace(/\\/g, "");
}
String.prototype.escapeDateTimeTokens = function () {
    return this.replace(/([dMyHmsft])/g, "\\$1");
}

/* Date Parsing
-----------------------------------------------------------------------------*/

mini.fixDate = function (d, check) { // force d to be on check's YMD, for daylight savings purposes
    if (+d) { // prevent infinite looping on invalid dates
        while (d.getDate() != check.getDate()) {
            d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
        }
    }
}

/*
examples:
2000/12/22 23:23:59
2000/12/22T23:23:59
2000-12-22 23:23:59
2000-12-22T23:23:59
2000-12-22
2000/12/22
12-22-2000
12/22/2000
2010.11.12  
*/
mini.parseDate = function (s, ignoreTimezone) {
    try {
        var d = eval(s);
        if (d && d.getFullYear) return d;
    } catch (ex) {
    }
    //if (isNaN(s)) return null; 
    if (typeof s == 'object') { // already a Date object    
        return isNaN(s) ? null : s;
    }
    if (typeof s == 'number') { // a UNIX timestamp
        //if (new Date(1970, 0, 1).getTime() > parseInt(s)) return null;
        var d = new Date(s * 1000);
        if (d.getTime() != s) return null;
        return isNaN(d) ? null : d;
    }
    if (typeof s == 'string') {
        //20101112
        m = s.match(/^([0-9]{4})([0-9]{2})([0-9]{2})$/);
        if (m) {
            var date = new Date(m[1], m[2] - 1, m[3]);
            return date;
        }

        //2010.11
        m = s.match(/^([0-9]{4}).([0-9]*)$/);
        if (m) {
            var date = new Date(m[1], m[2] - 1);
            return date;
        }

        if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
            var d = new Date(parseFloat(s) * 1000);
            if (d.getTime() != s) return null;
            else return d;
        }
        if (ignoreTimezone === undefined) {
            ignoreTimezone = true;
        }
        var d = mini.parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
        return isNaN(d) ? null : d;
    }
    // TODO: never return invalid dates (like from new Date(<string>)), return null instead
    return null;
}
mini.parseISO8601 = function (s, ignoreTimezone) { // ignoreTimezone defaults to false
    // derived from http://delete.me.uk/2005/03/iso8601.html
    // TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
    //var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
    var m = s.match(/^([0-9]{4})([-\/]([0-9]{1,2})([-\/]([0-9]{1,2})([T ]([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
    if (!m) {
        //2010-11-22 9  小时额外处理下
        m = s.match(/^([0-9]{4})[-\/]([0-9]{2})[-\/]([0-9]{2})[T ]([0-9]{1,2})/);
        if (m) {
            var date = new Date(m[1], m[2] - 1, m[3], m[4]);
            return date;
        }

        //2010.11
        m = s.match(/^([0-9]{4}).([0-9]*)/);
        if (m) {
            var date = new Date(m[1], m[2] - 1);
            return date;
        }

        //2010.11.22
        m = s.match(/^([0-9]{4}).([0-9]*).([0-9]*)/);
        if (m) {
            var date = new Date(m[1], m[2] - 1, m[3]);
            return date;
        }

        //ff "12-22-2000"
        m = s.match(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
        if (!m) return null;
        else {
            var date = new Date(m[3], m[1] - 1, m[2]);
            return date;
        }
    }
    var date = new Date(m[1], 0, 1);
    if (ignoreTimezone || !m[14]) {
        var check = new Date(m[1], 0, 1, 9, 0);
        if (m[3]) {
            date.setMonth(m[3] - 1);
            check.setMonth(m[3] - 1);
        }
        if (m[5]) {
            date.setDate(m[5]);
            check.setDate(m[5]);
        }
        mini.fixDate(date, check);
        if (m[7]) {
            date.setHours(m[7]);
        }
        if (m[8]) {
            date.setMinutes(m[8]);
        }
        if (m[10]) {
            date.setSeconds(m[10]);
        }
        if (m[12]) {
            date.setMilliseconds(Number("0." + m[12]) * 1000);
        }
        mini.fixDate(date, check);
    } else {
        date.setUTCFullYear(
			m[1],
			m[3] ? m[3] - 1 : 0,
			m[5] || 1
		);
        date.setUTCHours(
			m[7] || 0,
			m[8] || 0,
			m[10] || 0,
			m[12] ? Number("0." + m[12]) * 1000 : 0
		);
        var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
        offset *= m[15] == '-' ? 1 : -1;
        date = new Date(+date + (offset * 60 * 1000));
    }
    return date;
}


mini.parseTime = function (s, format) {
    if (!s) return null;
    var n = parseInt(s);

    if (n == s && format) {
        d = new Date(0);
        if (format[0] == "H") {
            d.setHours(n);
        } else if (format[0] == "m") {
            d.setMinutes(n);
        } else if (format[0] == "s") {
            d.setSeconds(n);
        }
        return d;
    }

    var d = mini.parseDate(s);
    if (!d) {
        var ss = s.split(":");
        var t1 = parseInt(parseFloat(ss[0]));
        var t2 = parseInt(parseFloat(ss[1]));
        var t3 = parseInt(parseFloat(ss[2]));
        if (!isNaN(t1) && !isNaN(t2) && !isNaN(t3)) {
            d = new Date(0);
            d.setHours(t1);
            d.setMinutes(t2);
            d.setSeconds(t3);
        }
        if (!isNaN(t1) && (format == "H" || format == "HH")) {
            d = new Date(0);
            d.setHours(t1);
        } else if (!isNaN(t1) && !isNaN(t2) && (format == "H:mm" || format == "HH:mm")) {
            d = new Date(0);
            d.setHours(t1);
            d.setMinutes(t2);
        } else if (!isNaN(t1) && !isNaN(t2) && format == "mm:ss") {
            d = new Date(0);
            d.setMinutes(t1);
            d.setSeconds(t2);
        }
    }
    return d;
}



/*
下表列出了可被合并以构造自定义模式的模式
========================================
这些模式是区分大小写的；例如，识别“MM”，但不识别“mm”。如果自定义模式包含空白字符或用单引号括起来的字符，则输出字符串页也将包含这些字符。未定义为格式模式的一部分或未定义为格式字符的字符按其原义复制。

格式模式 说明 ：
d 月中的某一天。一位数的日期没有前导零。
dd 月中的某一天。一位数的日期有一个前导零。
ddd 周中某天的缩写名称，在 AbbreviatedDayNames 中定义。
dddd 周中某天的完整名称，在 DayNames 中定义。
M 月份数字。一位数的月份没有前导零。
MM 月份数字。一位数的月份有一个前导零。
MMM 月份的缩写名称，在 AbbreviatedMonthNames 中定义。
MMMM 月份的完整名称，在 MonthNames 中定义。
y 不包含纪元的年份。如果不包含纪元的年份小于 10，则显示不具有前导零的年份。
yy 不包含纪元的年份。如果不包含纪元的年份小于 10，则显示具有前导零的年份。
yyyy 包括纪元的四位数的年份。
gg 时期或纪元。如果要设置格式的日期不具有关联的时期或纪元字符串，则忽略该模式。
h 12 小时制的小时。一位数的小时数没有前导零。
hh 12 小时制的小时。一位数的小时数有前导零。
H 24 小时制的小时。一位数的小时数没有前导零。
HH 24 小时制的小时。一位数的小时数有前导零。
m 分钟。一位数的分钟数没有前导零。
mm 分钟。一位数的分钟数有一个前导零。
s 秒。一位数的秒数没有前导零。
ss 秒。一位数的秒数有一个前导零。
f 秒的小数精度为一位。其余数字被截断。
ff 秒的小数精度为两位。其余数字被截断。
fff 秒的小数精度为三位。其余数字被截断。
ffff 秒的小数精度为四位。其余数字被截断。
fffff 秒的小数精度为五位。其余数字被截断。
ffffff 秒的小数精度为六位。其余数字被截断。
fffffff 秒的小数精度为七位。其余数字被截断。
t 在 AMDesignator 或 PMDesignator 中定义的 AM/PM 指示项的第一个字符（如果存在）。
tt 在 AMDesignator 或 PMDesignator 中定义的 AM/PM 指示项（如果存在）。
z 时区偏移量（“+”或“-”后面仅跟小时）。一位数的小时数没有前导零。例如，太平洋标准时间是“-8”。
zz 时区偏移量（“+”或“-”后面仅跟小时）。一位数的小时数有前导零。例如，太平洋标准时间是“-08”。
zzz 完整时区偏移量（“+”或“-”后面跟有小时和分钟）。一位数的小时数和分钟数有前导零。例如，太平洋标准时间是“-08:00”。
: 在 TimeSeparator 中定义的默认时间分隔符。
/ 在 DateSeparator 中定义的默认日期分隔符。
% c 其中 c 是格式模式（如果单独使用）。如果格式模式与原义字符或其他格式模式合并，则可以省略“%”字符。
\ c 其中 c 是任意字符。照原义显示字符。若要显示反斜杠字符，请使用“\\”。

只有上面第二个表中列出的格式模式才能用于创建自定义模式；在第一个表中列出的标准格式字符不能用于创建自定义模式。自定义模式的长度至少为两个字符；例如，

DateTime.ToString( "d") 返回 DateTime 值；“d”是标准短日期模式。
DateTime.ToString( "%d") 返回月中的某天；“%d”是自定义模式。
DateTime.ToString( "d ") 返回后面跟有一个空白字符的月中的某天；“d”是自定义模式。

比较方便的是,上面的参数可以随意组合,并且不会出错,多试试,肯定会找到你要的时间格式
如要得到2005年06月 这样格式的时间
可以这样写:
date.ToString("yyyy年MM月", DateTimeFormatInfo.InvariantInfo)
或者
date.ToString("yyyy年MM月")
如此类推.

*/

mini.dateInfo = {
    monthsLong: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    daysLong: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    daysShort: ["日", "一", "二", "三", "四", "五", "六"],
    quarterLong: ['一季度', '二季度', '三季度', '四季度'],
    quarterShort: ['Q1', 'Q2', 'Q2', 'Q4'],
    halfYearLong: ['上半年', '下半年'],
    patterns: {
        "d": "yyyy-M-d",
        "D": "yyyy年M月d日",
        "f": "yyyy年M月d日 H:mm",
        "F": "yyyy年M月d日 H:mm:ss",
        "g": "yyyy-M-d H:mm",
        "G": "yyyy-M-d H:mm:ss",
        "m": "MMMd日",
        "o": "yyyy-MM-ddTHH:mm:ss.fff",
        "s": "yyyy-MM-ddTHH:mm:ss",
        "t": "H:mm",
        "T": "H:mm:ss",
        "U": "yyyy年M月d日 HH:mm:ss",
        "y": "yyyy年MM月"
    },
    tt: {
        "AM": "上午",
        "PM": "下午"
    },
    ten: {
        "Early": "上旬",
        "Mid": "中旬",
        "Late": "下旬"
    },
    today: '今天',
    clockType: 24
};
//var s = "2000.1.2";
//alert(mini.parseDate(s));