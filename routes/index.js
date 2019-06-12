var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'post info' });
});
//search
router.get('/search', function (req, res, next) {
  let result = [];
  //split input words
  const words = req.query.keyword.split('');
  const csvFilePath = 'public/files/KEN_ALL.CSV'
  const iconv = require('iconv-lite')
  let data, postArr;
  const stream = fs.createReadStream(csvFilePath, { encoding: 'binary' });
  stream.on('error', err => {
    console.log(err)
  });
  stream.on('data', chunk => {
    data += chunk;
  });
  stream.on('end', () => {
    const buff = Buffer.from(data, 'binary');
    //str is the string of all record
    const str = iconv.decode(buff, 'Shift-JIS');
    postArr = str.split(/\n/)
    postArr.forEach(item => {
      let flag = true;
      words.forEach(word => {
        //check if each word is in the string
        if (item.indexOf(word) < 0) {
          flag = false;
        }
      })
      if (flag) {
        result.push(item.split(','))
      }
    })
    res.send({ result })
  })
})
//北西
module.exports = router;
