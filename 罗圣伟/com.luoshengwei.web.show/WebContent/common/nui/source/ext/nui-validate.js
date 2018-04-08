(function(){

	var validateFn = {
		/** 验证字符串是否为空或者全部都是空格
		 * 通过验证返回true,否则返回false
		 **/
		isNull : function (str) {
			if (typeof(str) == "object")
				str = str.value;
			var i;
			if (str.length == 0)
				return true;
			for (i = 0; i < str.length; i++) {
				if (str.charAt(i) != ' ')
					return false;
			}
			return true;
		},
		/**用途：校验ip地址的格式
		 *返回：通过验证返回true,否则返回false；
		 **/
		isIP : function (str) {
			if (typeof(str) == "object")
				str = str.value;
			var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/; //匹配IP地址的正则表达式
			if (re.test(str)) {
				if (RegExp.$1.length > 3 || RegExp.$2.length > 3 || RegExp.$3.length > 3 || RegExp.$4.length > 3)
					return false;
				if (RegExp.$1 > 0 && RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 255)
					return true;
			}
			return false;
		},
		/**校验是否为整数
		* 检验通过返回true,否则返回false
		**/
		isInteger : function (str) {
			if (typeof(str) == "object")
				str = str.value;
			if (/^(\+|-)?\d+$/.test(str)) {
				return true;
			} else {
				return false;
			}
		},
		/**校验是否为正整数
		* 检验通过返回true,否则返回false
		**/
		isPositiveInteger:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			if (/^(\+)?\d+$/.test(str)) {
				return true;
			} else {
				return false;
			}
		},
		/**校验是否为url
		 * 检验通过返回true,否则返回false
		 **/
		isURL:function(str) {
			if (typeof(str) == "object")
				str = str.value;

			if (str.indexOf("://") != -1) {
				var schema = str.substr(0, str.indexOf("://"));
				if (schema == "")
					return false;
				schema = str.substr(str.indexOf("://") + 3, schema.length);
				if (schema == "")
					return false;
			} else {
				return false;
			}
			return true;
		},
		/**校验是否为数字,可以是负数和包含小数点,并且可按精度进行校验)
		 * len:长度   pric：精度（即小数位数)
		 * 满足精度：即数字整数位数不大于指定，且小数位数不大于指定精度。
		 * 校验通过则返回true,否则返回false
		 **/
		isDecimal:function(str, len, pric) {
			if (typeof(str) == "object")
				str = str.value;
			if (/^(\+|-)?\d+($|\.\d+$)/.test(str)) {
				var dotPos = str.indexOf(".");
				if (len != null) {
					var strLen = str.length;
					if (dotPos != -1)
						strLen = strLen - 1;
					if (len < strLen)
						return false;
				}
				if (pric != null) {
					if (dotPos == -1)
						return true;
					if (str.length - dotPos - 1 > pric)
						return false;
				}
				return true;
			} else {
				return false;
			}
		},
		/**校验是否为socket端口号格式
		 * 检验通过返回true,否则返回false
		 **/
		isPort:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			if (/^\d+$/.test(str)) {
				if (parseInt(str, 10) > 65535 || parseInt(str, 10) <= 0)
					return false;
				return true;
			} else {
				return false;
			}
		},
		/**校验否符合E-Mail格式
		 *验证通过返回true,否则返回false
		 */
		isEmail:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var myReg = /^([-_A-Za-z0-9\.]+)@[A-Za-z0-9]{1}[_A-Za-z0-9\.]*\.[A-Za-z0-9]+$/;
			if (myReg.test(str))
				return true;
			return false;
		},
		/**校验字符串1是否以字符串2为结尾
		 *验证通过返回true,否则返回false
		 **/
		isLastMatch:function(str1, str2) {
			if (typeof(str1) == "object")
				str1 = str1.value;
			if (typeof(str2) == "object")
				str2 = str2.value;
			var myReg = new RegExp(str2 + "$");
			if (myReg.test(str1))
				return true;
			else
				return false;
		},
		/**校验字符串1是否以字符串2为开头
		 *验证通过返回true,否则返回false
		 **/
		isFirstMatch:function(str1, str2) {
			if (typeof(str1) == "object")
				str1 = str1.value;
			if (typeof(str2) == "object")
				str2 = str2.value;
			var myReg = new RegExp("^" + str2);
			if (myReg.test(str1))
				return true;
			else
				return false;
		},
		/**校验字符串1是否包含字符串2
		 *验证通过返回true,否则返回false
		 **/
		isMatch:function(str1, str2) {
			if (typeof(str1) == "object")
				str1 = str1.value;
			if (typeof(str2) == "object")
				str2 = str2.value;
			var myReg = new RegExp(str2);
			if (myReg.test(str1))
				return true;
			else
				return false;
		},
		/**校验输入手机号码是否正确
		 * 验证通过返回true,否则返回false
		 *校验规则：
		 *    一、移动电话号码为11或12位，如果为12位,那么第一位为0
		 *	 二、11位移动电话号码的第一位为"1"
		 *	 三、12位移动电话号码的第二位和第三位为"13"
		 */
		isChinaMobileNo:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var regu = /^1[3|4|5|8][0-9]\d{4,8}$/;
			var re = new RegExp(regu);
			if (re.test(str)) {
				return true;
			}
			return false;
		},
		/**校验输入电话号码是否正确
		 * 验证通过返回true,否则返回false
		 *校验规则：
		 *    一、电话号码由数字、"("、")"和"-"构成
		 *	 二、电话号码为3到8位
		 *	 三、如果电话号码中包含有区号，那么区号为三位或四位
		 *	 四、区号用"("、")"或"-"和其他部分隔开
		 */
		isPhoneNo:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var regu = /(^([0][1-9]{2,3}[-])?\d{3,8}(-\d{1,6})?$)|(^\([0][1-9]{2,3}\)\d{3,8}(\(\d{1,6}\))?$)|(^\d{3,8}$)/;
			var re = new RegExp(regu);
			if (re.test(str)) {
				return true;
			}
			return false;
		},
		/**校验字符串是否只由英文字母和数字和下划线组成
		 *验证通过返回true,否则返回false
		 **/
		isNumberOr_Letter:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			if (/[^(\w*)]/.test(str)) {
				return false;
			}
			return true;
		},
		/**校验字符串是否只由英文字母和数字组成
		 *验证通过返回true,否则返回false
		 **/
		isNumberOrLetter:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			if (/[^(a-z)*(A-Z)*(0-9)*]/.test(str)) {
				return false;
			}
			return true;
		},
		/**校验字符串是否是合法的文件夹格式
		 *验证通过返回true,否则返回false
		 **/
		isFolder:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var regu = /(^[^\.])/;
			var re = new RegExp(regu);

			if (!re.test(str)) {
				return false;
			}
			regu = /(^[^\\\/\?\*\"\<\>\:\|]*$)/;
			var re = new RegExp(regu);
			if (re.test(str)) {
				return true;
			}
			return false;
		},
		/**校验字符串是否只由汉字、字母、数字组成
		 *验证通过返回true,否则返回false
		 */
		isChinaOrNumbOrLett:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var regu = "^[0-9a-zA-Z\u4e00-\u9fa5]+$";
			var re = new RegExp(regu);
			if (re.test(str)) {
				return true;
			}
			return false;
		},
		/**校验字符串是否是中国大陆的邮政编码
		 *验证通过返回true,否则返回false
		 */
		isChinaZipcode:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			if (!isInteger(str))
				return false;
			if (str.length != 6) {
				return false;
			}
			return true;
		},
		/**校验字符串是否是中国大陆的身份证号码
		 *验证通过返回true,否则返回false
		 */
		isChinaIDNo:function(str) {
			if (typeof(str) == "object")
				str = str.value;
			var aCity = EOS_CITY_LIST;
			var iSum = 0;
			var info = "";
			var strIDno = str;
			var idCardLength = strIDno.length;
			if (!/^\d{17}(\d|X|x)$/i.test(strIDno) && !/^\d{15}$/i.test(strIDno)) {

				return false;
			}

			//在后面的运算中x相当于数字10,所以转换成a
			strIDno = strIDno.replace(/X|x$/i, "a");

			if (aCity[parseInt(strIDno.substr(0, 2))] == null) {

				return false;
			}

			if (idCardLength == 18) {
				sBirthday = strIDno.substr(6, 4) + "-" + Number(strIDno.substr(10, 2)) + "-" + Number(strIDno.substr(12, 2));
				var d = new Date(sBirthday.replace(/-/g, "/"))
					if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {

						return false;
					}

					for (var i = 17; i >= 0; i--)
						iSum += (Math.pow(2, i) % 11) * parseInt(strIDno.charAt(17 - i), 11);

					if (iSum % 11 != 1) {

						return false;
					}
			} else if (idCardLength == 15) {
				sBirthday = "19" + strIDno.substr(6, 2) + "-" + Number(strIDno.substr(8, 2)) + "-" + Number(strIDno.substr(10, 2));
				var d = new Date(sBirthday.replace(/-/g, "/"))
					var dd = d.getFullYear().toString() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
				if (sBirthday != dd) {

					return false;
				}
			}
			return true;
		},
		/**校验起止日期是否正确
		 *规则为两个日期的格式正确且结束如期>=起始日期。正确的日期格式为yyyyMMdd 日期格式 (1900年~2100年)。
		 *验证通过返回true,否则返回false
		 */
		checkPeriod:function(str1, str2) {
			if (typeof(str1) == "object")
				str1 = str1.value;
			if (typeof(str2) == "object")
				str2 = str2.value;
			if (!isDate(str1))
				return false;
			if (!isDate(str2))
				return false;
			if (str2 >= str1)
				return true;
			else
				return false;
		},
		/**校验字符串是否符合正则表达式
		 *pattern：正则表达式
		 *flag：标志位
		 *  表示匹配的选项,可以对以下选项组合使用：
		 *   i: 忽略大小写 g: 全局匹配 m: 多行模式
		 *验证通过返回true,否则返回false
		 **/
		matchRegExp:function(str, pattern, flag) {
			if (typeof(str) == "object")
				str = str.value;
			if (pattern == null || pattern == "")
				return false;
			var re;
			if (flag == null || flag == "")
				re = new RegExp(pattern);
			else {
				if (/[^mig]/.test(flag))
					return false;
				re = new RegExp(pattern, flag);
			}
			if (re.test(str))
				return true;

			return false;
		},
		isChinese:function(v){
			var re = new RegExp("^[\u4e00-\u9fa5]+$");
			if (re.test(v)) return true;
			return false;
		},
		isEnglish:function(v){
            var re = new RegExp("^[a-zA-Z\_]+$");
            if (re.test(v)) return true;
            return false;
        }
	};
	
	
	nui.VTypes["regErrorText"] = "不匹配";
	mini.VTypes["reg"] = function (v,args) {
		var re = args;
		if (re.test(v)) return true;
		return false;
	}
	
	
	nui.VTypes["ipErrorText"] = "请输入正确的IP地址";
	mini.VTypes["ip"] = function (v,args) {
		return validateFn.isIP(v);
	};	
	
	nui.VTypes["floatErrorText"] = "请输入实数";
	mini.VTypes["float"] = function (v,args) {
		var re = /^-?([1-9]d*.d*|0.d*[1-9]d*|0?.0+|0)$/;
		if (re.test(v)) return true;
		return false;
	};
	
	nui.VTypes["doubleErrorText"] = "请输入实数";
	mini.VTypes["double"] = function (v,args) {
		var len=args[0];
		var pric=args[1];
		
		return validateFn.isDecimal(v,len,pric);
	};
	
	
	nui.VTypes["chineseErrorText"] = "请输入汉字";
	mini.VTypes["chinese"] = function (v,args) {
		return validateFn.isChinese(v);
	};
	
	nui.VTypes["mobileErrorText"] = "请输入正确的手机号";
	mini.VTypes["mobile"] = function (v,args) {
		return validateFn.isChinaMobileNo(v);
	};
	
	nui.VTypes["portErrorText"] = "请输入端口号";
	mini.VTypes["port"] = function (v,args) {
		return validateFn.isPort(v);
	};
	
	nui.VTypes["englishErrorText"] = "请输入英文字母";
	mini.VTypes["english"] = function (v,args) {
		return validateFn.isEnglish(v);
	};
	
	nui.VTypes["idnoErrorText"] = "请输入身份证号";
	mini.VTypes["idno"] = function (v,args) {
		return validateFn.isChinaIDNo(v);
	};
	
	nui.VTypes["postErrorText"] = "请输入邮编";
	mini.VTypes["post"] = function (v,args) {
		return validateFn.isChinaIDNo(v);
	};
})();





