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

  // set globalMapBounds; largest extent of data
  var globalMapBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(36.889596, -121.724515),
    new google.maps.LatLng(46.887497, -105.554831));

  // fit map to globalMapBounds
  map.fitBounds(globalMapBounds);

  // create empty object
  var dataTiles = {};

  // fill with conifer data information
  dataTiles['coniferTiles'] = {
    // function that returns url of tile location
    function: function(x,y,z) {
            return "http://conifertiles.allredbw.com/conifer/{z}/{x}/{y}.png".replace('{z}',z).replace('{x}',x).replace('{y}',y); },
    // map bounds of data
    mapBounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(36.889596, -121.724515),
      new google.maps.LatLng(46.887497, -105.554831)),
    // min and max zoom of data
    mapMinZoom: 4,
    mapMaxZoom: 17
  }

  // load conifer data first
  // if checkbox is checked, load data
  if (document.getElementsByName('coniferTiles')[0].checked) {
    // add data overlay; use klokantech script
    var overlay = new klokantech.MapTilerMapType(map,
      dataTiles['coniferTiles'].function,
      dataTiles['coniferTiles'].mapBounds,
      dataTiles['coniferTiles'].mapMinZoom,
      dataTiles['coniferTiles'].mapMaxZoom);

    // add opacity control
    // var opacitycontrol = new klokantech.OpacityControl(map, overlay);
  }
  // if checkbox is not checked, clear all overlays
  else {
      map.overlayMapTypes.clear();
  };

  // listen for clicks on dataTiles layer
  $('.dataTiles').click(function () {

    // get checkbox name
    var checkBoxName = $(this).attr('name');

    // if checkbox is checked, load data
    if ($(this).prop('checked')){

      // add data overlay; use klokantech script
      var overlay = new klokantech.MapTilerMapType(map,
        dataTiles[checkBoxName].function,
        dataTiles[checkBoxName].mapBounds,
        dataTiles[checkBoxName].mapMinZoom,
        dataTiles[checkBoxName].mapMaxZoom);

      // add opacity control
      // var opacitycontrol = new klokantech.OpacityControl(map, overlay);
    }
    // if checkbox is not checked, clear all overlays
    else {
        map.overlayMapTypes.clear();
    }
  });
}
