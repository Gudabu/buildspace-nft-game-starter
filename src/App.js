import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Since this method will take some time, make sure to declare it as async
   */
  const checkIfWalletIsConnected = async () => {
    try {
      setIsLoading(true);
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /*
  * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
  */
  useEffect(() => {
    /*
    * The function we will call that interacts with out smart contract
    */
    const fetchNFTMetadata = async () => {
      setIsLoading(true);
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      setIsLoading(false);
    };

    /*
    * We only want to run this, if we have a connected wallet
    */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      setIsLoading(true);
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

// Render Methods
const renderContent = () => {
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://c.tenor.com/jACN7Zpp7KYAAAAC/cersei-lannister-game-of-thrones.gif"
          alt="Hi Losers"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    /*
    * Scenario #2
    */
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
  }
};

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Game Of NFThrones ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
            {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
