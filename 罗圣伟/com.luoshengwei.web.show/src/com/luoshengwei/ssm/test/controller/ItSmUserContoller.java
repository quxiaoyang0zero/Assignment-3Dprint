package com.luoshengwei.ssm.test.controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.luoshengwei.common.core.constant.SystemConstants;
import com.luoshengwei.ssm.test.entity.ItSmUser;
import com.luoshengwei.ssm.test.service.ItSmUserService;

/**
 * @ClassName:ItSmUserContoller
 * @Description:(系统管理-用户管理控制类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:55:04
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Controller
public class ItSmUserContoller {
	@Autowired
	private ItSmUserService itSmUserService = null;

	@SuppressWarnings("unused")
	@RequestMapping(value = "/checkUser.action", method = RequestMethod.POST)
	@ResponseBody
	private String loginCheck(HttpServletRequest req, HttpServletResponse resp) {
		String userData = req.getParameter("data");
		ItSmUser itSmUser = (ItSmUser) JSON.parseObject(userData, ItSmUser.class);
		String checkType = itSmUserService.checkUser(itSmUser);
		// 设置用户对象到Session中
		req.getSession().setAttribute(SystemConstants.AUTHENTICATION_KEY, itSmUser);
		return checkType;
	}
	
	@RequestMapping(value = "/showEmployeeInformation.action", method = RequestMethod.GET)
	public void tradeData(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.getRequestDispatcher("/assets/jsp/showEmployeeInformation.jsp").forward(req, resp);
	}
}