package com.luoshengwei.common.core.biz;

import java.util.List;
import java.util.Map;

import com.luoshengwei.common.core.dao.BaseDao;
import com.luoshengwei.common.core.entity.BaseEntity;
import com.luoshengwei.common.core.page.PageBean;
import com.luoshengwei.common.core.page.PageParam;

/**
 * @ClassName:BaseBizImpl
 * @Description:(基类Biz接口实现类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:38:57
 * @param <T>
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public abstract class BaseBizImpl<T extends BaseEntity> implements BaseBiz<T> {

	protected abstract BaseDao<T> getDao();

	public long create(T entity) {
		return getDao().insert(entity);
	}

	public long create(List<T> list) {
		return getDao().insert(list);
	}

	public long update(T entity) {
		return getDao().update(entity);
	}

	public long update(List<T> list) {
		return getDao().update(list);
	}

	public T getById(long id) {
		return this.getDao().getById(id);
	}

	/**
	 * 根据ID删除记录.
	 * 
	 * @param id
	 *            .
	 * @return
	 */
	public long deleteById(long id) {
		return this.getDao().deleteById(id);
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
