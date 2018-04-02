var myChart = echarts.init(document.getElementById("PCP"));
		var dataCSCS = [
	    [15, 8.6, 23, 25802],
		[15, 8.4, 32, 2280],
		[15, 8.4, 30, 10671],
		[15, 8.3, 25, 20336],
		[15, 8.1, 13.5, 14902],
		[15, 8.1, 18.8, 19180],
		[15, 8.1, 25, 62512],
		[15, 8, 13, 15427],
		[15, 8.4, 36, 51026],
		[15, 8.3, 45, 7781],
		[15, 8.2, 39, 2346],
		[15, 8.1, 25, 46533],
		[15, 7.6, 39.5, 5016],
		[15, 6.7, 29.5, 2265],
		[15, 8.5, 21, 3235]
	];
	//东野圭吾
	var dataDYGW = [
	    [11, 9.1, 29.8, 200935],
		[11, 8.6, 39.5, 257524],
		[11, 8.4, 18, 72563],
		[11, 7.4, 32, 2010],
		[11, 7, 35, 1670],
		[11, 7.6, 20, 77353],
		[11, 6.6, 36, 6616],
		[11, 7.1, 39.8, 6232],
		[11, 6.8, 39.8, 1864],
		[11, 7.2, 39.8, 5961],
		[11, 8.2, 22, 6540]
	];
	//王小波
	var dataWXB = [
		[13, 9.2, 39, 149],
		[13, 9.1, 18, 99],
		[13, 9.1, 18.8, 18467],
		[13, 9, 39.8, 15],
		[13, 9, 14, 3439],
		[13, 9, 30, 7633],
		[13, 8.8, 30, 159],
		[13, 8.8, 20, 2728],
		[13, 8.8, 18, 36028],
		[13, 8.7, 24, 7803],
		[13, 8.6, 29.8, 191],
		[13, 8.5, 38, 350],
	    [13, 8.9, 37.8, 1217]
	];
	//yuhua
	var dataYH = [
		[10, 9.1, 13, 78594],
		[10, 9.1, 12, 138663],
		[10, 9, 19, 3634],
		[10, 8.5, 38, 10688],
		[10, 8.4, 22, 634],
		[10, 8.3, 18, 17813],
		[10, 8.3, 16, 58991],
		[10, 7.4, 27, 37333],
		[10, 6.8, 29.5, 29814],
		[10, 8.4, 35, 2898]
	];
	
		var schema = [
		    {name: 'num', index: 0, text: '出版数量'},
		    {name: 'score', index: 1, text: '评分'},
		    {name: 'price', index: 2, text: '价格'},
		    {name: 'comment', index: 3, text: '评论数量'}
		];
		
		var lineStyle = {
		    normal: {
		        width: 1,
		        opacity: 0.5
		    }
		};
		
		option = {
		    backgroundColor: '#333',
		    legend: {
		        bottom: 30,
		        data: ['村上春树', '东野圭吾', '王小波','余华'],
		        itemGap: 20,
		        textStyle: {
		            color: '#fff',
		            fontSize: 14
		        }
		    },
		    tooltip: {
		        padding: 10,
		        backgroundColor: '#222',
		        borderColor: '#777',
		        borderWidth: 1,
		        formatter: function (obj) {
		            var value = obj[0].value;
		            return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
		                + obj[0].seriesName + ' ' + value[0] + '数量：'
		                + value[3]
		                + '</div>'
		                + schema[0].text + '：' + value[0] + '<br>'
		                + schema[1].text + '：' + value[1] + '<br>'
		                + schema[2].text + '：' + value[2] + '<br>'
		                + schema[3].text + '：' + value[3] + '<br>';
		        }
		    },
		   
		    parallelAxis: [
		        {dim: 0, name: schema[0].text},
		        {dim: 1, name: schema[1].text},
		        {dim: 2, name: schema[2].text},
		        {dim: 3, name: schema[3].text}
		    ],
		    visualMap: {
		        show: false,
		        min: 0,
		        max: 150,
		        dimension: 2,
		        inRange: {
		            //color: ['#d94e5d','#eac736','#50a3ba','#100aaa']
		            // colorAlpha: [0, 1]
		        }
		    },
		    parallel: {
		        left: '5%',
		        right: '18%',
		        bottom: 100,
		        parallelAxisDefault: {
		            type: 'value',
		            name: '评分',
		            nameLocation: 'end',
		            nameGap: 20,
		            nameTextStyle: {
		                color: '#fff',
		                fontSize: 12
		            },
		            axisLine: {
		                lineStyle: {
		                    color: '#aaa'
		                }
		            },
		            axisTick: {
		                lineStyle: {
		                    color: '#777'
		                }
		            },
		            splitLine: {
		                show: true
		            },
		            axisLabel: {
		                textStyle: {
		                    color: '#fff'
		                }
		            }
		        }
		    },
		    series: [
		        {
		            name: '村上春树',
		            type: 'parallel',
		            lineStyle: lineStyle,
		            data: dataCSCS
		        },
		        {
		            name: '东野圭吾',
		            type: 'parallel',
		            lineStyle: lineStyle,
		            data: dataDYGW
		        },
		        {
		            name: '王小波',
		            type: 'parallel',
		            lineStyle: lineStyle,
		            data: dataWXB
		        },
		        {
		            name: '余华',
		            type: 'parallel',
		            lineStyle: lineStyle,
		            data: dataYH
		        }
		    ]
		};
		myChart.setOption(option);