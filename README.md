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

Function 1: to generate a index file
1. download zip file from the given url
2. unzip the file using adm-zip
3. process the data to make multiple lines address to one record, and then write to the info.csv file
4. using n-gram algorithm to make index json object, and then write to the index.json file

Function 2: query records using the index file
1. using n-gram algotithm to process query data, from string to two-word string array
2. read index.json file to get the index arrays of the query data
3. find the indexs that every two-word string matches
4. read the info.csv file to get the data using the indexs from the preview step
5. show the data on the website
