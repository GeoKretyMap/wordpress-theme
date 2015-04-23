jQuery().ready(function(){
var opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: true, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};
//var target = document.getElementById('map-loading');
//var spinner = new Spinner(opts).spin(target);
jQuery('#map').spin(opts);




var url;
var latLng;
var zoom=4;
var countloading=0;

var geoOptions = {
    enableHighAccuracy: false,
    timeout: 5000, // Wait 5 seconds
    maximumAge: 300000 //  Valid for 5 minutes
};

var userLocationFound = function(position){
    latLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    window.console.log("User confirmed! Location found: " + latLng.lat + ", " + latLng.lng);
    zoom=9;
    jQuery('#older').prop('checked', true);
    mapGK();
}

var userLocationNotFound = function(){
    //window.console.log("Fallback to FreeGeoIp");
    //jQuery.ajax( { 
    //  url: 'http://freegeoip.net/json/', 
    //  type: 'POST', 
    //  dataType: 'jsonp',
    //  success: function(location) {
    //    if (location.longitude) {
    //      latLng = {
    //          lat: location.latitude,
    //          lng: location.longitude
    //      };
    //      window.console.log("Fallback set to: ", latLng);
    //      latLng.lat = location.latitude;
    //      latLng.lng = location.longitude;
    //      jQuery('#older').prop('checked', false);
    //      zoom=7;
    //      mapGK();
    //    }
    //  },
    //  error: function() {
          window.console.log("FreeGeoIp failed");
          latLng = {  // Paris
              lat: 48.856578, // fallback lat 
              lng: 2.351828  // fallback lng
          };
          window.console.log("Fallback set to Paris: ", latLng);
          jQuery('#older').prop('checked', false);
          mapGK();
    //  }
    //} );
}

if (navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(userLocationFound, userLocationNotFound, geoOptions);
    setTimeout(function () {
        if(!latLng){
            window.console.log("No confirmation from user, using fallback");
            userLocationNotFound();
        }
    }, geoOptions.timeout + 1000); // Wait extra second
} else {
    window.console.log("No support, using fallback");
    userLocationNotFound();
}

function mapGK() {
 var map = new mxn.Mapstraction('map', 'openlayers'); 
 var latlon = new mxn.LatLonPoint(latLng.lat, latLng.lng); // center on Paris
 map.setCenterAndZoom(latlon, zoom);
 map.enableScrollWheelZoom();
 map.addLargeControls();
 map.addMapTypeControls();
 var opts = {};
 map.declutterMarkers(opts);
 map.endPan.addHandler(function(eventName, eventSource, eventArgs) { refreshMap(eventName, eventSource, eventArgs); });
 refreshMap(null, map, null);

 jQuery('#newer').change(function() {
    if(jQuery(this).is(":checked")) {
       retrieve("newer", 22);
       return;
    } else {
      jQuery('#pointsstats-newer').html();
    }
    map.removeAllMarkers();
    if ( jQuery('#older').is(':checked') ) {
     retrieve("older", 22);
    }
    if ( jQuery('#ghosts').is(':checked') ) {
     retrieve("ghosts", 22);
    }
 });
 jQuery('#older').change(function() {
    if(jQuery(this).is(":checked")) {
       retrieve("older", 22);
       return;
    } else {
      jQuery('#pointsstats-older').html();
    }
    map.removeAllMarkers();
    if ( jQuery('#newer').is(':checked') ) {
     retrieve("newer", 22);
    }
    if ( jQuery('#ghosts').is(':checked') ) {
     retrieve("ghosts", 22);
    }
 });
 jQuery('#ghosts').change(function() {
    if(jQuery(this).is(":checked")) {
       retrieve("ghosts", 22);
       return;
    } else {
      jQuery('#pointsstats-ghosts').html();
    }
    map.removeAllMarkers();
    if ( jQuery('#newer').is(':checked') ) {
     retrieve("newer", 22);
    }
    if ( jQuery('#older').is(':checked') ) {
     retrieve("older", 22);
    }
 });
 
 function refreshMap(event_name, event_source, event_args) { 
  var mapBounds = event_source.getBounds();
  var latlonTL = mapBounds.getNorthEast();
  var latlonBR = mapBounds.getSouthWest();
  var latTL=latlonTL.latConv();
  var lonTL=latlonTL.lonConv();
  var latBR=latlonBR.latConv();
  var lonBR=latlonBR.lonConv();
  var zoom = event_source.getZoom();
  url="//api.geokretymap.org/getPoints.php?latTL="+latlonTL.lat+"&lonTL="+latlonTL.lon+"&latBR="+latlonBR.lat+"&lonBR="+latlonBR.lon+"&zoom="+zoom;

  if (zoom > 8 && !jQuery('#ghosts').is(":checked")) {
    jQuery('#older').prop('checked', true);
  }

  map.removeAllMarkers();
  if ( jQuery('#older').is(':checked') ) {
   retrieve("older", 22);
  }
  if ( jQuery('#newer').is(':checked') ) {
   retrieve("newer", 22);
  }
  if ( jQuery('#ghosts').is(':checked') ) {
   retrieve("ghosts", 22);
  }
 }
 

 function retrieve(from, size) {
   countloading++;
   jQuery('#map').spin();
   var data;
   var xml;
   jQuery.ajax({
    dataType: "xml",
    url: url+"&"+from,
    success: parse,
    error: function(){
     alert("Error: Something went wrong");
     if (countloading == 1) {
      jQuery('#map').spin(false);
      countloading--;
     }
    }
    });
 
  function parse(doc){
   jQuery('#map').spin();
   var counter = jQuery(doc).find( "geokret" ).length;
   jQuery('#pointsstats-'+from).html("("+counter+")");
   jQuery(doc).find( "geokret" ).each(function() {
    //adding features to map
    var point = new mxn.LatLonPoint(jQuery(this).attr('lat'),jQuery(this).attr('lon'));
    var marker = new mxn.Marker(point);
    marker.setIcon('/map-pin-'+from+'.png', [14, 22] );
    marker.setInfoBubble(getInfos(this));
    map.addMarker(marker);
   });
   if (countloading == 1) {
    jQuery('#map').spin(false);
   }
   countloading--;
  }

  function getInfos(gk) {
   var text = '<a href="//geokretymap.org/'+jQuery(gk).attr('id')+'" target="_blank">'+jQuery(gk).text()+'</a>';
   var dist = jQuery(gk).attr('dist');
   if (typeof dist !== typeof undefined && dist !== false) {
    text += ' ('+jQuery(gk).attr('dist')+'&nbsp;km)';
   }
   var waypoint = jQuery(gk).attr('waypoint');
   if (typeof waypoint !== typeof undefined && waypoint !== false) {
    text += '<br/>In: <a href="//geokrety.org/go2geo/index.php?wpt='+jQuery(gk).attr('waypoint')+'" target="_blank">'+jQuery(gk).attr('waypoint')+'</a>';
   }
   var date = jQuery(gk).attr('date');
   if (typeof date !== typeof undefined && date !== false) {
    text += '<br/>Last move: '+jQuery(gk).attr('date');
   }
   var image = jQuery(gk).attr('image');
   if (typeof image !== typeof undefined && date !== false) {
    text += '<br/><img src="/gkimage/'+jQuery(gk).attr('image')+'" />';
   }

   return text;
  }
 }
};
});
