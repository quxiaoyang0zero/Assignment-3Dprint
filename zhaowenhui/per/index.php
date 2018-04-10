<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	error_reporting(0);
?>

<!DOCTYPE HTML>
<html>
	<head>
		<title>Hui's homepage</title>
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


<script type="text/javascript" src="js/jquery-1.8.3.min.js"></script>
<script src="js/jquery-migrate-1.1.1.min.js"></script>
<script src="css/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/css_browser_selector.js"></script>
<script type="text/javascript" src="js/twitter-bootstrap-hover-dropdown.min.js"></script>
<script type="text/javascript" src="js/jquery.easing-1.3.js"></script>
<script type="text/javascript" src="js/jquery.flexslider-min.js"></script>
<script type="text/javascript" src="js/script.js"></script>
		<noscript>
			<link rel="stylesheet" href="css/skel-noscript.css" />
			<link rel="stylesheet" href="css/style.css" />
			<link rel="stylesheet" href="css/style-desktop.css" />
    <link href="css/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href="css/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet">        
		</noscript>
<link  rel="stylesheet" href="css/styleroll.css">
<link  rel="stylesheet" href="css/responsive.css">

<link href="css/font-awesome/css/font-awesome.min.css" rel="stylesheet">
<link href="css/flexslider.css" rel="stylesheet">
<!--[if IE 7]>

<link href="css/font-awesome/css/font-awesome-ie7.min.css" rel="stylesheet">

<![endif]-->


	</head>
	<body class="homepage">

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
								<li class="active"><a href="index.php">Homepage</a></li>
								<li><a href="content.php">Content</a></li>
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
	
				<section>
					<span class="fa fa-cubes"></span>
                        
                        
						<header>
							<h2>Welcome to Hui's homepage.</h2>
							<span class="byline">Never say die.</span>
						</header>
                        <!--
						<a href="#" class="button medium">Fusce ultrices fringilla</a>
                        -->
					</section>	
				</div>
			</div>
		<!-- /Banner -->

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

	
    <div id="main">
    
<section id="home" class="home-slider">
		<div class="container">
			<div class="flexslider">
				<ul class="slides">
					<li class="slide">
						<img src="images/slide03.jpg" />
						<div class="flex-caption">
							<h1>Hi</h1>
							<div class="medium">
								<span>nice to meet you</span>
							</div>
							<div class="small">
								<span>leave something</span>
							</div>
							

						</div>
					</li>
					<li class="slide">
						<img src="images/slide01.png" />
						<div class="flex-caption">
							<h1>UP</h1>
							<div class="medium">
								<span>I have nothing to offer</span>
							</div>
							<div class="small">
								<span>but blood , toil tears and sweat </span>
							</div>
							

						</div>
					</li>



				</ul>
			</div>
		</div>
	</section>

	</div><!-- /main -->

<!-- Footer -->
		<div id="footer">
			<div class="container">
				<div class="row">
					<section class="4u">
						<header>
							<h2>Chatting</h2>
						</header>
						<ul class="default">
						<?php 
			while ($row1=mysqli_fetch_array($result1)) {
				echo "<li><a href='content.php?id=".$row1[0]."' target='_parent'>".$row1[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row1[4].")</a></li>";
			}
       ?>
						</ul>
					</section>
					<section class="4u">
						<header>
							<h2>Experience</h2>
						</header>
						<ul class="default">
					<?php 
			while ($row2=mysqli_fetch_array($result2)) {
				echo "<li><a href='content.php?id=".$row2[0]."' target='_parent'>".$row2[1]."&nbsp;&nbsp;&nbsp;&nbsp;(".$row2[4].")</a></li>";
			}
       ?>
						</ul>
					</section>
					<section class="4u">
						<header>
							<h2>Learning</h2>
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
	<!-- /Footer -->
	<!-- Copyright -->
		<div id="copyright">
			<div class="container">
				copyright2018-2019
			</div>
		</div>


	</body>
</html>