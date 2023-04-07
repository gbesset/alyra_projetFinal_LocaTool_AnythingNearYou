import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifact, artifactCollection) => {
      if (artifact && artifactCollection) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract, txhash;
        let isOwner = false;
        let ownerAddress = '';
        let contractCollection = '';
        let isRenter = false;
        try {
          address = artifact.networks[networkID].address;
          txhash = artifact.networks[networkID].transactionHash;
          contract = new web3.eth.Contract(abi, address);
          if(contract && accounts){
            isOwner = await contract.methods.isAddressOwner(accounts[0]).call({ from: accounts[0] });
            if(isOwner){
              ownerAddress =  await contract.methods.getToolsCollectionAddress(accounts[0]).call({ from: accounts[0] });
            }
          }
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, artifactCollection, web3, accounts, networkID, contract, isOwner, ownerAddress, isRenter, txhash }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/AnyRental.json");
        const artifactCollection = require("../../contracts/AnyNFTCollection.json");
        init(artifact, artifactCollection);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact, state.artifactCollection);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact, state.artifactCollection]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
