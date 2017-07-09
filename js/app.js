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
	  {title: '广东省博物馆', location: {lat: 23.11476, lng: 113.326313}}
	];

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 23.109464, lng: 113.318485},
      zoom: 11,
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
			//map:map,
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

	      function getStreetView(data, status) {
	      	console.log(data)
	        if (status == google.maps.StreetViewStatus.OK) {
	          var nearStreetViewLocation = data.location.latLng;
	          var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
	            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
	            var panoramaOptions = {
	              position: nearStreetViewLocation,
	              pov: {
	                heading: heading,
	                pitch: 30
	              }
	            };
	          var panorama = new google.maps.StreetViewPanorama(
	            document.getElementById('pano'), panoramaOptions);
	        } else {
	          infowindow.setContent('<div>' + marker.title + '</div>' +
	            '<div>此处没有街景地图</div>');
	        }
	      }

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
          new google.maps.Size(21,34));
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
