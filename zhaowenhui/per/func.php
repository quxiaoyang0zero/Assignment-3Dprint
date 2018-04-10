<?php
//记录后台管理信息
//记录管理员的操作
//登录、登出、添加、删除等
//参数$action为操作动作
function w_log($act){
	$filename = "log.txt";
	if(file_exists($filename)){
		$f_open = fopen($filename,"a+");
	}
	else
	{
		$f_open = fopen($filename,"w+");
	}
		$str = $_SESSION['u_name'].",".date("Y-m-d H:i:s").",".$_SERVER['REMOTE_ADDR'].",".$act."\n";
		fwrite($f_open,$str);
		fclose($f_open);
}

function createFolder($path)
 {
  if (!file_exists($path))
  {
   createFolder(dirname($path));
   mkdir($path, 0777);
  }
 }
 
 

function cleanhtml($str,$tags='<img><a>'){//过滤时默认保留html中的<a><img>标签  
        $search = array(  
                        '@<script[^>]*?>.*?</script>@si',  // Strip out javascript  
/*                      '@<[\/\!]*?[^<>]*?>@si',            // Strip out HTML tags*/  
                        '@<style[^>]*?>.*?</style>@siU',    // Strip style tags properly   
                        '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments including CDATA   
        );   
        $str = preg_replace($search, '', $str);  
        $str = strip_tags($str,$tags);  
        return $str;  
    }  

function cleanhtml2($str,$tags='<a>'){//过滤时默认保留html中的<a><img>标签  
        $search = array(  
                        '@<script[^>]*?>.*?</script>@si',  // Strip out javascript  
/*                      '@<[\/\!]*?[^<>]*?>@si',            // Strip out HTML tags*/  
                        '@<style[^>]*?>.*?</style>@siU',    // Strip style tags properly   
                        '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments including CDATA   
        );   
        $str = preg_replace($search, '', $str);  
        $str = strip_tags($str,$tags);  
        return $str;  
    }  

?>