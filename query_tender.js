const { ethers } = require("ethers");
const abi = require("./src/lib/TenderSealABI.json");
async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", abi, provider);
  const tender = await contract.tenders("b5bbd98b-cffa-49bf-a169-bd97ef290128");
  console.log("Tender Data:", tender);
}
main();
