<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css"
	href="<%=request.getContextPath()%>/css/trade.css" />
<script src="assets/js/love.js"></script>
<script src="<%=request.getContextPath()%>/common/nui/nui.js"
	type="text/javascript"></script>
<script src="<%=request.getContextPath()%>/common/nui/nui-debug.js"
	type="text/javascript"></script>

<title>员工信息查询系统</title>
</head>
<body>
	<div class="mini-panel" title="员工列表"
		style="width: 100%; height: 600px;">
		<div id="div_Search" style="width: 100%; margin: 2px">
			<form id="form_search">
				<table style="width: 100%;">
					<tr>
						<td style="width: 60px;">员工姓名：</td>
						<td style="width: 15%; text-align: center;"><input
							id="employeeName" name="employeeName" style="width: 90%"
							class="mini-textbox" /></td>

						<td style="width: 60px;">员工编号：</td>
						<td style="width: 15%; text-align: center;"><input
							id="employeeCode" name="employeeCode" style="width: 90%"
							class="mini-textbox" /></td>


						<td style="width: 40px;">性别：</td>
						<td style="width: 8%; text-align: left;"><select
							id="employeeSex" name="employeeSex"
							style="width: 90% ；height:     30px;">
								<option value="">全部</option>
								<option value="1">男</option>
								<option value="0">女</option>
						</select></td>

						<td style="width: 60px;">所在部门：</td>
						<td style="width: 86px; text-align: left;"><select
							id="employeeDepartment" name="employeeDepartment"
							style="width: 90%">
								<option value="">全部</option>
								<option value="0">研发一部</option>
								<option value="1">商务部</option>
								<option value="2">行政部</option>
						</select></td>

						<td style="white-space: nowrap; width: 100px; text-align: left;"><a
							class="mini-button" onclick="queryEmployeeData()"
							style="width: 60px; cursor: pointer; width: 50px; height: 20px; margin-top: -2px; padding: 0; background: #236B8E; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; border: 1px solid #236B8E; -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); font-family: 'PT Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, .1); -o-transition: all .2s; -moz-transition: all .2s; -webkit-transition: all .2s; -ms-transition: all .2s;">查询</a>

						<td style="white-space: nowrap; text-align: left;"><a
							class="mini-button" onclick="refrash()" style="width: 60px; cursor: pointer; width: 50px; height: 20px; margin-top: -2px; padding: 0; background: #236B8E; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; border: 1px solid #236B8E; -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); font-family: 'PT Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, .1); -o-transition: all .2s; -moz-transition: all .2s; -webkit-transition: all .2s; -ms-transition: all .2s;">重置</a></td>
					</tr>
				</table>
			</form>
		</div>

		<div style="width: 100%;">
			<div class="mini-toolbar" style="border-bottom: 0; padding: 0px;">
				<table style="width: 100%;">
					<tr>
						<td style="width: 100%;"><a class="mini-button"
							iconCls="icon-add" onclick="add()">增加</a> <a class="mini-button"
							iconCls="icon-edit" onclick="edit()">编辑</a> <a
							class="mini-button" iconCls="icon-remove" onclick="remove()">删除</a>
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div id="employeeList_datagrid" class="mini-datagrid"
			style="width: 100%; height: 500px;"
			url="<%=request.getContextPath()%>/employee/queryEmployee.action"
			idField="id" allowResize="true" multiSelect="true"
			sizeList="[20,30,50,100]" pageSize="20">
			<div property="columns">
				<div type="checkcolumn"></div>
				<div type="indexcolumn" headerAlign="center">序号</div>
				<div field="name" width="400" headerAlign="center" align="center">员工姓名</div>
				<div field="code" width="400" headerAlign="center" align="center">员工编号</div>
				<div field="sex" renderer="onEmployeeSexRenderer" width="200"
					headerAlign="center" align="center">员工性别</div>
				<div field="department" renderer="onEmployeeDepartmentRenderer"
					width="200" headerAlign="center" align="center">所在部门</div>
			</div>
		</div>
	</div>
	<script type="text/javascript">
		var EmployeeSexFlag = [ {
			id : '1',
			text : '男'
		}, {
			id : '0',
			text : "女"
		}, {
			id : "",
			text : "未知"
		} ];

		var EmployeeDepartmentFlag = [ {
			id : "0",
			text : "研发一部"
		}, {
			id : "1",
			text : "商务部"
		}, {
			id : "2",
			text : "行政部"
		}, {
			id : "",
			text : "未知"
		} ];
		function onEmployeeSexRenderer(e) {
			if (e.value == null || e.value == '') {
				return "未知";
			}
			for ( var i = 0, l = EmployeeSexFlag.length; i < l; i++) {
				var x = EmployeeSexFlag[i];
				if (x.id == e.value)
					return x.text;
			}
			return e.value;
		}
		function onEmployeeDepartmentRenderer(e) {
			if (e.value == null || e.value == '') {
				return "未知";
			}
			for ( var i = 0, l = EmployeeDepartmentFlag.length; i < l; i++) {
				var x = EmployeeDepartmentFlag[i];
				if (x.id == e.value)
					return x.text;
			}
			return e.value;
		}
	</script>
	<div style="text-align:center">
		<p>
			Copyright 2017-2018© 罗圣伟版权所有
			本站已稳定运行：<SPAN id=span_dt_dt style="color: #238E68; text-align: center;"></SPAN>
		</p>
		<script language=javascript>
					function show_date_time(){
						window.setTimeout("show_date_time()", 1000);
						BirthDay = new Date("4/1/2018 10:00:00");
						today = new Date();
						timeold = (today.getTime()-BirthDay.getTime());
						sectimeold = timeold/1000;
						secondsold = Math.floor(sectimeold);
						msPerDay = 24*60*60*1000;
						e_daysold = timeold/msPerDay;
						daysold = Math.floor(e_daysold);
						e_hrsold = (e_daysold-daysold)*24;
						hrsold = Math.floor(e_hrsold);
						e_minsold = (e_hrsold-hrsold)*60;
						minsold = Math.floor((e_hrsold-hrsold)*60);
						seconds = Math.floor((e_minsold-minsold)*60);
						span_dt_dt.innerHTML = ""+daysold + "天" + hrsold + "小时" + minsold + "分"+seconds+"秒";
					}
				show_date_time();
		</script>
		<p>Spring + SpringMVC + Mybatis + JSP + HTML +CSS +JS 小试牛刀。</p>
