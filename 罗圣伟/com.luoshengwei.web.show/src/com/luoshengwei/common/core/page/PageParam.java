package com.luoshengwei.common.core.page;

import java.io.Serializable;

import javax.servlet.http.HttpServletRequest;

/**
 * @ClassName:PageParam
 * @Description:(分页参数传递工具类)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:38:12
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class PageParam implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6297178964005032338L;
	private int pageNum; // 当前页数
	private int numPerPage; // 每页记录数

	public PageParam(int pageNum, int numPerPage) {
		super();
		this.pageNum = pageNum;
		this.numPerPage = numPerPage;
	}

	public PageParam(HttpServletRequest req) {
		String pageSize = req.getParameter("pageSize");
		String pageIndex = req.getParameter("pageIndex");
		this.pageNum = Integer.parseInt(pageIndex) + 1;
		this.numPerPage = Integer.parseInt(pageSize);
	}

	/** 当前页数 */
	public int getPageNum() {
		return pageNum;
	}

	/** 当前页数 */
	public void setPageNum(int pageNum) {
		this.pageNum = pageNum;
	}

	/** 每页记录数 */
	public int getNumPerPage() {
		return numPerPage;
	}

	/** 每页记录数 */
	public void setNumPerPage(int numPerPage) {
		this.numPerPage = numPerPage;
	}

}
