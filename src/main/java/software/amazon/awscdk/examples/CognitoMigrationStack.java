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

//    Bucket bucket = Bucket.Builder.create(this, "WidgetStorexaaa2").build();

    RestApi api =
        RestApi.Builder.create(this, "widgets-api")
            .restApiName("Widget Service")
            .description("This service serves widgets.")
            .build();

//    List<IManagedPolicy> managedPolicyArray = new ArrayList<IManagedPolicy>();
//    managedPolicyArray.add(
//        (IManagedPolicy) ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoPowerUser")); // TODO needs to be more constrained

    Role restApiRole =
        Role.Builder.create(this, "RestAPIRole")
            .assumedBy(new ServicePrincipal("apigateway.amazonaws.com"))
//            .managedPolicies(managedPolicyArray)
            .build();

    Map<String, String> environmentVariables = new HashMap<String, String>();
    environmentVariables.put("CLIENT_ID", "1r4gcuhj4f127iuhoiov9234tm");
    environmentVariables.put("REGION", "us-east-2");
    environmentVariables.put("FUSIONAUTH_TENANT_ID", "c5e99266-cb54-4021-abaa-42ed7b8650c4");


    Function lambdaFunction =
        Function.Builder.create(this, "WidgetHandler")
            .code(Code.fromAsset("resources"))
            .handler("widgets.main")
            .timeout(Duration.seconds(30))
            .runtime(Runtime.NODEJS_14_X)
            .environment(environmentVariables)
            .build();

//    bucket.grantReadWrite(lambdaFunction);

    Map<String, String> lambdaIntegrationMap = new HashMap<String, String>();
    lambdaIntegrationMap.put("application/json", "{ \"statusCode\": \"200\" }");

    LambdaIntegration getWidgetIntegration =
        LambdaIntegration.Builder.create(lambdaFunction)
            .requestTemplates(lambdaIntegrationMap)
            .build();

//    api.getRoot().addMethod("GET", getWidgetIntegration);
    
    LambdaIntegration postWidgetIntegration = new LambdaIntegration(lambdaFunction);
    
    api.getRoot().addMethod("POST", postWidgetIntegration);
//    LambdaIntegration deleteWidgetIntegration = new LambdaIntegration(lambdaFunction);

//    Resource widget = api.getRoot().addResource("{id}");
//
//    widget.addMethod("POST", postWidgetIntegration);
//    widget.addMethod("GET", getWidgetIntegration);
//    widget.addMethod("DELETE", deleteWidgetIntegration);
  }
}
