/**
 * 是否包含给定的子串
 * @param substr
 * @returns {Boolean}
 */
String.prototype.contains = function(substr) {
	return this.indexOf(substr) >= 0;
};

function sleep(milliSeconds){
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}

// 常量定义 //
var TOKEN_KEY = '_bocTokenKey_'; // Token存放到Cookie的key
var TOKEN_EXPIRE_DAY = 10; // Token过期时间，单位：天
var TOKEN_DOMAIN = '_bocTokenDomain'; // Token的Cookie域

var GLOBAL_CONTEXT = '_globalContext';//
var VAL_RULES = '_valRules';//校验规则Key
var AUTH_RES_LIST = '_authResList';//资源权限列表Key
var USER_ID = '_userId';//用户ID上下文Key
var GLOBAL_TABS = '_global_tabs';
var Channel = "page";//渠道
var APPLICATION_CONTEXT = "poc";//上下文





// 程序开关 //
nui.enableModelVal = true; // 是否启用模型校验，为false则关闭所有的表单校验
nui.enableResAuth = true; // 是否启用资源权限控制，为false则关闭所有的权限控制

/**
 * 判断是否为顶层窗口
 * @param win window对象
 */
function isTop(win) {
	return win.parent === win; // 顶层窗口的parent等于自身窗口
}

/**
 * 根据传入的window对象，依次遍历parent直到top，查找属性值
 * @param win window对象
 * @param propName 属性名称
 * @return 属性值
 */
nui.findPropertyValue = function(win, propName) {
	if(!win) {
		return null;
	}
	
	if(win[propName]) {
		return win[propName];
	}
	
	if(isTop(win)) { 
		return null;
	} 
	
	return this.findPropertyValue(win.parent, propName);
};

/**
 * 获取全局数据上下文
 */
nui.getGlobalContext = function() {
	return this.findPropertyValue(window, GLOBAL_CONTEXT);
};

/**
 * 设置令牌
 * @param token 令牌字符串
 */
nui.setToken = function(token) {
	nui.Cookie.set(TOKEN_KEY, token);
};

/**
 * 获取令牌
 * @return 令牌字符串
 */
nui.getToken = function() {
	return nui.Cookie.get(TOKEN_KEY);
};

/**
 * 销毁令牌
 */
nui.removeToken = function() {
	nui.Cookie.del(TOKEN_KEY);
};


/**
 * 带交易的Ajax请求. 请求前会将Token和交易码加入Header中
 * @param options 原生的Ajax参数
 * @param transCode 交易码
 */
nui.transAjax = function(options, transCode) {
	// 扩展原NUI的ajax，将token自动加入HTTP Header
	if(!options.headers) {
		options.headers = {};
	}
	options.headers['_TokenStr'] = this.getToken();
	options.headers['_Transactioncode'] = transCode;
	options.headers['userId'] = 'sysadmin';
	nui.ajax(options);
};


/**
 * 带交易的Ajax请求. 请求前会将Token和交易码加入Header中
 * @param options 原生的Ajax参数
 * @param transCode 交易码
 */
nui.transAjaxs = function(options, transCode,data) {
	// 扩展原NUI的ajax，将token自动加入HTTP Header
	if(!options.headers) {
		options.headers = {};
	}
	var bussCode = nui.BussSerialCode();
	var jsonData = {
			Head:
			{
				"TransCode":transCode,
				"Token":"AWODO39499fkcdkde432432dsawsae",
				"UserId":"sysadmin",
				"Channel":Channel,
				"BussSerialCode":bussCode
			},
			Body:data
	};
	if(mini.isNull(options.url) == true){
		options.url = "/"+APPLICATION_CONTEXT+"/"+"transCode";
	}
	if(mini.isNull(options.type) == true){
		options.type = 'POST';
	}
	if(mini.isNull(options.contentType) == true){
		options.contentType = 'text/json';
	}
	options.data = nui.encode(jsonData),
	//options.onSuccess = options.success;
	options.success = function(value,code,response){
		
		options.onSuccess(value,code,response);
	};
	nui.ajax(options);
};

/**
 * 获取UUID
 */
nui.BussSerialCode = function(){
    return UUID();
};
/**
 * 表单提交函数.<br>提交失败会自动弹出提示框显示提示信息
 * @param url 请求URL
 * @param transactioncode 交易码
 * @param formId 
 * @param callback 调用成功后回调函数
 */
