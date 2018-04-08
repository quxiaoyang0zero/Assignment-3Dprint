package com.luoshengwei.ssm.test.service;

import java.util.List;

import com.luoshengwei.common.core.service.BaseService;
import com.luoshengwei.ssm.test.entity.ItBsEmployeeInformation;

/**
 * @ClassName:ItBsEmployeeInformationService
 * @Description:(系统管理-员工管理-业务层接口)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:57:09
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public interface ItBsEmployeeInformationService extends BaseService<ItBsEmployeeInformation> {

	/**
	 * @Title:addEmployeeCheck
	 * @Description:(新增员工)
	 * @param itBsEmployeeInformation
	 * @returnType: String
	 */
	String addEmployeeCheck(ItBsEmployeeInformation itBsEmployeeInformation);

	/**
	 * @Title:deleteEmployee
	 * @Description:(删除员工)
	 * @param id
	 * @returnType: String
	 */
	String deleteEmployee(String id);

	/**
	 * @Title:deleteEmployees
	 * @Description:(批量删除员工)
	 * @param idList
	 * @returnType: String
	 */
	String deleteEmployees(List<String> idList);

	/**
	 * @Title:updateEmployeeCheck
	 * @Description:(修改员工信息)
	 * @param itBsEmployeeInformation
	 * @returnType: String
	 */
	String updateEmployeeCheck(ItBsEmployeeInformation itBsEmployeeInformation);

}