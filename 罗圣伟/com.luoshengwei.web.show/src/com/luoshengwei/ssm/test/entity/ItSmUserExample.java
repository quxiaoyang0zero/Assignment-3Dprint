package com.luoshengwei.ssm.test.entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * @ClassName:ItSmUserExample
 * @Description:(系统管理-用户管理-实体类助手)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:57:57
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class ItSmUserExample implements Serializable {

	/**
	 * Comment for <code>serialVersionUID</code>
	 */
	private static final long serialVersionUID = -8014813317817292760L;
	/**
	 * This field was generated by Apache iBATIS ibator. This field corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	protected String orderByClause;
	/**
	 * This field was generated by Apache iBATIS ibator. This field corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	protected List oredCriteria;

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public ItSmUserExample() {
		oredCriteria = new ArrayList();
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	protected ItSmUserExample(ItSmUserExample example) {
		this.orderByClause = example.orderByClause;
		this.oredCriteria = example.oredCriteria;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public void setOrderByClause(String orderByClause) {
		this.orderByClause = orderByClause;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public String getOrderByClause() {
		return orderByClause;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public List getOredCriteria() {
		return oredCriteria;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public void or(Criteria criteria) {
		oredCriteria.add(criteria);
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public Criteria createCriteria() {
		Criteria criteria = createCriteriaInternal();
		if (oredCriteria.size() == 0) {
			oredCriteria.add(criteria);
		}
		return criteria;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	protected Criteria createCriteriaInternal() {
		Criteria criteria = new Criteria();
		return criteria;
	}

	/**
	 * This method was generated by Apache iBATIS ibator. This method corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public void clear() {
		oredCriteria.clear();
	}

	/**
	 * This class was generated by Apache iBATIS ibator. This class corresponds to the database table IT_SM_USER
	 * @ibatorgenerated  Sat Jan 06 00:19:15 CST 2018
	 */
	public static class Criteria implements Serializable {
		/**
		 * Comment for <code>serialVersionUID</code>
		 */
		private static final long serialVersionUID = 8418930165446724063L;
		protected List criteriaWithoutValue;
		protected List criteriaWithSingleValue;
		protected List criteriaWithListValue;
		protected List criteriaWithBetweenValue;

		protected Criteria() {
			super();
			criteriaWithoutValue = new ArrayList();
			criteriaWithSingleValue = new ArrayList();
			criteriaWithListValue = new ArrayList();
			criteriaWithBetweenValue = new ArrayList();
		}

		public boolean isValid() {
			return criteriaWithoutValue.size() > 0 || criteriaWithSingleValue.size() > 0
					|| criteriaWithListValue.size() > 0 || criteriaWithBetweenValue.size() > 0;
		}

		public List getCriteriaWithoutValue() {
			return criteriaWithoutValue;
		}

		public List getCriteriaWithSingleValue() {
			return criteriaWithSingleValue;
		}

		public List getCriteriaWithListValue() {
			return criteriaWithListValue;
		}

		public List getCriteriaWithBetweenValue() {
			return criteriaWithBetweenValue;
		}

		protected void addCriterion(String condition) {
			if (condition == null) {
				throw new RuntimeException("Value for condition cannot be null");
			}
			criteriaWithoutValue.add(condition);
		}

		protected void addCriterion(String condition, Object value, String property) {
			if (value == null) {
				throw new RuntimeException("Value for " + property + " cannot be null");
			}
			Map map = new HashMap();
			map.put("condition", condition);
			map.put("value", value);
			criteriaWithSingleValue.add(map);
		}

		protected void addCriterion(String condition, List values, String property) {
			if (values == null || values.size() == 0) {
				throw new RuntimeException("Value list for " + property + " cannot be null or empty");
			}
			Map map = new HashMap();
			map.put("condition", condition);
			map.put("values", values);
			criteriaWithListValue.add(map);
		}

		protected void addCriterion(String condition, Object value1, Object value2, String property) {
			if (value1 == null || value2 == null) {
				throw new RuntimeException("Between values for " + property + " cannot be null");
			}
			List list = new ArrayList();
			list.add(value1);
			list.add(value2);
			Map map = new HashMap();
			map.put("condition", condition);
			map.put("values", list);
			criteriaWithBetweenValue.add(map);
		}

		protected void addCriterionForJDBCDate(String condition, Date value, String property) {
			addCriterion(condition, new java.sql.Date(value.getTime()), property);
		}

		protected void addCriterionForJDBCDate(String condition, List values, String property) {
			if (values == null || values.size() == 0) {
				throw new RuntimeException("Value list for " + property + " cannot be null or empty");
			}
			List dateList = new ArrayList();
			Iterator iter = values.iterator();
			while (iter.hasNext()) {
				dateList.add(new java.sql.Date(((Date) iter.next()).getTime()));
			}
			addCriterion(condition, dateList, property);
		}

		protected void addCriterionForJDBCDate(String condition, Date value1, Date value2, String property) {
			if (value1 == null || value2 == null) {
				throw new RuntimeException("Between values for " + property + " cannot be null");
			}
			addCriterion(condition, new java.sql.Date(value1.getTime()), new java.sql.Date(value2.getTime()), property);
		}

		public Criteria andIdIsNull() {
			addCriterion("ID is null");
			return this;
		}

		public Criteria andIdIsNotNull() {
			addCriterion("ID is not null");
			return this;
		}

		public Criteria andIdEqualTo(String value) {
			addCriterion("ID =", value, "id");
			return this;
		}

		public Criteria andIdNotEqualTo(String value) {
			addCriterion("ID <>", value, "id");
			return this;
		}

		public Criteria andIdGreaterThan(String value) {
			addCriterion("ID >", value, "id");
			return this;
		}

		public Criteria andIdGreaterThanOrEqualTo(String value) {
			addCriterion("ID >=", value, "id");
			return this;
		}

		public Criteria andIdLessThan(String value) {
			addCriterion("ID <", value, "id");
			return this;
		}

		public Criteria andIdLessThanOrEqualTo(String value) {
			addCriterion("ID <=", value, "id");
			return this;
		}

		public Criteria andIdLike(String value) {
			addCriterion("ID like", value, "id");
			return this;
		}

		public Criteria andIdNotLike(String value) {
			addCriterion("ID not like", value, "id");
			return this;
		}

		public Criteria andIdIn(List values) {
			addCriterion("ID in", values, "id");
			return this;
		}

		public Criteria andIdNotIn(List values) {
			addCriterion("ID not in", values, "id");
			return this;
		}

		public Criteria andIdBetween(String value1, String value2) {
			addCriterion("ID between", value1, value2, "id");
			return this;
		}

		public Criteria andIdNotBetween(String value1, String value2) {
			addCriterion("ID not between", value1, value2, "id");
			return this;
		}

		public Criteria andCodeIsNull() {
			addCriterion("CODE is null");
			return this;
		}

		public Criteria andCodeIsNotNull() {
			addCriterion("CODE is not null");
			return this;
		}

		public Criteria andCodeEqualTo(String value) {
			addCriterion("CODE =", value, "code");
			return this;
		}

		public Criteria andCodeNotEqualTo(String value) {
			addCriterion("CODE <>", value, "code");
			return this;
		}

		public Criteria andCodeGreaterThan(String value) {
			addCriterion("CODE >", value, "code");
			return this;
		}

		public Criteria andCodeGreaterThanOrEqualTo(String value) {
			addCriterion("CODE >=", value, "code");
			return this;
		}

		public Criteria andCodeLessThan(String value) {
			addCriterion("CODE <", value, "code");
			return this;
		}

		public Criteria andCodeLessThanOrEqualTo(String value) {
			addCriterion("CODE <=", value, "code");
			return this;
		}

		public Criteria andCodeLike(String value) {
			addCriterion("CODE like", value, "code");
			return this;
		}

		public Criteria andCodeNotLike(String value) {
			addCriterion("CODE not like", value, "code");
			return this;
		}

		public Criteria andCodeIn(List values) {
			addCriterion("CODE in", values, "code");
			return this;
		}

		public Criteria andCodeNotIn(List values) {
			addCriterion("CODE not in", values, "code");
			return this;
		}

		public Criteria andCodeBetween(String value1, String value2) {
			addCriterion("CODE between", value1, value2, "code");
			return this;
		}

		public Criteria andCodeNotBetween(String value1, String value2) {
			addCriterion("CODE not between", value1, value2, "code");
			return this;
		}

		public Criteria andNameIsNull() {
			addCriterion("NAME is null");
			return this;
		}

		public Criteria andNameIsNotNull() {
			addCriterion("NAME is not null");
			return this;
		}

		public Criteria andNameEqualTo(String value) {
			addCriterion("NAME =", value, "name");
			return this;
		}

		public Criteria andNameNotEqualTo(String value) {
			addCriterion("NAME <>", value, "name");
			return this;
		}

		public Criteria andNameGreaterThan(String value) {
			addCriterion("NAME >", value, "name");
			return this;
		}

		public Criteria andNameGreaterThanOrEqualTo(String value) {
			addCriterion("NAME >=", value, "name");
			return this;
		}

		public Criteria andNameLessThan(String value) {
			addCriterion("NAME <", value, "name");
			return this;
		}

		public Criteria andNameLessThanOrEqualTo(String value) {
			addCriterion("NAME <=", value, "name");
			return this;
		}

		public Criteria andNameLike(String value) {
			addCriterion("NAME like", value, "name");
			return this;
		}

		public Criteria andNameNotLike(String value) {
			addCriterion("NAME not like", value, "name");
			return this;
		}

		public Criteria andNameIn(List values) {
			addCriterion("NAME in", values, "name");
			return this;
		}

		public Criteria andNameNotIn(List values) {
			addCriterion("NAME not in", values, "name");
			return this;
		}

		public Criteria andNameBetween(String value1, String value2) {
			addCriterion("NAME between", value1, value2, "name");
			return this;
		}

		public Criteria andNameNotBetween(String value1, String value2) {
			addCriterion("NAME not between", value1, value2, "name");
			return this;
		}

		public Criteria andPasswordIsNull() {
			addCriterion("PASSWORD is null");
			return this;
		}

		public Criteria andPasswordIsNotNull() {
			addCriterion("PASSWORD is not null");
			return this;
		}

		public Criteria andPasswordEqualTo(String value) {
			addCriterion("PASSWORD =", value, "password");
			return this;
		}

		public Criteria andPasswordNotEqualTo(String value) {
			addCriterion("PASSWORD <>", value, "password");
			return this;
		}

		public Criteria andPasswordGreaterThan(String value) {
			addCriterion("PASSWORD >", value, "password");
			return this;
		}

		public Criteria andPasswordGreaterThanOrEqualTo(String value) {
			addCriterion("PASSWORD >=", value, "password");
			return this;
		}

		public Criteria andPasswordLessThan(String value) {
			addCriterion("PASSWORD <", value, "password");
			return this;
		}

		public Criteria andPasswordLessThanOrEqualTo(String value) {
			addCriterion("PASSWORD <=", value, "password");
			return this;
		}

		public Criteria andPasswordLike(String value) {
			addCriterion("PASSWORD like", value, "password");
			return this;
		}

		public Criteria andPasswordNotLike(String value) {
			addCriterion("PASSWORD not like", value, "password");
			return this;
		}

		public Criteria andPasswordIn(List values) {
			addCriterion("PASSWORD in", values, "password");
			return this;
		}

		public Criteria andPasswordNotIn(List values) {
			addCriterion("PASSWORD not in", values, "password");
			return this;
		}

		public Criteria andPasswordBetween(String value1, String value2) {
			addCriterion("PASSWORD between", value1, value2, "password");
			return this;
		}

		public Criteria andPasswordNotBetween(String value1, String value2) {
			addCriterion("PASSWORD not between", value1, value2, "password");
			return this;
		}

		public Criteria andTypeIsNull() {
			addCriterion("TYPE is null");
			return this;
		}

		public Criteria andTypeIsNotNull() {
			addCriterion("TYPE is not null");
			return this;
		}

		public Criteria andTypeEqualTo(String value) {
			addCriterion("TYPE =", value, "type");
			return this;
		}

		public Criteria andTypeNotEqualTo(String value) {
			addCriterion("TYPE <>", value, "type");
			return this;
		}

		public Criteria andTypeGreaterThan(String value) {
			addCriterion("TYPE >", value, "type");
			return this;
		}

		public Criteria andTypeGreaterThanOrEqualTo(String value) {
			addCriterion("TYPE >=", value, "type");
			return this;
		}

		public Criteria andTypeLessThan(String value) {
			addCriterion("TYPE <", value, "type");
			return this;
		}

		public Criteria andTypeLessThanOrEqualTo(String value) {
			addCriterion("TYPE <=", value, "type");
			return this;
		}

		public Criteria andTypeLike(String value) {
			addCriterion("TYPE like", value, "type");
			return this;
		}

		public Criteria andTypeNotLike(String value) {
			addCriterion("TYPE not like", value, "type");
			return this;
		}

		public Criteria andTypeIn(List values) {
			addCriterion("TYPE in", values, "type");
			return this;
		}

		public Criteria andTypeNotIn(List values) {
			addCriterion("TYPE not in", values, "type");
			return this;
		}

		public Criteria andTypeBetween(String value1, String value2) {
			addCriterion("TYPE between", value1, value2, "type");
			return this;
		}

		public Criteria andTypeNotBetween(String value1, String value2) {
			addCriterion("TYPE not between", value1, value2, "type");
			return this;
		}

		public Criteria andCreatetimeIsNull() {
			addCriterion("CREATETIME is null");
			return this;
		}

		public Criteria andCreatetimeIsNotNull() {
			addCriterion("CREATETIME is not null");
			return this;
		}

		public Criteria andCreatetimeEqualTo(Date value) {
			addCriterionForJDBCDate("CREATETIME =", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeNotEqualTo(Date value) {
			addCriterionForJDBCDate("CREATETIME <>", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeGreaterThan(Date value) {
			addCriterionForJDBCDate("CREATETIME >", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeGreaterThanOrEqualTo(Date value) {
			addCriterionForJDBCDate("CREATETIME >=", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeLessThan(Date value) {
			addCriterionForJDBCDate("CREATETIME <", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeLessThanOrEqualTo(Date value) {
			addCriterionForJDBCDate("CREATETIME <=", value, "createtime");
			return this;
		}

		public Criteria andCreatetimeIn(List values) {
			addCriterionForJDBCDate("CREATETIME in", values, "createtime");
			return this;
		}

		public Criteria andCreatetimeNotIn(List values) {
			addCriterionForJDBCDate("CREATETIME not in", values, "createtime");
			return this;
		}

		public Criteria andCreatetimeBetween(Date value1, Date value2) {
			addCriterionForJDBCDate("CREATETIME between", value1, value2, "createtime");
			return this;
		}

		public Criteria andCreatetimeNotBetween(Date value1, Date value2) {
			addCriterionForJDBCDate("CREATETIME not between", value1, value2, "createtime");
			return this;
		}

		public Criteria andCreateuserIsNull() {
			addCriterion("CREATEUSER is null");
			return this;
		}

		public Criteria andCreateuserIsNotNull() {
			addCriterion("CREATEUSER is not null");
			return this;
		}

		public Criteria andCreateuserEqualTo(String value) {
			addCriterion("CREATEUSER =", value, "createuser");
			return this;
		}

		public Criteria andCreateuserNotEqualTo(String value) {
			addCriterion("CREATEUSER <>", value, "createuser");
			return this;
		}

		public Criteria andCreateuserGreaterThan(String value) {
			addCriterion("CREATEUSER >", value, "createuser");
			return this;
		}

		public Criteria andCreateuserGreaterThanOrEqualTo(String value) {
			addCriterion("CREATEUSER >=", value, "createuser");
			return this;
		}

		public Criteria andCreateuserLessThan(String value) {
			addCriterion("CREATEUSER <", value, "createuser");
			return this;
		}

		public Criteria andCreateuserLessThanOrEqualTo(String value) {
			addCriterion("CREATEUSER <=", value, "createuser");
			return this;
		}

		public Criteria andCreateuserLike(String value) {
			addCriterion("CREATEUSER like", value, "createuser");
			return this;
		}

		public Criteria andCreateuserNotLike(String value) {
			addCriterion("CREATEUSER not like", value, "createuser");
			return this;
		}

		public Criteria andCreateuserIn(List values) {
			addCriterion("CREATEUSER in", values, "createuser");
			return this;
		}

		public Criteria andCreateuserNotIn(List values) {
			addCriterion("CREATEUSER not in", values, "createuser");
			return this;
		}

		public Criteria andCreateuserBetween(String value1, String value2) {
			addCriterion("CREATEUSER between", value1, value2, "createuser");
			return this;
		}

		public Criteria andCreateuserNotBetween(String value1, String value2) {
			addCriterion("CREATEUSER not between", value1, value2, "createuser");
			return this;
		}

		public Criteria andModifytimeIsNull() {
			addCriterion("MODIFYTIME is null");
			return this;
		}

		public Criteria andModifytimeIsNotNull() {
			addCriterion("MODIFYTIME is not null");
			return this;
		}

		public Criteria andModifytimeEqualTo(Date value) {
			addCriterionForJDBCDate("MODIFYTIME =", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeNotEqualTo(Date value) {
			addCriterionForJDBCDate("MODIFYTIME <>", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeGreaterThan(Date value) {
			addCriterionForJDBCDate("MODIFYTIME >", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeGreaterThanOrEqualTo(Date value) {
			addCriterionForJDBCDate("MODIFYTIME >=", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeLessThan(Date value) {
			addCriterionForJDBCDate("MODIFYTIME <", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeLessThanOrEqualTo(Date value) {
			addCriterionForJDBCDate("MODIFYTIME <=", value, "modifytime");
			return this;
		}

		public Criteria andModifytimeIn(List values) {
			addCriterionForJDBCDate("MODIFYTIME in", values, "modifytime");
			return this;
		}

		public Criteria andModifytimeNotIn(List values) {
			addCriterionForJDBCDate("MODIFYTIME not in", values, "modifytime");
			return this;
		}

		public Criteria andModifytimeBetween(Date value1, Date value2) {
			addCriterionForJDBCDate("MODIFYTIME between", value1, value2, "modifytime");
			return this;
		}

		public Criteria andModifytimeNotBetween(Date value1, Date value2) {
			addCriterionForJDBCDate("MODIFYTIME not between", value1, value2, "modifytime");
			return this;
		}

		public Criteria andModifyuserIsNull() {
			addCriterion("MODIFYUSER is null");
			return this;
		}

		public Criteria andModifyuserIsNotNull() {
			addCriterion("MODIFYUSER is not null");
			return this;
		}

		public Criteria andModifyuserEqualTo(String value) {
			addCriterion("MODIFYUSER =", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserNotEqualTo(String value) {
			addCriterion("MODIFYUSER <>", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserGreaterThan(String value) {
			addCriterion("MODIFYUSER >", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserGreaterThanOrEqualTo(String value) {
			addCriterion("MODIFYUSER >=", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserLessThan(String value) {
			addCriterion("MODIFYUSER <", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserLessThanOrEqualTo(String value) {
			addCriterion("MODIFYUSER <=", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserLike(String value) {
			addCriterion("MODIFYUSER like", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserNotLike(String value) {
			addCriterion("MODIFYUSER not like", value, "modifyuser");
			return this;
		}

		public Criteria andModifyuserIn(List values) {
			addCriterion("MODIFYUSER in", values, "modifyuser");
			return this;
		}

		public Criteria andModifyuserNotIn(List values) {
			addCriterion("MODIFYUSER not in", values, "modifyuser");
			return this;
		}

		public Criteria andModifyuserBetween(String value1, String value2) {
			addCriterion("MODIFYUSER between", value1, value2, "modifyuser");
			return this;
		}

		public Criteria andModifyuserNotBetween(String value1, String value2) {
			addCriterion("MODIFYUSER not between", value1, value2, "modifyuser");
			return this;
		}
	}
}