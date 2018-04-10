<?php
	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	w_log(delete,$_SESSION["u_name"]);	//添加日志
	$sql3 = "delete from content where c_id=".$_GET['id'];
	
	if($result3 = mysqli_query($conn, $sql3)){
		
		echo "<script>alert('删除成功');location='content.php';</script>";
		
	}
	else{
		echo "<script>alert('删除失败');history.go(-1);</script>";
	}

?>