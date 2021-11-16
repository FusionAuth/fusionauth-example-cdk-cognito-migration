// Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// This file is licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License. A copy of the
// License is located at
//
// http://aws.amazon.com/apache2.0/
//
// This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
// OF ANY KIND, either express or implied. See the License for the specific
// language governing permissions and limitations under the License.
const AWS = require('aws-sdk');

const bucketName = process.env.BUCKET;

function processUserJSON(json) {
  json.testValue = "foo"
  return json
}

//snippet-start:[cdk.typescript.widgets.exports_main]
exports.main = async function(event, context) {
  try {
    const method = event.httpMethod;
    // Get name, if present
    if (method === "POST") {
// TODO
//create cognito object
//call cognito with the correct path
//rename stuff
//set up cognito app with correct perms
//- no client secret
//- only password path

      if (event.path === "/") {
        const incomingBody = JSON.parse(event.body)
        if (incomingBody.loginId && incomingBody.password) {
         //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#initiateAuth-property
          const cognito = new AWS.CognitoIdentityServiceProvider({region: "us-east-2"}); // TODO pull from environment
          var params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: '1r4gcuhj4f127iuhoiov9234tm', // TODO pull from envt
            AuthParameters: {
              USERNAME: incomingBody.loginId, // TODO email? 
              PASSWORD: incomingBody.password
            }
         };

    	const res = await cognito.initiateAuth(params).promise()
        var jsonResponse = {}
        if (res.AuthenticationResult && res.AuthenticationResult.AccessToken) {
    	   const res2 = await cognito.getUser({AccessToken:res.AuthenticationResult.AccessToken}).promise();
           jsonResponse = processUserJSON(res2)
        }
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify(jsonResponse)
        };
     }
     }
     }

// TODO check header for security value auth

    return {
      statusCode: 400,
      headers: {},
      body: "Invalid request"
    };
  } catch(error) {
    var body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: body
    }
  }
}

