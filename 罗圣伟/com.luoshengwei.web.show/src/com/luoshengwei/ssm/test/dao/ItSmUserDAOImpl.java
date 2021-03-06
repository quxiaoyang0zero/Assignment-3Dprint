package com.luoshengwei.ssm.test.dao;

import java.sql.SQLException;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.luoshengwei.common.core.dao.BaseDaoImpl;
import com.luoshengwei.ssm.test.entity.ItSmUser;
import com.luoshengwei.ssm.test.entity.ItSmUserExample;

/**
 * @ClassName:ItSmUserDAOImpl
 * @Description:(系统管理-用户管理-数据访问层接口实现类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:55:47
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Repository(value="itSmUserDAO")
public class ItSmUserDAOImpl extends BaseDaoImpl<ItSmUser> implements ItSmUserDAO {

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int countByExample(ItSmUserExample example) throws SQLException {
		Integer count = (Integer) this.getSqlSession().selectOne("itSmUser_countByExample", example);
		return count.intValue();
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int deleteByExample(ItSmUserExample example) throws SQLException {
		int rows = this.getSqlSession().delete("itSmUser_deleteByExample", example);
		return rows;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int deleteByPrimaryKey(String id) throws SQLException {
		ItSmUser key = new ItSmUser();
		key.setId(id);
		int rows = this.getSqlSession().delete("itSmUser_deleteByPrimaryKey", key);
		return rows;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @return 
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public long insert(ItSmUser record) {
		return this.getSqlSession().insert("itSmUser_insert", record);
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public void insertSelective(ItSmUser record) throws SQLException {
		this.getSqlSession().insert("itSmUser_insertSelective", record);
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public List selectByExample(ItSmUserExample example) throws SQLException {
		List list = this.getSqlSession().selectList("itSmUser_selectByExample", example);
		return list;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public ItSmUser selectByPrimaryKey(String id) throws SQLException {
		ItSmUser key = new ItSmUser();
		key.setId(id);
		ItSmUser record = (ItSmUser) this.getSqlSession().selectOne("itSmUser_selectByPrimaryKey", key);
		return record;
	}
	
	public ItSmUser selectByNameAndPassword(ItSmUser record) throws SQLException {
		ItSmUser key = new ItSmUser();
		key.setName(record.getName());
		key.setPassword(record.getPassword());
		return(ItSmUser) this.getSqlSession().selectOne("itSmUser_selectByNameAndPassword", key);
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int updateByExampleSelective(ItSmUser record, ItSmUserExample example) throws SQLException {
		UpdateByExampleParms parms = new UpdateByExampleParms(record, example);
		int rows = this.getSqlSession().update("itSmUser_updateByExampleSelective", parms);
		return rows;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int updateByExample(ItSmUser record, ItSmUserExample example) throws SQLException {
		UpdateByExampleParms parms = new UpdateByExampleParms(record, example);
		int rows = this.getSqlSession().update("itSmUser_updateByExample", parms);
		return rows;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int updateByPrimaryKeySelective(ItSmUser record) throws SQLException {
		int rows = this.getSqlSession().update("itSmUser_updateByPrimaryKeySelective", record);
		return rows;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public int updateByPrimaryKey(ItSmUser record) throws SQLException {
		int rows = this.getSqlSession().update("itSmUser_updateByPrimaryKey", record);
		return rows;
	}

	/**
	 * This class was generated by Apache iBATIS ibator. This class corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	private static class UpdateByExampleParms extends ItSmUserExample {
		/**
		 * Comment for <code>serialVersionUID</code>
		 */
		private static final long serialVersionUID = 5436719798037427959L;
		private Object record;

		public UpdateByExampleParms(Object record, ItSmUserExample example) {
			super(example);
			this.record = record;
		}

		public Object getRecord() {
			return record;
		}
	}
}