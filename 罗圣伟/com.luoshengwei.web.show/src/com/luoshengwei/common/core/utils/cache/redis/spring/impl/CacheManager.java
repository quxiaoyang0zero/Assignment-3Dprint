package com.luoshengwei.common.core.utils.cache.redis.spring.impl;

import java.util.Collection;

import org.springframework.cache.Cache;
import org.springframework.cache.support.AbstractCacheManager;

/**
 * @ClassName:CacheManager
 * @Description:(继承了 spring 内置的 AbstractCacheManager 管理 RedisCache 类缓存管理)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:44:27
 * @param <T>
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class CacheManager<T extends Object> extends AbstractCacheManager {

	private Collection<? extends RedisCache> caches;

	public void setCaches(Collection<? extends RedisCache> caches) {
		this.caches = caches;
	}

	@Override
	protected Collection<? extends Cache> loadCaches() {
		return this.caches;
	}
}
