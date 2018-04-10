<?php
 	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	if($_SESSION['u_id']!=""){
		w_log('contact',$_SESSION["u_name"]);//添加日志
		$sql = "insert into contact values('','".$_POST['n']."' ,'".$_POST['s']."', '".$_POST['p']."','".$_POST['t']."','".date("Y-m-d")."',0,1)";
	}else if($_POST['n']!=""){
		$sql = "insert into contact values('','".$_POST['n']."' ,'".$_POST['s']."', '".$_POST['p']."','".$_POST['t']."','".date("Y-m-d")."',0,0)";
	}
	else{
		echo "<script>alert('请输入昵称');location='contact.php';</script>";
	}
	if($result = mysqli_query($conn, $sql)){
		echo "<script>alert('发表成功');location='contact.php';</script>";
	}
	else{
		echo "<script>alert('发表失败');;location='contact.php';</script>";
	}
?>