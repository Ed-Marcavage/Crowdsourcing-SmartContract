// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { getNamedAccounts, deployments, network } = require("hardhat")
const { verify } = require("../utils/verify")

// function deployFunc(hre) {
//   hre.getNamedAccounts
//   hre.deployments
// }
// module.exports.default = deployFunc

// SAME THING ^ AS BELOW

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre
// }
// SAME THING ^ AS BELOW

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainID = network.config.chainId
  //  const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

  let ethUsdPriceFeedAddress
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"]
  }

  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })
  log(`FundMe deployed at ${fundMe.address}`)
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }
  log("------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
