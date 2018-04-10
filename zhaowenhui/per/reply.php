<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	error_reporting(0);
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Hui--reply</title>
<link href="css/styles.css" rel="stylesheet" type="text/css" />
</head>
<body>
<?php
$_SESSION['cid']=$_GET['cid'];
//echo $_SESSION['rid'];
//Session_Register("Name");
$sql = "select * from contact where cc_id=".$_SESSION['cid'];
$result = mysqli_query($conn, $sql);
$row = mysqli_fetch_row($result);
//echo $_GET['id'];
?>
<!-- begin #container -->
<div id="container">
	<!-- begin #header -->

    	
        <div class="clearfloat"></div>
        
       <br><br>
 

    <div id="mainContent">
    	<p>
        	<b><?php echo $row[3]; ?></b>
            <br /><br />
            <?php echo $row[1]; ?>&nbsp;&nbsp;&nbsp;&nbsp;
            <?php
			if($row[7] == 0){
			echo "(".$row[2].")";
			}else{
				echo "author";	
			}
			?><br>
            <?php echo $row[5]; ?><br>
            <?php echo $row[4]; ?><br>
            <?php
				if($_SESSION['u_id']!=""){
			echo "<a href='delete_cta.php'>删除</a>";		
				}
			?>
        </p>
<?php 
$sql2 = "select * from reply where r_cid=".$row[0];
$result2 = mysqli_query($conn, $sql2);
while($row2 = mysqli_fetch_array($result2)){
	
?>
        <div class="horSeparator"></div>
        <p>
        	<?php echo $row2[2] ?>&nbsp;&nbsp;&nbsp;&nbsp;
            <?php
			if($row2[6] == 0){
				echo "(";
				echo $row2[3];
				echo ")";
			}else {
				echo "(author)";	
			}
			?>
        </p>
        <p>
        	<?php echo $row2[5] ?>
        </p>
        <p>
        	<?php echo $row2[4] ?>
            <?php
				if($_SESSION['u_id']!=""){
			echo "<a href='delete_re.php?rid=".$row2[0]."'>删除评论</a>";		
				}
			?>
        </p>
        <?php
}
?>
    </div>
    <!-- end #mainContent -->
    <!-- This clearing element should immediately follow the #mainContent div in order to force the #container div to contain all child floats --><br class="clearfloat" />
</div>
<!-- end #container -->

<br><br>
<div style="margin:0px auto; text-align:center; font-size:24px;  font-weight:bold;">评论</div>
<label style="margin-left:300px;">昵称：</label>
<div id="div0" class="text" style=" width:500px; height:33px; background-color:#CCC; margin-left:300px;">
<?php
if($_SESSION['u_id']!=""){
	echo "<p>";
	echo $_SESSION['u_name'];
	echo "</p>";
}
?>
</div>
<br><br>
<label style="margin-left:300px;">邮箱：</label>
<div id="div1" class="text" style=" width:500px; height:33px; background-color:#CCC; margin-left:300px;">
<?php
if($_SESSION['u_id']!=""){
	echo "<p>";
	echo "author";
	echo "</p>";
}
?>
</div>
<br><br>
<div id="div3" style="margin:0px auto; width:800px;   background-color:#FFF; ">
    <p>请输入内容</p>
</div>
<br><br>

<div style="width:300px; height:100px; margin-left:600px;">

<button id="btn1"  style=" margin-left:30px; width:100px;">评论</button>
</div>

<script type="text/javascript" src="js/wangEditor.min.js"></script>
<script type="text/javascript">
        var E0 = window.wangEditor
        var editor0 = new E0('#div00', '#div0')
        editor0.create()
		
		var E1 = window.wangEditor
        var editor1 = new E1('#div00', '#div1')
        editor1.create()
		
    	var E = window.wangEditor
   		var editor = new E('#div3')
    	editor.create()

	document.getElementById('btn1').addEventListener('click', function () {
        // 读取 html
		
		var temp0 = editor0.txt.text();
		var temp1 = editor1.txt.text();
		var temp = editor.txt.html();
		//var mm = '1';			
	    document.write('<script type="text/javascript" src="js/dis.js" ><\/script>'); 
		document.write("<form id='d' name='dis' method='post' action='reply_ok.php'>");
		document.write("<input id='n' name='n' value='"+temp0+"' />");
		document.write("<input id='s' name='s' value='"+temp1+"' />");
        document.write("<input id='t' name='t' value='"+temp+"' />");
		document.write("<input type='submit' id='m' name='m' value='' />");
		//document.write("<button id='m' >"+mm+"</button>");
		document.write("</form>");	
}, false)
</script>

<div style="width:100px; font-size:18px; margin:auto;"><a href="index.php">回到首页</a></div> 
</body>
</html>