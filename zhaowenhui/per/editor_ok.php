<?php

 	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	//error_reporting(0);

	$sql = "update content set c_title='".$_POST['a']."' ,c_content='".$_POST['b']."',c_time='".date('Y-m-d')."' where c_id='".$_SESSION['id']."'";

	if($result = mysqli_query($conn, $sql)){
		w_log('editor',$_SESSION["u_name"]);	//添加日志
		echo "<script>alert('修改成功');location='content.php?id=".$_SESSION['id']."';</script>";
	}
	else{
		echo "<script>alert('修改失败');history.go(-2);</script>";
	}
?>