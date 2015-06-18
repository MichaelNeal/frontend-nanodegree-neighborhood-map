// Poinst of Interest data model
function POI(data) {
    this.name = data.name;
    this.address = data.address;
    this.geoLat = data.geoLat;
    this.geoLong = data.geoLong;
    this.listingID = data.listingID;
}
// JSON for initial data
var locationData = [{
    name: 'Village Corner',
    address: '6655 James B Rivers Dr',
    geoLat: 33.811494,
    geoLong: -84.170716,
    listingID: 22250335
}, {
    name: 'Crazy Rons BBQ',
    address: '6187 E Ponce De Leon Ave',
    geoLat: 33.811810,
    geoLong: -84.172552,
    listingID: 12621168
}, {
    name: 'Stone Mountain Park',
    address: '1000 Robert E Lee Blvd',
    geoLat: 33.803792,
    geoLong: -84.145446,
    listingID: 483660385
}];
// swapped wording for ViewModel to Controller - makes more sense to me this way.
function Controller() {
    var self = this;
    self.locations = ko.observableArray(); // Locations to show
    self.message = ko.observable(); // Message box
    myFilter = ko.observable(''); // Filter by
    self.completeModel = ko.observableArray(); // Stores copy of self.locations
    var currentMarker = null;
    var currentInfowindow = null;
    self.init = function() {
        self.loadMap();
        self.loadPOIs();
        self.getYPData();
        self.addMarkers();
        self.completeModel(self.locations());
    };

    self.loadPOIs = function() {
        // Load JSON data into observable array
        ko.utils.arrayForEach(locationData, function(data) {
            self.locations.push(new POI(data));
        });
    };

    self.loadMap = function() {
        this.neighborhood = new google.maps.LatLng(33.8072392, -84.1578003);
        var mapOptions = {
            center: this.neighborhood,
            zoom: 14,
            disableDefaultUI: true
        };
        // Attach to map DIV
        this.map = new google.maps.Map(document.getElementsByClassName('map-canvas')[0], mapOptions);
        // Makes map responsive on resize
        google.maps.event.addDomListener(window, 'resize', function() {
            var center = self.map.getCenter();
            google.maps.event.trigger(self.map, 'resize');
            self.map.setCenter(center);
        });
    };

    self.filter = function() {
        if (myFilter() === undefined || myFilter() === '') {
            self.locations(self.completeModel()); // reload Array if filtering by undefined or ''
        }
        self.removeMarkers();
        var lookingFor = myFilter().toLowerCase();
        var filtered = []; // Sets array empty
        ko.utils.arrayForEach(self.locations(), function(POI) {
            // Search thru observable array and if found push into temp array filtered
            var item1 = POI.name.toLowerCase();
            var item2 = POI.address.toLowerCase();
            if (item1.indexOf(lookingFor) > -1 || item2.indexOf(lookingFor) > -1) {
                filtered.push(POI);
            }
        });
        // Update with our filtered list
        self.locations(filtered);
        self.addMarkers();
    };

    self.getYPData = function() {
        // Async data retrieval from Yellow Pages
        ko.utils.arrayForEach(self.locations(), function(POI) {
            // Set default values in case no data is returned
            POI.phone = 'Phone Unavailable';
            POI.hours = 'Hours Unavailable';
            $.ajax({
                contentType: 'application/json; charset=utf-8',
                dataType: 'jsonp',
                url: 'http://api2.yp.com/listings/v1/details?listingid=' + POI.listingID + '&key=mhqhlhjb38&format=json',
                success: function(ypData) {
                    var ypDetail = ypData.listingsDetailsResult.listingsDetails.listingDetail[0];
                    if (ypDetail.openHours !== '') {
                        POI.hours = ypDetail.openHours;
                    }
                    if (ypDetail.phone !== '') {
                        POI.phone = ypDetail.phone;
                    }
                },
                error: function() {
                    // Error handling if no data returned
                    var info = 'Some data unavailable. Please check Internet Connection.';
                    alert(info);
                }
            });
        });
    };

    self.addMarkers = function() {
        ko.utils.arrayForEach(self.locations(), function(POI) {
            // Loop thru locations and add markers
            var myLatLng = new google.maps.LatLng(POI.geoLat, POI.geoLong);
            POI.marker = new google.maps.Marker({
                position: myLatLng,
                map: self.map,
                title: POI.name,
                icon: 'images/blue.png'
            });

            // Show user message with details about place when clicking on marker
            google.maps.event.addListener(POI.marker, 'click', function() {
                var contentString = '<span class="msg_name">' + POI.name + '</span>' +
                    '<span class="msg_address">' + POI.address + '</span>' +
                    '<span class="msg_hours">' + POI.phone + '</span>' +
                    '<span class="msg_name">' + POI.name + '</sapn>';
                if (currentInfowindow) {
                    currentInfowindow.close();
                }
                POI.marker.infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                // set reference to open infoWindow
                currentInfowindow = POI.marker.infowindow;
                POI.marker.infowindow.open(self.map, POI.marker);
                // remove the bounce from the 'old' marker
                if (currentMarker) currentMarker.setAnimation(null);
                if (currentMarker === POI.marker) {
                    // stops marker from bouncing if clicked twice
                    currentMarker.setAnimation(null);
                } else {
                    // set this marker to the currentMarker
                    currentMarker = POI.marker;
                    // add a bounce to this marker
                    POI.marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });
            // Change marker color to red on mouseover
            google.maps.event.addListener(POI.marker, 'mouseover', function() {
                POI.marker.setIcon('images/red.png');
            });
            // Change marker color back to blue
            google.maps.event.addListener(POI.marker, 'mouseout', function() {
                POI.marker.setIcon('images/blue.png');
            });
        });
    };

    self.removeMarkers = function() {
        ko.utils.arrayForEach(self.locations(), function(POI) {
            // Remove markers
            POI.marker.setMap(null);
        });
    };

    self.init();
}

$(window).load(function() {
    // Test for Google API on page load
    if (typeof google === 'object' && typeof google.maps === 'object') {
        $('.container-fluid').attr('visibility', 'visible');
        ko.applyBindings(new Controller());
    } else {
        $('.location_list').toggle();
        $('.filter').toggle();
        alert('Unable to Load Google API. Please check your Internet Connection and Reload.');
    }
});