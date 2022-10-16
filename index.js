const ethers = require("ethers");
const chalk = require("chalk");
const dotenv = require('dotenv');
dotenv.config();

const ISling = require("./abi/ISling.json");

const logWarn = (...args) => { console.log(chalk.hex("#FFA500")(...args)); };
const logSuccess = (...args) => { console.log(chalk.green(...args)); };
const logInfo = (...args) => { console.log(chalk.yellow(...args)); };
const logError = (...args) => { console.log(chalk.red(...args)); };
const logTrace = (...args) => { console.log(chalk.grey(...args)); };
const logDebug = (...args) => { console.log(chalk.magenta(...args)); };
const logFatal = (...args) => { console.log(chalk.redBright(...args)); };

const match = (a, b, caseIncensitive = true) => {
    if (a === null || a === undefined) return false;
  
    if (Array.isArray(b)) {
      if (caseIncensitive) {
        return b.map((x) => x.toLowerCase()).includes(a.toLowerCase());
      }
  
      return b.includes(a);
    }
  
    if (caseIncensitive) {
      return a.toLowerCase() === b.toLowerCase();
    }
  
    return a === b;
  };

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const slingContract = "0x5a79BE6CDcE26bc853d72919bF98A0378641b607"
const deadWallet = "0x000000000000000000000000000000000000dead"
const fakeWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider) // Private Key for Publicly Known Account ... DO NOT USE!!

const sendAlert = async (from, to, amount) => {
    if (!match(to, deadWallet)) { return }
    const tokenContract = new ethers.Contract( slingContract, [ 'function balanceOf(address account) public view returns (uint256)', ], fakeWallet );
    const deadBalance = await tokenContract.balanceOf(deadWallet);

    logInfo(`NEW BURN!! \n Amount Burned: ${ethers.utils.formatUnits(amount, 18)} Total Burn Amount: ${ethers.utils.formatUnits(deadBalance, 18)} \n `)
}

const main = async () => {

    filter = {
        address: slingContract,
        topics: [ ethers.utils.id("Transfer(address,address,uint256)") ]
    }

    provider.on(filter, (from, to, amount) => {
        sendAlert(from, to, amount).catch((e) => {
            logFatal(`Error: ${JSON.stringify(e)}`);
          })
    })

  };
  
  main();
  