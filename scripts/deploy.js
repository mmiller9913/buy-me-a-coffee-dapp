//run with npx hardhat run scripts/deploy.js --network rinkeby 

const main = async () => {
    const [owner] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account: ", owner.address);
    const coffeeContractFactory = await hre.ethers.getContractFactory("Coffee");
    const coffeeContract = await coffeeContractFactory.deploy();
    await coffeeContract.deployed();
    console.log("Contract deployed to:", coffeeContract.address);
    console.log(`Verify this contract on ethercan with: \n npx hardhat verify --network rinkeby ${coffeeContract.address}`)
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