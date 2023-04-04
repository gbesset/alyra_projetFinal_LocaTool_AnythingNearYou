const actions = {
  init: "INIT",
  setIsOwner: "SET_IS_OWNER"
};

const initialState = {
  artifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  contract: null,
  isOwner: null,
  isRenter:null,
  txhash:null
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    case actions.setIsOwner:
      return { ...state, isOwner: data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
