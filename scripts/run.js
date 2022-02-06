//run with npx hardhat run scripts/run.js

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    let accountBalance = await owner.getBalance();

    console.log("Deploying contracts with account: ", owner.address);
    console.log("Account balance: ", accountBalance.toString());

    //compile the contract & generate artifact abi file
    const coffeeContractFactory = await hre.ethers.getContractFactory("Coffee");
    //create a local ethereum network
    //deploy the contract
    //when the script ends, hardhat destroys the network
    //to spin up a local network that isn't destroyed, run "npx hardhat node" in a NEW terminal window
    //then run "npx hardhat run scripts/deploy.js --network localhost"
    // const waveContract = await waveContractFactory.deploy();
    //deploy contract with 0.1 ethers
    const coffeeContract = await coffeeContractFactory.deploy();
    //wait until contracty is deployed
    await coffeeContract.deployed();
    console.log("Contract deployed to:", coffeeContract.address);

    //get contract balance
    let contractBalance = await hre.ethers.provider.getBalance(
        coffeeContract.address
    );
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    //get coffee count
    let coffeeCount;
    coffeeCount = await coffeeContract.getTotalCoffeesBought();
    console.log(`The following number of coffees have been bought: ${coffeeCount.toNumber()}`);

    //buy a coffee
    // let coffeeTxn = await coffeeContract.buyCoffee('Enjoy this coffee!', ethers.utils.parseEther("0.001") )
    let coffeeTxn = await coffeeContract.buyCoffee('Enjoy this coffee!', { value: ethers.utils.parseEther('0.001') });
    await coffeeTxn.wait();

    //get coffee count againt
    coffeeCount = await coffeeContract.getTotalCoffeesBought();
    console.log(`The following number of coffees have been bought: ${coffeeCount.toNumber()}`);

    //get all coffees bought
    let allCoffeesBought = await coffeeContract.getAllCoffeesBought();
    console.log(allCoffeesBought);

    //get contract balance again
    contractBalance = await hre.ethers.provider.getBalance(coffeeContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    //get my my balance again...
    accountBalance = await owner.getBalance();
    console.log("Account balance: ", accountBalance.toString());

    //withdraw
    let withdrawTxn = await coffeeContract.withdraw();
    await withdrawTxn.wait();

    //get my my balance to see if withdraw worked
    accountBalance = await owner.getBalance();
    console.log("Account balance: ", accountBalance.toString());

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();