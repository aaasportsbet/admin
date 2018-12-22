import Eos from 'eosjs';
import {stat} from 'fs';
import * as moment from 'moment';

import {getconfig} from '../config';
import {logout} from '../player';
import {eosOptions, getScatterEOS, network} from '../scatter';

import {calcBetTotal, getPlayerBetStatEOS, getPlayerPreviousRoundBets, getPlayerRoundBetLatest, getPlayerRoundBets, playerBetWinStatus, playerBetWinStatusLeft, playerRoundJoinStatus, roundBetValue} from './bet';
import {roundtypeKeyValue, teamKeyLang, teamKeyShort} from './filter';

const contract = process.env.EOS.CONTRACTNBA;

// sort algo
function sortby(time) {
  return function(a, b) {
    return (a.bet_end_time - time) < (b.bet_end_time - time) ? 1 : -1
  };
  }

// get round list
async function getRoundList() {
  var rounds = [];
  const scatter = await getScatterEOS();
  if (scatter != null) {
    const eos = scatter.eos(network, Eos, eosOptions);
    const result = await eos.getTableRows(
        true, contract, contract, 'rounds', 'rounds', 0, -1, 10000, 'i64', 1);
    rounds = result.rows.sort(sortby(moment().unix()));
  }

  console.log('rounds', rounds);
  return rounds;
}

// get single round
async function getRound(id) {
  if (id < 0) {
    return {};
    }

  const scatter = await getScatterEOS();
  if (scatter != null) {
    const eos = scatter.eos(network, Eos, eosOptions);
    const result = await eos.getTableRows({
      json: true,
      code: contract,
      scope: contract,
      table: 'rounds',
      lower_bound: id,
      upper_bound: id + 1,
      limit: 1
    });

    if (result.rows.length > 0) {
      return result.rows[0];
    }
    }

  return {};
}

function nullObj(obj) {
  return Object.keys(obj).length === 0
  }

export async function createRound(round) {
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    const aaasportsnba = await eos.contract(contract);
    await aaasportsnba.createround(
        `${account.name}`, round.bet_end_time, round.roundtype, round.home,
        round.away, round.unit,
        {authorization: [`${account.name}@${account.authority}`]});
  }
  }

export async function publishRound(round) {
  console.log(round);
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    const aaasportsnba = await eos.contract(contract);
    await aaasportsnba.publicround(
        `${account.name}`, round.id, round.homepoint, round.awaypoint,
        {authorization: [`${account.name}@${account.authority}`]});
  }
  }

export async function lotteryRound(round) {
  logout();  // using contract permission
  const scatter = await getScatterEOS(true);
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    const aaasportsnba = await eos.contract(contract);
    await aaasportsnba.lotteryround(
        round.id, {authorization: [`${account.name}@${account.authority}`]});
  }
  }

export async function deleteRound(round) {
  const scatter = await getScatterEOS(true);
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    const aaasportsnba = await eos.contract(contract);
    await aaasportsnba.deleteround(
        `${account.name}`, round.id,
        {authorization: [`${account.name}@${account.authority}`]});
  }
  }

export async function withdrawRound(round) {
  logout();  // using contract permission
  const scatter = await getScatterEOS(true);
  if (scatter != null && scatter.identity) {
    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');

    const eos = scatter.eos(network, Eos, eosOptions);
    await eos.transfer(
        contract, 'aaasportsbet', round.token_left, 'withdraw|' + round.id);
  }
  }

export async function getSingleRound(id, player) {
  const round = await getRound(id);
  if (nullObj(round)) {
    return {errno: 404, error: 'round not found'};
    }
  const playerRoundBets = getPlayerRoundBets(player, round);
  return {errno: 200, data: formatHomeRound(round, playerRoundBets)};
  }

export async function getRoundListByStatus(status) {
  const rounds = await getRoundList();

  let displayrounds = [];
  const now = moment().unix();
  rounds.forEach((r) => {
    switch (status) {
      case 'betting':
        if (r.status == 0 && now <= r.bet_end_time) {
          displayrounds.push(r);
          }
        break;
      case 'waittingpub':
        if (r.status == 0 && now > r.bet_end_time) {
          displayrounds.push(r);
          }
        break;
      case 'pubing':
        if (r.status == 1) {
          displayrounds.push(r);
          }
        break;
      case 'delete':
        if (r.status == 2) {
          displayrounds.push(r);
          break;
        }
    }
  });

  return displayrounds;
}
