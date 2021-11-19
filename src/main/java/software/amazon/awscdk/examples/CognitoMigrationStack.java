package software.amazon.awscdk.examples;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Duration;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.iam.IManagedPolicy;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.amazon.awscdk.services.s3.Bucket;

public class CognitoMigrationStack extends Stack {
  public CognitoMigrationStack(final Construct scope, final String id) {
    super(scope, id, null);

    RestApi api =
        RestApi.Builder.create(this, "connector-endpoint")
            .restApiName("Connector Endpoint")
            .description("This service responds to login requests from a FusionAuth Connector")
            .build();

    Map<String, String> environmentVariables = new HashMap<String, String>();
    environmentVariables.put("CLIENT_ID", "1r4gcuhj4f127iuhoiov9234tm");
    environmentVariables.put("REGION", "us-east-2");
    environmentVariables.put("FUSIONAUTH_TENANT_ID", "30663132-6464-6665-3032-326466613934");
    environmentVariables.put("AUTHORIZATION_HEADER_VALUE", "2687EE95-AF19-4CE6-A8BD-963139DED32E"); // make this a random value

    Function lambdaFunction =
        Function.Builder.create(this, "ConnectorHandler")
            .code(Code.fromAsset("resources"))
            .handler("connector.main")
            .timeout(Duration.seconds(10))
            .runtime(Runtime.NODEJS_14_X)
            .environment(environmentVariables)
            .build();
    
    LambdaIntegration postWidgetIntegration = new LambdaIntegration(lambdaFunction);
    
    api.getRoot().addMethod("POST", postWidgetIntegration);
  }
}
