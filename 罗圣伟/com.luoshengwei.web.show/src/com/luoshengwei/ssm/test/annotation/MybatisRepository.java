package com.luoshengwei.ssm.test.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.stereotype.Component;

/**
 * @ClassName:MybatisRepository
 * @Description:(前沿mybatis扫描注解，此注解用于org.mybatis.spring.mapper.MapperScannerConfigurer扫描)
 * @author:luoshengwei
 * @date:2018-4-6 下午4:54:24
 * @Copyright: 2018 luoshengwei All rights reserved.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Component
public @interface MybatisRepository {
	String value() default "";
}