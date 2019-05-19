const fs = require('fs');
const mm = require('music-metadata');
const config = require("./config.json");
const uuid = require('uuid/v4');
let ary = [];
let database;
const file = 'database.json';
if (!fs.existsSync(file)) {
    database = ary;
    fs.writeFileSync(file, JSON.stringify(ary));
}
else {
    database = JSON.parse(fs.readFileSync(file, 'utf8'));
}

console.log(database);

fs.readdir(config.directory, (err, files) =>{
    check(files.length);
    files.forEach(element => {
        //console.log(element);
        //ファイル名が同じ場DBを保持
        const result = database.filter(d => d.file === element);
        //console.log(result);
        //配列が空ではない場合
        if(result.length!==0){
            ary.push(result[0]);
        }
        else{
            mm.parseFile(config.directory+element,{}).then((metadata)=> {
                //console.log(metadata);
                const data = {
                    file : element,
                    title: metadata.common.title,
                    artist: metadata.common.artist,
                    album: metadata.common.album,
                    id: uuid(),
                    kokosukiTimes: []
                };
                ary.push(data);
                //console.log(ary.length+"/"+files.length);
            });
        }
    });
    //console.log(ary);

});
function check(n){
    console.log("Database generating... "+ary.length+"/"+n);
    if(ary.length===n){
        setTimeout(function(){
            fs.writeFile(file, JSON.stringify(ary));
        },1000);
    }
    else{
        setTimeout(function(){check(n)},500);
    }
}