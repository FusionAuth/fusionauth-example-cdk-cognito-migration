package software.amazon.awscdk.examples;

import software.amazon.awscdk.core.App;

public class CognitoMigrationApp {
  public static void main(final String argv[]) {
    App app = new App();

    new CognitoMigrationStack(app, "CognitoMigration");

    app.synth();
  }
}
