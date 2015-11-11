
var imageSrc = "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

var poiList = [];
//var transCoordList = [];
var map = null;
// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setMapType(maptype) {
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview');
    if (maptype === 'roadmap') {
        map.setMapTypeId(daum.maps.MapTypeId.ROADMAP);
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        map.setMapTypeId(daum.maps.MapTypeId.HYBRID);
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}

// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

function drawMap() {
  var centerCood = transCoordList[5];

  var mapContainer = document.getElementById('map'), // 지도를 표시할 div
      mapOption = {
          center: new daum.maps.LatLng(centerCood.lat, centerCood.lng), // 지도의 중심좌표
          level: 3 // 지도의 확대 레벨
      };
  map = new daum.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

  for (var i = 0; i < transCoordList.length; i ++) {
    var cood = transCoordList[i];
    addMarker = function (cood) {


      // 마커 이미지의 이미지 크기 입니다
      //var imageSize = new daum.maps.Size(24, 35);
      var imageSize = new daum.maps.Size(35, 35);
      imageSrc = './img/' + cood.category + '.png';
      //console.log(imageSrc);
      // 마커 이미지를 생성합니다
      var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize);

      // 마커를 생성합니다
      var marker = new daum.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: new daum.maps.LatLng(cood.lat, cood.lng), // 마커를 표시할 위치
          title : cood.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image : markerImage, // 마커 이미지
          clickable: true
      });

      // 인포윈도우를 생성합니다
      var infowindow = new daum.maps.InfoWindow({
          content : cood.contents,
          removable: true
      });

      var imageTag;
      if (cood.imageUrl.length > 5) {
        imageTag = '<img src="' + cood.imageUrl + '" width="290" >';
      } else {
        imageTag = '<b>No Image</b><br>'
      }
      var imgContent = '<div style="padding:5px; width: 300px;float:left; white-break:normal; font-size:small;">' + 
         imageTag + '</div>';
      //console.log(imgContent);
      var imgWindow = new daum.maps.InfoWindow({
          content : imgContent,
          removable: true
      });

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

      // 마커에 클릭 이벤트를 등록합니다
      daum.maps.event.addListener(marker, 'click', function() {
        // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
          imgWindow.open(map, marker);
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

drawMap();


