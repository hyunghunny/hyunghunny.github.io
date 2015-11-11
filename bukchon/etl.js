// obsolete code

var travelAPI = 'http://openapi.seoul.go.kr:8088/6a57584d7877656234337941446e76/json/BukChonSpaceVisitKo/0/623';

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



var poiLength = 0;
var currentPoi = {};
function transCoordSync() {
  var poi = poiList.pop();
  var wtmX = poi.LATITUDE;
  var wtmY = poi.LONGITUDE;
  var title = poi.TITLE;
  var category = poi.CATE_SPACE;
  var contact = poi.TEL;
  var homePage = poi.HOMEPAGE;
  var address = poi.ADDRESS;
  var imageUrl = poi.IMAGE;

  currentPoi.title = title;
  currentPoi.contents = '<div style="padding:5px; width: 300px;float:left; white-break:normal; font-size:small;">' + 
  '[' + category + ']' + '<br>' + 
  poi.TITLE + '<br>' + poi.CONTENTS + 
  poi.SERVICE_HOUR + ' ' + poi.ENTRANCE_FEE + 
  '</div>';
  currentPoi.category = category;
  currentPoi.contact = contact;
  currentPoi.homePage = homePage;
  currentPoi.address = address;
  currentPoi.imageUrl = imageUrl;

  //console.log(wtmX + ':' + wtmY);
  var geocoder = null;
  try {
    geocoder = new daum.maps.services.Geocoder();
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
                            'category' : currentPoi.category,
                            'contents' : currentPoi.contents,
                            'contact' : currentPoi.contact,
                            'homePage' : currentPoi.homePage,
                            'address' : currentPoi.address,
                            'imageUrl' : currentPoi.imageUrl
                            });
                          } else {
                            console.log(status);
                          }

                          if (poiList.length != 0) {
                            transCoordSync();
                          } else {
                            console.log(JSON.stringify(transCoordList));
                            drawMap();
                          }

                        });    
  } catch (ex) {
    alert('다음 맵 사용 권한을 초과했습니다.');
  }
  

}

/*
function transCoordAsync() {

  poiLength = poiList.length;

  for (var i = 0; i < poiLength; i++) {
    var transCoord = function () {
      var wtmX = poiList[i].LATITUDE;
      var wtmY = poiList[i].LONGITUDE;
      var title = poiList[i].TITLE;
      var category = poiList[i].CATE_SPACE;
      var geocoder = null;
      try {
        geocoder = new daum.maps.services.Geocoder();
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
        transCoord();        
      } catch (ex) {
        alert('다음 맵 사용 권한을 초과했습니다.');
      }
            
    }
  }
}
*/


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

  alert('좌표 체계를 변환하여 지도에 표기하는 중입니다... 조금만 기다려 주세요.');
  transCoordSync();
})
