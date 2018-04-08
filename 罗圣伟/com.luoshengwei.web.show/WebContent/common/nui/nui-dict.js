(function(){
	mini.DictCheckboxGroup=function(){
		mini.DictCheckboxGroup.superclass.constructor.call(this);
	}
	mini.DictRadioGroup=function(){
		mini.DictRadioGroup.superclass.constructor.call(this);
	}
	mini.DictComboBox=function(){
		mini.DictComboBox.superclass.constructor.call(this);
	}
	
	var dictStore={
		map:{},
		loadingMap:{},
		removeEmpty:function(data){
			for(var i=0,len=data.length;i<len;i++){
				if(data[i]&&data[i].__NullItem){
					data.splice(i,1);
				}
			}
		},
		getDictName:function(dictData,dictID){
			var name=[];
			for(var i=0,len=dictData.length;i<len;i++){
				var dict=dictData[i];
				if(nui.fn.contains(dictID,dict.dictID)){
					name.push(dict.dictName);
				}
			}
			return name.join(',');
		},
		ajaxLoad:function(control){
			var data={dictTypeId:control.dictTypeId};
			mini.ajax({
				url:'com.primeton.components.nui.DictLoader.getDictData.biz.ext',
				data:data,
				type:'POST',
				async:false,
				success:function(ret){
					var dictData=ret.dictList;
					dictStore.map[dictTypeId]=dictData;
					
					control._setDictData(dictData);
					
					/*同步请求
					var lm=dictStore.loadingMap[dictTypeId];
					if(lm){
						for(var i=0,len=lm.query.length;i<len;i++){
							lm.query[i]._setDictData(dictData);
						}
						lm.query=[];
					}
					*/
				}
			});
		},
		getDictText:function(dictTypeId,dictKey){
			var data=dictStore.map[dictTypeId];
			if(data){//no map
				return dictStore.getDictName(data,dictKey);
			}
			var dictName='';
			mini.ajax({
				url:'com.primeton.components.nui.DictLoader.getDictData.biz.ext',
				data:{dictTypeId:dictTypeId},
				type:'POST',
				async:false,
				success:function(ret){
					var dictData=ret.dictList;
					dictStore.map[dictTypeId]=dictData;
					
					dictName=dictStore.getDictName(dictData,dictKey);
				}
			});
			
			return dictName;
		},
		loadData:function(){
			var dictTypeId=this.dictTypeId;
			if(!dictTypeId){
				return;
			}
			
			var data=dictStore.map[dictTypeId];
			if(!data){
				mini.ajax({
					url:'com.primeton.components.nui.DictLoader.getDictData.biz.ext',
					data:{dictTypeId:dictTypeId},
					type:'POST',
					async:false,
					success:function(ret){
						var dictData=ret.dictList;
						dictStore.map[dictTypeId]=dictData;
					}
				});
				data=dictStore.map[dictTypeId];
			}
			
			dictStore.removeEmpty(data);
			this._setDictData(data);
			
			
			/* 同步请求
			var lm=dictStore.loadingMap[dictTypeId];
			if(lm){
				switch(lm.status){
					case 'loading':
						lm.query=lm.query||[];
						lm.query.push(this);
						break;
					default:
						//ajaxLoad(this);
						break;
				}
			}else{
				dictStore.loadingMap[dictTypeId]={
					status:'loading',
					query:[this]
				};
				dictStore.ajaxLoad(this.dictTypeId);
			} */
		}
	}
	
	
	mini.getDictText=dictStore.getDictText;
	
	var pp={
		dictTypeId:'',
		textField:'dictName',
		valueField:'dictID',
		_initData:function(){
			dictStore.loadData.call(this);
		},
		_setDictData:function(data){
			this.loadData(data);
			if(this.value){
				this.setValue(this.value);
			}
		}
	};
	pp.uiCls='mini-dictcheckboxgroup';
	jQuery.extend(pp,{
		uiCls:'mini-dictcheckboxgroup',
		set: function(config) {
			mini.DictCheckboxGroup.superclass.set.call(this,config);
			this._initData();
		},
		getAttrs: function (el) {
	        var attrs = mini.DictCheckboxGroup.superclass.getAttrs.call(this, el);
	        var jq = jQuery(el);
	        
	        mini._ParseString(el, attrs,
	            ["dictTypeId"
	             ]
	        );
	        return attrs;
	    }
	});
	mini.extend(mini.DictCheckboxGroup, mini.CheckBoxList, pp);
	
	
	jQuery.extend(pp,{
		uiCls:'mini-dictradiogroup',
		set: function(config) {
			mini.DictRadioGroup.superclass.set.call(this,config);
			this._initData();
		},
		getAttrs: function (el) {
	        var attrs = mini.DictRadioGroup.superclass.getAttrs.call(this, el);
	        var jq = jQuery(el);
	        
	        mini._ParseString(el, attrs,[
				"dictTypeId"
			]);
	        return attrs;
	    }
	});
	mini.extend(mini.DictRadioGroup, mini.RadioButtonList, pp);
	
	//dictcombobox
	jQuery.extend(pp,{
		uiCls:'mini-dictcombobox',
		_afterApply:function(el){
			mini.DictComboBox.superclass._afterApply.call(this,el);
			this._initData();
		},
		getAttrs: function (el) {
	        var attrs = mini.DictComboBox.superclass.getAttrs.call(this, el);
	        var jq = jQuery(el);
	        
	        mini._ParseString(el, attrs,
	            ["dictTypeId"
	             ]
	        );
	        return attrs;
	    },
		_setDictData:function(data){
			this.setValueField(this.valueField);
			this.setTextField(this.textField);
			
			this.setData(data);
			
			if(this.value){
				var v=this.value;
				this.value='';
				this.setValue(v);
			}
		}
	});
	mini.extend(mini.DictComboBox, mini.ComboBox, pp);
	
	
	
	mini.regClass(mini.DictCheckboxGroup, 'dictcheckboxgroup');
	mini.regClass(mini.DictRadioGroup, 'dictradiogroup');
	mini.regClass(mini.DictComboBox, 'dictcombobox');
})(mini);

