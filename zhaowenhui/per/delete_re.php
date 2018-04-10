<?php
	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	if($_SESSION['u_id']!=""){
		w_log('del_re',$_SESSION["u_name"]);	//添加日志
	}
	$sql = "select cc_reply from contact where cc_id=".$_SESSION['cid'];
	$result = mysqli_query($conn, $sql);
	$row = mysqli_fetch_row($result);
	
	$sql2 = "update contact set cc_reply=".($row[0]-1)." where cc_id=".$_SESSION['cid'];
	$result2 = mysqli_query($conn, $sql2);
	
	$sql3 = "delete from reply where r_id=".$_GET['rid'];
	
	if($result3 = mysqli_query($conn, $sql3)){
		echo "<script>alert('删除成功');location='reply.php?cid=".$_SESSION['cid']."';</script>";
		
	}
	else{
		echo "<script>alert('删除失败');history.go(-1);</script>";
	}

?>