// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Support {
  struct History {
    address[] supporters;
    uint256[] amounts;
    uint256[] timestamps;
  }

  // contentId => history
  mapping(uint256 => History) private histories;

  event SupportsRecorded(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp);

  // Records a batch of supports. Arrays must be the same length. Each entry corresponds
  // to one support for the contentIds[i] made by supporters[i] with amount amounts[i].
  function recordSupports(
    uint256[] memory contentIds,
    address[] memory supporters,
    uint256[] memory amounts,
    uint256 timestamp
  ) external {
    uint256 len = contentIds.length;
    require(len > 0, "empty batch");
    require(supporters.length == len && amounts.length == len, "length mismatch");

    for (uint256 i = 0; i < len; i++) {
      uint256 cid = contentIds[i];
      histories[cid].supporters.push(supporters[i]);
      histories[cid].amounts.push(amounts[i]);
      histories[cid].timestamps.push(timestamp);
    }

    emit SupportsRecorded(contentIds, supporters, amounts, timestamp);
  }

  // Returns supporters, amounts, timestamps arrays for the given contentId
  function getSupportHistory(uint256 contentId) external view returns (
    address[] memory supporters,
    uint256[] memory amounts,
    uint256[] memory timestamps
  ) {
    History storage h = histories[contentId];
    return (h.supporters, h.amounts, h.timestamps);
  }
}


