import Eos from 'eosjs';
import {eosOptions, getScatterEOS, network} from './scatter';

export async function getconfig(contract) {
    const scatter = await getScatterEOS();
    if (scatter != null) {
        const eos = scatter.eos(network, Eos, eosOptions);
        const result = await eos.getTableRows({json: true, code: contract, scope: contract, table: 'config', limit: 1});

        console.log('configs: ', result);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
    }
}
