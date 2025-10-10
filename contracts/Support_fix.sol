// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 💡 Support.sol (가스 최적화 버전)
// 이 컨트랙트는 DB에 기록되는 응원 데이터의 '불변성 증거(Immutable Proof)'를 
// 가장 저렴한 방법인 이벤트 로그를 통해 블록체인에 남기는 역할만 수행합니다.
contract Support {
  
  // ⚠️ 기존 버전의 'struct History', 'histories' 매핑, 'getSupportHistory' 함수는 
  //    높은 가스 비용 문제로 인해 제거되었습니다.

  // 이벤트: DB에 응원 기록 배치가 저장되었음을 증명하는 로그를 남깁니다.
  // 오프체인 서비스(Node.js 백엔드)는 이 로그를 파싱하여 히스토리를 재구성합니다.
  event SupportsRecorded(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp);

  /**
   * @dev DB에 저장된 응원 기록 배치를 블록체인에 증명합니다.
   * @param contentIds 응원받은 콘텐츠 ID 목록
   * @param supporters 응원한 사용자 지갑 주소 목록
   * @param amounts 응원 금액 목록 (현재는 1 단위)
   * @param timestamp 기록 시간 (Unix Time)
   */
  function recordSupports(
    uint256[] memory contentIds,
    address[] memory supporters,
    uint256[] memory amounts,
    uint256 timestamp
  ) external {
    uint256 len = contentIds.length;
    
    // 유효성 검사: 모든 배열의 길이가 일치하고 비어 있지 않은지 확인
    require(len > 0, "empty batch");
    require(supporters.length == len && amounts.length == len, "length mismatch");
    
    // ✅ 저장소 쓰기 없이 이벤트만 발행하여 가스 비용을 최소화합니다.
    emit SupportsRecorded(contentIds, supporters, amounts, timestamp);
  }
}