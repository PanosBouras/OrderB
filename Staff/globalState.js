// This file manages the global state
export let globalTotalTablesCount = null;

export const setGlobalTotalTablesCount = (totalTables) => {
  globalTotalTablesCount = totalTables;
};

export let globalFoodList =null;
export const setGlobalFoodItemsList = (value) => {
  globalFoodList = value;
};

export let globalUsername = '';

export const setGlobalUsername = (username) => {
  globalUsername = username;
};

export let globalUserID = '';
export const setGlobalUserID = (UserID) => {
  globalUserID = UserID;
};

export let gloabalTableid =null;
export const setGloabalTableid = (value) => {
  gloabalTableid = value;
};

export let globalPersons =1;
export const setGlobalPersons = (value) => {
  globalPersons = value;
};

export let globalCompanyID =1;
export const setGlobalCompanyID = (value) => {
  globalCompanyID = value;
};

//export const BASE_URL = 'http://192.168.1.186';
//export const BASE_URL = 'http://2.86.224.176';
//export const BASE_URL = 'http://85.74.192.220';
//export const BASE_URL = 'https://orderb.hopto.org';
export const BASE_URL = 'https://orderb.ddns.net';

export const getOrderItemsUrl = (value) => {
  BASE_URL=value;
};