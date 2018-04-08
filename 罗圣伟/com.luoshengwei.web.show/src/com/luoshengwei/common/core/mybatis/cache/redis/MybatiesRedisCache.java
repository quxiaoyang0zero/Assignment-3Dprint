package com.luoshengwei.common.core.mybatis.cache.redis;

import org.apache.ibatis.cache.decorators.LoggingCache;

/**
 * @ClassName:MybatiesRedisCache
 * @Description:(这里用一句话描述这个类的作用)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:51:17
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
public class MybatiesRedisCache extends LoggingCache {

	public MybatiesRedisCache(String id) {
		super(new RedisCache(id));
	}
}
