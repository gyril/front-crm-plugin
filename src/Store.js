import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { contextUpdates } from '@frontapp/plugin-sdk';

export const StoreContext = createContext(null);

export const useStoreState = () => {
  const { state } = useContext(StoreContext);
  return state;
};

export const useStoreDispatch = () => {
  const { dispatch } = useContext(StoreContext);
  return dispatch;
};

const stateReducer = (oldState, action) => {
  console.log(action, action.value);

  if (action.type === 'locales_set')
    return {...oldState, secret: action.value.secret, endpoint: action.value.endpoint};

  if (action.type === 'new_context_received')
    return {...oldState, frontContext: action.value};

  return oldState;
};

export default ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, null);
  
  useEffect(() => {
    // The auth_secret is used for authentication of the plugin
    const secret = (new URL(document.location.href)).searchParams.get('auth_secret');
    console.log(`Secret is ${secret}`);

    // An endpoint can be provided to override the on in the Config.js
    const endpoint = (new URL(document.location.href)).searchParams.get('endpoint');
    console.log(`Endpoint is ${endpoint}`);

    dispatch({type: 'locales_set', value: {secret, endpoint}});

    const subscription = contextUpdates.subscribe(newContext => dispatch({type: 'new_context_received', value: newContext}));
    return () => subscription.unsubscribe();
  }, []);

  const storeContextValue = useMemo(() => ({
    state,
    dispatch
  }), [state, dispatch]);

  if (!state?.frontContext)
    return null;

  return <StoreContext.Provider value={storeContextValue}>
    {children}
  </StoreContext.Provider>;
};