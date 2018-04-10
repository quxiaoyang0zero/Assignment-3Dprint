<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	error_reporting(0);
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Hui--content</title>
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
								<li class="active"><a href="content.php">Content</a></li>
								<li><a href="contact.php">Contact</a></li>
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
		
					<div class="9u skel-cell-important">
						<section>
  <?php 
  if($_GET['ctype']==1){
	  $sql="select * from content where c_type=1";
  $result=mysqli_query($conn, $sql);
  echo "<header>";
  echo "<h2>Chatting</h2>";
  echo "</header>";
  while ($row=mysqli_fetch_array($result)) {
				echo "<li><a href='content.php?id=".$row[0]."' target='_parent'>".$row[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row[4].")</a></li>";
	}
  }else if($_GET['ctype']==2){
	  $sql="select * from content where c_type=2";
  $result=mysqli_query($conn, $sql);
  echo "<header>";
  echo "<h2>Experience</h2>";
  echo "</header>";
  while ($row=mysqli_fetch_array($result)) {
				echo "<li><a href='content.php?id=".$row[0]."' target='_parent'>".$row[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row[4].")</a></li>";
	}
  }else if($_GET['ctype']==3){
	  $sql="select * from content where c_type=3";
  $result=mysqli_query($conn, $sql);
  echo "<header>";
  echo "<h2>Learning</h2>";
  echo "</header>";
  while ($row=mysqli_fetch_array($result)) {
				echo "<li><a href='content.php?id=".$row[0]."' target='_parent'>".$row[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row[4].")</a></li>";
	}
  }else  if($_GET['id']!=""){
  $sql="select * from content where c_id=".$_GET['id'];
  $result=mysqli_query($conn, $sql);
  $row=mysqli_fetch_row($result);
  echo "<header>";
  echo "<h2>".$row[1];
  
  echo "</h2>";
  echo "<span class='byline'>".$row[4];
  if($_SESSION['u_id']!=""){
	echo "&nbsp;&nbsp;&nbsp;&nbsp;<a href='editor.php?id=".$row[0]."'>[edit]</a>&nbsp;&nbsp;||&nbsp;&nbsp;<a href='delete.php?id=".$row[0]."'>[delete]</a>";  
  }
  echo "</span>";
  echo "</header>";
  echo $row[2];
}else{
  $sql="select * from content order by c_id desc limit 0,1";
  $result=mysqli_query($conn, $sql);
  $row=mysqli_fetch_row($result);
  echo "<header>";
  echo "<h2>".$row[1];
 
  echo "</h2>";
  echo "<span class='byline'>".$row[4];
  if($_SESSION['u_id']!=""){
	echo "&nbsp;&nbsp;&nbsp;&nbsp;<a href='editor.php?id=".$row[0]."'>[edit]</a>&nbsp;&nbsp;||&nbsp;&nbsp;<a href='delete.php?id=".$row[0]."'>[delete]</a>";  
  }
  echo "</span>";
  echo "</header>";
  echo $row[2];
  }
  ?>
						</section>
					</div>
<?php
	$sql1="select * from content where c_type=1 order by c_id desc limit 0,8";
	$result1 = mysqli_query($conn, $sql1);
 	$count1 = mysqli_num_rows($result1);
	
	$sql2="select * from content where c_type=2 order by c_id desc limit 0,8";
	$result2 = mysqli_query($conn, $sql2);
 	$count2 = mysqli_num_rows($result2);
	
	$sql3="select * from content where c_type=3 order by c_id desc limit 0,8";
	$result3 = mysqli_query($conn, $sql3);
 	$count3 = mysqli_num_rows($result3);
?>
					<div class="3u">
						<section class="sidebar">
							<header>
								<h2>
                               <a href="content.php?ctype=1"> Chatting</a>(<?php echo $count1; ?>)<?php
if($_SESSION['u_id']!=""){
	echo "<a href='add.php?type=1'>[new]</a>";	
}
?></h2>
							</header>
							<ul class="default">
       <?php 
			while ($row1=mysqli_fetch_array($result1)) {
				echo "<li><a href='content.php?id=".$row1[0]."' target='_parent'>".$row1[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row1[4].")</a></li>";
			}
       ?>
							</ul>
						</section>
						<section class="sidebar">
							<header>
								<h2><a href="content.php?ctype=2">Experience</a>(<?php echo $count2; ?>)<?php
if($_SESSION['u_id']!=""){
	echo "<a href='add.php?type=2'>[new]</a>";	
}
?></h2>
							</header>
							<ul class="default">
							       <?php 
			while ($row2=mysqli_fetch_array($result2)) {
				echo "<li><a href='content.php?id=".$row2[0]."' target='_parent'>".$row2[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row2[4].")</a></li>";
			}
       ?>
							</ul>
						</section>
                        <section class="sidebar">
							<header>
								<h2><a href="content.php?ctype=3">Learning</a>(<?php echo $count3; ?>)<?php
if($_SESSION['u_id']!=""){
	echo "<a href='add.php?type=3'>[new]</a>";	
}
?></h2>
							</header>
							<ul class="default">
							       <?php 
			while ($row3=mysqli_fetch_array($result3)) {
				echo "<li><a href='content.php?id=".$row3[0]."' target='_parent'>".$row3[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row3[4].")</a></li>";
			}
       ?>
							</ul>
						</section>
					</div>
				
				</div>
                
                
			</div>
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