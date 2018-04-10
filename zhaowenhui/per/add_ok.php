<?php

 	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	//error_reporting(0);

	$sql = "insert into content values('','".$_POST['a']."' ,'".$_POST['b']."', '".$_SESSION['type']."','".date("Y-m-d")."')";

	if($result = mysqli_query($conn, $sql)){
		w_log('add',$_SESSION["u_name"]);	//添加日志
		echo "<script>alert('添加成功');location='content.php';</script>";
	}
	else{
		echo "<script>alert('添加失败');history.go(-1);</script>";
	}
?>