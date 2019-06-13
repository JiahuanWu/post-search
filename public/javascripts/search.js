
function search(){
    //replace space of the input
    const keyword = document.getElementById('keyword').value.replace(/\s*/g,"");
    const $result = document.getElementById('result');
    //start searching
    $result.innerHTML = "searching...";
    fetch(`/search?keyword=${keyword}`)
    .then(function(res){
        if(res.ok){
            res.json().then(json=>{
                //no matched result
                if(json.result.length<=0){
                    $result.innerHTML = "no result";
                    return;
                }
                //matched result
                $result.innerHTML = "result：";
                json.result.forEach(item=>{
                    let liNode = document.createElement('li');
                    liNode.innerHTML=`<li>${item}</li>`
                    $result.appendChild(liNode);
                })
            }).catch(err=>{
                console.log(err);
                $result.innerHTML = "error";
            });
        }
    }).catch(function(err){
        console.log(err);
        $result.innerHTML = "error";
    })
}