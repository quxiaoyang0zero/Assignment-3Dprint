<?php
session_start();	//启动会话
include "func.php";									
header('Content-type:text/html;charset=utf-8');
if($_SESSION['u_id']!=""){
	w_log('logout',$_SESSION["u_name"]);	//添加日志
}
error_reporting(0);
session_destroy();//销毁一个会话中的全部数据
?>
<script>window.close();</script>