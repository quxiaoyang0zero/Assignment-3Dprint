<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="css/core11.css">
<title>Hui--editor</title>

</head>
<body>

<div align="center">

<table border="1" width="815" style="border-width: 0px" height="560">
<tr>
<td style="border-style: none; border-width: medium" height="500" width="809">　
<?php
	session_start();
    header("Content-Type:text/html; charset=utf-8");
	include "conn/conn.php";
	//echo "1111".$_GET['fid'];
	$_SESSION['id']=$_GET['id'];
	$sql = "select * from content where c_id=".$_SESSION['id'];
	$result = mysqli_query($conn, $sql);
	$row = mysqli_fetch_row($result);
		
?>
<section class="container">
<label>标题：</label>
<div id="div0" class="text" style=" width:500px; height:30px; background-color:#FFF;"> <!--可使用 min-height 实现编辑区域自动增加高度-->
        <p><?php echo $row[1]; ?></p>
    </div>
<br style="clear:both;" />
<br style="clear:both;" />
<label>正文：</label>
<div id="editor1"  style="background-color:#FFF; min-height:100px;">
        <p><?php echo $row[2]; ?></p>
    </div>

<br style="clear:both;" />

<br style="clear:both;" />
<div style="width:300px; height:100px;">

<button id="btn1"  style=" margin-left:350px; width:100px;">保存</button>
</div>
    <!-- 注意， 只需要引用 JS，无需引用任何 CSS ！！！-->
    <script type="text/javascript" src="js/wangEditor.min.js"></script>
    <script type="text/javascript">
		var E0 = window.wangEditor
        var editor0 = new E0('#div00', '#div0')  // 两个参数也可以传入 elem 对象，class 选择器
        editor0.create()
	
        var E1 = window.wangEditor
        var editor1 = new E1('#editor1')
        editor1.create()
    
    document.getElementById('btn1').addEventListener('click', function () {
        // 读取 html
		
		var temp0 = editor0.txt.text();
		var temp1 = editor1.txt.html();
	    document.write('<script type="text/javascript" src="js/dis.js" ><\/script>'); 
		document.write("<form id='d' name='dis' method='post' action='editor_ok.php'>");
		document.write("<input id='a' name='a' value='"+temp0+"' />");
		document.write("<input id='b' name='b' value='"+temp1+"' />");

		document.write("<input type='submit' id='m' name='m' value='' />");
		//document.write("<button id='m' >"+mm+"</button>");
		document.write("</form>");
		
		
}, false)

    
    
    </script>

</section>

</td></tr></table>

</div>

<div style="text-align:center;clear:both">
<br style="clear:both;" />
<br style="clear:both;" />
<p></p>
<p><a href="index.php">回到首页</a></p>
</div>
</body>
</html>