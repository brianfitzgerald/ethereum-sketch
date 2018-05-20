pragma solidity ^0.4.18;

contract Zones {

    struct Zone {
        uint id;
        address currentOwner;
    }

    Zone[] zones;
    uint[][] connections;

    mapping(address => string) players;

    function claimBoard(address newOwner, uint zoneID) public {
        boardStatus[zoneID].currentOwner = newOwner;
    }

    function addZone(uint16[3] connections, address currentOwner, uint id) public {
        Zone memory newZone = Zone({currentOwner: currentOwner, connections: connections, id: id });
        boardStatus.push(newZone);
    }

    function getZones() public view returns (uint[16], uint[16][8], address[16]) {
        uint[16] memory ids;
        uint[16][8] memory connections;
        address[16] memory owners;
        for (uint i = 0; i < 16; i++) {
            ids[i] = boardStatus[i].id;
            for (uint j = 0; j < 3; j++) {
                connections[i][j] = boardStatus[i].connections[j];
            }
            owners[i] = boardStatus[i].currentOwner;
        }
        return (ids, connections, owners);
    }


}
