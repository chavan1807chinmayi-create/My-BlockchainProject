require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

// Optional: set BLOCKCERT_OFFLINE_SOLC=1 to compile with the bundled `solc` npm package
// (only needed when binaries.soliditylang.org is unreachable). Normal installs don't need this.
if (process.env.BLOCKCERT_OFFLINE_SOLC === "1") {
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion !== "0.8.24") return runSuper();
    const compilerPath = require.resolve("solc/soljson.js");
    return { compilerPath, isSolcJs: true, version: "0.8.24", longVersion: "0.8.24+commit.e11b9ed9" };
  });
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" } },
  networks: { localhost: { url: "http://127.0.0.1:8545", chainId: 31337 } },
};
