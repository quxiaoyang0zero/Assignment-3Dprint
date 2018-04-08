package com.luoshengwei.ssm.test.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luoshengwei.common.core.dao.BaseDao;
import com.luoshengwei.common.core.service.BaseServiceImpl;
import com.luoshengwei.ssm.test.dao.ItBsEmployeeInformationDAO;
import com.luoshengwei.ssm.test.entity.ItBsEmployeeInformation;
import com.luoshengwei.ssm.test.entity.ItBsEmployeeInformationExample;

/**
 * @ClassName:ItBsEmployeeInformationServiceImpl
 * @Description:(系统管理-用户管理-业务层接口实现类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:57:26
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Service(value = "itBsEmployeeInformationService")
public class ItBsEmployeeInformationServiceImpl extends BaseServiceImpl<ItBsEmployeeInformation> implements
		ItBsEmployeeInformationService {
	@Autowired
	private ItBsEmployeeInformationDAO itBsEmployeeInformationDAO;

	@Override
	protected BaseDao<ItBsEmployeeInformation> getDao() {
		return itBsEmployeeInformationDAO;
	}

	@Override
	public String addEmployeeCheck(ItBsEmployeeInformation itBsEmployeeInformation) {
		String loginCheckType = "";
		ItBsEmployeeInformationExample itBsEmployeeInformationExample = new ItBsEmployeeInformationExample();
		itBsEmployeeInformationExample.createCriteria().andCodeEqualTo(itBsEmployeeInformation.getCode());
		List<ItBsEmployeeInformation> list = itBsEmployeeInformationDAO.selectByExample(itBsEmployeeInformationExample);
		if (list != null && !list.isEmpty()) {
			loginCheckType = "0";// 员工编号已存在
		} else {
			itBsEmployeeInformation.setId(UUID.randomUUID().toString().replace("-", ""));
			itBsEmployeeInformationDAO.insert(itBsEmployeeInformation);
			loginCheckType = "1";// 当前员工编号可用
		}
		return loginCheckType;
	}

	@Override
	public String deleteEmployee(String id) {
		int num = ((ItBsEmployeeInformationDAO) this.getDao()).deleteByPrimaryKey(id);
		return num > 0 ? "success" : "failed";
	}

	@Override
	public String deleteEmployees(List<String> idList) {
		ItBsEmployeeInformationExample itBsEmployeeInformationExample = new ItBsEmployeeInformationExample();
		itBsEmployeeInformationExample.createCriteria().andIdIn(idList);
		int num = itBsEmployeeInformationDAO.deleteByExample(itBsEmployeeInformationExample);
		return num > 0 ? "success" : "failed";
	}

	@Override
	public String updateEmployeeCheck(ItBsEmployeeInformation itBsEmployeeInformation) {
		String loginCheckType = "";
		ItBsEmployeeInformationExample itBsEmployeeInformationExample = new ItBsEmployeeInformationExample();
		itBsEmployeeInformationExample.createCriteria().andCodeEqualTo(itBsEmployeeInformation.getCode())
				.andIdNotEqualTo(itBsEmployeeInformation.getId());
		List<ItBsEmployeeInformation> list = itBsEmployeeInformationDAO.selectByExample(itBsEmployeeInformationExample);
		if (list != null && !list.isEmpty()) {
			loginCheckType = "0";// 员工编号已存在
		} else {
			itBsEmployeeInformationDAO.updateByPrimaryKeySelective(itBsEmployeeInformation);
			loginCheckType = "1";// 当前员工编号可用
		}
		return loginCheckType;
	}
}