<p>作者：<a href="http://www.sdu.edu.cn/" target="_blank">罗圣伟</a></p>
	</div>
</body>

<script type="text/javascript">
 	 $.fn.serializeObject = function () {  
           var o = {};  
           var a = this.serializeArray();  
           $.each(a, function () {  
               if (o[this.name]) {  
                   if (!o[this.name].push) {  
                       o[this.name] = [o[this.name]];  
                   }  
                   o[this.name].push(this.value || '');  
               } else {  
                   o[this.name] = this.value || '';  
               }  
           });  
           return o;  
       };
     
		nui.parse();
		var form = new nui.Form("#form_search");
		var formData = $("#form_search").serializeObject();
		var grid = mini.get("employeeList_datagrid");
		grid.load(formData);
	
		//新建
		function add() {
			mini
					.open({
						targetWindow : window,
						allowResize : true,
						url : "<%=request.getContextPath()%>/employee/addEmployeeDialog.action",
	                 title: "新增员工", width: 330, height: 220,
	                 ondestroy: function (action) {
	                	 var grid = mini.get("employeeList_datagrid");
		                	 var formData = $("#form_search").serializeObject();  
		                	 grid.load(formData);
	                 }
	             });
	  		}
	  		
  		//编辑
  		function edit(){
  			var grid = mini.get("employeeList_datagrid");
  			var rows = grid.getSelecteds();
  			if(rows){
  				if(rows.length != 1){
  					alert("请选中一条记录");
  					return  ;
  				}
  				var row = rows[0];
	  			var employeeId = row.id;
	  			var employeeName = row.name;
	  			var employeeCode = row.code;
	  			var employeeSex = row.sex;
	  			var employeeDepartment = row.department;
	  			 mini.open({
	                 targetWindow: window,
	                 url: "<%=request.getContextPath()%>/employee/updateEmployeeDialog.action?employeeId="
								+ employeeId
								+ "&employeeName="
								+ employeeName
								+ "&employeeCode="
								+ employeeCode
								+ "&employeeSex="
								+ employeeSex
								+ "&employeeDepartment=" + employeeDepartment,
						title : "编辑员工",
						width : 330,
						height : 220,
						ondestroy : function(action) {
							var grid = mini.get("employeeList_datagrid");
							var formData = $("#form_search").serializeObject();
							grid.load(formData);
						}
					});
			} else {
				alert("请选择所要编辑的记录！");
			}
		}

		//删除
		function remove() {
			var grid = mini.get("employeeList_datagrid");
			var rows = grid.getSelecteds();
			if (rows) {
				if(rows.length == 0){
					alert("请选择所要删除的记录！");
					return;
				}
				if (confirm("确定删除选中记录？")) {
					console.info(rows);
					var employeeIds = "";
					$.each(rows, function(index, row) {
						employeeIds = employeeIds + row.id + ",";
					});
	
					$.ajax({
						url : "<%=request.getContextPath()%>/employee/deleteEmployee.action",
							data : {
								"employeeIds" : employeeIds
							},
							contentType : "application/x-www-form-urlencoded; charset=utf-8",
							type : "POST",
							success : function(result) {
								if (result == "success") {
									alert("删除成功！");
									var grid = mini
											.get("employeeList_datagrid");
									var formData = $("#form_search")
											.serializeObject();
									grid.load(formData);
								} else {
									alert("删除失败！");
								}
							}
						});
			}
		}
	}

	//查询
	function queryEmployeeData() {
		var formData = $("#form_search").serializeObject();
		var grid = mini.get("employeeList_datagrid");
		grid.load(formData);
	}

	//重置
	function refrash() {
		nui.get("employeeName").setValue("");
		nui.get("employeeCode").setValue("");
		$("#employeeSex").val("");
		$("#employeeDepartment").val("");
		var formData = $("#form_search").serializeObject();
		var grid = mini.get("employeeList_datagrid");
		grid.load(formData);
	}
</script>
</html>