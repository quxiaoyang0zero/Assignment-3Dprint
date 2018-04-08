/**
 * 
 */
package com.luoshengwei.common.core.page;

import java.util.List;

import com.luoshengwei.common.core.entity.BaseEntity;


/**
 * @author Administrator
 *
 */
public class UIPageResult {
	//数据
	private List<Object> data;
	//当前查询数据大小
	private int total;
	public int getTotal() {
		return total;
	}
	public void setTotal(int total) {
		this.total = total;
	}
	public List<Object> getData() {
		return data;
	}
	public void setData(List<Object> data) {
		this.data = data;
	}
}
