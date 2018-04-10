<?php

 	session_start();
    header("Content-Type:text/html; charset=utf-8");
    include "conn/conn.php";
	include "func.php";
	error_reporting(0);
	
	if($_SESSION['u_id']!=""){
		w_log('reply',$_SESSION["u_name"]);	//添加日志
		$sql = "insert into reply values('','".$_SESSION['cid']."' ,'".$_SESSION['u_name']."', 'author','".$_POST['t']."','".date("Y-m-d")."',1)";
	}else if($_POST['n']!=""){
		$sql = "insert into reply values('','".$_SESSION['cid']."' ,'".$_POST['n']."', '".$_POST['s']."','".$_POST['t']."','".date("Y-m-d")."',0)";
	}else{
		echo "<script>alert('请输入昵称');location='reply.php?cid=".$_SESSION['cid']."';</script>";
	}
	$sql3 = "select cc_reply from contact where cc_id=".$_SESSION['cid'];
	$result3 = mysqli_query($conn, $sql3);
	$row3 = mysqli_fetch_row($result3);
	$sql2 = "update contact set cc_reply=".($row3[0]+1)." where cc_id=".$_SESSION['cid'];
	$result2 = mysqli_query($conn, $sql2);
	if($result = mysqli_query($conn, $sql)){
		echo "<script>alert('评论成功');location='reply.php?cid=".$_SESSION['cid']."';</script>";
	}
	else{
		echo "<script>alert('评论失败');history.go(-2);</script>";
	}
?>