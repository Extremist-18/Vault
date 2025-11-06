import { sign } from "crypto";
import {ethers} from "ethers";
import contractABI from "VaultABI.josn" assert {type:"json"};

const provider = new ethers.JsonRpcApiProvider(process.env.ALCHEMY_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract =new ethers.Contract(contractAddress, vaultLedgerABI, signer);

export default contract;

