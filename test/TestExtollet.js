var Extollet = artifacts.require("./Extollet.sol");
var SofiaToken = artifacts.require("./SofiaToken.sol");

contract('Extollet', (accounts) => {

  var creatorAddress = accounts[0];
  var creatorAddress = accounts[0];
  var recipientAddress = accounts[1];

  var ExtolletAddress;
  Extollet.deployed().then(instance => {
    extolletAddress = instance.address;
  });

  var SofiaTokenAddress;
  SofiaToken.deployed().then(instance => {
    sofiaTokenAddress = instance.address;
  });

  it("should transfer 100000000 SofiaToken to the Extollet balance", () => {
    var sofiaTokenInstance;
    return SofiaToken.deployed().then(instance => {
      sofiaTokenInstance = instance;
      return sofiaTokenInstance.transfer(extolletAddress, 100000000, {from: creatorAddress});
    }).then(result => {
      return sofiaTokenInstance.balanceOf.call(extolletAddress);
    }).then(extolletBalance => {
      assert.equal(extolletBalance.valueOf(), 100000000, "100000000 wasn't in the Extollet balance");
    });
  });

  it("should have a Extollet balance of 100000000", () => {
    return Extollet.deployed().then(instance => {
      return instance.availableBalance.call();
    }).then(availableBalance => {
      assert.equal(availableBalance.valueOf(), 100000000, "100000000 wasn't the available Extollet balance");
    });
  });

  it("should transfer 100000 token to the creator address", () => {
    var ExtolletInstance;
    return Extollet.deployed().then(instance => {
      ExtolletInstance = instance;
      return ExtolletInstance.buy({from: creatorAddress, value: web3.toWei(1, 'ether')});
    }).then(result => {
      return ExtolletInstance.availableBalance.call();
    }).then(availableBalance => {
      assert.equal(availableBalance.valueOf(), 99000000, "99000000 wasn't the available Extollet balance");
    });
  });

  it("should contain 9001 SofiaToken in the creator balance", () => {
    return SofiaToken.deployed().then(instance => {
      return instance.balanceOf.call(creatorAddress);
    }).then(balance => {
      assert.equal(balance.valueOf(), 9001, "9001 wasn't in the creator balance");
    });
  });
);
/*
  it("should transfer 1 token to the recipient address", () => {
    var ExtolletInstance;
    return Extollet.deployed().then(instance => {
      ExtolletInstance = instance;
      return ExtolletInstance.buyFor(recipientAddress, {from: creatorAddress, value: web3.toWei(1, 'ether')});
    }).then(result => {
      return ExtolletInstance.availableBalance.call();
    }).then(availableBalance => {
      assert.equal(availableBalance.valueOf(), 998, "998 wasn't the available Extollet balance");
    });
  });

  it("should contain 1 SofiaToken in the recipient balance", () => {
    return SofiaToken.deployed().then(instance => {
      return instance.balanceOf.call(recipientAddress);
    }).then(balance => {
      assert.equal(balance.valueOf(), 1, "1 wasn't in the recipient balance");
    });
  })
*/
