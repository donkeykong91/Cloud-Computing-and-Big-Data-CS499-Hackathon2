var requestpromise = require('request-promise-native');
var AWS = require('aws-sdk');

'use strict';

module.exports.storeSchedule = (event, context, callback) => {
  fetchSchedule(callback);
};

var docClient = new AWS.DynamoDB.DocumentClient();
var table = "busschedule";

function fetchSchedule(callback) {
	requestpromise('https://rqato4w151.execute-api.us-west-1.amazonaws.com/dev/info')
    .then(body => {
      var json = JSON.parse(body);
      var promises = []
      var params;

      for (var i = 0; i < json.length; i++) {
        params = {
          TableName:table,
          Item:{
            "id": json[i].id,
            "timestamp": Date.now(),
            "logo": json[i].logo,
            "lat": json[i].lat,
            "lng": json[i].lng,
            "route": json[i].route
          }
        };
        promises.push(putParams(params));
      }

      Promise.all(promises)
        .then(values => {
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
        })
        .catch(err => {console.log(err);});
    });
}

function putParams(params) {
  return new Promise(function(resolve, reject){
    docClient.put(params, (err, data) => {
      if (!err) resolve(data);
      else reject(err);
    });
  });
}
