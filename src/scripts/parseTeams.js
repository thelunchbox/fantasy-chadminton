const fs = require('fs');
const path = require('path');

const ignore = [
  'numerals',
  'ignoreFields',
  'reason',
  'Logo Status',
  'Conf',
];

const csvFilePath = path.resolve(__dirname, '../data/teams.csv');
let csv = '';
if (fs.existsSync(csvFilePath)) {
  csv = fs.readFileSync(csvFilePath, 'utf8');
}

const rows = csv.split('\r\n');
const headers = rows[0].split(',');
const result = [];

for (let r = 1; r < rows.length; r++) {
  const data = rows[r].split(',');
  const obj = {};
  for (let h = 0; h < headers.length; h++) {
    obj[headers[h]] = data[h];
  }
  result.push(obj);
}

fs.writeFileSync(path.resolve(__dirname, '../data/teams.json'), JSON.stringify(result, null, 2));