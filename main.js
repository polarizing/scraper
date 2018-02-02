var request = require('request');
var fs = require('fs');
var moment = require('moment');

var date = null;

for (let j = 0; j < process.argv.length; j++) {  
    if (j == 2) {
        date = moment(process.argv[j], 'MM-DD-YYYY');
    }
}

// Set the headers
var headers = {
    'accept': '*/*',
    'user-agent':'*',
    'Content-Type': 'application/x-www-form-urlencoded',
}

// Configure the request
var options = {
    url: 'http://www.bmfbovespa.com.br/main.jsp?lumPageId=8A488ABF54DF86090154E2F84CB77494&lumA=1&lumII=8A488ABF54DF86090154E2FD4F871950&doui_processActionId=commit&doui_fromForm=Form_8A488ABF54DF86090154E2FD4F871950',
    method: 'POST',
    headers: headers,
    form: {
        'dataDownload':date.format('DD/MM/YYYY'),
        'tipo':'R',
    },
    json: true
}

// Start the request
if (date) {
    if (!date.isValid()) {
        console.log("Wrong date format. Date is of format MM/DD/YYYY or MM-DD-YYYY.");
    }
    else if (date.day() == 6 || date.day() == 0) {
        console.log("Please enter a valid weekday. There is no data for weekends.");
    }
    else {
        console.log("Fetching data ...");
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var index = body.search("doui_setResponseParameters") + 32;
                var fileHash = body.slice( index, index + 32 );
                var error = body.search("doui_error") + 16;
                var errorCode = body.slice( error, error + 25 );
                if (errorCode == "No+entity+found+for+query") {
                    console.log("Invalid date range. Please check website for valid date ranges.");
                    return;
                }
                var output = "data_" + date.format('YYYYMMDD') + ".zip";
                var fileUrl = 'http://www.bmfbovespa.com.br/lumis/portal/file/fileDownload.jsp?fileId=' + fileHash;

                request({url: fileUrl, encoding: null}, function(err, resp, body) {
                  if(err) throw err;
                  fs.writeFile(output, body, function(err) {
                    console.log("File written as: " + output + " to " + __dirname);
                  });
                });

            }
            else {
                console.log("There was an error scraping the data.")
            }
        })
    }
}
else {
    console.log("Run 'node main.js <date>' to download. <date> is of format MM/DD/YYYY or MM-DD-YYYY.");
}