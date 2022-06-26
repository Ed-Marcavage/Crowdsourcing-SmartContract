const { network } = require("hardhat")
const {
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments

  // const accounts = await ethers.getSigners()
  // const accountZero = accounts[0] -- OR below to get account
  const { deployer } = await getNamedAccounts()
  const chainID = network.config.chainId // network is from HH

  // or you can do: if(chainId ==  "31337")
  if (developmentChain.includes(network.name)) {
    // network is from HH
    log("Local network detected! Deploying mocks...")
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks deployed!")
    log("--------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
