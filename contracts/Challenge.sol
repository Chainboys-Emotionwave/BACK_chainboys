// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Challenge {
  struct ChallengeInfo {
    address creator;
    uint256 prizeAmount; // Total prize escrowed for the challenge
    uint256 distributedAmount; // Total amount distributed so far
    bool active; // True when created; can remain active even after partial distributions
  }

  // challengeId => info
  mapping(uint256 => ChallengeInfo) private challenges;

  event ChallengeCreated(uint256 indexed challengeId, address indexed creator, uint256 prizeAmount);
  event PrizeDistributed(uint256 indexed challengeId, address[] winners, uint256[] amounts);

  // Create a challenge and escrow the prize in the contract balance.
  // msg.value must equal prizeAmount.
  function createChallenge(uint256 challengeId, uint256 prizeAmount) external payable {
    require(prizeAmount > 0, "prize must be > 0");
    require(msg.value == prizeAmount, "msg.value != prizeAmount");
    ChallengeInfo storage info = challenges[challengeId];
    require(info.creator == address(0), "challenge exists");

    challenges[challengeId] = ChallengeInfo({
      creator: msg.sender,
      prizeAmount: prizeAmount,
      distributedAmount: 0,
      active: true
    });

    emit ChallengeCreated(challengeId, msg.sender, prizeAmount);
  }

  // Distribute prize to winners. Can be called multiple times until the entire prize is distributed.
  function distributePrize(uint256 challengeId, address[] memory winners, uint256[] memory amounts) external {
    require(winners.length == amounts.length, "length mismatch");
    require(winners.length > 0, "empty winners");

    ChallengeInfo storage info = challenges[challengeId];
    require(info.creator != address(0), "challenge not found");
    require(info.active, "inactive challenge");
    require(msg.sender == info.creator, "only creator");

    uint256 total;
    for (uint256 i = 0; i < amounts.length; i++) {
      total += amounts[i];
    }
    require(info.distributedAmount + total <= info.prizeAmount, "exceeds prize");

    // Effects first
    info.distributedAmount += total;
    if (info.distributedAmount == info.prizeAmount) {
      info.active = false;
    }

    // Interactions
    for (uint256 i = 0; i < winners.length; i++) {
      address payable recipient = payable(winners[i]);
      uint256 amount = amounts[i];
      if (amount > 0) {
        (bool ok, ) = recipient.call{value: amount}("");
        require(ok, "transfer failed");
      }
    }

    emit PrizeDistributed(challengeId, winners, amounts);
  }

  // Returns creator, prizeAmount, distributedAmount, active
  function getChallengeInfo(uint256 challengeId) external view returns (
    address creator,
    uint256 prizeAmount,
    uint256 distributedAmount,
    bool active
  ) {
    ChallengeInfo storage info = challenges[challengeId];
    return (info.creator, info.prizeAmount, info.distributedAmount, info.active);
  }
}


