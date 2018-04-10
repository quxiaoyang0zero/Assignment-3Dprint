<?php
	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	w_log('del_cta',$_SESSION["u_name"]);	//添加日志
	$sql = "select cc_reply from contact where cc_id=".$_SESSION['cid'];
	$result = mysqli_query($conn, $sql);
	$row = mysqli_fetch_row($result);
	
	if($row[0]!=0){

	$sql3 = "delete from reply where r_cid=".$_SESSION['cid'];
	$result3 = mysqli_query($conn, $sql3);
	}
	
	$sql2 = "delete from contact where cc_id=".$_SESSION['cid'];
	
	if($result2 = mysqli_query($conn, $sql2)){
		echo "<script>alert('删除成功');location='contact.php';</script>";
		
	}
	else{
		echo "<script>alert('删除失败');history.go(-1);</script>";
	}

?>