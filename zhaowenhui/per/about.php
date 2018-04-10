<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	error_reporting(0);
?>
<!DOCTYPE HTML>
<html>
	<head>
		<title>Hui--About</title>
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
								<li><a href="contact.php">Contact</a></li>
								<li class="active"><a href="about.php">About</a></li>
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
					<section>
						<header>
							<h2><a href="https://github.com/nazinanuoni/huii.github.io">Me</a></h2>
							<span class="byline">ccccute</span>
                            <img src="images/me.jpg" />
                            <img src="images/me2.jpg" />
						</header>
						<p>wwwish for more fffriends</p>
						
					</section>
				</div>

			</div>
		</div>
	<!-- /Main -->


	<!-- Copyright -->
		<div id="copyright">
			<div class="container">
				copyright2018-2019
			</div>
		</div>


	</body>
</html>