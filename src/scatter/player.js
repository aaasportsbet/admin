import store from '../store/index';

import {getScatterEOS, requiredFields} from './scatter';

// login
export async function login() {
  console.log('should only show once login');

  const identity = await getPlayerIdentity(true);
  return identity;
  }

// get player identity
export async function getPlayerIdentity(force = false) {
  console.log('should only show once getPlayerIdentity');
  const scatter = await getScatterEOS(force);
  console.log('getPlayerIdentity scatter: ', scatter);
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
    return account;
    }

  return null;
  }

// logout
export async function logout() {
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    scatter.forgetIdentity();
  }
  // Vuex ( when using a setScatter action on your store )
  store.dispatch('setScatterEOS', null);
}
