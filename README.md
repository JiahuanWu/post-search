# post-search

### 実行説明：
- git clone https://github.com/JiahuanWu/post-search.git
- cd post-search
- npm install
- npm start
- open http://localhost:3000 in browser


### 技術説明：
packages:
- fs: reads and writes files in NodeJS
- request: makes http calls to get the zip file
- adm-zip: unzips the zip file and read as a buffer
- iconv-lite: decodes the buffer to string
- csvtojson: converts csv string to json
- json2csv: converts json to csv string
- n-gram: converts a given value to n-grams
