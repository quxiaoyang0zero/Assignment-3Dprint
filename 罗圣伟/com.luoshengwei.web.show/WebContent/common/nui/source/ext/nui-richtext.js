mini.Richtext = function () {
	mini.Richtext.superclass.constructor.call(this);

}
mini.extend(mini.Richtext, mini.Control, {
	width: "100%",
	height: 300,
	uiCls: 'mini-richtext',
	_create: function () {
		this.el = document.createElement('div');
		this.el.innerHTML = '<textarea style="display:none"></textarea>';
		this._fromEditor = this.el.firstChild;
		this._editor = new mini.TextArea();
		this._editor.setVisible(false);
		this._editor.render(this.el);
		
		var _this=this;
		mini.loadRes('ckeditor',function(){
			_this._initEditor();
		});
		
		//this._initEditor();
	},
	render: function(p) {
		mini.Richtext.superclass.constructor.call(this, p);
		
		/*
		loadJS('',function(){
			this._initEditor();
		});
		*/
	},
	_initEditor: function() {
		var me = this;
        setTimeout(function () {
            me._doInitEditor();
        }, 1);
      
	},
	_doInitEditor: function () {
        if (this.isRender() == false) return;
        if (this.editor) return;
        var me = this;
        this._editor.set({
        	name: me.name,
        	id: me.id + "_editor"
        });
        this._fromEditor.id = this.id + "_fromEditor";
		this.editor = CKEDITOR.replace(me._fromEditor.id, {
			width:  me.width.replace("px", ""),
			height: me.height.replace("px", "")-100,
			readOnly: me.readOnly
		});
		this.editor.isReady = false;
		this.editor.on("instanceReady", function(e) {
			e.editor.resize(e.editor.config.width, me.height.replace("px", ""));
			e.editor.isReady = true;
        	me.setValue(me.value);
        	me.fire("initeditor");
		});
		this.editor.on("resize", function(e) {
			var height = e.editor.container.$.clientHeight;
			mini.Richtext.superclass.setHeight.call(me, height);
		});
    },
	setValue: function(value) {
		if (this.editor && this.editor.isReady) {
            this.editor.setData(value);
            this._editor.setValue(value);
        } else {
            this.value = value;
        }
	},
	getValue: function() {
		if (this.editor) return this.editor.getData();
        return this.value;
	},
	setSubmitData: function() {
		if (this._editor){
			this._editor.setValue(this.getValue());
		}
	},
	getSubmitData: function() {
		if(this._editor) return this._editor.getValue();
		return this.getValue();
	},
	setWidth: function (value) {
	    mini.Richtext.superclass.setWidth.call(this, value);
	    if (this.editor){
	    	this.editor.resize(value,this.getHeight());
	    }     
	},
	setHeight: function (value) {
	    mini.Richtext.superclass.setHeight.call(this, value);
        if (this.editor){
       		this.editor.resize(this.getWidth(),value);
       	}
	},
	setReadOnly: function(val) {
	    if (this.editor) {
	        this.editor.setReadOnly(val);
	        this.readOnly = val;
	    } else {
	        this.readOnly = val;
	    }
	},
	getReadOnly: function () {
	    if (this.editor) return this.editor.readOnly;
	    return this.readOnly;
	}
});
mini.regClass(mini.Richtext, 'richtext');