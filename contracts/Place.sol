pragma solidity ^0.4.18;

contract Place {
    uint[100][100] boardStatus;

    string[8] colors;

    function set(uint x, uint y, uint color) public {
        assert(color <= colors.length);
        assert(color > 0);
        boardStatus[x][y] = color;
    }

    function getAllColors() public view returns (uint[100][100]) {
        return boardStatus;
    }

    function getColor(uint x, uint y) public view returns (uint) {
        return boardStatus[x][y];
    }
}
