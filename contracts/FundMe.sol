// SPDX-License-Identifier: MIT

// Pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

// error codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts

contract FundMe {
  // Type declarations
  using PriceConverter for uint256;

  // STATE Variables
  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;

  // Could we make this constant?  /* hint: no! We should make it immutable! */
  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 50 * 10**18;

  AggregatorV3Interface private s_priceFeed; // 2 saving priceFeed of type AggregatorV3Interface as a globally accessible variable

  modifier onlyOwner() {
    // require(msg.sender == owner);
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress); // 1
  }

  // receive() external payable {
  //         fund();
  //     }

  //     fallback() external payable {
  //         fund();
  //     }

  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "You need to spend more ETH!"
    ); //3
    // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");

    console.log("%s is depositing %s ETH", msg.sender, msg.value);
    s_addressToAmountFunded[msg.sender] += msg.value;

    s_funders.push(msg.sender);
  }

  function withdraw() public payable onlyOwner {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function cheaperWithdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    // mappings cannot be stored in mem
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool success, ) = i_owner.call{value: address(this).balance}("");
    require(success);
  }

  // View / pure functions (getters)

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmountFunded(address funder)
    public
    view
    returns (uint256)
  {
    return s_addressToAmountFunded[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
