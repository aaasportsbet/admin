import store from '@/store';
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';

export const network = {
  blockchain: 'eos',
  protocol: process.env.EOS.PROTOCOL,
  host: process.env.EOS.HOST,
  port: process.env.EOS.PORT,
  chainId: process.env.EOS.CHAINID
};

// get scatter eos
export async function getScatterEOS() {
  let scatter = store.getters.scatterEOS;
  if (scatter == null) {
    // Don't forget to tell ScatterJS which plugins you are using.
    ScatterJS.plugins(new ScatterEOS());
    // connect
    await ScatterJS.scatter.connect('aaasportsbet').then(connected => {
      // User does not have Scatter Desktop, Mobile or Classic installed.
      if (!connected) return null;

      scatter = ScatterJS.scatter;
      // Vuex ( when using a setScatter action on your store )
      store.dispatch('setScatterEOS', ScatterJS.scatter);
      window.ScatterJS = null;
    });

    // get identity
    const requiredFields = {accounts: [network]};
    await scatter.getIdentity(requiredFields);
  }

  console.log('scatter: ', scatter);
  return scatter;
}
