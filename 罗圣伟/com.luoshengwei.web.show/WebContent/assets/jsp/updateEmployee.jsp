<%@page import="com.luoshengwei.common.core.constant.SystemConstants"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script src="<%=request.getContextPath()%>/common/nui/nui.js"
	type="text/javascript"></script>
<script src="<%=request.getContextPath()%>/common/nui/nui-debug.js"
	type="text/javascript"></script>
<script src="<%=request.getContextPath()%>/common/json.js"
	type="text/javascript"></script>


<title>新增员工</title>
</head>
	<body>
		<form id="form_search" method="post">
			<input type="hidden" name="id" id="id"
				value="<%=request.getParameter("employeeId")%>" />
			<div style="padding-left: 11px; padding-bottom: 5px;">
				<table style="table-layout: fixed;">
					<tr>
						<td><label for="name$text">员工姓名：</label></td>
						<td><input name="name" errorMode="none"
						value="<%=request.getParameter("employeeName")%>"
							onvalidation="onNameValidation" class="mini-textbox"
							required="true" requiredErrorText="员工姓名不能为空" /></td>
						<td id="name_error" class="errorText"></td>
					</tr>
					<tr>
						<td><label for="code$text">员工编号：</label></td>
						<td><input name="code" errorMode="none"
							value="<%=request.getParameter("employeeCode")%>"
							onvalidation="onCodeValidation" class="mini-textbox"
							class="mini-textbox" required="true" requiredErrorText="员工编号不能为空" />
						<td id="code_error" class="errorText"></td>
					</tr>
				<tr>
					<td>性别：</td>
					<td><select id="employeeSex" name="sex"
						style="width: 90% ；height:                30px;">
							<option value="1">男</option>
							<option value="0">女</option>
					</select></td>
				</tr>
				<tr>
					<td>所在部门：</td>
					<td><select id="employeeDepartment" name="department"
						style="width: 90% ；height:                 30px;">
							<option value="0">研发一部</option>
							<option value="1">商务部</option>
							<option value="2">行政部</option>
					</select></td>
				</tr>
			</table>
			</div>
			<script type="text/javascript">
				nui.parse();
			</script>
		</form>
		<p id="error" class="login-error"
			style="display: inline-block; height: 20px; color: red;">
		</p>
		<p align="center">
			<a class="nui-button" onclick="okPressed"
				style="width: 60px; cursor: pointer; width: 50px; height: 20px; margin-top: -10px; padding: 0; background: #ef4300; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; border: 1px solid #ff730e; -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); font-family: 'PT Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, .1); -o-transition: all .2s; -moz-transition: all .2s; -webkit-transition: all .2s; -ms-transition: all .2s;">确定</a>
			<a onclick="onResetClick" class="nui-button"
				style="width: 60px; cursor: pointer; width: 50px; height: 20px; margin-top: -10px; padding: 0; background: #ef4300; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; border: 1px solid #ff730e; -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); font-family: 'PT Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, .1); -o-transition: all .2s; -moz-transition: all .2s; -webkit-transition: all .2s; -ms-transition: all .2s;">重置</a>
			<a onclick="cancelPressed" class="nui-button"
				style="width: 60px; cursor: pointer; width: 50px; height: 20px; margin-top: -10px; padding: 0; background: #ef4300; -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; border: 1px solid #ff730e; -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); box-shadow: 0 15px 30px 0 rgba(255, 255, 255, .25) inset, 0 2px 7px 0 rgba(0, 0, 0, .2); font-family: 'PT Sans', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, .1); -o-transition: all .2s; -moz-transition: all .2s; -webkit-transition: all .2s; -ms-transition: all .2s;">取消</a>
		</p>
	</body>


	<style type="text/css">
		html,body {
			margin: 0;
			padding: 0;
			border: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
	</style>

	<script type="text/javascript">
		$.fn.serializeObject = function() {
			var o = {};
			var a = this.serializeArray();
			$.each(a, function() {
				if (o[this.name]) {
					if (!o[this.name].push) {
						o[this.name] = [ o[this.name] ];
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
		
		//回显性别
		var brand="<%=request.getParameter("employeeSex")%>";//这里后台传到页面的值
		 if(brand!=""){
			 var s = document.getElementById("employeeSex"); //获取select对象
	         var ops = s.options;  
	         for(var i=0;i<ops.length; i++){  
	             var tempValue = ops[i].value; 
	             if(tempValue == brand)
	             {  
		             ops[i].selected = true;  //如果后台的值与下拉列表的某一个value相等，就设置此项为选中项
	                 break;  
	             }  
	         }   
		 }
		
		//回显部门
		 var brand="<%=request.getParameter("employeeDepartment")%>";//这里后台传到页面的值
		if (brand != "") {
			var s = document.getElementById("employeeDepartment"); //获取select对象
			var ops = s.options;
			for ( var i = 0; i < ops.length; i++) {
				var tempValue = ops[i].value;
				if (tempValue == brand) {
					ops[i].selected = true; //如果后台的值与下拉列表的某一个value相等，就设置此项为选中项
					break;
				}
			}
		}

		//确定
		function okPressed() {
			form.validate();
			if (form.isValid() == false) {
				return;
			}
			var data = $("#form_search").serializeObject(); //获取表单多个控件的数据
			var json = nui.encode(data); //序列化成JSON
			nui.ajax({
				url : "./updateEmployee.action",
				data : {
					data : json
				},
				type : 'POST',
				success : function(text) {
					var check = nui.decode(text);
					if (check == '1') {
						alert("修改成功！");
						window.CloseOwnerWindow();
					} else if (check == '0') {
						alert("员工编号已存在，请重新输入。");
					}
				}
			});
		}
	
		//重置
		function onResetClick(e) {
			var form = new nui.Form("#form_search");
			form.clear();
			$("#employeeSex").val("1");
			$("#employeeDepartment").val("0");
		}
	
		//取消
		function cancelPressed() {
			window.CloseOwnerWindow();
		}
	
		function updateError(e) {
			var id = e.sender.name + "_error";
			var el = document.getElementById(id);
			if (el) {
				el.innerHTML = e.errorText;
			}
		}
		
		function onNameValidation(e) {
			updateError(e);
		}
		
		function onCodeValidation(e) {
			updateError(e);
		}
	</script>
</html>
