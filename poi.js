var travelAPI = 'http://openapi.seoul.go.kr:8088/6a57584d7877656234337941446e76/json/BukChonSpaceVisitKo/0/56';

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

  var staticMapContainer  = document.getElementById('staticMap'), // 이미지 지도를 표시할 div
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

  currentPoi.title = title;

  console.log(wtmX + ':' + wtmY);
  var geocoder = new daum.maps.services.Geocoder();
  geocoder.transCoord(wtmX,
                      wtmY,
                      daum.maps.services.Coords.WTM, // 변환을 위해 입력한 좌표계 입니다
                      daum.maps.services.Coords.WGS84, // 변환 결과로 받을 좌표계 입니다
                      function (status, result) {
                        if (status === daum.maps.services.Status.OK) {
                          console.log('lat:' + result.y + ', lng:' + result.x);
                          // TODO:how to join transCoordindate into original?
                          transCoordList.push({'lat': result.y, 'lng': result.x, 'title': currentPoi.title});
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
      console.log(wtmX + ':' + wtmY);
      var geocoder = new daum.maps.services.Geocoder();
      geocoder.transCoord(wtmX,
                          wtmY,
                          daum.maps.services.Coords.WTM, // 변환을 위해 입력한 좌표계 입니다
                          daum.maps.services.Coords.WGS84, // 변환 결과로 받을 좌표계 입니다
                          function (status, result) {
                            if (status === daum.maps.services.Status.OK) {
                              console.log('lat:' + result.y + ', lng:' + result.x);
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
  console.log(data);
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
