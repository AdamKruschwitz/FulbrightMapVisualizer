const key = 'AIzaSyC18z_iqn0b-M7jto7qR9uKcIUvcZT_EHQ';
var locationDictionary = {};
var subjectDictionary = { all: [] };

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "data/locationDictionary.json",
        dataType: "json",
        success: function (data) {
            locationDictionary = data;
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
    //console.log(headers);
    let deffereds = [];
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
                deffereds.push($.get(url, callbackFunction(address)));
            }

            if (locationDictionary[record[headers[5]]] === undefined) { // US_Institution or to institution
                let address = record[headers[5]];

                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                url += address.replace(" ", "%20") + "%20USA&key=" + key;
                deffereds.push($.get(url, callbackFunction(address)));
            }

            //records.push(record); // Add the record to the end of records
        }
        if(recordData[2] !== "") { // Current Position
            subjectDictionary["all"].push(record);

            if(subjectDictionary[record["Field of Specialization"]] === undefined) {
                subjectDictionary[record["Field of Specialization"]] = [record];
            }
            else {
                subjectDictionary[record["Field of Specialization"]].push(record);
            }
        }

    }
    //console.log("out of for loop");
    $.when.apply(deffereds).then(function(){
        //console.log("ran function");
        initUI();
        initScene();
        initGlobe();
        arrowsUpdate();
    });
}

/*function processData(data) {
    let allTextLines = data.split(/\r\n|\n/);

    let deffereds = [];
    $.each(allTextLines, function(index, line) {
        let headers = [];
        if(index === 0) headers = line.split('\t'); // ["Name", "Grant Date", "Current Position", "Field of Specialization", "TR_Institution", "US_Institution", "category", "address", "city", "e-mail address", "work e-mail", "work address", "work city", "work phone number", "fax number", "cell phone number", "home phone number"]
        else {
            let recordData = line.split('\t');
            let record = {};
            $.each(headers, function (index, header) {
                console.log(header);
                console.log(recordData[index]);
                record[header] = recordData[index];
            });
            console.log(record);

            // Get the location data from Google API
            if (locationDictionary[record["TR_Institution"]] === undefined) {
                let address = record["TR_Institution"];
                console.log(address);
                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                url += address.replace(" ", "%20") + "%20Turkey&key=" + key;
                deffereds.push(
                    $.get(url, callbackFunction(address))
                );
            }

            if (locationDictionary[record["US_Institution"]] === undefined) {
                let address = record["US_Institution"];
                let url = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                url += address.replace(" ", "%20") + "%20USA&key=" + key;
                deffereds.push(
                    $.get(url, callbackFunction(address))
                );
            }
        }
        console.log(headers);
    });

    $.when.apply($, deffereds).then(function() {
        initScene();
        initGlobe();
        initUI();
    })
}*/








/*
Wrapper function for saving the data. Need to keep the given address in scope bc Google sends back the address they
thought I asked for.
 */
let callbackFunction = function(address) {
    return function(data) {
        console.log(data);
        if(data["status"] === "OK") {
            let latlng = [
                data["results"][0]["geometry"]["location"]["lng"],
                data["results"][0]["geometry"]["location"]["lat"]
            ];
            locationDictionary[address] = latlng;
        }
        //else console.log("Error: Something went wrong with Geocode API");
    }
};

