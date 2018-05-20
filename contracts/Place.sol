pragma solidity ^0.4.18;

contract Place {

    struct Zone {
        uint id;
        uint[8] connections;
        address currentOwner;
    }

    Zone[16] boardStatus;

    string[] players;

    function claimBoard(address newOwner, uint zoneID) public {
        boardStatus[zoneID].currentOwner = newOwner;
    }

    function getZones() public view returns (uint[16], uint[16][8], address[16]) {
        uint[16] memory ids;
        uint[16][8] memory connections;
        address[16] memory owners;
        for (uint i = 0; i < 16; i++) {
            ids[i] = boardStatus[i].id;
            for (uint j = 0; j < 16; j++) {
                connections[i][j] = boardStatus[i].connections[j];
            }
            owners[i] = boardStatus[i].currentOwner;
        }
        return (ids, connections, owners);
    }


}
