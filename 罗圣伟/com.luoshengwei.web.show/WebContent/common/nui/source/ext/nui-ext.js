(function(nui){//
	nui.getClassByUICls = function (uiCls) {
	    uiCls = uiCls.toLowerCase();
	    var clazz = this.uiClasses[uiCls];
	    if(!clazz){
	        uiCls = uiCls.replace("nui-", "mini-");
	        clazz = this.uiClasses[uiCls];
	    }
	    return clazz
	}
	
	//DatePicker
	nui.DatePicker.prototype.valueFormat = "yyyy-MM-dd HH:mm:ss";
	
	//Ajax：普元使用时，取消注释
	nui.ajax = function (options) {
		var url=options.url;
		//目前只支持逻辑流的默认设定
		if(url&&url.length>4&&url.lastIndexOf('.ext')==url.length-4){
		    if (!options.dataType) {
		        options.dataType = "json";
		
		    }
		    if (!options.contentType) {
		        options.contentType = "application/json; charset=UTF-8";
		    }
		
		    if (options.data && mini.isNull(options.data.pageIndex) == false) {
		        var page = options.data.page = {};
		        
		        page.begin = options.data.pageIndex*options.data.pageSize;
		        page.length = options.data.pageSize;
		
		        //delete options.data.pageIndex;
		        //delete options.data.pageSize;
		    }
		    
		
		    if (options.dataType == "json"&&typeof(options.data)=='object') {
		        options.data = mini.encode(options.data);
		        if(options.data=='{}'){
		        	delete options.data;
		        }
		    	options.type='POST';
		    }
		}
		/*
		options.__onsucc=options.success;
		options.success=function(ret){
			this.__onsucc(ret);
		}
		*/
	
	    return window.jQuery.ajax(options);
	}
	
// })(mini);


//常用方法集合
// (function(nui){//	
	nui.fn={
		contains:function(s,c){
			return (','+s+',').indexOf(','+c+',')!=-1;
		},
		endWidth:function(s,c){
			if(s.length<c.length){
				return false;
			}
			return s.substr(s.length-c.length)===c;
		},
		startWidth:function(s,c){
			return s.substr(0,c.length)===c;
		}
	}
// })(mini);

//Res资源管理
// (function(nui){//	
	var $=jQuery;
	var nuiRes={
		map:{},
		loaded:{},
		timeSeed:true,
		path:'',
		isAbsolutePath:function(path){
			return nui.fn.startWidth(path,'http')||nui.fn.startWidth(path,'/');
		},
		getJSPath:function(js){
			var scripts=document.scripts;
			
			for(var i=0,len=scripts.length;i<len;i++){
				var src=scripts[i].src;
				src=src.split('?')[0];
				
				var ret=nui.fn.endWidth(src,js);
				
				if(ret){
					return src.substr(0,src.lastIndexOf('/'))+'/';
				}
			}
			return '';
		},
		hasLoaded:function(src){
			return this.loaded[src];
		},
		getLoadInfo:function(src){
			return this.loaded[src];
		},
		loadCSS:function(href){
			if(!$.isArray(href)){
				href=[href];
			}
			
			for(var i=0,len=href.length;i<len;i++){
				this.loadCSS(href[i]);
			}
		},
		loadJS:function(src,cb,order){
			if(!$.isArray(src)){
				src=[src];
			}
			var len=src.length;
			var cindex=0;
			
			if(order){//顺序加载
				var _load=function(i,cb){
					nuiRes._loadJS(src[i],function(){
						i++;
						if(i<len){
							_load(i,cb);
						}else{
							cb();
						}
					});
				}
				_load(0,cb);
			}else{//无顺序加载
				for(var i=0;i<len;i++){
					nuiRes._loadJS(src[i],function(){
						cindex++;
						if(cindex==len){
							cb();
						}
					});
				}
			}
		},
		_loadCSS:function(href,doc){
			if(this.getLoadInfo(href)){
				return;
			}
			doc=doc||document;
			var l=doc.createElement('link');
			l.type='text/css';
			if(NUI.timeSeed){
				l.href=href+'?'+(new Date());
			}else{
				l.href=href;
			}
			l.rel='stylesheet';
			doc.getElementsByTagName('head')[0].appendChild(l);
			this.loaded[href]=true;
			return l;
		},
		_loadJS:function(src,cb,doc){
			cb=cb||function(){};
			//拼凑成绝对路径
			if(!nuiRes.isAbsolutePath(src)){
				src=nuiRes.path+src;
			}
			
			var loadInfo=this.getLoadInfo(src);
			
			if(loadInfo){
				switch(loadInfo.status){
					case 'loading':
						loadInfo.handler.push(cb);
						break;
					case 'loaded':
						cb();
						break;
				}
				return;
			}else{
				this.loaded[src]={
					status:'loading',
					handler:[cb]
				};
			}
			doc=doc||document;		
			var s=doc.createElement('script');
			s.type='text/javascript';
			
			if(this.timeSeed){
				s.src=src+'?'+(new Date());
			}else{
				s.src=src;
			}
			s.onreadystatechange=s.onload=function(){//加载成功
				if(!this.readyState||(this.readyState=='complete'||this.readyState=='loaded')){
					nuiRes.loaded[src]=nuiRes.loaded[src]||{}
					nuiRes.loaded[src].status='loaded';
					var cbs=nuiRes.loaded[src].handler;
					for(var i=0,len=cbs.length;i<len;i++){
						var c=cbs[i];
						if(c&&typeof(c)=='function'){
							c();
						}
					}
				}
			};
			doc.getElementsByTagName('head')[0].appendChild(s);
			
			return s;
		}
	};
	nuiRes.path=nuiRes.getJSPath('nui.js');
	
	nui.res={
		hasLoaded:function(src){
			return nuiRes.loaded[src];
		},
		/**
		*@desc 添加资源
		*@param key 资源主键
		*@param data 资源内容
		*	{
				js:[],//JS资源
				css:[],//CSS资源
				order:true,//JS是否按照顺序加载
				required:''//依赖的资源名称,用,号分隔			****尚未实现
			}
		*
		*
		*/
		add:function(key,data){
			data=data||{};
			data.js=data.js||[];
			data.css=data.css||[];
			data.order=data.order||false;
			
			nuiRes.map[key]=data;
		},
		remove:function(key){
			delete nuiRes.map[key];
		},
		get:function(key){
			return nuiRes.map[key];
		},
		load:function(key,cb){
			var res=this.get(key);
			if(!res){
				cb();
				return;
			}
			nuiRes.loadCSS(res.css);
			nuiRes.loadJS(res.js,cb,res.order);
		}
	};
	
	nui.loadRes=function(key,cb){
		nui.res.load(key,cb);
	};
	
	//ckeditor
	nui.res.add('ckeditor',{
		js:[
			'resource/ckeditor/ckeditor.js'
		]
	});
	
	//swfupload
	nui.res.add('swfupload',{
	
	});
	
	window['nui']=nui;
})(mini);