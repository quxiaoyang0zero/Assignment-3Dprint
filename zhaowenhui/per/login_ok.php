<?php
    session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	$sqlstr1 = "select * from usr where u_name = '".$_POST['username']."'";
	$result1 = mysqli_query($conn, $sqlstr1);
	$record1 = mysqli_fetch_row($result1);
	if($record1[2] == $_POST['userpwd']){
		echo "<script>alert('欢迎光临');location='index.php';</script>";
		$_SESSION["u_id"] = $record1[0];
		$_SESSION["u_name"] = $record1[1];
		w_log('login',$_SESSION["u_name"]);	//添加日志
	}
	else{
		echo "<script>alert('昵称或密码错误');history.go(-1);</script>";
	}
	

?>