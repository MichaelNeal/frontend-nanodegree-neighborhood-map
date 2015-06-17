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
    name: "Village Corner",
    address: " 6655 James B Rivers Dr",
    geoLat: 33.811494,
    geoLong: -84.170716,
    listingID: 22250335
}, {
    name: "Crazy Ron's BBQ",
    address: "6187 E Ponce De Leon Ave",
    geoLat: 33.811810,
    geoLong: -84.172552,
    listingID: 12621168
}, {
    name: "Stone Mountain Park",
    address: "1000 Robert E Lee Blvd",
    geoLat: 33.803792,
    geoLong: -84.145446,
    listingID: 483660385
}];
// swapped wording for ViewModel to Controller - makes more sense to me this way.
function Controller() {
    var self = this;

    self.locations = ko.observableArray(); // Locations to show
    self.message = ko.observable(); // Message box
    myFilter = ko.observable(); // Filter by
    self.completeModel = ko.observableArray(); // Stores copy of self.locations
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
        this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        // Makes map responsive on resize
        google.maps.event.addDomListener(window, "resize", function() {
            var center = self.map.getCenter();
            google.maps.event.trigger(self.map, "resize");
            self.map.setCenter(center);
        });
    };

    self.showMsg = function(myMessage) {
        // Function for displaying messages to the user
        self.message(myMessage);
        $("#message").html(myMessage);
        if ($("#message_box").is(":hidden")) {
            $("#message_box").toggle();
        }
    };

    self.filter = function() {
        if (myFilter() === undefined || myFilter() === "") {
            self.locations(self.completeModel()); // reload Array if filtering by undefined or ""
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
            POI.phone = "Phone Unavailable";
            POI.hours = "Hours Unavailable";
            $.ajax({
                contentType: "application/json; charset=utf-8",
                dataType: 'jsonp',
                url: 'http://api2.yp.com/listings/v1/details?listingid=' + POI.listingID + '&key=mhqhlhjb38&format=json',
                success: function(ypData) {
                    var ypDetail = ypData.listingsDetailsResult.listingsDetails.listingDetail[0];
                    if (ypDetail.openHours !== "") {
                        POI.hours = ypDetail.openHours;
                    }
                    if (ypDetail.phone !== "") {
                        POI.phone = ypDetail.phone;
                    }
                },
                error: function() {
                    // Error handling if no data returned
                    var info = "<p>Some data unavailable. Pleas check Internet Connection.</p>";
                    self.showMsg(info);
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
                var info = "<span id='msg_name'>" + POI.name + "</span>" +
                    "<span id='msg_address'>" + POI.address + "</span>" +
                    "<span id='msg_phone'>" + POI.phone + "</span>" +
                    "<span id='msg_hours'>" + POI.hours + "</span>";
                self.showMsg(info);
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

    //Close message box when clicking anywhere in message box
    $("#message_box").click(function() {
            $("#message_box").toggle();
        });
        //Hides our message box
    $("#message_box").toggle();

    self.init();
}

$(window).load(function(){
	// Test for Google API on page load
    if (typeof google === 'object' && typeof google.maps === 'object') {
        $(".container-fluid").attr("visibility", "visible"); 
		ko.applyBindings(new Controller());	
	} else {
		$("#location_list").toggle();
		$("#filter").toggle();
		alert("Unable to Load Google API. Please check your Internet Connection and Reload.");
	}    
});