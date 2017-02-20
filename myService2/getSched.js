var request = require('request-promise-native');
var AWS = require('aws-sdk');

'use strict';

module.exports.getSchedule = (event, context, callback) => {
  grabSchedule(callback);
};

var docClient = new AWS.DynamoDB.DocumentClient();
var table = "busschedule";

function grabSchedule(callback) {
  docClient.scan({TableName : table}, (err, data) => {
     if (err) console.log(err);
     var busses = data.Items;
     var recentBusses = [];
     var index = 0;

     for(var i = 0; i < busses.length-1; i++) {
       if (busses[i].id != busses[i+1].id) {
         recentBusses[index] = busses[i];
         index++;
       }
     }
     recentBusses[index] = busses[busses.length-1];

    //  console.log(recentBusses);

     const response = {
       statusCode: 200,
       headers: {
         "Access-Control-Allow-Origin" : "*"
       },
       body: JSON.stringify(recentBusses)
     };
     callback(null, response);
  });

  // docClient.scan({TableName : table}, (err, data) => {
  //    if (err) console.log(err);
  //    const response = {
  //      statusCode: 200,
  //      headers: {"Access-Control-Allow-Origin" : "*"},
  //      body: JSON.stringify(data.Items)
  //    };
  //    callback(null, response);
  // });
}
