var express = require('express');
var router = express.Router();
var fs = require('fs');

//combine multiple lines address
const getResult = (row) => {
  let newArr = [];
  //loop all the records
  for (let i = 0; i < row.length - 1; i++) {
    let k = 0;
    let lastAddress = row[i][8];
    for (let j = 1; j < row.length - i; j++) {
      //loop all the records after i
      if (row[i][2] != row[i + j][2]) {
        //if two records have different code, jump to the next loop
        break;
      } else if (row[i][8] != row[i + j][8]) {
        //if two records have same code, combine two address
        lastAddress += row[i + j][8];
        k = j;
      }
    }
    //jump over the same records
    i=i+k;
    newArr.push([row[i][2], row[i][6], row[i][7], lastAddress])
  }
  return newArr;
}
//get n-gram index json object
const getNGramIndex = (arr,n) => {
  //arr is the array of all the records. like [["0600000","北海道","札幌市中央区","以下に掲載がない場合"],["0640941","北海道","札幌市中央区","旭ケ丘"]]
  let indexObj = {};
  for (let i = 0; i < arr.length; i++) {
    //every record's content: change from array to string
    let str = arr[i][0] + arr[i][1] + arr[i][2] + arr[i][3];
    for (let j = 0; j < str.length + 1 - n; j++) {
      //change the string to n-gram string
      var index = str.substring(j, j + n);
      if (indexObj[index] == undefined) { indexObj[index] = []; }
      if(indexObj[index].indexOf(i)<0) indexObj[index].push(i);
    }
  }
  //{"word1":[1,2],"word2":[6]}
  return indexObj;
}
//change string to n-gram string array
const getNGramStrArr = (str, n) => {
  let strArr = [];
  for (let i = 0; i < str.length + 1 - n; i++) {
    strArr[i] = str.substring(i, i + n);
  }
  return strArr;
}
/* GET home page. */
router.get('/', function (req, res, next) {
  var AdmZip = require('adm-zip');
  var request = require('request');
  //get the zip file
  request.get({ url: 'http://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip', encoding: null }, (err, res, body) => {
    //unzip the file
    let zip = new AdmZip(body);
    let zipEntries = zip.getEntries();
    zipEntries.forEach(zipEntry => {
      if (zipEntry.entryName == "KEN_ALL.CSV") {
        const iconv = require('iconv-lite');
        //decode japanese
        let buf = zip.readFile(zipEntry);
        let str = iconv.decode(buf, 'Shift-JIS');
        //change csv to json
        const csv = require('csvtojson');
        csv({ noheader: true, output: 'csv' })
          .fromString(str)
          .then(row => {
            //processed data
            let result = getResult(row);
            //index json object
            let indexObj = getNGramIndex(result,2);
            const { parse } = require('json2csv');
            try {
              fs.writeFile('public/info.csv', parse(result,{header:false}), err => {
                if (err) throw err;
                console.log('write info file succeed')
              })
              fs.writeFile('public/index.json', JSON.stringify(indexObj), err => {
                if (err) throw err;
                console.log('write index file succeed')
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
  //split keywords into n-gram string arrays
  words = getNGramStrArr(req.query.keyword, 2);
  //read index.json file
  const indexFilePath = 'public/index.json'
  let indexJson, //index json object
      indexArrs =[], //splited keywords' index arrays
      indexArr = []; //index array that include all the splited kwywords
  fs.readFile(indexFilePath,(err,data)=>{
    if(err) throw err;
    indexJson = JSON.parse(data)
    words.forEach(word=>{
      indexArrs.push(indexJson[word]);
    })
    //indexArrs: words index, like [[1,2],[1],[1,8,10]]
    for (let i = 0; i < indexArrs[0].length; i++) {
      let flag = true;
      for (let j = 1; j < indexArrs.length; j++) {
          if (indexArrs[j].indexOf(indexArrs[0][i]) < 0) {
            //if one of the index array doesn't has the index
            flag = false;
          }
      }
      if (flag) indexArr.push(indexArrs[0][i]);
  }
    //read info.csv file
    const infoFilePath = 'public/info.csv'
    fs.readFile(infoFilePath, (err,data)=>{
      if(err) throw err;
      let infoArr = data.toString().split(/\n/);
      indexArr.forEach(index=>{
        result.push(infoArr[index])
      })
      res.send({result});
    })
  });
})

module.exports = router;
