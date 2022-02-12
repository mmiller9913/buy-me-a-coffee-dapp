import React from 'react';
import { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/Coffee.json';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Me from './assets/Me.jpg';

//constants
const contractAddress = '0x39eBb778272c206478603bE09298e7bD6b50164E';
const contractABI = abi.abi;

function App() {
  const [isPurchasingCoffee, setIsPurchasingCoffee] = useState(false);
  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [allCoffeePurchases, setAllCoffeePurchases] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        toast.warn("Make sure you have MetaMask installed", {
          position: "top-left",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        //check to make sure on the right checkNetwork
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        // Hex code of the chainId of the Rinkeby test network
        const rinkebyChainId = "0x4";
        if (chainId === rinkebyChainId) {
          setNetwork("Rinkeby")
        }
        //get account 
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
          toast.success("🦄 Wallet is Connected", {
            position: "top-left",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          getAllCoffeePurchases();
        } else {
          console.log('No authorized account found');
          // toast.warn("No authorized account found", {
          //   position: "top-left",
          //   autoClose: 1000,
          //   hideProgressBar: true,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          // });
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async (message) => {
    console.log('Now buying the coffee');
    setIsPurchasingCoffee(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeeContract = new ethers.Contract(contractAddress, contractABI, signer);

        //get coffee count
        let count = await coffeeContract.getTotalCoffeesBought();
        console.log("Retrieved total number of coffees purchased..", count.toNumber());

        const coffeeTxn = await coffeeContract.buyCoffee(message, { value: ethers.utils.parseEther('0.001') });
        console.log("Mining...", coffeeTxn.hash);
        toast.info("Sending funds for coffee...", {
          position: "top-left",
          autoClose: 6050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await coffeeTxn.wait();
        console.log("Mined -- ", coffeeTxn.hash);

        toast.success("Coffee Purchased!", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        //get coffee count again
        count = await coffeeContract.getTotalCoffeesBought();
        console.log("Retrieved total number of coffees purchased..", count.toNumber());

        setIsPurchasingCoffee(false);
        getAllCoffeePurchases();
      } else {
        setIsPurchasingCoffee(false);
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsPurchasingCoffee(false);
      console.log(error);
      toast.error(`${error.message}`, {
        position: "top-left",
        autoClose: 2500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  const getAllCoffeePurchases = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeeContract = new ethers.Contract(contractAddress, contractABI, signer);
        const coffeesPurchased = await coffeeContract.getAllCoffeesBought();
        // console.log(coffeesPurchased);
        let coffeesCleaned = [];
        coffeesPurchased.forEach(item => {
          coffeesCleaned.push({
            address: item.buyer,
            timestamp: new Date(item.timestamp * 1000), //converting unix timestamp to ms by multiplying by 1000
            message: item.message
          });
        });
        // console.log(coffeesCleaned);
        setAllCoffeePurchases(coffeesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  //HANDLERS
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please download MetaMask to use this dapp");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  //RENDER METHODS
  const renderLoader = () => {
    if (isPurchasingCoffee) {
      return (
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      )
    }
  }

  const renderButtonFormOrRinkebyWarning = () => {
    if (!currentAccount) {
      return (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )
    }

    if (currentAccount && network === "Rinkeby") {
      return <form className='form' onSubmit={(event) => {
        event.preventDefault();
        const message = document.getElementById('coffee-message').value;
        // console.log(message);
        buyCoffee(message);
      }}
      // noValidate //uncomment if want to allow no message to me sent
      >
        {/* <textarea
          id="coffee-message"
          type="text"
          placeholder="Send a message with the coffee :)"
          required
        /> */}
        <div>
          <label>Choose an emoji to send with the coffee:</label>
          <select id="coffee-message" name="emojis">
            <option value="😀">😀</option>
            <option value="😁">😁</option>
            <option value="😎">😎</option>
            <option value="👋">👋</option>
            <option value="💪">💪</option>
            <option value="👊">👊</option>
            <option value="👍">👍</option>
            <option value="💩">💩</option>
          </select>
        </div>
        <button type="submit" disabled={isPurchasingCoffee} className={isPurchasingCoffee ? 'accomodate-for-loader' : ''}
        >
          {isPurchasingCoffee ? `Purchasing coffee... Please confirm the transaction` : 'Send 0.001 ETH'}
          {renderLoader()}
        </button>
      </form>
    }

    if (currentAccount && network === "") {
      return <p className="rinkeby-only">
        Hold up! This dapp only works on the Rinkeby Test Network. To buy Matt a coffee, please switch networks in your connected wallet.
      </p>
    }
  }

  const renderTestEthMessage = () => {
    if (currentAccount && network === "Rinkeby") {
      return <p className="test-eth">
        If you need test ETH, try using <a href="https://faucets.chain.link/rinkeby">this faucet</a>.
      </p>
    }
  }

  const renderCoffeeLog = () => {
    if (allCoffeePurchases.length > 0) {
      return (
        <div className="coffeeLogContainer">
          <div className="coffeeLogHeader">Coffee Log ☕</div>
          <table className="coffeeLog">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Time</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {allCoffeePurchases.slice(0).reverse().map((wave, key) => {
                return (
                  <tr key={key}>
                    <td><a href={"https://rinkeby.etherscan.io/address/" + wave.address}>{shortenAddress(wave.address)}</a></td>
                    <td>{wave.timestamp.toString()}</td>
                    <td>{wave.message}</td>
                  </tr>
                )
              })
              }
            </tbody>

          </table>
        </div>

      )
    }
  }

  //functions
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // USE EFFECTS
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })

  return (
    <div className="outerContainer">
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            ☕Buy Me a Coffee
          </div>

          <div className="bio">
            Hey everyone, I'm Matt. Buy me a coffee by sending some ETH ☕
          </div>

          {renderButtonFormOrRinkebyWarning()}

          {/* {renderLoader()} */}

          {renderTestEthMessage()}

          {renderCoffeeLog()}
        </div>
        <div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
