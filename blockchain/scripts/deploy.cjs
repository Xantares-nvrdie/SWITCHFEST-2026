const hre = require("hardhat");

async function main() {
  const TenderSeal = await hre.ethers.getContractFactory("TenderSeal");
  const tenderSeal = await TenderSeal.deploy();

  await tenderSeal.waitForDeployment();

  const address = await tenderSeal.getAddress();
  console.log(`TenderSeal deployed to: ${address}`);
  
  // The first account is the deployer, which is the relayer.
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Relayer Address: ${deployer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
