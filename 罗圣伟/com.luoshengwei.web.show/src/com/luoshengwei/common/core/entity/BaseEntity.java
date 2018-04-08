package com.luoshengwei.common.core.entity;

import java.io.Serializable;
import java.util.Date;

/**
 * @ClassName:BaseEntity
 * @Description:(基础实体类，包含各实体公用属性)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:39:50
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class BaseEntity implements Serializable {

	private static final long serialVersionUID = 1L;
	private String id;
	private Integer version = 0;
	/**
	 * 创建时间
	 */
	protected Date createTime = new Date();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

}
