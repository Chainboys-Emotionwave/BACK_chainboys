/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const Challenge = await hre.ethers.getContractFactory("Challenge");
  const challenge = await Challenge.deploy();
  await challenge.waitForDeployment();
  console.log(`Challenge deployed to: ${challenge.target}`);

  // const Support = await hre.ethers.getContractFactory("Support");
  const Support = await hre.ethers.getContractFactory("contracts/Support.sol:Support");
  const support = await Support.deploy();
  await support.waitForDeployment();
  console.log(`Support deployed to: ${support.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


