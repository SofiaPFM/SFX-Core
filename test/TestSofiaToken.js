var SofiaToken = artifacts.require("./contracts/SofiaToken.sol");

contract('SofiaToken', (accounts) => {

  var creatorAddress = accounts[0];
  var recipientAddress = accounts[1];
  var recipientAddress2 = accounts[3];
  var delegatedAddress = accounts[2];

  it("should contain 1000000000 SofiaToken in circulation", () => {
    return SofiaToken.deployed().then((instance) => {
      return instance.totalSupply.call();
    }).then(balance => {
      assert.equal(balance.valueOf(), 1000000000, "1000000000 SofiaToken are not in circulation");
    });
  });

  it("should contain 1000000000 SofiaToken in the creator balance", () => {
    return SofiaToken.deployed().then(instance => {
      return instance.balanceOf.call(creatorAddress);
    }).then(balance => {
      assert.equal(balance.valueOf(), 1000000000, "1000000000 wasn't in the creator balance");
    });
  });

  it("should transfer 1000 SofiaToken to the recipient balance", () => {
    var SofiaTokenInstance;
    return SofiaToken.deployed().then(instance => {
      SofiaTokenInstance = instance;
      return SofiaTokenInstance.transfer(recipientAddress, 1000, {from: creatorAddress});
    }).then(result => {
      return SofiaTokenInstance.balanceOf.call(recipientAddress);
    }).then(recipientBalance => {
      assert.equal(recipientBalance.valueOf(), 1000, "1000 wasn't in the recipient balance");
      return SofiaTokenInstance.balanceOf.call(creatorAddress);
    }).then(creatorBalance => {
      assert.equal(creatorBalance.valueOf(), 999999000, "9000 wasn't in the creator balance");
    });
  });

  it("should approve 500 SofiaToken to the delegated balance", () => {
    var SofiaTokenInstance;
    return SofiaToken.deployed().then(instance => {
      SofiaTokenInstance = instance;
      return SofiaTokenInstance.approve(delegatedAddress, 500, {from: creatorAddress});
    }).then(result => {
      return SofiaTokenInstance.allowance.call(creatorAddress, delegatedAddress);
    }).then(delegatedAllowance => {
      assert.equal(delegatedAllowance.valueOf(), 500, "500 wasn't approved to the delegated balance");
    });
  });

  it("should transfer 200 SofiaToken from the creator to the alt recipient via the delegated address", () => {
    var SofiaTokenInstance;
    return SofiaToken.deployed().then(instance => {
      SofiaTokenInstance = instance;
      return SofiaTokenInstance.transferFrom(creatorAddress, recipientAddress2, 200, {from: delegatedAddress});
    }).then(result => {
      return SofiaTokenInstance.balanceOf.call(recipientAddress2);
    }).then(recipientBalance => {
      assert.equal(recipientBalance.valueOf(), 200, "200 wasn't in the recipient balance");
      return SofiaTokenInstance.allowance.call(creatorAddress, delegatedAddress);
    }).then(delegatedAllowance => {
      assert.equal(delegatedAllowance.valueOf(), 300, "300 wasn't set as the delegated balance");
    });
  });

});
