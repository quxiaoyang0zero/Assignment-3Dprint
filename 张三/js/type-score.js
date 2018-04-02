var myChart = echarts.init(document.getElementById("type-score"));
		var data = echarts.dataTool.prepareBoxplotData([
			[ 5.4 , 9.9 , 8.4056 ],
			[ 4.2 , 10 , 7.9852 ],
			[ 5.1 , 10 , 8.4472 ],
			[ 4.6 , 10 , 8.0408 ],
			[ 4.3 , 9.8 , 7.9061 ],
			[ 2 , 10 , 8.0863 ]
			]);
	
	option = {
	    title: [
	        {
	            text: '类别和评分间的关系',
	            left: 'center',
	        },
	        {
	            text: '',
	            borderColor: '#999',
	            borderWidth: 1,
	            textStyle: {
	                fontSize: 14
	            },
	            left: '10%',
	            top: '90%'
	        }
	    ],
	    tooltip: {
	        trigger: 'item',
	        axisPointer: {
	            type: 'shadow'
	        }
	    },
	    grid: {
	        left: '10%',
	        right: '10%',
	        bottom: '15%'
	    },
	    xAxis: {
	        type: 'category',
	        data:  ['文学','流行','文化','生活','经管','科技'],
	        boundaryGap: true,
	        nameGap: 30,
	        splitArea: {
	            show: false
	        },
	       
	        splitLine: {
	            show: false
	        }
	    },
	    yAxis: {
	        type: 'value',
	        name: '评分',
	        splitArea: {
	            show: true
	        }
	    },
		    series: [
	        {
	            name: 'boxplot',
	            type: 'boxplot',
	            data: data.boxData,
	            tooltip: {
	                formatter: function (param) {
	                    return [
	                        'Experiment ' + param.name + ': ',
                        	'upper: ' + param.data[5],
                        	'median: ' + param.data[3],
                        	'lower: ' + param.data[1]
	                        
	                    ].join('<br/>')
	                }
	            }
	        }
	        /*,
	        {
	            name: 'outlier',
	            type: 'scatter',
	            data: data.outliers
	        }*/
	    ]
	};
	myChart.setOption(option);
	
