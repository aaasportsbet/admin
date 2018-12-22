import {BigNumber} from 'bignumber.js';
import Eos from 'eosjs';
import * as moment from 'moment';

import {eosOptions, getScatterEOS, network} from '../scatter';

import {teamKeyShort} from './filter';

const contract = process.env.EOS.CONTRACTNBA;

export function playerBetWinStatus(bet) {
  switch (bet.status) {
    case 0:
      return 'wait';
    case 1:
      return 'win';
    case 2:
      return 'lose';
    case 3:
      return 'awarded';
    case 4:
      return 'returned';
    default:
      return 'unknown';
  }
  }

export function playerBetWinStatusLeft(round, bet) {
  if (round.result === bet.bet_val) {
    return 'win';
    }

  return 'lose';
  }

// get bet list
export function getPlayerRoundBets(player, round) {
  console.log('getPlayerRoundBets player: ', player);
  if (player === '') {
    return [];
    }

  var bets = [];
  if (round.bets) {
    round.bets.forEach((bet) => {
      if (bet.player != player || bet.round_id != round.id) {
        return;
      }

      bets.push(bet);
    });
  }

  console.log('round bets: ', bets);
  return bets;
};

export function playerRoundJoinStatus(playerRoundBets, round) {
  switch (round.status) {
    case 0:  // betting
      if (moment().unix() > round.bet_end_time) {
        return {index: 1, value: 'Playing'};
        }

      return {
        index: 0,
        value: playerRoundBets.length > 0 ? 'Join Again' : 'Join Now'
      };
    // case 1:  // result published   return {index: 1, value: 'Playing'};
    default:
      return {index: 2, value: 'View Detail'};
  }
};

export function roundBetValue(bet, round) {
  var winner;
  var points;
  switch (round.type) {
    case 0:  // pointdiff
      winner = bet.bet_val > 0 ? round.hometeam : round.awayteam;
      points = Math.abs(bet.bet_val) + '';
      break;
    case 1:  // winlose
      winner = bet.bet_val == 1 ? round.hometeam : round.awayteam;
      points = '';
      break;
    case 2:  // range
      winner = bet.bet_val > 0 ? round.hometeam : round.awayteam;
      switch (Math.abs(bet.bet_val)) {
        case 1:
          points = '1~3';
          break;
        case 2:
          points = '4~7';
          break;
        case 3:
          points = '8~12';
          break;
        case 4:
          points = '13~20';
          break;
        case 5:
          points = '20+';
          break;
          }
      break;
      }

  return {
    team_name: teamKeyShort[winner],
        share: calcBetTotal(round.bet_unit, bet.share, false, 2),
        team_score: points, user_win_status: playerBetWinStatus(bet)
  }
};

export function getPlayerRoundBetLatest(
    playerRoundBets, round){return playerRoundBets.length > 0 ?
                                roundBetValue(playerRoundBets[0], round) :
                                0};

export function getPlayerPreviousRoundBets(playerRoundBets, round) {
  var bets = [];
  playerRoundBets.forEach((b, idx) => {
    if (idx == 0) {
      return;
    }

    bets.push(roundBetValue(b, round));
  });

  return bets;
};

export async function getPlayerBetStatEOS(player) {
  var stat = {
    player: player,
    join_times: 0,
    win_times: 0,
    bet_amount: 0,
    win_amount: 0,
    extras: []
  };
  const scatter = await getScatterEOS();
  if (scatter != null && scatter.identity) {
    const eos = scatter.eos(network, Eos, eosOptions);
    const tablekey = new BigNumber(Eos.modules.format.encodeName(player, false))
        const result = await eos.getTableRows({
          json: true,
          code: contract,
          scope: contract,
          table: 'playerstats',
          lower_bound: tablekey.toString(),
          upper_bound: tablekey.plus(1).toString(),
          limit: 1
        });

    console.log('player bet stat response: ', result);
    if (result.rows.length > 0) {
      const retstat = result.rows[0]

      retstat.stats.forEach(s => {
        if (asset_symbol(s.assettype) === 'EOS') {
          stat = {
            player: player,
            join_times: s.join_times,
            win_times: s.win_times,
            bet_amount: asset2amount(s.bet_amount, 0),
            win_amount: asset2amount(s.win_amount, 0),
            extras: []
          };
        }
      });
    }
  }

  console.log('player stat: ', stat);
  return stat;
  }

/// bet round
export async function betRound(
    playerIdentity, round, winner, range, points, shares) {
  console.log('bet round identity: ', playerIdentity);

  if (!playerIdentity) {
    return {errno: 401, error: 'player not login'};
    }

  let homewin = false;
  if (round.hometeam == winner) {
    homewin = true;
  } else {
    homewin = false;
    }

  let betval = '';
  switch (round.type) {
    case 0:
      betval = homewin ? points.toString() : (-points).toString();
      break;
    case 1:
      betval = homewin ? 1 + '' : 0 + '';
      break;
    case 2:
      betval = homewin ? range.toString() : (-range).toString();
      break;
      }

  const quant = calcBetTotal(round.bet_unit, shares);
  if (quant == '') {
    return {errno: 400, error: 'quantity is invalid'};
    }

  try {
    const scatter = await getScatterEOS();
    if (scatter != null && scatter.identity) {
      const eos = scatter.eos(network, Eos, eosOptions);
      const response = await eos.transfer(
          `${playerIdentity.name}`, contract, quant,
          'bet|' + round.id + ',' + betval);
      return {errno: 200, data: response};
    } else {
      return {errno: 401, error: 'player not login'};
    }
  } catch (error) {
    return {errno: 500, error: error};
  }
};

export function calcBetTotal(
    round_bet_unit, shares, original = true, fixed = 4) {
  const units = round_bet_unit.split(' ', 2);
  if (units.length != 2) {
    return '';
    }

  const unit = parseFloat(units[0]);
  if (unit == 0) {
    return '';
    }

  const symbol = units[1];
  if (original) {
    let DecimalPad = Eos.modules.format.DecimalPad;
    switch (symbol) {
      case 'EOS':
        return DecimalPad(unit * shares, 4) + ' ' + symbol;
    }
    }

  return (unit * shares).toFixed(fixed) + ' ' + symbol;
};

export function asset2amount(asset, fixed = 0) {
  const units = asset.split(' ', 2);
  if (units.length != 2) {
    return 0;
    }

  const unit = parseFloat(units[0]);
  if (unit == 0) {
    return 0;
    }

  return unit.toFixed(fixed);
  }

function asset_symbol(asset) {
  const units = asset.split(' ', 2);
  if (units.length != 2) {
    return '';
    }

  return units[1];
}