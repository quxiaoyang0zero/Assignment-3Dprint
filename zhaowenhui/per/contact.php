<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	error_reporting(0);
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Hui--contact</title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<link href='https://fonts.googleapis.com/css?family=Raleway:400,100,200,300,500,600,700,800,900' rel='stylesheet' type='text/css'>
		<!--[if lte IE 8]><script src="js/html5shiv.js"></script><![endif]
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>-->
        <script src="js/jquery.min.js"></script>
		<script src="js/skel.min.js"></script>
		<script src="js/skel-panels.min.js"></script>
		<script src="js/init.js"></script>
		<noscript>
			<link rel="stylesheet" href="css/skel-noscript.css" />
			<link rel="stylesheet" href="css/style.css" />
			<link rel="stylesheet" href="css/style-desktop.css" />
		</noscript>
	</head>
	<body>

	<div id="header-wrapper">

		<!-- Header -->
			<div id="header">
				<div class="container">
						
					<!-- Logo -->
						<div id="logo">
							<h1><a href="login.php">Hui</a></h1>
                            <?php    if($_SESSION['u_id']!=""){
			echo "<h4 style='font-size:8px;'><a href='logout.php'>[logout]</a></h4>";  
  	}	
      ?>
						</div>
					
					<!-- Nav -->
						<nav id="nav">
							<ul>
								<li><a href="index.php">Homepage</a></li>
								<li><a href="content.php">Content</a></li>
								<li class="active"><a href="contact.php">Contact</a></li>
								<li><a href="about.php">About</a></li>
							</ul>
						</nav>
	
				</div>
			</div>
		<!-- Header -->

		<!-- Banner -->
			<div id="banner">
				<div class="container">
				</div>
			</div>
		<!-- /Banner -->

	</div>

	<!-- Main -->
		<div id="main">
			<div class="container">
				<div class="row">
		
					<div class="9u skel-cell-important" style="margin-left:300px;">
						<?php 
 $Page_size=10;
 $sql = "select * from contact";
 $result = mysqli_query($conn, $sql);
 $count = mysqli_num_rows($result);
 $page_count  = ceil($count/$Page_size);

 $init = 1;
 $page_len = 7;
 $max_p = $page_count;
 $pages = $page_count;

 //判断当前页码
 if(empty($_GET['page'])||$_GET['page']<0){
 	$page=1;
 }else {
	$page=$_GET['page'];
}

 $offset=$Page_size*($page-1);
 $sql1="select * from contact order by cc_id desc limit $offset,$Page_size";
 $result1=mysqli_query($conn, $sql1);
 while ($row1=mysqli_fetch_array($result1)) {
	 //echo $row1[3];
?>

		<ul>
        
        	<li style="text-align:left;">标题：<?php echo $row1[3];  ?></li>
            <li style="text-align:left;">发布人：<?php echo $row1[1]."&nbsp;&nbsp;&nbsp;(".$row1[2].")"; ?></li>
            <li style="text-align:left;">发布时间：<?php echo $row1[5]; ?></li>
			<li style="word-wrap: break-word;word-break:break-all; text-align:left;"> <?php echo $row1[4]; ?></li>
			<li><?php echo "<a href='reply.php?cid=".$row1[0]."'>评论</a>"; ?></li>
            <li>--------------------------------------------------------------------------------------------</li>
		</ul>

<?php
}
 $page_len = ($page_len%2)?$page_len:$pagelen+1;//页码个数
 $pageoffset = ($page_len-1)/2;//页码个数左右偏移量

 $key='<div class="page">';
 $key.="<span>$page/$pages</span>&nbsp;";			//第几页,共几页
 if($page!=1){
	$key.="<a href=\"".$_SERVER['PHP_SELF']."?page=1\">第一页</a> ";				//第一页
	$key.="<a href=\"".$_SERVER['PHP_SELF']."?page=".($page-1)."\">上一页</a>";	//上一页
}else {
	$key.="第一页 ";//第一页
	$key.="上一页";	//上一页
}

 if($pages>$page_len){
	//如果当前页小于等于左偏移
	if($page<=$pageoffset){
	$init=1;
	$max_p = $page_len;
	}else{//如果当前页大于左偏移
	//如果当前页码右偏移超出最大分页数
	if($page+$pageoffset>=$pages+1){
	$init = $pages-$page_len+1;
	}else{
	//左右偏移都存在时的计算
	$init = $page-$pageoffset;
	$max_p = $page+$pageoffset;
	}
	}
 	}
 	for($i=$init;$i<=$max_p;$i++){
	if($i==$page){
	$key.=' <span>'.$i.'</span>';
	} else {
	$key.=" <a href=\"".$_SERVER['PHP_SELF']."?page=".$i."\">".$i."</a>";
	}
 	}

 	if($page!=$pages){
	$key.=" <a href=\"".$_SERVER['PHP_SELF']."?page=".($page+1)."\">下一页</a> ";//下一页
	$key.="<a href=\"".$_SERVER['PHP_SELF']."?page={$pages}\">最后一页</a>";	//最后一页
	}else {
	$key.="下一页 ";//下一页
	$key.="最后一页";	//最后一页
	}
	$key.='</div>';
?>

					</div>
					
				
				</div>
			</div>
            <br><br>
<div style="margin:0px auto; text-align:center; font-size:24px;  font-weight:bold;">留言</div>
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
<label style="margin-left:300px;">标题：</label>
<div id="div2" class="text" style=" width:500px; height:33px; background-color:#CCC; margin-left:300px;">
</div>

<br><br>
<div id="div3" style="margin:0px auto; width:800px;   background-color:#FFF; ">
    <p>请输入内容</p>
</div>
<br><br>

<div style="width:300px; height:100px; margin-left:600px;">

<button id="btn1"  style=" margin-left:30px; width:100px;">留言</button>
</div>

<script type="text/javascript" src="js/wangEditor.min.js"></script>
<script type="text/javascript">
        var E0 = window.wangEditor
        var editor0 = new E0('#div00', '#div0')
        editor0.create()
		
		var E1 = window.wangEditor
        var editor1 = new E1('#div00', '#div1')
        editor1.create()
		
		var E2 = window.wangEditor
        var editor2 = new E2('#div00', '#div2')
        editor2.create()
		
    	var E = window.wangEditor
   		var editor = new E('#div3')
    	editor.create()

	document.getElementById('btn1').addEventListener('click', function () {
        // 读取 html
		
		var temp0 = editor0.txt.text();
		var temp1 = editor1.txt.text();
		var temp2 = editor2.txt.text();
		var temp = editor.txt.html();
		//var mm = '1';			
	    document.write('<script type="text/javascript" src="js/dis.js" ><\/script>'); 
		document.write("<form id='d' name='dis' method='post' action='contact_ok.php'>");
		document.write("<input id='n' name='n' value='"+temp0+"' />");
		document.write("<input id='s' name='s' value='"+temp1+"' />");
		document.write("<input id='p' name='p' value='"+temp2+"' />");
        document.write("<input id='t' name='t' value='"+temp+"' />");
		document.write("<input type='submit' id='m' name='m' value='' />");
		//document.write("<button id='m' >"+mm+"</button>");
		document.write("</form>");	
}, false)
</script>

<br><br>
		</div>
	<!-- Main -->

	<!-- Copyright -->
		<div id="copyright">
			<div class="container">
				copyright2018-2019
			</div>
		</div>


	</body>
</html>