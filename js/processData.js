const key = 'AIzaSyC18z_iqn0b-M7jto7qR9uKcIUvcZT_EHQ';
var locationDictionary = {};
var records = [];

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "data/locationDictionary.json",
        dataType: "json",
        success: function (data) {
            locationDictionary = data;
            console.log(data);
            getDatabase();
        }
    });
});

let getDatabase = function() {
    $.ajax({
        type: "GET",
        url: "data/Fulbright Database - Fulbright Database.tsv",
        dataType: "text",
        success: function (data) {
            processData(data);
        }
    });
};

function processData(data) {
    let allTextLines = data.split(/\r\n|\n/);
    let headers = allTextLines[0].split('\t'); // ["Name", "Grant Date", "Current Position", "Field of Specialization", "TR_Institution", "US_Institution", "category", "address", "city", "e-mail address", "work e-mail", "work address", "work city", "work phone number", "fax number", "cell phone number", "home phone number"]
    console.log(headers);
    for(let i=1; i<allTextLines.length; i++) {
        let recordData = allTextLines[i].split('\t');
        let record = {};
        if(recordData[4] !== "" && recordData[5] !== "") {
            for (let j = 0; j < headers.length; j++) {
                record[headers[j]] = recordData[j];
            }

            let errors = false;


            if (locationDictionary[record[headers[4]]] === undefined) { // TR_Institution, or from institution
                let address = record[headers[4]];

                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                url += address.replace(" ", "%20") + "%20Turkey&key=" + key;
                $.get(url, callbackFunction(address))
            }

            if (locationDictionary[record[headers[5]]] === undefined) { // US_Institution or to institution
                let address = record[headers[5]];

                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                url += address.replace(" ", "%20") + "%20USA&key=" + key;
                $.get(url, callbackFunction(address))
            }

            records[records.length] = record; // Add the record to the end of records
        }

    }
}

let callbackFunction = function(address) {
    return function(data) {
        console.log(data);
        if(data["status"] === "OK") {
            let latlng = [
                data["results"][0]["geometry"]["location"]["lat"],
                data["results"][0]["geometry"]["location"]["lng"]
            ];
            locationDictionary[address] = latlng;
        }
        else console.log("Error: Something went wrong with Geocode API");
    }
};

/*
let address = records[0]["TR_Institution"];
 + address + '&key=' + key;
$.get(url, function(data) {
    console.log(data);
});
*/