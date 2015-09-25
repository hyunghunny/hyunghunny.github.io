var travelAPI = 'http://openapi.seoul.go.kr:8088/6a57584d7877656234337941446e76/json/BukChonSpaceVisitKo/0/56';
var imageSrc = "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

function invokeOpenAPI(url, scb) {
    $.ajax({
        url : url,
        type : "get",
        dataType : "json",
        success : function (data) {
            //console.log('retrieve success:' + data);
            scb(data)
        },
        error : function (request) {
            console.log("failed to retrieve:" + request);
        }
    });
}

var poiList = [];
var transCoordList = [];

function drawMap() {
  var centerCood = transCoordList[5];

  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
      mapOption = {
          center: new daum.maps.LatLng(centerCood.lat, centerCood.lng), // 지도의 중심좌표
          level: 3 // 지도의 확대 레벨
      };
var map = new daum.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

  for (var i = 0; i < transCoordList.length; i ++) {
    var cood = transCoordList[i];
    addMarker = function (cood) {


      // 마커 이미지의 이미지 크기 입니다
      var imageSize = new daum.maps.Size(24, 35);

      // 마커 이미지를 생성합니다
      var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize);

      // 마커를 생성합니다
      var marker = new daum.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: new daum.maps.LatLng(cood.lat, cood.lng), // 마커를 표시할 위치
          title : cood.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image : markerImage // 마커 이미지
      });

      // 인포윈도우를 생성합니다
      var infowindow = new daum.maps.InfoWindow({
          content : cood.contents,
          removable: true
      });
/*
      // 마커에 마우스오버 이벤트를 등록합니다
      daum.maps.event.addListener(marker, 'mouseover', function() {
        // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
          infowindow.open(map, marker);
      });

      // 마커에 마우스아웃 이벤트를 등록합니다
      daum.maps.event.addListener(marker, 'mouseout', function() {
          // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
          infowindow.close();
      });
*/
      // 마커에 클릭 이벤트를 등록합니다
      daum.maps.event.addListener(marker, 'click', function() {
        // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
          infowindow.open(map, marker);
      });

    }(cood);
  }
}


function drawStaticMap() {

  var markers = [];
  for (var i = 0; i < transCoordList.length; i++) {
    var cood = transCoordList[i];
    var marker = {
        position: new daum.maps.LatLng(cood.lat, cood.lng)
    };
    if (cood.title) {
      marker.text = cood.title;
    }
    markers.push(marker);
  }

  var centerCood = transCoordList[5];

  var staticMapContainer  = document.getElementById('map'), // 이미지 지도를 표시할 div
      staticMapOption = {
          center: new daum.maps.LatLng(centerCood.lat, centerCood.lng), // 이미지 지도의 중심좌표
          level: 3, // 이미지 지도의 확대 레벨
          marker: markers // 이미지 지도에 표시할 마커
      };

  // 이미지 지도를 생성합니다
  var staticMap = new daum.maps.StaticMap(staticMapContainer, staticMapOption);

}
var poiLength = 0;
var currentPoi = {};
function transCoordSync() {
  var poi = poiList.pop();
  var wtmX = poi.LATITUDE;
  var wtmY = poi.LONGITUDE;
  var title = poi.TITLE;

  currentPoi.title = poi.TITLE;
  currentPoi.contents = '<div style="padding:5px; width: 300px;float:left; white-break:normal; font-size:small;">' + poi.CONTENTS + '</div>';

  //console.log(wtmX + ':' + wtmY);
  var geocoder = new daum.maps.services.Geocoder();
  geocoder.transCoord(wtmX,
                      wtmY,
                      daum.maps.services.Coords.WTM, // 변환을 위해 입력한 좌표계 입니다
                      daum.maps.services.Coords.WGS84, // 변환 결과로 받을 좌표계 입니다
                      function (status, result) {
                        if (status === daum.maps.services.Status.OK) {
                          //console.log('lat:' + result.y + ', lng:' + result.x);
                          // TODO:how to join transCoordindate into original?
                          transCoordList.push({
                            'lat': result.y, 'lng': result.x,
                          'title': currentPoi.title,
                          'contents' : currentPoi.contents});
                        } else {
                          console.log(status);
                        }

                        if (poiList.length != 0) {
                          transCoordSync();
                        } else {
                          drawMap();
                        }

                      });
}


function transCoordAsync() {

  poiLength = poiList.length;

  for (var i = 0; i < poiLength; i++) {
    var transCoord = function () {
      var wtmX = poiList[i].LATITUDE;
      var wtmY = poiList[i].LONGITUDE;
      //console.log(wtmX + ':' + wtmY);
      var geocoder = new daum.maps.services.Geocoder();
      geocoder.transCoord(wtmX,
                          wtmY,
                          daum.maps.services.Coords.WTM, // 변환을 위해 입력한 좌표계 입니다
                          daum.maps.services.Coords.WGS84, // 변환 결과로 받을 좌표계 입니다
                          function (status, result) {
                            if (status === daum.maps.services.Status.OK) {
                              //console.log('lat:' + result.y + ', lng:' + result.x);
                              // TODO:how to join transCoordindate into original?
                              transCoordList.push({'lat': result.y, 'lng': result.x});
                            } else {
                              console.log(status);
                            }
                            // XXX: one data is invalid format
                            if (transCoordList.length == poiLength) {
                            //if (poiList.length - 1 == transCoordList.length) {
                              drawMap();
                            }

                          });
    }
    transCoord();
  }
}

function isInt(x) {
    return !isNaN(x) && eval(x).toString().length == parseInt(eval(x)).toString().length
}

function isFloat(x) {
    return !isNaN(x) && !isInt(eval(x)) && x.toString().length > 0
}

invokeOpenAPI(travelAPI, function(data) {
  var locations = data.BukChonSpaceVisitKo.row;
  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    console.log(location.LATITUDE + ',' + location.LONGITUDE + ":" + location.TITLE);
    if (isFloat(location.LATITUDE) && isFloat(location.LONGITUDE)) {
        poiList.push(location);
    } else {
      console.log('invalid format item:' + i);
    }

  }
  //transCoordAsync();
  transCoordSync();
})
