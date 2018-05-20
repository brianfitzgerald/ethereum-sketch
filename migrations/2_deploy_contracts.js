var Place = artifacts.require("./Place.sol")
var Zones = artifacts.require("./Zones.sol")

module.exports = function(deployer) {
  deployer.deploy(Place)
  deployer.deploy(Zones)
}
