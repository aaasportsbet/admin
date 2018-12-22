const teamOptions = [
  {key: 0, display_name: 'San Antonio Spurs', short_name: 'SAS'},
  {key: 1, display_name: 'Memphis Grizzlies', short_name: 'MEM'},
  {key: 2, display_name: 'Dallas Mavericks', short_name: 'DAL'},
  {key: 3, display_name: 'Houston Rockets', short_name: 'HOU'},
  {key: 4, display_name: 'New Orleans Pelicans', short_name: 'NOP'},
  {key: 5, display_name: 'Minnesota Timberwolves', short_name: 'MIN'},
  {key: 6, display_name: 'Denver Nuggets', short_name: 'DEN'},
  {key: 7, display_name: 'Utah Jazz', short_name: 'UTH'},
  {key: 8, display_name: 'Portland Trail Blazers', short_name: 'POR'},
  {key: 9, display_name: 'Oklahoma City Thunder', short_name: 'OCT'},
  {key: 10, display_name: 'Sacramento Kings', short_name: 'SAC'},
  {key: 11, display_name: 'Phoenix Suns', short_name: 'PHX'},
  {key: 12, display_name: 'LosAngeles Lakers', short_name: 'LAL'},
  {key: 13, display_name: 'LosAngeles Clippers', short_name: 'LAC'},
  {key: 14, display_name: 'GoldenState Warriors', short_name: 'GSW'},
  {key: 15, display_name: 'Miami Heat', short_name: 'MIA'},
  {key: 16, display_name: 'Orlando Magic', short_name: 'ORL'},
  {key: 17, display_name: 'Atlanta Hawks', short_name: 'ATL'},
  {key: 18, display_name: 'Washington Wizards', short_name: 'WAS'},
  {key: 19, display_name: 'Charlotte Bobcats', short_name: 'CHA'},
  {key: 20, display_name: 'Detroit Pistons', short_name: 'DET'},
  {key: 21, display_name: 'Indiana Pacers', short_name: 'IND'},
  {key: 22, display_name: 'Cleveland Cavaliers', short_name: 'CLE'},
  {key: 23, display_name: 'Chicago Bulls', short_name: 'CHI'},
  {key: 24, display_name: 'Milwaukee Bucks', short_name: 'MIL'},
  {key: 25, display_name: 'Boston Celtics', short_name: 'CEL'},
  {key: 26, display_name: 'Philadelphia 76ers', short_name: 'PHI'},
  {key: 27, display_name: 'New York Knicks', short_name: 'NYN'},
  {key: 28, display_name: 'Brooklyn Nets', short_name: 'BKN'},
  {key: 29, display_name: 'Toronto Raptors', short_name: 'TOR'},
  {key: 30, display_name: 'West All Star', short_name: 'WEST'},
  {key: 31, display_name: 'East All Star', short_name: 'EAST'}
];

export const teamKeyLang = teamOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export const teamKeyShort = teamOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.short_name;
  return acc;
}, {});

// round type
const roundtypeOptions = [
  {key: 0, display_name: 'PointDiff'}, {key: 1, display_name: 'WinLose'},
  {key: 2, display_name: 'Range'}
];

export const roundtypeKeyValue = roundtypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});
