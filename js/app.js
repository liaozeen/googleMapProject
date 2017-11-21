var map;
//创建一个全局的空数组，用于存储实例化后的标记marker
var markers = [];
//创建一个全局变量，用于存储当前被点击的标记的id值
var number = 0;
var locations = [
	    {title: '中山大学北校区', location: {lat:23.129857, lng: 113.291691}},
	  	{title: '华南理工大学', location: {lat: 23.151297, lng: 113.34463}},
	  	{title: '广州美术学院', location: {lat: 23.040989, lng: 113.382773}},
	  	{title: '大夫山森林公园', location: {lat:22.945073, lng: 113.301972}},
	  	{title: '火炉山森林公园', location: {lat: 23.18219, lng: 113.389797}},
	  	{title: '广州大学城体育中心', location: {lat:23.056781, lng: 113.391122}},
	  	{title: '广州国际会展中心', location: {lat:23.101982, lng:113.360771}},
	  	{title: '天河体育中心体育场', location: {lat: 23.139983, lng:113.305693}},
	  	{title: '广州动物园', location: {lat:23.139983, lng:113.305693}},
	  	{title: '华南植物园', location: {lat:23.18684, lng: 113.364208}},
	  	{title: '长隆欢乐世界', location: {lat: 22.99665, lng:113.328853}},
	  	{title: '广东省博物馆', location: {lat: 23.11476, lng: 113.326313}},
	  	{title: '光孝寺', location: {lat:23.129482, lng:113.256333}},
	  	{title: '南越国宫署遗址', location: {lat:23.126417, lng:113.270057}},
	  	{title: '黄埔军校旧址纪念馆', location: {lat:23.086484, lng:113.425263}},
	  	{title: '广东科学中心', location: {lat:23.041875, lng:113.364969}},
	  	{title: '广东广雅中学', location: {lat: 23.137097, lng:113.241103}},
	  	{title: '孙中山大元帅府纪念馆', location: {lat:23.109774, lng: 113.278999}},
	  	{title: '天主教露德圣母堂', location: {lat:23.107314, lng:113.247682}},
	  	{title: '三元宫', location: {lat: 23.134744, lng:113.263246}},
	  	{title: '星海音乐学院', location: {lat:23.149802, lng:113.304132}},
	];

