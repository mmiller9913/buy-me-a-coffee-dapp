// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//this lets us console.log in our contract
import "hardhat/console.sol";

contract Coffee {
    uint256 totalCoffeesBought;
    address payable public owner;

    struct CoffeesBought {
        address buyer; // The address of the person who bought the coffee
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user bought the coffee
    }

    event NewCoffeeBought(
        address indexed from,
        uint256 timestamp,
        string message
    );

    CoffeesBought[] coffees; //variable called "coffees" that storesn array of structs

    constructor() payable {
        console.log("Yo yo, I am a contract and I am smart");
        // user who is calling this function address
        owner = payable(msg.sender);
    }

    // function buyCoffee(string memory _message, uint256 _payAmount)
    //     public
    //     payable
    // {
    //     uint256 costOfACoffee = 0.001 ether;
    //     require(_payAmount >= costOfACoffee, "Insufficient Ether provided");
    //     console.log(_payAmount);
    //     totalCoffeesBought += 1;
    //     coffees.push(CoffeesBought(msg.sender, _message, block.timestamp));
    //     console.log(
    //         "Contract message: %s bought you a coffee with the following message: %s",
    //         msg.sender,
    //         _message
    //     );
    //     emit NewCoffeeBought(msg.sender, block.timestamp, _message);
    //     (bool success, ) = owner.call{value: _payAmount}("");
    //     require(success, "Failed to send money");
    // }

      function buyCoffee(string memory _message)
        public
        payable
    {
        uint256 costOfACoffee = 0.001 ether;
        require(msg.value >= costOfACoffee, "Insufficient Ether provided");
        totalCoffeesBought += 1;
        coffees.push(CoffeesBought(msg.sender, _message, block.timestamp));
        console.log(
            "Contract message: %s bought you a coffee with the following message: %s",
            msg.sender,
            _message
        );
        emit NewCoffeeBought(msg.sender, block.timestamp, _message);
    }

    function getAllCoffeesBought()
        public
        view
        returns (CoffeesBought[] memory)
    {
        return coffees;
    }

    function getTotalCoffeesBought() public view returns (uint256) {
        console.log(
            "Contract message: We have %d total coffees bought!",
            totalCoffeesBought
        );
        return totalCoffeesBought;
    }

     // withdraw the ether sent to our contract
    modifier onlyOwner() {
        require(msg.sender == owner, "not the owner!");
        _;
    }
    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");
        owner.transfer(balance);
    }
}
