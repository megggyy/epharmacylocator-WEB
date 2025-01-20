import React, { createContext, useReducer, useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import isEmpty from "../assets/common/is-empty"
import { SET_CURRENT_USER } from "./AuthActions";

// Actions;
const LOGOUT_USER = 'LOGOUT_USER';

// Initial State
const initialState = {
  isAuthenticated: false,
  user: {},
  userProfile: {}
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      const isAuthenticated = !isEmpty(action.payload);
      return {
        ...state,
        isAuthenticated,
        user: isAuthenticated ? action.payload : {}, // Ensure user is valid
        userProfile: isAuthenticated ? action.userProfile : {} // Ensure userProfile is valid
      };    
    case LOGOUT_USER:
      return initialState;
    default:
      return state;
  }
};

// Context
const AuthGlobal = createContext({
  state: initialState,
  dispatch: () => null,
  logout: () => {},
});

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token on Init:", decoded); // Add this line
        dispatch({
          type: SET_CURRENT_USER,
          payload: decoded,
        });
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  
    return () => setShowChild(false);
  }, []);
  
  


  const logout = async () => {
    localStorage.removeItem('jwt');
    dispatch({ type: LOGOUT_USER });
  };

  return (
    <AuthGlobal.Provider value={{ state, dispatch, logout }}>
      {children}
    </AuthGlobal.Provider>
  );
};

export default AuthGlobal;
