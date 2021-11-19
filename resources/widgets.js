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

const clientId = process.env.CLIENT_ID;
const region = process.env.REGION;
const fusionAuthTenantId = process.env.FUSIONAUTH_TENANT_ID;
const authorizationHeaderValue = process.env.AUTHORIZATION_HEADER_VALUE;

function processOneAttribute(attributes, name) {
    console.log("processing: " + name)
    if (attributes && attributes.filter(obj => obj.Name == name).length > 0) {
        return attributes.filter(obj => obj.Name == name)[0].Value
    }
    return null
}

function processUserJSON(json) {
    // map the json returned by cognito to FusionAuth compatible json
    // see https://fusionauth.io/docs/v1/tech/connectors/generic-connector/ for more
    // example: {"Username":"06744664-df6e-48cc-9421-3d56a9732172","UserAttributes":[{"Name":"sub","Value":"06744664-df6e-48cc-9421-3d56a9732172"},{"Name":"website","Value":"http://example.com"},{"Name":"given_name","Value":"Test"},{"Name":"middle_name","Value":"T"},{"Name":"family_name","Value":"Testerson"},{"Name":"email","Value":"test@example.com"}],"testValue":"foo"}
    // console.log(json)

    const userJSON = {}
    userJSON.user = {}

    userJSON.user.data = {}

    // add migration metadata for future queries
    userJSON.user.data.migratedDate = new Date()
    userJSON.user.data.migratedFrom = "cognito"

    const attributes = json.UserAttributes
    const website = processOneAttribute(attributes, "website")
    if (website != null) {
        userJSON.user.data.website = website
    }

    userJSON.user.username = json.Username // use the same username if desired

    const email = processOneAttribute(attributes, "email")
    if (email != null) {
        userJSON.user.email = email
    }

    userJSON.user.id = json.Username // prefer the sub claim as the id, but fall back to this
    const sub = processOneAttribute(attributes, "sub")
    if (sub != null) {
        userJSON.user.id = sub
    }

    userJSON.user.active = true

    const firstName = processOneAttribute(attributes, "given_name")
    if (firstName != null) {
        userJSON.user.firstName = firstName
    }
    const lastName = processOneAttribute(attributes, "family_name")
    if (lastName != null) {
        userJSON.user.lastName = lastName
    }
    userJSON.user.registrations = []
    userJSON.user.registrations[0] = {
        applicationId: "85a03867-dccf-4882-adde-1a79aeec50df"
    }
    userJSON.user.tenantId = fusionAuthTenantId

)
const emailVerified = processOneAttribute(attributes, "email_verified")
if (emailVerified != null) {
    userJSON.user.verified = (emailVerified == "true")
}

return userJSON
}

//snippet-start:[cdk.typescript.widgets.exports_main]
exports.main = async function(event, context) {
    try {
        const headers = event.headers
        if (headers["Authorization"] !== authorizationHeaderValue) {
            return {
                statusCode: 401,
                headers: {},
                body: "Unauthorized, saw " + JSON.stringify(headers) + ", expected: " + authorizationHeaderValue
            };
        }

        const method = event.httpMethod;
        // Get name, if present
        if (method === "POST") {

            if (event.path === "/") {
                const incomingBody = JSON.parse(event.body)
                if (incomingBody.loginId && incomingBody.password) {
                    //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#initiateAuth-property
                    const cognito = new AWS.CognitoIdentityServiceProvider(region); // TODO pull from environment
                    var params = {
                        AuthFlow: 'USER_PASSWORD_AUTH',
                        ClientId: clientId, // TODO pull from envt
                        AuthParameters: {
                            USERNAME: incomingBody.loginId, // TODO email? 
                            PASSWORD: incomingBody.password
                        }
                    };


                    const res = await cognito.initiateAuth(params).promise()
                    var jsonResponse = {}
                    if (res.AuthenticationResult && res.AuthenticationResult.AccessToken) {
                        const res2 = await cognito.getUser({
                            AccessToken: res.AuthenticationResult.AccessToken
                        }).promise();
                        jsonResponse = processUserJSON(res2)

                        return {
                            statusCode: 200,
                            headers: {},
                            body: JSON.stringify(jsonResponse)
                        };
                    } else if (res.ChallengeName) {
                        console.log("Unable to log user in. Got response: " + res.ChallengeName + " and am unsure how to handle.")
                    }
                }
            }
        }

        return {
            statusCode: 400,
            headers: {},
            body: "Invalid request"
        };
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);
        console.log("Error in authenticating")
        console.log(body)
        return {
            statusCode: 404,
            headers: {},
            body: ""
        }
    }
}