var Extollet = artifacts.require("./Extollet.sol");
var SofiaToken = artifacts.require("./SofiaToken.sol");

module.exports = function(deployer, network, accounts) {

  var startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;// one second in the future
  var endTime = startTime + (86400 * 31); // 20 days
  var rate = 14000000000000000;
  var volume = 70000000;
  var supply = 1000000000; //total supply
  wallet = accounts[9];
  deployer.deploy(SofiaToken,supply).then(function(){
    return SofiaToken.deployed().then(function(instance){
        var token = instance;
        return deployer.deploy(Extollet, startTime, endTime,volume,rate,wallet,instance.address).then(
          function(){
            return Extollet.deployed().then(function(ico){
               return token.transfer(ico.address,volume,{from:accounts[0]});
            });
          });
        });
      });
    }