nui.Form.submit = function(url, transactioncode, formId, callback) {
	var form = new nui.Form(formId);

    form.validate();
    if (!form.isValid()) {
    	nui.alert('表单中有不合法字段');
    	return;
    }

    //提交数据
    var data = form.getData();      
    var json = nui.encode(data);
    nui.transAjax({
		type: "POST",
		url: url,
		data: json,
		success: callback,
		error : function(err) {
			nui.alert('请求失败');
		}
    }, transactioncode);
};

/**
 * 异步加载校验规则信息并保持到globalContext
 * @param onSuccess 加载成功回调函数
 * @param onError 加载失败回调函数
 */
nui.loadValidateRules = function(onSuccess, onError) {
	var globalContext = this.getGlobalContext();
	if(!globalContext) {
		onError && onError(null);
		return;
	}
	
	nui.transAjax({
		type: 'POST',
		url: '/poc/WS_vRulesQuery',
		async: false,
		success: function(text, status, response) {
			var obj = nui.decode(text);
			if(obj.success) {
				globalContext[VAL_RULES] = obj.data;
				// nui.setToken(respone.getResponseHeader('_TokenStr'));
				onSuccess && onSuccess(globalContext[VAL_RULES]);
			} else {
				nui.alert('获取加载校验规则失败');
				onError && onError('获取加载校验规则失败');
			}
			
		}
		//,
		//error : function(err) {
		//	nui.alert('加载校验规则信息失败');
		//	onError(err);
		//}
	}, 'WS_vRulesQuery');
};

/**
 * 获取校验规则信息，获取前需要确保在Top中已经调用过loadValidateRules()方法
 */
nui.getValidateRules = function() {
	var globalContext = this.getGlobalContext();
	return globalContext ? globalContext[VAL_RULES] : null;
};

/**
 * 加载当前页面的数据字段定义
 * 同步导致性能问题，异步会导致模型校验失败
 * 如果要达到异步加载数据模型，需要修改NUI源码
 * 
 * 如果异步不修改源码，需要把方案改为全局数据加载数据字段定义，在main.html加载时调用
 */ 
nui.loadDataFields = function() {
	var result;
	var url = window.location.href;
	var index = url.indexOf('?');
	if(index >=0){
		url = url.substring(0, index);
	}
	var json = nui.encode({pageUrl : url});
	nui.transAjax({
		type: 'POST',
		url: '/poc/CH_dataAttrDef',
		data: json,
		async: false,
		success: function(text,status,response) {
			var obj = nui.decode(text);
			if(obj.success) {
				//nui.setToken(respone.getResponseHeader('_TokenStr'));
				result = obj.data;
			} else {
				nui.alert('获取数据字段定义失败');
			}
		}
	}, 'CH_dataAttrDef');
	return result;
};

/**
 * 根据当前登录用户的userId加载（同步方式）已授权的资源列表。<br/>
 * 该方法只需要在Top中调用一次，以后子页面直接通过nui.getAuthResList()方法获取
 * 
 * 
 * 此方法可以修改为异步，如果改为异步，可参考  loadValidateRules方法
 */
nui.loadAuthResList = function() {
	var globalContext = this.getGlobalContext();
	if(!globalContext) {
		return;
	}
	
	var result = null;
	var userId = globalContext[USER_ID];
	var json = nui.encode({userId: userId});
	nui.transAjax({
		type: 'POST',
		url: '/poc/WS_pageResQuery',
		data: json,
		async: false,
		success: function(text,status,response) {
			obj = nui.decode(text);
			if(obj.success) {
				globalContext[AUTH_RES_LIST] = obj.data;
				result = obj.data;
				//nui.setToken(respone.getResponseHeader('_TokenStr'));
			} else {
				nui.alert('获取权限失败');
			}
			
		}
	}, 'WS_pageResQuery');
	return result;
};

/**
 * 根据当前登录用户的userId获取已授权的资源列表，获取前需要确保在Top中已经调用过loadAuthResList()方法
 */
nui.getAuthResList = function() {
	var globalContext = this.getGlobalContext();
	return globalContext ? globalContext[AUTH_RES_LIST] : null;
};

/**
 * 运用模型校验，使用数据字段定义中的校验规则
 * @param dataFields 数据字段定义
 */
