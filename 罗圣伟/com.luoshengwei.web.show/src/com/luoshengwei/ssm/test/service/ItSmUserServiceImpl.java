package com.luoshengwei.ssm.test.service;

import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luoshengwei.common.core.dao.BaseDao;
import com.luoshengwei.common.core.service.BaseServiceImpl;
import com.luoshengwei.ssm.test.dao.ItSmUserDAO;
import com.luoshengwei.ssm.test.entity.ItSmUser;

/**
 * @ClassName:ItSmUserServiceImpl
 * @Description:(系统管理-用户管理-业务层接口实现类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:48:04
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Service(value = "itSmUserService")
public class ItSmUserServiceImpl extends BaseServiceImpl<ItSmUser> implements ItSmUserService {
	@Autowired
	private ItSmUserDAO itSmUserDAO;

	/**
	 * (非 Javadoc) 
	 * <p>Title:getDao</p>
	 * <p>Description:</p>
	 * @return
	 * @see com.luoshengwei.common.core.service.BaseServiceImpl#getDao()
	 */
	@Override
	protected BaseDao<ItSmUser> getDao() {
		return itSmUserDAO;
	}

	/**
	 * (非 Javadoc) 
	 * <p>Title:checkUser</p>
	 * <p>Description:</p>
	 * @param itSmUser
	 * @return
	 * @see com.luoshengwei.ssm.test.service.ItSmUserService#checkUser(com.luoshengwei.ssm.test.entity.ItSmUser)
	 */
	@Override
	public String checkUser(ItSmUser itSmUser) {
		String loginCheckType = "";
		ItSmUser itSmUserEntity;
		try {
			itSmUserEntity = itSmUserDAO.selectByNameAndPassword(itSmUser);
			if (itSmUserEntity != null) {
				if ("1".equals(itSmUserEntity.getType())) {
					loginCheckType = "1";// 登陆验证成功
				} else {
					loginCheckType = "2";// 用户状态为停用状态
				}
			} else {
				loginCheckType = "0";// 用户名或密码错误
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return loginCheckType;
	}
}