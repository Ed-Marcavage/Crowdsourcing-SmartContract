const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")
const { assert } = require("chai")
const { inputToConfig } = require("@ethereum-waffle/compiler")

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe
      let deployer

      const sendValue = ethers.utils.parseEther(".1")
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })
      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw() //{ gasLimit: 100000 }
        const endingBalance = await fundMe.provider.getBalance(fundMe.address) // ethers.provider.getBal
        assert.equal(endingBalance.toString(), "0")
      })
    })