//Google地图API请求成功调用initMap()函数，初始化地图
function initMap(){
	//生成一个地图实例
    map = new google.maps.Map(document.getElementById('map'), {
      	center: {lat: 23.151297, lng:113.291691},//地图中心坐标
      	zoom: 10,//地图详细倍数
      	mapTypeControl: false //地图的一些控件，如放大缩小、卫星地图等。true为开启（默认），false为隐藏
    });

    //当地图的中心偏离当前被点击的标记的所在位置时，3秒后地图中央会回到标记的位置
    map.addListener('center_changed', function() {
          window.setTimeout(function() {
          	//获取当前标记的经纬坐标值
            map.panTo(locations[number].location);
          }, 3000);
    });

    //生成信息窗口实例
    var largeInfowindow = new google.maps.InfoWindow();

    //标记的颜色变量，作为marker的属性icon的值
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    //遍历地址数组locations的元素，生成对应的标记对象marker
	for(var i=0;i<locations.length;i++){
		var position = locations[i].location;
		var title = locations[i].title;

		//生成标记对象实例
		var marker = new google.maps.Marker({
			position:position,//标记的坐标
			title:title,//标记名称
			icon: defaultIcon,//标记的样式
			animation: google.maps.Animation.DROP,	//标记下落的动画效果
			id:i,//标记的唯一编号
		});
		//为marker添加新的属性：lat和lng，以便后面的API请求使用标记的经纬度值
		marker.lat = position.lat;
		marker.lng = position.lng;

		//将生成的marker对象添加到数组对象markers中
		markers.push(marker);
		//为locations的每个元素添加新的属性：marker对象，以便ViewModel调用
		locations[i].marker = marker;
		//当标记被点击时，显示信息窗口
		marker.addListener('click', function() {
			//this指向当前的标记
        	populateInfoWindow(this, largeInfowindow);
        });

		//当标记被点击时，标记的颜色改变并出现弹跳效果，2秒后恢复原来的颜色并停止弹跳
	    marker.addListener('click', function() {
	        this.setIcon(highlightedIcon);//改变标记的颜色
	        this.setAnimation(google.maps.Animation.BOUNCE);//标记弹跳效果

	        var obj=this;//把当前上下文存储在变量obj中
		    setTimeout(function() {
		    	obj.setIcon(defaultIcon);
		        obj.setAnimation(null);
		    }, 2000);
	    });

	    //当标记被点击时，使标记移到地图中央
	    marker.addListener('click', function() {
	    	//获取当前标记的属性id的值，以便将标记的坐标设置为地图的中央的坐标
	    	number = this.id;
	    	//地图视野大小更改
            map.setZoom(11);
            //设置地图的中央为当前标记的坐标
            map.setCenter(this.getPosition());
        });

	}

	function populateInfoWindow(marker, infowindow) {
	    if (infowindow.marker != marker) {
		    infowindow.setContent('');
		    infowindow.marker = marker;

		    //当信息窗口关闭时，清空infowindow的marker属性
		    infowindow.addListener('closeclick',function(){
		        infowindow.marker = null;
		    });

		    //生成街景地图实例
		    var streetViewService = new google.maps.StreetViewService();
		    //该变量的作用是寻找标记所在位置的半径为100米内的街景地图
		    var radius = 100;
			//标记的名称
		    var markertitle = marker.title;

		    //API的请求格式
		    var wikiUrl = 'https://zh.wikipedia.org/w/api.php?action=opensearch&search='+markertitle+'&format=json&callback=wikiCallback';
		    var stationUrl = 'https://api.jisuapi.com/transit/nearby?city=广州&address='+markertitle+'&appkey=4c76bff3355f585d';
		    var weatherUrl = 'https://api.caiyunapp.com/v2/GrHSrW6xIME5WtYy/'+marker.lng+','+marker.lat+'/realtime.json';

		    //谷歌街景地图API请求
		    function getStreetView(data, status) {
		      	console.log(data);
		      	//请求成功，在信息窗口显示标记附近的街景地图
		        if (status == google.maps.StreetViewStatus.OK) {
		            var nearStreetViewLocation = data.location.latLng;
		            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);

		            //清空#pano的原内容，更改height属性的值，使得街景地图可以在信息窗口显示出来
		            $("#pano").text("");
		            $("#pano").css('height','200px');

		            var panoramaOptions = {
		                position: nearStreetViewLocation,
		                pov: {
		                    heading: heading,
		                    pitch: 30
		                }
		            };

		            var panorama = new google.maps.StreetViewPanorama(
		                document.getElementById('pano'), panoramaOptions);
		        //处理错误
		        }else {
		        	   $("#pano").text("");
		        	   $("#pano").append('<p>===此处没有街景地图===</p>');
		         }
		    }

		    //维基百科API请求
		    function getWiki(){
		        $.ajax({
		        	//请求地址
	                url:wikiUrl,
	                //响应的数据格式
	                dataType:"jsonp",
	                //请求成功，运行该函数
	                success:function(data){
		                console.log(data);
		                //分别获取维基百科的标题、文章概要和文章地址
		                var articleHealine= data[1];
		                var articleSummary = data[2];
		                var articleUrl = data[3];
		                //筛选返回的结果，只显示维基百科的文章标题和标记的名称相一致的结果
		                for(var i=0;i<articleHealine.length;i++){
		                    if(articleHealine[i]===markertitle){
		                    	$("#wiki").text("");
		                        $("#wiki").append('<p>'+articleSummary[i]+'</p>'+' '+'<a href="'+articleUrl[i]+'">'+'维基百科：'+articleHealine[i]+'</a>');
		                    }
		                }
		                //如果没有与标记的名称相同的维基百科内容，则在信息窗口显示错误提示
		                if($("#wiki").text()===""){
		                	$("#wiki").css('text-align','center');
		                	$("#wiki").text("");
		                	$("#wiki").append('<p>===没有相关的维基百科===</p>');
		                }
	                }
	            });
		      }

		    //附近公交站API请求
		    function getStation(){
		    	console.log("公交API请求函数已运行");
		      	$.ajax({
	                url:stationUrl,
	                dataType:"jsonp",
	                success:function(data){
	                	console.log(data);

	                	//请求成功
	                	if(data.status==='0'){
	                		var nearbyStation =data.result;
	                		$("#stationList").text("");
	                		//在信息窗口显示最多五个公交站信息
	                		//将for(var i= 0;i<5;i++)改为for(let i in nearbyStation){if(i>4) return;...}
	                		//修改原因：有些情况下返回的数据少于5个信息，多出来的几个循环就会因数据取不到而报错。
	                		for(let i in nearbyStation){
	                			if(i>4) return;
	                			var nearStation = nearbyStation[i].station;
	                			var nearDistance = nearbyStation[i].distance;

	                			$('#stationList').append('<li><span>'+nearStation+'——'+nearDistance+'米'+'</span></li>');
	                		}
	                	}else{
	                		//处理错误，并显示在信息窗口
	                		$("#stationList").text("");
	                		$('#stationList').append('<p>错误提示：'+data.msg+'</p>');
	                	}

	                }
	            });
		    }

		    //彩云天气API请求
		    function getWeather(){
		    	console.log("天气API请求函数已运行");

		    	//使用jQuery调用API
		    	$.ajax({
		    		url:weatherUrl,
		    		dataType:"jsonp",
		    		success:function(data){
	                	console.log(data);
	                	//将响应的结果result赋予变量realtimeweather
	                	var realtimeweather = data.result;
	                	//如果status为ok，即有可用数据返回，立即调用返回的数据
	                	if(data.status==='ok'){
	                		//温度变量
	                		var temperature = realtimeweather.temperature;
	                		//天气状况变量，根据返回的值转换为中文
	                		var skycon ;
                			switch(realtimeweather.skycon){
                				case "CLEAR_DAY":
                					skycon = "晴";
                					break;
                				case "CLEAR_NIGHT":
                					skycon = "晴";
                					break;
                				case "PARTLY_CLOUDY_DAY":
                				    skycon =  "多云";
                				    break;
                				case "PARTLY_CLOUDY_NIGHT":
                					skycon =  "多云";
                					break;
                				case "CLOUDY":
                					skycon = "阴";
                					break;
                				case "RAIN":
                					skycon = "雨";
                					break;
                				case "SNOW":
                					skycon = "雪";
                					break;
                				case "WIND":
                					skycon = "风";
                					break;
                				case "FOG":
                					skycon = "雾";
                					break;
                		    }
                		    //PM2.5变量
	                		var pm25 = realtimeweather.pm25;
	                		//0.03-0.25是小雨，0.25-0.35是中雨, 0.35以上是大雨
	                		if(realtimeweather.precipitation.local.status==='ok'){
	                			var precipitation = realtimeweather.precipitation.local.intensity;
	                			if(precipitation<0.03){
	                				precipitation = "无雨";
	                			}else if(0.03<=precipitation<0.25){
	                				precipitation = "小雨";
	                			}else if(0.25<=precipitation<0.35){
	                				precipitation = "中雨";
	                			}else if(0.35<=precipitation){
	                				precipitation = "大雨";
	                			}
	                		}

	                		//在信息窗口信息标记所在位置的实时天气情况
	                		$("#weather").text("");
	                		$('#weather').append('<li>温度：'+temperature+'</li>'+
	                			'<li>天气：'+skycon+'</li>'+
	                			'<li>降雨情况：'+precipitation+'</li>'+
	                			'<li>PM2.5：'+pm25+'</li>'+
	                			'<li>来源：<a href="https://caiyunapp.com/">彩云天气</a></li>'
	                			);

	                	}else{
	                		//处理错误，并显示在信息窗口
	                		$("#weather").text("");
	                		$('#weather').append('<p>错误提示：'+data.error+'</p>');
	                	}

	                }
		    	});
		    }

		    //为标记的信息窗口添加内容
	        infowindow.setContent(
	    	    '<div id="markertitle">' + marker.title +
	    	    '</div><div id="Information"><div id="pano">正在加载街景地图...</div>'+
	    	    '<div id="wiki">正在加载维基百科...</div>'+
	    	    '<div><h4>附近的公交站有：</h4><ul id="stationList">正在加载公交信息...</ul></div>'+
	    	    '<div><h4>实时天气：</h4><ul id="weather">正在加载天气信息...</ul></div></div>'
	    	);

	        //运行API的函数，发出请求并处理响应，根据结果更改信息窗口infowindow的内容
		    getStation();
		    getWiki();
		    getWeather();
		    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

		    //显示标记的信息窗口
        	infowindow.open(map, marker);
        }
    }

    //输入颜色参数，更改标记的颜色
	function makeMarkerIcon(markerColor) {
	    var markerImage = new google.maps.MarkerImage(
	        'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	        '|40|_|%E2%80%A2',
	        new google.maps.Size(21, 34),
	        new google.maps.Point(0, 0),
	        new google.maps.Point(10, 34),
	        new google.maps.Size(21,34)
	    );
	    return markerImage;
	}
	//激活KO绑定，启动ViewModel函数
    ko.applyBindings(new ViewModel());
}

