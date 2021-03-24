

const targetNumber = 2020;
var fs = require('fs');
var array= [];
fs.readFile('./expense_report.txt', function (err, data) {
    if (err) throw err;
    array = data.toString().split("\n");

        /*** Problem A ***/
    console.log("\n\n******** 2 VALUES *************");

    console.time("2 values - Brute Time");
    findTwoBrute(array);
    console.timeEnd("2 values - Brute Time");


    console.time("2 values - 2:nd method Time");
    let twoMultiplied = findTwoFaster(array);
    console.timeEnd("2 values - 2:nd method Time");

        /*** Problem B ***/
    console.log("\n********** 3 VALUES **************");
    
    console.time("3 values - Brute Time");
    let threeMultiplied = findThreeBrute(array);
    console.timeEnd("3 values - Brute Time");

    console.time("3 values - 2:nd method Time");
    findThreeFaster(array);
    console.timeEnd("3 values - 2:nd method Time");

    console.log("\n********** RESULT ************");

    console.log("2 values found multiplied: ",  twoMultiplied);
    console.log("3 values found multiplied: ",  threeMultiplied);

});


function findTwoBrute(array){
    for (i in array) {
        for (j in array) {
            if(parseInt(array[i]) + parseInt(array[j]) == targetNumber ){
                console.log("FOUND 2 VALUES Brute method: ", array[i] +", "+ array[j]);
                return parseInt(array[i]) * parseInt(array[j]);
            }
            
        }
    }
}

function findTwoFaster(arr) {
    arr.sort((a, b) => {
        return a - b;
    });
    for (let i = 0; i < arr.length; i++) {
        let indexB = (arr.length-1) / 2 ;
        if (parseInt(arr[i]) + parseInt(arr[indexB]) > targetNumber) {
            while (indexB > 0) {
                if (parseInt(arr[i]) + parseInt(arr[indexB]) == targetNumber) {
                    console.log("FOUND 2 VALUES 2:nd method",parseInt(arr[i])+", "+parseInt(arr[indexB]));
                    return parseInt(arr[i]) * parseInt(arr[indexB])
                } else {
                    indexB--;
                }
            }
        } else if (parseInt(arr[i]) + parseInt(arr[indexB]) < targetNumber) {
            while (indexB < arr.length) {
                if (parseInt(arr[i]) + parseInt(arr[indexB]) == targetNumber) {
                    console.log("FOUND 2 VALUES 2:nd method",parseInt(arr[i]) +", "+ parseInt(arr[indexB]));
                    return parseInt(arr[i]) * parseInt(arr[indexB]);
                } else {
                    indexB++;
                }
            }

        }
    }
    

}

function findThreeBrute(array){
    for (i in array) {
        for (j in array) {
            for (k in array) {
                if (parseInt(array[i]) + parseInt(array[j]) +parseInt(array[k]) == targetNumber) {
                    console.log("FOUND 3 VALUES BRUTE method: ", array[i] +" "+ array[j] +" "+ array[k]);
                    return  parseInt(array[i]) * parseInt(array[j]) * parseInt(array[k]);
                    
                }
            }
        }
    }
}
   

function findThreeFaster(arr) {
    arr.sort((a, b) => {
        return a - b;
    });
    for (var i = 0; i < arr.length; i++) {

        let x = targetNumber - parseInt(arr[i]);
        let indexA = i + 1;
        let indexB = arr.length;
        while (indexA != indexB) {
            let sumValues = parseInt(arr[indexA]) + parseInt(arr[indexB]);
            if (sumValues == x) {
                console.log("FOUND 3 VALUES 2:nd method " + arr[i] +" "+ arr[indexA] +" "+ arr[indexB]);
                return;
            } else if (sumValues < x) {
                indexA++;
            }
            else {
                indexB--;
            }

        }
    }
}