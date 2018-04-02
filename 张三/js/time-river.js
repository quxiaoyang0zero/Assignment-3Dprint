var myChart = echarts.init(document.getElementById("main"));	
option = {

    tooltip: {
        trigger: 'axis',
        //坐标轴指示器
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: 'rgba(255,255,255,0.2)',
                width: 1,
                type: 'solid'
            }
        }
    },

    legend: {
        data: [{name:'literature',icon:'circle',textStyle: {color: 'white'}}, 
        {name:'fashion',icon:'circle',textStyle: {color: 'white'}}, 
        {name:'culture',icon:'circle',textStyle: {color: 'white'}},
        {name:'life',icon:'circle',textStyle: {color: 'white'}}, 
        {name:'sdministered',icon:'circle',textStyle: {color: 'white'}}, 
        {name:'science',icon:'circle',textStyle: {color: 'white'}}]
    },

    singleAxis: {
        top: 50,
        bottom: 50,
        axisTick: {},
        axisLabel: {},
        type: 'value',
        min: '2000',
        max: '2015',
        splitNumber: 16,
        nameTextStyle: {
        	color: 'white'
        },
        axisPointer: {
            animation: true,
            label: {
                show: true
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                type: 'dashed',
                opacity: 0.2,
                color: 'white'
            }
        }
    },

    series: [
        {
            type: 'themeRiver',
            itemStyle: {
                emphasis: {
                    shadowBlur: 20,
                    shadowColor: 'rgba(0, 0, 0, 0.8)'
                }
            },
            data: 
            [['2000',39,'literature'],['2001',40,'literature'],['2002',63,'literature'],
			['2003',73,'literature'],['2004',91,'literature'],['2005',94,'literature'],
			['2006',110,'literature'],['2007',106,'literature'],['2008',71,'literature'],
			['2009',111,'literature'],['2010',104,'literature'],['2011',104,'literature'],
			['2012',94,'literature'],['2013',66,'literature'],['2014',77,'literature'],
			['2015',89,'literature'],
			
			['2000',18,'fashion'],['2001',37,'fashion'],['2002',32,'fashion'],
			['2003',35,'fashion'],['2004',62,'fashion'],['2005',95,'fashion'],
			['2006',102,'fashion'],['2007',117,'fashion'],['2008',107,'fashion'],
			['2009',113,'fashion'],['2010',142,'fashion'],['2011',132,'fashion'],
			['2012',122,'fashion'],['2013',127,'fashion'],['2014',113,'fashion'],
			['2015',125,'fashion'],
			
			['2000',26,'culture'],['2001',45,'culture'],['2002',38,'culture'],
			['2003',63,'culture'],['2004',62,'culture'],['2005',97,'culture'],
			['2006',103,'culture'],['2007',101,'culture'],['2008',113,'culture'],
			['2009',105,'culture'],['2010',124,'culture'],['2011',129,'culture'],
			['2012',115,'culture'],['2013',151,'culture'],['2014',144,'culture'],
			['2015',126,'culture'],
			
			['2000',7,'life'],['2001',11,'life'],['2002',16,'life'],
			['2003',25,'life'],['2004',31,'life'],['2005',49,'life'],
			['2006',42,'life'],['2007',85,'life'],['2008',80,'life'],
			['2009',93,'life'],['2010',107,'life'],['2011',109,'life'],
			['2012',113,'life'],['2013',119,'life'],['2014',105,'life'],
			['2015',127,'life'],
			
			['2000',12,'sdministered'],['2001',14,'sdministered'],['2002',16,'sdministered'],
			['2003',24,'sdministered'],['2004',31,'sdministered'],['2005',33,'sdministered'],
			['2006',38,'sdministered'],['2007',54,'sdministered'],['2008',47,'sdministered'],
			['2009',68,'sdministered'],['2010',48,'sdministered'],['2011',62,'sdministered'],
			['2012',54,'sdministered'],['2013',78,'sdministered'],['2014',63,'sdministered'],
			['2015',70,'sdministered'],
			
			['2000',11,'science'],['2001',11,'science'],['2002',19,'science'],
			['2003',24,'science'],['2004',34,'science'],['2005',34,'science'],
			['2006',62,'science'],['2007',49,'science'],['2008',44,'science'],
			['2009',70,'science'],['2010',52,'science'],['2011',55,'science'],
			['2012',59,'science'],['2013',43,'science'],['2014',64,'science'],
			['2015',46,'science']]
        }
    ]
};
myChart.setOption(option);