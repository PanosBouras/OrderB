// This file manages the global state
export let globalTotalTablesCount = null;

export const setGlobalTotalTablesCount = (value) => {
  globalTotalTablesCount = value;
};

export let globalFoodList =null;
export const setGlobalFoodItemsList = (value) => {
  globalFoodList = value;
};

export let globalUsername = '';

export const setGlobalUsername = (username) => {
  globalUsername = username;
};

export let gloabalTableid =null;
export const setGloabalTableid = (value) => {
  gloabalTableid = value;
};

export const BASE_URL = 'http://192.168.1.186';
//export const BASE_URL = 'http://2.86.224.176';

export const getOrderItemsUrl = (value) => {
  BASE_URL=value;
};