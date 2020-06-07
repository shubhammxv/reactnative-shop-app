const FIREBASE_API = 'https://identitytoolkit.googleapis.com/v1/accounts:';
const DB_ACCESS_API = `https://${[DATABASE_NAME]}.firebaseio.com`;
const API_KEY = `${FIREBASE_API_KEY}`;

export const env = {
  mainApi: FIREBASE_API,
  apiKey: API_KEY,
  dbApi: DB_ACCESS_API,
};
