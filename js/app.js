var map;
var markers = [];
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

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
      	center: {lat: 23.109464, lng: 113.318485},
      	zoom: 10,
      	mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();

    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

	for(var i=0;i<locations.length;i++){
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
			position:position,
			title:title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id:i,
		});

		markers.push(marker);
		locations[i].marker = marker;

		marker.addListener('click', function() {
        	populateInfoWindow(this, largeInfowindow);
        });

	    marker.addListener('click', function() {
	        this.setIcon(highlightedIcon);
	        this.setAnimation(google.maps.Animation.BOUNCE);

	        var obj=this;
		    setTimeout(function() {
		    	obj.setIcon(defaultIcon);
		        obj.setAnimation(null);
		    }, 2000);
	    });
	}

	function populateInfoWindow(marker, infowindow) {
	    if (infowindow.marker != marker) {
		    infowindow.setContent('');
		    infowindow.marker = marker;

		    infowindow.addListener('closeclick',function(){
		        infowindow.marker = null;
		    });

		    var streetViewService = new google.maps.StreetViewService();
		    var radius = 100;


		    var markertitle = marker.title;
		    var wikiUrl = 'https://zh.wikipedia.org/w/api.php?action=opensearch&search='+markertitle+'&format=json&callback=wikiCallback';
		    var stationUrl = 'http://api.jisuapi.com/transit/nearby?city=广州&address='+markertitle+'&appkey=4c76bff3355f585d';


		    function getStreetView(data, status) {
		      	console.log(data);

		        if (status == google.maps.StreetViewStatus.OK) {
		            var nearStreetViewLocation = data.location.latLng;
		            var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);

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
		        }else {
		        	   $("#pano").text("");
		        	   $("#pano").append('<p>===此处没有街景地图===</p>');
		         }
		    }

		    function getWiki(){
		        $.ajax({
	                url:wikiUrl,
	                dataType:"jsonp",
	                success:function(data){
		                console.log(data);

		                var articleHealine= data[1];
		                var articleSummary = data[2];
		                var articleUrl = data[3];

		                for(var i=0;i<articleHealine.length;i++){
		                    if(articleHealine[i]===markertitle){
		                        $("#wiki").append('<p>'+articleSummary[i]+'</p>'+' '+'<a href="'+articleUrl[i]+'">'+'维基百科：'+articleHealine[i]+'</a>');
		                    }
		                }

		                if($("#wiki").text()===""){
		                	$("#wiki").css('text-align','center');
		                	$("#wiki").append('<p>===没有相关的维基百科===</p>');
		                }
	                }
	            });
		      }

		    function getStation(){
		      	$.ajax({
	                url:stationUrl,
	                dataType:"jsonp",
	                success:function(data){
	                	console.log(data);

	                	if(data.status==='0'){
	                		var nearbyStation =data.result;

	                		for(var i= 0;i<5;i++){
	                			var station = nearbyStation[i].station;
	                			var distance = nearbyStation[i].distance;

	                			$('#stationList').append('<li><span>'+station+'——'+distance+'米'+'</span></li>');
	                		}
	                	}else{
	                		$('#stationList').append('<p>错误提示：'+data.msg+'</p>');
	                	}

	                }
	            });
		    }

	        infowindow.setContent(
	    	    '<div id="Information"><div id="markertitle">' + marker.title +
	    	    '</div><div id="pano"></div>'+
	    	    '<div id="wiki"></div>'+
	    	    '<div><h4>附近的公交站有：</h4><ul id="stationList"></ul></div></div>'
	    	);

		    getStation();
		    getWiki();
		    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

        	infowindow.open(map, marker);
        }
    }

	function makeMarkerIcon(markerColor) {
	    var markerImage = new google.maps.MarkerImage(
	        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	        '|40|_|%E2%80%A2',
	        new google.maps.Size(21, 34),
	        new google.maps.Point(0, 0),
	        new google.maps.Point(10, 34),
	        new google.maps.Size(21,34)
	    );
	    return markerImage;
	}

    ko.applyBindings(new ViewModel());

}

var Location = function(data){
	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.location.lat);
	this.lng = ko.observable(data.location.lng);
	this.marker = ko.observable(data.marker);
};

var ViewModel = function(){
   var self=this;

   self.list = ko.observableArray([]);
   self.inputValue = ko.observable('');
   self.mapMarkers = ko.observableArray(markers);

   locations.forEach(function(locationItem){
   	self.list.push(new Location(locationItem));
   });

   this.clickLocation = function(clickedData){
    var clickedmarker = clickedData.marker();
    google.maps.event.trigger(clickedmarker, 'click');
   };



   this.filterList = ko.computed(function(){
	    if(self.inputValue !== ""){

	    	var inputString = self.inputValue().toLowerCase();
	     	self.list.removeAll();

	     	locations.forEach(function(locationItem){

	        locationItem.marker.setMap(null);

	        if(locationItem.title.toLowerCase().includes(inputString)){

	          self.list.push(new Location(locationItem));
	          locationItem.marker.setMap(map);
	        }
	        });
	    }
    }, this);
};
