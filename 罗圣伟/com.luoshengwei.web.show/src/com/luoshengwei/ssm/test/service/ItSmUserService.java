package com.luoshengwei.ssm.test.service;

import com.luoshengwei.common.core.service.BaseService;
import com.luoshengwei.ssm.test.entity.ItSmUser;

/**
 * @ClassName:ItSmUserService
 * @Description:(系统管理-用户管理-业务层接口)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:57:40
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public interface ItSmUserService extends BaseService<ItSmUser> {
	/**
	 * @Title:checkUser
	 * @Description:(登陆验证)
	 * @param itSmUser
	 * @return "0"-登录失败，用户名或者密码错误,"1"-登陆成功，"2"-用户无效
	 * @returnType: String
	 */
	public String checkUser(ItSmUser itSmUser);
}