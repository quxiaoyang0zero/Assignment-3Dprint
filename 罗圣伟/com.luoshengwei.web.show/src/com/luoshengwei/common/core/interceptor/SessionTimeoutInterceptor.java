package com.luoshengwei.common.core.interceptor;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.luoshengwei.common.core.constant.SystemConstants;

/**
 * @ClassName:SessionTimeoutInterceptor
 * @Description:(处理session超时的拦截器 会话控制拦截器)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:37:19
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class SessionTimeoutInterceptor implements Filter {

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
			ServletException {
		String requestUrl = ((HttpServletRequest) req).getRequestURI().replace(
				((HttpServletRequest) req).getContextPath(), "");
		Object itSmUser = (Object) ((HttpServletRequest) req).getSession().getAttribute(
				SystemConstants.AUTHENTICATION_KEY);
		if (itSmUser != null) {
			chain.doFilter(req, res);
		} else {
			if (requestUrl.endsWith("loginCheck.action") || requestUrl.endsWith("checkUser.action")) {
				chain.doFilter(req, res);
			} else {
				((HttpServletResponse) res).sendRedirect(((HttpServletRequest) req).getContextPath() + "/index.html");
			}
		}
	}

	@Override
	public void init(FilterConfig config) throws ServletException {

	}

}
