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

//snippet-start:[cdk.typescript.widgets.exports_main]
exports.main = async function(event, context) {
  try {
    const method = event.httpMethod;
    // Get name, if present
    if (method === "POST") {

// TODO
// get the data
//create cognito object
//call cognito with the correct path
//rename stuff
//set up cognito app with correct perms
//- no client secret
//- only password path

      if (event.path === "/") {
        const incomingBody = JSON.parse(event.body)
        if (incomingBody.loginId && incomingBody.password) {
          const data = "POSTadddd333ddbc" + incomingBody.loginId
          var body = {
            user : data
          };
          return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify(body)
          };
        }
      }
    }

    // We got something besides a GET
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET, POST, and DELETE, not " + method
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
//snippet-end:[cdk.typescript.widgets.exports_main]
//snippet-end:[cdk.typescript.widgets]