nui.applyModelValidation = function(dataFields) {
	if(!dataFields) return;
	
	$('input[modelName]').each(function() {
		var $this = $(this);
		var dataField = dataFields[$this.attr('modelName')];
		if(dataField && dataField.ruleCodeList) {
			$this.attr('vtype', dataField.ruleCodeList);
			
			// 设置错误提示信息（NUI的错误提示属性为xxxErrorText）
			var vtypes = dataField.ruleCodeList.split(";");
			var valRules = nui.getValidateRules();
			if(vtypes && valRules) {
				for (var i = 0, l = vtypes.length; i < l; i++) {
			        var vtype = vtypes[i].trim();
			        var vv = vtype.split(":");
			        var vt = vv[0];
			        
//			        // 处理带参数的情况,从maxLength:20解析出参数'20'
//			        var args = vtype.substr(vt.length+1, 1000); //vv[1];
//			        if (args) args = args.split(",");
//			        else args = [];

			        var vtext = valRules[vtype];
			        if(!vtext) continue;
			        
			        vtext = vtext.replace('%s', dataField.fieldName || '');
			        var vtextAttr = vt + "ErrorText";
			        $this.attr(vtextAttr, vtext);
			    }
			}
		    
		}
	});
};

/**
 * 执行资源权限控制
 * @param authResList 授权资源列表
 */
nui.applyResAuth = function(authResList) {
	if(!authResList) return;
	
	$('*[resId]').each(function() {
		var $this = $(this);
		var res = authResList[$this.attr('resId')];
		if(res) {
			// 根据res.operate设置控件的read、write、disabled属性
			if(res.operate.contains('read')) {
				$this.attr('readonly', 'readonly');
			} else if(res.operate.contains('disabled')) {
				$this.attr('disabled', 'disabled');
			}
		} else {
			// 如果控件resId对应的权限不在authResList中，则删除
			$this.remove();
			//$this.hide(); //用hide()方法对表格(datagrid)列的隐藏无效
		}
	});
};

// 扩展原nui.parse方法，增加模型校验和权限控制的功能
var old_nuiParse = nui.parse;
var isApplied = false; // 是否执行了模型校验和权限控制
nui.parse = function(el) {
	if(!isApplied) {
		// 执行资源权限控制
		if(nui.enableResAuth) {
			var authResList = this.getAuthResList();
			this.applyResAuth(authResList);
		}
		
		// 执行模型校验
		if(nui.enableModelVal) {
			var dataFields = this.loadDataFields();
			this.applyModelValidation(dataFields);
		}
		isApplied = true;
	}
	
	old_nuiParse.call(this, el);
};

/**
 * 获取当前窗口所在的tabId
 */
nui.getOwnTabId = function() {
//	return this.findPropertyValue(window, OWN_TAB_ID);
	
};

/**
 * 获取当前Tab页的数据上下文
 */
nui.getCurrentDataContext = function() {
	var globalCtx = nui.getGlobalContext();
	if(!globalCtx) return null;
	
	var nuiTabs = globalCtx[GLOBAL_TABS];
	var tabId = nuiTabs.getActiveTab()._id;
	
	var tabContext = globalCtx[tabId];
	if(!tabContext) {
		tabContext = globalCtx[tabId] = {};
	}
	
	return tabContext;
};

// 扩展Tabs控件的_initTabs方法，将Tabs对象自身放到globalContext中
var old_initTabs = nui.Tabs.prototype._initTabs;
nui.Tabs.prototype._initTabs = function() {
	old_initTabs.call(this);
	var globalCtx = nui.getGlobalContext();
	if(globalCtx) globalCtx[GLOBAL_TABS] = this;
};

// 扩展removeTab控件方法，在删除tab时清理globalContext中的tab数据上下文对象
var old_removeTab = nui.Tabs.prototype.removeTab;
nui.Tabs.prototype.removeTab = function (tab) {
	if(tab) {
		var globalCtx = nui.getGlobalContext();
		if(globalCtx) delete globalCtx[tab._id];
	}
	old_removeTab.call(this, tab);
};


/**
 * 扩展MessageBox.alert方法
 * message 提示信息
 * title 提示框标题
 * callback 回调函数
 */
nui.alertError = function(message, title, callback){
	return mini.MessageBox.show({
        minWidth: 250,
        title: title || nui.MessageBox.alertTitle,
        buttons: ["ok"],
        message: message,
        iconCls: "mini-messagebox-error",//此处修改了弹出框的提示图标
        callback: callback
    });
};
/**
 * 扩展Alert弹出框，此方法只用于异常信息弹出
 * errorCode 异常代码
 * message 异常描述
 * title 弹出框标题
 * callback 回调函数
 */
nui.showError = function(errorCode,message,title,callback){
	var errorMessage = "<div align=\"left\">&nbsp;&nbsp;&nbsp;&nbsp;错误代码："+errorCode+"</div><div align=\"left\">&nbsp;&nbsp;&nbsp;&nbsp;错误描述："+message+"</div>";
	nui.alertError(errorMessage,title,callback);
};