//将所有与地点相关的属性放进在地点模型Location作为Knockout监控对象
//模型（数据）
var Location = function(data){
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.location.lat);
	this.lng = ko.observable(data.location.lng);
	this.marker = ko.observable(data.marker);
};

//视觉模型（控制器）
var ViewModel = function(){
   var self=this;
   //定义监控属性，与DOM对象绑定
   self.list = ko.observableArray([]);
   self.inputValue = ko.observable('');
   self.mapMarkers = ko.observableArray(markers);
   //遍历数组对象的所有元素，生成Location实例存储在self.list里
   locations.forEach(function(locationItem){
   		self.list.push(new Location(locationItem));
   });
   //列表与标记绑定，当列表的子项被点击时，将点击事件传给相应的标记
   this.clickLocation = function(clickedData){
    	var clickedmarker = clickedData.marker();
		google.maps.event.trigger(clickedmarker, 'click');
   };


   //跟踪输入框的内容的变化，传入输入框接收到的字符串
   this.filterList = ko.computed(function(){
   		//如果接收到字符串，则执行该段代码
	    if(self.inputValue !== ""){
			//将输入的字符串转换为大写
			//优化：添加toLowerCase方法可以用于同时处理中英文字符串
	    	var inputString = self.inputValue().toLowerCase();
	    	//清空列表的内容
	     	self.list.removeAll();
	     	//遍历地点数组locations的元素，显示符合要求的标记
	     	locations.forEach(function(locationItem){
	     		//在地图上隐藏元素的标记
	        	locationItem.marker.setMap(null);
	        	//如果标记的名称title部分或全部的字符串与输入框传递的字符串相同，则执行该段代码
	        	if(locationItem.title.toLowerCase().includes(inputString)){
	        		//在列表显示符合条件的标记名称
	          		self.list.push(new Location(locationItem));
	          		//在地图上显示符合条件的标记
	         	    locationItem.marker.setMap(map);
	            }
	        });
	    }
    }, this);

   //显示侧边栏
   this.openNav = function(){
   	 $("#container").css('display','block');
   	 $(".close").css('display','block');
   };

   //隐藏侧边栏
   this.closeNav = function(){
   	 $("#container").css('display','none');
   	 $(".close").css('display','none');
   };
};
