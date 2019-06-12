var express = require('express');
var router = express.Router();
var fs = require('fs');
var nGram = require('n-gram');

/* GET home page. */
router.get('/', function (req, res, next) {
  var AdmZip = require('adm-zip');
  var request = require('request');
  request.get({url:'http://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip', encoding:null}, (err, res, body)=>{
    let zip = new AdmZip(body);
    let zipEntries = zip.getEntries();
    zipEntries.forEach(zipEntry=>{
      if(zipEntry.entryName == "KEN_ALL.CSV"){
        //decode japanese
        const iconv = require('iconv-lite')
        let buf = zip.readFile(zipEntry);
        let str = iconv.decode(buf, 'Shift-JIS');
        //
        const csv = require('csvtojson');
        csv({noheader:true,output:'csv'})
        .fromString(str)
        .then(row=>{
          let newArr = [];
          row.forEach(item=>{
            newArr.push([item[2],item[6],item[7],item[8]])
          })
          const {parse} = require('json2csv');
          try{
            const csv = parse(newArr)
            fs.writeFile('public/files/index.txt',csv, err=>{
              if(err) throw err;
              console.log('write file succeed')
            })
          }catch(err){
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
  let result = [];
  //split input words
  const words = nGram(2)(req.query.keyword);
  const filePath = 'public/files/index.txt'
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
      let flag = false;
      words.forEach(word=>{
        if(item.indexOf(word) >=0){
          flag = true;
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
