# Phase 2 Requirements

## 1. File Reload

이미 load한 파일이 수정되었을 경우 reload 하기.

단, 이미 적용해놓은 filter가 있다면 유지하고 결과만 update.

## 2. Performance 개선

Performance 측면에서 개선할 포인트를 찾아 개선.

특히 Clear Filter 시에 단순히 객체를 초기화하면 될 것 같은데 너무 느림.

## 3. Clipboard 복사

- AgGrid의 row에 마우스 hover 시 copy 버튼을 나타나게 하고 클릭하면 clipboard에 복사 후 'Copied!'를 어딘가에 표시해야 하는데 어떻게 알려주는게 좋을까?
- 마우스 우클릭 context menu에도 복사 메뉴를 넣자.
- 여러 row 선택 후 context menu에도 복사가 가능하게 하자.

## 4. Filter 기능 구체화

Boolean formula 식을 만족하는 row가 속한 Group의 tree를 통째로 다 보여주면 돼.

이 경우 `VNet1=="VDD" && VNet1=="VSS"`도 가능해야 해. 즉 이건 하나의 row의 VNet1 값이 동시에 VDD와 VSS가 될 수 있다가 아니라, Group별로 `VNet1=="VDD"`이고 `VNet1=="VSS"`인 row가 모두 존재하는지 찾고 그게 하나라도 있으면 matched rows가 속한 Group들의 전체 item을 모두 보여주면 돼.
