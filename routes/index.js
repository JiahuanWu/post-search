var express = require('express');
var router = express.Router();
var fs = require('fs');
var nGram = require('n-gram');

//combine multiple lines address
const getResult = (row) => {
  let newArr = [];
  //loop all the records
  for(let i=0;i<row.length-1;i++){
    let lastAddress ="";
    if(row[i][2] == row[i+1][2] && row[i][8] != row[i+1][8]){
      //if two consecutive records has the same id but different address, then combine them and jump to the next record
      lastAddress = row[i][8]+row[i+1][8];
      i++;
    }else{
      lastAddress = row[i][8]
    }
    newArr.push([row[i][2], row[i][6], row[i][7], lastAddress])
  }
  return newArr;
}
/* GET home page. */
router.get('/', function (req, res, next) {
  var AdmZip = require('adm-zip');
  var request = require('request');
  request.get({ url: 'http://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip', encoding: null }, (err, res, body) => {
    let zip = new AdmZip(body);
    let zipEntries = zip.getEntries();
    zipEntries.forEach(zipEntry => {
      if (zipEntry.entryName == "KEN_ALL.CSV") {
        //decode japanese
        const iconv = require('iconv-lite')
        let buf = zip.readFile(zipEntry);
        let str = iconv.decode(buf, 'Shift-JIS');
        //
        const csv = require('csvtojson');
        csv({ noheader: true, output: 'csv' })
          .fromString(str)
          .then(row => {
            let result = getResult(row);
            const { parse } = require('json2csv');
            try {
              const csv = parse(result)
              fs.writeFile('public/index.txt', csv, err => {
                if (err) throw err;
                console.log('write file succeed')
              })
            } catch (err) {
              console.error(err)
            }
          })
      }
    })
  })
  res.render('index', { title: 'post info' });
});
//search
router.get('/search', function (req, res, next) {
  let result = [], words = [];
  //split input words
  if (req.query.keyword.length <= 2) {
    words = nGram(1)(req.query.keyword)
  } else {
    words = nGram(2)(req.query.keyword);
  }
  //read index.txt file
  const filePath = 'public/index.txt'
  const stream = fs.createReadStream(filePath);
  let data, postArr;
  stream.on('error', err => {
    console.log(err)
  });
  stream.on('data', chunk => {
    data += chunk;
  });
  stream.on('end', () => {
    postArr = data.split(/\n/)
    postArr.forEach(item => {
      let flag = true;
      words.forEach(word => {
        //check if each word is in the string
        if (item.indexOf(word) < 0) {
          flag = false;
        }
      })
      if (flag) {
        result.push(item)
      }
    })
    res.send({ result })
  })
})

module.exports = router;
