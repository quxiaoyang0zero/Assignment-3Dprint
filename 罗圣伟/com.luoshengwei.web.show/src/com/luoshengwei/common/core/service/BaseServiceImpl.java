package com.luoshengwei.common.core.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.luoshengwei.common.core.dao.BaseDao;
import com.luoshengwei.common.core.entity.BaseEntity;
import com.luoshengwei.common.core.page.PageBean;
import com.luoshengwei.common.core.page.PageParam;

/**
 * @ClassName:BaseServiceImpl
 * @Description:(Service 基类实现)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:43:48
 * @param <T>
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public abstract class BaseServiceImpl<T extends BaseEntity> implements BaseService<T> {

	protected abstract BaseDao<T> getDao();

	public T getById(long id) {
		return this.getDao().getById(id);
	}

	/**
	 * 分页查询 .
	 * 
	 * @param pageParam
	 *            分页参数.
	 * @param paramMap
	 *            业务条件查询参数.
	 * @return
	 */
	public PageBean listPage(PageParam pageParam, Map<String, Object> paramMap) {
		return this.getDao().listPage(pageParam, paramMap);
	}

	public PageBean listPage(PageParam pageParam, Map<String, Object> paramMap, String sqlId) {
		return this.getDao().listPage(pageParam, paramMap, sqlId);
	}

	public PageBean listPageTable(PageParam pageParam, Map<String, Object> paramMap) {
		if (paramMap == null)
			paramMap = new HashMap<String, Object>();
		PageHelper.startPage(pageParam.getPageNum(), pageParam.getNumPerPage());
		List list = this.getDao().listBy(paramMap);
		PageInfo<Object> pageInfo = new PageInfo<Object>(list);
		return new PageBean(pageInfo.getPageNum(), pageInfo.getPageSize(), Integer.parseInt(String.valueOf(pageInfo
				.getTotal())), pageInfo.getList());
	}

	/**
	 * 根据条件查询 listBy: <br/>
	 * 
	 * @param paramMap
	 * @return 返回集合
	 */
	public List<T> listBy(Map<String, Object> paramMap) {
		return this.getDao().listBy(paramMap);
	}

	public List<Object> listBy(Map<String, Object> paramMap, String sqlId) {
		return this.getDao().listBy(paramMap, sqlId);
	}

	/**
	 * 根据条件查询 listBy: <br/>
	 * 
	 * @param paramMap
	 * @return 返回实体
	 */
	public T getBy(Map<String, Object> paramMap) {
		return this.getDao().getBy(paramMap);
	}

	public Object getBy(Map<String, Object> paramMap, String sqlId) {
		return this.getDao().getBy(paramMap, sqlId);
	}

	/**
	 * 根据序列名称获取下一个值
	 * 
	 * @return
	 */
	public String getSeqNextValue(String seqName) {
		return this.getDao().getSeqNextValue(seqName);
	}

}
