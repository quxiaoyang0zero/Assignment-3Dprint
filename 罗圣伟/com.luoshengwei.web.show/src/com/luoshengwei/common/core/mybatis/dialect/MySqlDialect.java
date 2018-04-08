package com.luoshengwei.common.core.mybatis.dialect;

/**
 * @ClassName:MySqlDialect
 * @Description:(MySQL数据库分页适配器)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:42:42
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class MySqlDialect extends Dialect {
	public boolean supportsLimitOffset() {
		return true;
	}

	public boolean supportsLimit() {
		return true;
	}

	public String getLimitString(String sql, int offset, String offsetPlaceholder, int limit, String limitPlaceholder) {
		sql = "select * from (select t.*, ROWNUM RM from ( " + sql + " ) t where ROWNUM<=" + limitPlaceholder
				+ " ) where RM> " + offsetPlaceholder;
		return sql;
	}
}
