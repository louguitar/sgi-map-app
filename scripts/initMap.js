function mapInit() {

  // base google maps api options
  var opts = {
    streetViewControl: false,
    tilt: 0,
    center: new google.maps.LatLng(0, 0),
    zoom: 3,
    minZoom: 4,
    maxZoom: 18
  };

  // initialize map
  var map = new google.maps.Map(document.getElementById('map'), opts);

  // set ROADMAP styles
  map.set('styles', [
    {
      "featureType": "landscape.natural.landcover",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "landscape.natural.terrain",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "poi.park",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "water",
      "stylers": [
        { "color": "#B3E2FF" }
      ]
    },{
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#fffefe" }
      ]
    },{
    }
  ]);

  // set ROADMAP as the default basemap
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);

  // set map bounds of conifer tiles
  var mapBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(36.889596, -121.724515),
    new google.maps.LatLng(46.887497, -105.554831));

  // set min and max zoom for conifer tiles
  var mapMinZoom = 4;
  var mapMaxZoom = 17;

  // add conifer overlay; use klokantech script
  var overlay = new klokantech.MapTilerMapType(map, function(x,y,z) {
          return "http://conifertiles.allredbw.com/conifer/{z}/{x}/{y}.png".replace('{z}',z).replace('{x}',x).replace('{y}',y); },
        mapBounds, mapMinZoom, mapMaxZoom);

  // add opacity control
  var opacitycontrol = new klokantech.OpacityControl(map, overlay);

  // fit map to mapBounds
  map.fitBounds(mapBounds);

}
