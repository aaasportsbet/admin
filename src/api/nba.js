import request from '@/utils/request';
import {getScatterEOS, network} from '@/utils/scatter';
import Eos from 'eosjs';

// options you want into the eosjs reference.
const eosOptions = {
  expireInSeconds: 60,
  verbose: process.env.EOS.DEBUG,
  sign: process.env.EOS.DEBUG
};

export async function createRound(round) {
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    const aaasportsnba = await eos.contract('aaasportsnba');
    await aaasportsnba.createround(
        `${account.name}`, round.bet_end_time, round.roundtype, round.home,
        round.away, round.unit,
        {authorization: [`${account.name}@${account.authority}`]});
  }
  }

export async function fetchRoundList(query) {
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    const eos = scatter.eos(network, Eos, eosOptions);
    const result = await eos.getTableRows(
        true, 'aaasportsnba', 'aaasportsnba', 'rounds', 'rounds', 0, -1, 100,
        'i64', 1);
    return result;
    }

  return {a: 'sdfwefsa'};
  }

export function fetchArticle(id) {
  return request({url: '/article/detail', method: 'get', params: {id}})
  }

export function fetchPv(pv) {
  return request({url: '/article/pv', method: 'get', params: {pv}})
  }

export function createArticle(data) {
  return request({url: '/article/create', method: 'post', data})
  }

export function updateArticle(data) {
  return request({url: '/article/update', method: 'post', data})
}
