package com.luoshengwei.ssm.test.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.luoshengwei.common.core.page.PageBean;
import com.luoshengwei.common.core.page.PageParam;
import com.luoshengwei.common.core.page.UIPageResult;
import com.luoshengwei.ssm.test.entity.ItBsEmployeeInformation;
import com.luoshengwei.ssm.test.service.ItBsEmployeeInformationService;

/**
 * @ClassName:ItBsEmployeeInformationContoller
 * @Description:(系统管理-员工管理控制类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:54:43
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Controller
@RequestMapping("/employee")
public class ItBsEmployeeInformationContoller {
	@Autowired
	/*****业务层接口对象*****/
	private ItBsEmployeeInformationService itBsEmployeeInformationService = null;

	/**
	 * @Title:addEmployee
	 * @Description:(新增员工窗口)
	 * @param req
	 * @param resp
	 * @throws ServletException
	 * @throws IOException 
	 * @returnType: void
	 */
	@RequestMapping(value = "/addEmployeeDialog.action", method = RequestMethod.GET)
	public void addEmployee(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.getRequestDispatcher("/assets/jsp/addEmployee.jsp").forward(req, resp);
	}

	/**
	 * @Title:updateEmployee
	 * @Description:(编辑员工窗口)
	 * @param req
	 * @param resp
	 * @throws ServletException
	 * @throws IOException 
	 * @returnType: void
	 */
	@RequestMapping(value = "/updateEmployeeDialog.action", method = RequestMethod.GET)
	public void updateEmployee(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.getRequestDispatcher("/assets/jsp/updateEmployee.jsp").forward(req, resp);
	}

	/**
	 * @Title:addEmployeeCheck
	 * @Description:(新增员工)——增
	 * @param req
	 * @param resp
	 * @return 
	 * @returnType: String
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/addEmployee.action", method = RequestMethod.POST)
	@ResponseBody
	private String addEmployeeCheck(HttpServletRequest req, HttpServletResponse resp) {
		String employeeData = req.getParameter("data");
		ItBsEmployeeInformation itBsEmployeeInformation = (ItBsEmployeeInformation) JSON.parseObject(employeeData,
				ItBsEmployeeInformation.class);
		String checkType = itBsEmployeeInformationService.addEmployeeCheck(itBsEmployeeInformation);
		return checkType;
	}

	/**
	 * @Title:delete
	 * @Description:(删除员工)——删
	 * @param employeeIds
	 * @return 
	 * @returnType: String
	 */
	@RequestMapping(value = "/deleteEmployee.action", method = RequestMethod.POST)
	@ResponseBody
	public String delete(String employeeIds) {
		String flag = "success";
		List<String> employeeIdList = new ArrayList<String>();
		String[] idArray = employeeIds.split(",");
		for (int i = 0; i < idArray.length; i++) {
			if (StringUtils.isNotBlank(idArray[i])) {
				employeeIdList.add(idArray[i]);
			}
		}
		if (employeeIdList.isEmpty()) {

		} else if (employeeIdList.size() == 1) {
			flag = itBsEmployeeInformationService.deleteEmployee(employeeIdList.get(0));
		} else {
			flag = itBsEmployeeInformationService.deleteEmployees(employeeIdList);
		}
		return flag;
	}
	
	/**
	 * @Title:updateEmployeeCheck
	 * @Description:(编辑员工)——改
	 * @param req
	 * @param resp
	 * @return 
	 * @returnType: String
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/updateEmployee.action", method = RequestMethod.POST)
	@ResponseBody
	private String updateEmployeeCheck(HttpServletRequest req, HttpServletResponse resp) {
		String employeeData = req.getParameter("data");
		ItBsEmployeeInformation itBsEmployeeInformation = (ItBsEmployeeInformation) JSON.parseObject(employeeData,
				ItBsEmployeeInformation.class);
		String checkType = itBsEmployeeInformationService.updateEmployeeCheck(itBsEmployeeInformation);
		return checkType;
	}

	/**
	 * @Title:queryEmployeeInformation
	 * @Description:(查询员工)——查
	 * @param req
	 * @param resp
	 * @return
	 * @throws ServletException
	 * @throws IOException 
	 * @returnType: UIPageResult
	 */
	@RequestMapping(value = "/queryEmployee.action", method = RequestMethod.POST, produces = "application/json")
	public @ResponseBody
	UIPageResult queryEmployeeInformation(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
			IOException {
		Map<String, Object> paramMap = new HashMap<String, Object>();
		getParam(paramMap, req);
		PageParam pageParam = new PageParam(req);
		PageBean page = itBsEmployeeInformationService.listPageTable(pageParam, paramMap);
		UIPageResult result = new UIPageResult();
		result.setData(page.getRecordList());
		result.setTotal(page.getTotalCount());
		return result;
	}

	private void getParam(Map<String, Object> paramMap, HttpServletRequest req) {
		paramMap.put("name", req.getParameter("employeeName"));
		paramMap.put("code", req.getParameter("employeeCode"));
		paramMap.put("sex", req.getParameter("employeeSex"));
		paramMap.put("department", req.getParameter("employeeDepartment"));
	}
}