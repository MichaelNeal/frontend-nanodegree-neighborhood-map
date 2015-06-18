function POI(e){this.name=e.name,this.address=e.address,this.geoLat=e.geoLat,this.geoLong=e.geoLong,this.listingID=e.listingID}function Controller(){var e=this;e.locations=ko.observableArray(),e.message=ko.observable(),myFilter=ko.observable(""),e.completeModel=ko.observableArray();var o=null;e.init=function(){e.loadMap(),e.loadPOIs(),e.getYPData(),e.addMarkers(),e.completeModel(e.locations())},e.loadPOIs=function(){ko.utils.arrayForEach(locationData,function(o){e.locations.push(new POI(o))})},e.loadMap=function(){this.neighborhood=new google.maps.LatLng(33.8072392,-84.1578003);var o={center:this.neighborhood,zoom:14,disableDefaultUI:!0};this.map=new google.maps.Map(document.getElementsByClassName("map-canvas")[0],o),google.maps.event.addDomListener(window,"resize",function(){var o=e.map.getCenter();google.maps.event.trigger(e.map,"resize"),e.map.setCenter(o)})},e.filter=function(){(void 0===myFilter()||""===myFilter())&&e.locations(e.completeModel()),e.removeMarkers();var o=myFilter().toLowerCase(),a=[];ko.utils.arrayForEach(e.locations(),function(e){var n=e.name.toLowerCase(),t=e.address.toLowerCase();(n.indexOf(o)>-1||t.indexOf(o)>-1)&&a.push(e)}),e.locations(a),e.addMarkers()},e.getYPData=function(){ko.utils.arrayForEach(e.locations(),function(e){e.phone="Phone Unavailable",e.hours="Hours Unavailable",$.ajax({contentType:"application/json; charset=utf-8",dataType:"jsonp",url:"http://api2.yp.com/listings/v1/details?listingid="+e.listingID+"&key=mhqhlhjb38&format=json",success:function(o){var a=o.listingsDetailsResult.listingsDetails.listingDetail[0];""!==a.openHours&&(e.hours=a.openHours),""!==a.phone&&(e.phone=a.phone)},error:function(){var e="Some data unavailable. Please check Internet Connection.";alert(e)}})})},e.addMarkers=function(){ko.utils.arrayForEach(e.locations(),function(a){var n=new google.maps.LatLng(a.geoLat,a.geoLong);a.marker=new google.maps.Marker({position:n,map:e.map,title:a.name,icon:"images/blue.png"}),google.maps.event.addListener(a.marker,"click",function(){var n='<span class="msg_name">'+a.name+'</span><span class="msg_address">'+a.address+'</span><span class="msg_hours">'+a.phone+'</span><span class="msg_name">'+a.name+"</sapn>",t=new google.maps.InfoWindow({content:n});t.open(e.map,a.marker),o&&o.setAnimation(null),o===a.marker?o.setAnimation(null):(o=a.marker,a.marker.setAnimation(google.maps.Animation.BOUNCE))}),google.maps.event.addListener(a.marker,"mouseover",function(){a.marker.setIcon("images/red.png")}),google.maps.event.addListener(a.marker,"mouseout",function(){a.marker.setIcon("images/blue.png")})})},e.removeMarkers=function(){ko.utils.arrayForEach(e.locations(),function(e){e.marker.setMap(null)})},e.init()}var locationData=[{name:"Village Corner",address:"6655 James B Rivers Dr",geoLat:33.811494,geoLong:-84.170716,listingID:22250335},{name:"Crazy Rons BBQ",address:"6187 E Ponce De Leon Ave",geoLat:33.81181,geoLong:-84.172552,listingID:12621168},{name:"Stone Mountain Park",address:"1000 Robert E Lee Blvd",geoLat:33.803792,geoLong:-84.145446,listingID:483660385}];$(window).load(function(){"object"==typeof google&&"object"==typeof google.maps?($(".container-fluid").attr("visibility","visible"),ko.applyBindings(new Controller)):($(".location_list").toggle(),$(".filter").toggle(),alert("Unable to Load Google API. Please check your Internet Connection and Reload."))});