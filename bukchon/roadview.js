//지도위에 현재 로드뷰의 위치와, 각도를 표시하기 위한 map walker 아이콘 생성 클래스
function MapWalker(position){

    //커스텀 오버레이에 사용할 map walker 엘리먼트
    var content = document.createElement('div');
    var figure = document.createElement('div');
    var angleBack = document.createElement('div');

    //map walker를 구성하는 각 노드들의 class명을 지정 - style셋팅을 위해 필요
    content.className = 'MapWalker';
    figure.className = 'figure';
    angleBack.className = 'angleBack';

    content.appendChild(angleBack);
    content.appendChild(figure);

    //커스텀 오버레이 객체를 사용하여, map walker 아이콘을 생성
    var walker = new daum.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1
    });

    this.walker = walker;
    this.content = content;
}

//로드뷰의 pan(좌우 각도)값에 따라 map walker의 백그라운드 이미지를 변경 시키는 함수
//background로 사용할 sprite 이미지에 따라 계산 식은 달라 질 수 있음
MapWalker.prototype.setAngle = function(angle){

    var threshold = 22.5; //이미지가 변화되어야 되는(각도가 변해야되는) 임계 값
    for(var i=0; i<16; i++){ //각도에 따라 변화되는 앵글 이미지의 수가 16개
        if(angle > (threshold * i) && angle < (threshold * (i + 1))){
            //각도(pan)에 따라 아이콘의 class명을 변경
            var className = 'm' + i;
            this.content.className = this.content.className.split(' ')[0];
            this.content.className += (' ' + className);
            break;
        }
    }
};

//map walker의 위치를 변경시키는 함수
MapWalker.prototype.setPosition = function(position){
    this.walker.setPosition(position);
};

//map walker를 지도위에 올리는 함수
MapWalker.prototype.setMap = function(map){
    this.walker.setMap(map);
};

/*
 * 아래부터 실제 지도와 로드뷰 map walker를 생성 및 제어하는 로직
 */
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapCenter = new daum.maps.LatLng(37.58466049827802, 126.98230739985725), // 지도의 가운데 좌표
    mapOption = {
        center: mapCenter, // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
var map = new daum.maps.Map(mapContainer, mapOption);

// 로드뷰 도로를 지도위에 올린다.
map.addOverlayMapTypeId(daum.maps.MapTypeId.ROADVIEW);

var roadviewContainer = document.getElementById('roadview'); // 로드뷰를 표시할 div
var roadview = new daum.maps.Roadview(roadviewContainer); // 로드뷰 객체
var roadviewClient = new daum.maps.RoadviewClient(); // 좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체

// 지도의 중심좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
roadviewClient.getNearestPanoId(mapCenter, 50, function(panoId) {
    roadview.setPanoId(panoId, mapCenter); // panoId와 중심좌표를 통해 로드뷰 실행
});

var mapWalker = null;

// 로드뷰의 초기화 되었을때 map walker를 생성한다.
daum.maps.event.addListener(roadview, 'init', function() {

    // map walker를 생성한다. 생성시 지도의 중심좌표를 넘긴다.
    mapWalker = new MapWalker(mapCenter);
    mapWalker.setMap(map); // map walker를 지도에 설정한다.

    // 로드뷰가 초기화 된 후, 추가 이벤트를 등록한다.
    // 로드뷰를 상,하,좌,우,줌인,줌아웃을 할 경우 발생한다.
    // 로드뷰를 조작할때 발생하는 값을 받아 map walker의 상태를 변경해 준다.
    daum.maps.event.addListener(roadview, 'viewpoint_changed', function(){

        // 이벤트가 발생할 때마다 로드뷰의 viewpoint값을 읽어, map walker에 반영
        var viewpoint = roadview.getViewpoint();
        mapWalker.setAngle(viewpoint.pan);

    });

    // 로드뷰내의 화살표나 점프를 하였을 경우 발생한다.
    // position값이 바뀔 때마다 map walker의 상태를 변경해 준다.
    daum.maps.event.addListener(roadview, 'position_changed', function(){

        // 이벤트가 발생할 때마다 로드뷰의 position값을 읽어, map walker에 반영 
        var position = roadview.getPosition();
        mapWalker.setPosition(position);
        map.setCenter(position);

    });
});