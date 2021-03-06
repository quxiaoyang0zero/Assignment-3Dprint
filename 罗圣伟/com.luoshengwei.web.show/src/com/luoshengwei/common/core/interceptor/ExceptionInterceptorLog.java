package com.luoshengwei.common.core.interceptor;

import java.lang.reflect.Method;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.aop.ThrowsAdvice;

import com.luoshengwei.common.core.exception.BizException;

/**
 * @ClassName:ExceptionInterceptorLog
 * @Description:(异常的处理 拦截)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:36:37
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class ExceptionInterceptorLog implements ThrowsAdvice {

	private static final Log log = LogFactory.getLog(ExceptionInterceptorLog.class);

	/**
	 * 对未知异常的处理. <br>
	 * Method method 执行的方法 Object[] args <br>
	 * 方法参数 Object target <br>
	 * 代理的目标对象 Throwable BizException 产生的异常 <br>
	 */
	public void afterThrowing(Method method, Object[] args, Object target, BizException ex) {

		log.info("==>ExceptionInterceptorLog.BizException");
		log.info("==>errCode:" + ex.getCode() + " errMsg:" + ex.getMsg());
		log.info("==>" + ex.fillInStackTrace());
	}

	public void afterThrowing(Method method, Object[] args, Object target, Exception ex) {

		log.error("==>ExceptionInterceptorLog.Exception");

		log.error("==>Error class: " + target.getClass().getName());
		log.error("==>Error method: " + method.getName());

		for (int i = 0; i < args.length; i++) {
			log.error("==>args[" + i + "]: " + args[i]);
		}

		log.error("==>Exception class: " + ex.getClass().getName());
		log.error("==>" + ex.fillInStackTrace());
		ex.printStackTrace();
	}
}
