package com.luoshengwei.common.core.mybatis;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandler;

/**
 * @ClassName:BooleanTypeHandler
 * @Description:(自定义Boolean类型转换器，java中的boolean和jdbc中的int之间转换;true-1;false-0.)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:42:04
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@SuppressWarnings("rawtypes")
public class BooleanTypeHandler implements TypeHandler {

	/*
	 * (非 Javadoc) 
	 * <p>Title:getResult</p>
	 * <p>Description:</p>
	 * @param arg0
	 * @param arg1
	 * @return
	 * @throws SQLException
	 * @see org.apache.ibatis.type.TypeHandler#getResult(java.sql.ResultSet, int)
	 */
	public Object getResult(ResultSet arg0, int arg1) throws SQLException {
		int num = arg0.getInt(arg1);
		Boolean rt = Boolean.FALSE;
		if (num == 1) {
			rt = Boolean.TRUE;
		}
		return rt;
	}

	/*
	 * (非 Javadoc) 
	 * <p>Title:getResult</p>
	 * <p>Description:</p>
	 * @param arg0
	 * @param arg1
	 * @return
	 * @throws SQLException
	 * @see org.apache.ibatis.type.TypeHandler#getResult(java.sql.CallableStatement, int)
	 */
	public Object getResult(CallableStatement arg0, int arg1) throws SQLException {
		Boolean b = arg0.getBoolean(arg1);
		return b == true ? 1 : 0;
	}

	/*
	 * (非 Javadoc) 
	 * <p>Title:setParameter</p>
	 * <p>Description:</p>
	 * @param arg0
	 * @param arg1
	 * @param arg2
	 * @param arg3
	 * @throws SQLException
	 * @see org.apache.ibatis.type.TypeHandler#setParameter(java.sql.PreparedStatement, int, java.lang.Object, org.apache.ibatis.type.JdbcType)
	 */
	public void setParameter(PreparedStatement arg0, int arg1, Object arg2, JdbcType arg3) throws SQLException {
		Boolean b = (Boolean) arg2;
		int value = (Boolean) b == true ? 1 : 0;
		arg0.setInt(arg1, value);
	}

	public Object getResult(ResultSet arg0, String arg1) throws SQLException {
		int num = arg0.getInt(arg1);
		Boolean rt = Boolean.FALSE;
		if (num == 1) {
			rt = Boolean.TRUE;
		}
		return rt;
	}

}
