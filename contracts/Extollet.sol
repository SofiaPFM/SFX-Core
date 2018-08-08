pragma solidity ^0.4.24;

import "./SofiaToken.sol";
import "./Controlled.sol";
import "./SafeMath.sol";

contract Extollet is Controlled {

    using SafeMath for uint;

    string public name;                     //Campaign name
    uint256 public startFundingTime;        //In UNIX Time Format
    uint256 public endFundingTime;          //In UNIX Time Format
    uint public volume;                     //Total volume of tokens in this Campaign
    uint public totalCollected;             //In WEI
    uint public totalTokensSold;            //Number of tokens sold so far
    uint public rate;                       //Rate in WEI
    SofiaToken public tokenContract;        //The token for this Campaign
    address public vaultAddress;           //The address to hold the funds donated

  /*
   * @notice 'constructor()' initiates the Campaign by setting its funding parameters
   * @param _startFundingTime The time that the Campaign will be able to start receiving funds
   * @param _endFundingTime The time that the Campaign will stop being able to receive funds
   * @param _volume Total volume
   * @param _rate Rate in wei
   * @param _vaultAddress The address that will store the donated funds
   * @param _tokenAddress Address of the token contract this contract controls
   */
  constructor(
      uint256 _startFundingTime,
      uint256 _endFundingTime,
      uint _volume,
      uint _rate,
      address _vaultAddress,
      address _tokenAddress
    ) public {
     require ((_endFundingTime >= now) &&            //Cannot end in the past
              (_endFundingTime > _startFundingTime) &&
              (_volume > 0) &&
              (_rate > 0) &&
              (_vaultAddress != 0));                 //To prevent burning ETH
      startFundingTime = _startFundingTime;
      endFundingTime = _endFundingTime;
      volume = _volume.mul(1 ether);
      rate = _rate;
      vaultAddress = _vaultAddress;
      totalCollected = 0;
      totalTokensSold = 0;
      tokenContract = SofiaToken(_tokenAddress); //The Deployed Token Contract
      name = "Extollet";
      }

  /*
   * @notice The fallback function is called when ether is sent to the contract, it
     simply calls `doPayment()` with the address that sent the ether as the
     `_owner`. Payable is a required solidity modifier for functions to receive
     ether, without this modifier functions will throw if ether is sent to them
   */
  function () public payable{
    doPayment(msg.sender);
  }

  /*
   * @notice `proxyPayment()` allows the caller to send ether to the Campaign and
     have the tokens created in an address of their choosing
   * @param _owner The address that will hold the newly created tokens
   */
  function proxyPayment(address _owner) public payable returns(bool) {
      doPayment(_owner);
      return true;
  }

  /*
   * @notice `doPayment()` is an internal function that sends the ether that this
     contract receives to the `vault` and creates tokens in the address of the
     `_owner` assuming the Campaign is still accepting funds
   * @param _owner The address that will hold the newly created tokens
   */
  function doPayment(address _owner) internal {
//   Calculate token amount
    uint tokenAmount = getTokenAmount(msg.value);
//   Check that the Campaign is allowed to receive this donation
    require ((now >= startFundingTime) &&
            (now <= endFundingTime) &&
            (tokenContract.controller() != 0) &&            //Extra check
            (msg.value != 0) &&
            ((totalTokensSold + tokenAmount) <= volume)
            );
  //Send the ether to the vault
    preValidatePurchase(_owner,msg.value);
    require (vaultAddress.send(msg.value));
    require (tokenContract.transfer(_owner,tokenAmount));
//  Track how much the Campaign has collected
    totalCollected += msg.value;
    totalTokensSold += tokenAmount;
    emit FundTransfer(msg.sender,tokenAmount,true);
    return;
    }

    /*
     * @notice Validation of an incoming purchase. Use require statemens to revert state when conditions are not met.
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal pure{
      require(_beneficiary != address(0));
      require(_weiAmount != 0);
    }

    /*
     * @param _weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function getTokenAmount(uint _weiAmount) internal view returns (uint) {
      uint preDecimalAmount = _weiAmount.div(rate);
      uint postDecimalAmount = preDecimalAmount.mul(1 ether);
      return postDecimalAmount;
    }

    /*
     * @notice `onlyController` changes the location that ether is sent
     * @param _newVaultAddress The address that will receive the ether sent to this
     */
    function setVault(address _newVaultAddress) public onlyController {
        vaultAddress = _newVaultAddress;
    }

    /*
     * @notice `onlyController` changes the campaing ending time
     * @param newEndingTime The new campaign end time in UNIX time format
     */
    function modifyEndFundingTime(uint256 newEndingTime) public onlyController{
      require((now < endFundingTime) && (now < newEndingTime));
      endFundingTime = newEndingTime;
    }

    /*
     * @dev `finalizeFunding()` can only be called after the end of the funding period.
     */
     function finalizeFunding(address to) public onlyController{
       require(now >= endFundingTime);
       uint tokensLeft = tokenContract.balanceOf(this);
       require(tokensLeft > 0);
       require(tokenContract.transfer(to,tokensLeft));
     }

    /*
     *Events
     */
    event FundTransfer(address backer, uint amount, bool isContribution);
}
