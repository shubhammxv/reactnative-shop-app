import { AsyncStorage } from 'react-native';

import { env } from '../../constants/keys';

export const SIGNUP = "SIGNUP";
export const LOGIN = "LOGIN";
export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT ="LOGOUT";

let timer;

export const authenticate = (userId, token, expiryTime) => {
  return dispatch => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({
      type: AUTHENTICATE,
      userId: userId,
      token: token,
    })
  }
}

export const signup = (email, password) => {
  return async dispatch => {
    const url = `${env.mainApi}signUp?key=${env.apiKey}`;
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      }
    )
    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!'

      if (errorId === 'EMAIL_EXISTS') {
        message = 'This email already exists! Please sign in.'
      }

      // different error codes in firebase docs
      throw new Error(message);
    }

    const resData = await response.json();

    // dispatch({
    //   type: SIGNUP,
    //   token: resData.idToken,
    //   userId: resData.localId
    // })
    dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000))
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  }
}

export const login = (email, password) => {
  return async dispatch => {
    const url = `${env.mainApi}signInWithPassword?key=${env.apiKey}`;
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      }
    )
    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!'

      if (errorId === 'EMAIL_NOT_FOUND') {
        message = 'Email not registered. Please sign up!'
      }

      // different error codes in firebase docs
      throw new Error(message);
    }

    const resData = await response.json();
    console.log("Login", resData);
    // dispatch({
    //   type: LOGIN,
    //   token: resData.idToken,
    //   userId: resData.localId
    // })
    dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000))
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  }
}

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem('userData');
  return {
    type: LOGOUT
  }
}

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
}

const setLogoutTimer = (expirationTime) => {
  return dispatch => {
    timer = setTimeout(() => {
      dispatch(logout())
    }, expirationTime)
  }
}

const saveDataToStorage = (token, userId, expirationDate) => {
  AsyncStorage.setItem(
    'userData',
    JSON.stringify({
      token: token,
      userId: userId,
      expiryDate: expirationDate.toISOString()
    })
  )
}
