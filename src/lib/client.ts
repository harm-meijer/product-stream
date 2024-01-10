import { ClientBuilder } from "@commercetools/sdk-client-v2";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import { ByProjectKeyRequestBuilder } from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";

type Config = {
  clientId: string;
  clientSecret: string;
  projectKey: string;
  authUrl: string;
  apiUrl: string;
};

function createCtpClient({
  clientId,
  clientSecret,
  projectKey,
  authUrl,
  apiUrl,
}: Config) {
  return new ClientBuilder()
    .withClientCredentialsFlow({
      host: authUrl,
      projectKey,
      //@note: No need to provide scopes
      //  minimal scope needed is view_published_products
      // scopes: [`view_published_products:${projectKey}`],
      credentials: {
        clientId,
        clientSecret,
      },
      fetch,
    })
    .withHttpMiddleware({
      maskSensitiveHeaderData: true,
      host: apiUrl,
      enableRetry: true,
      retryConfig: {
        retryCodes: [500, 502, 503, 504],
      },
      fetch,
    })
    .build();
}

const getApiRoot = ((apiRoot?: ByProjectKeyRequestBuilder) => {
  return () => {
    if (apiRoot) {
      return apiRoot;
    }

    console.log("config:", {
      clientId: process.env.CTP_CLIENT_ID as string,
      clientSecret: process.env.CTP_CLIENT_SECRET as string,
      projectKey: process.env.CTP_PROJECT_KEY as string,
      authUrl: process.env.CTP_AUTH_URL as string,
      apiUrl: process.env.CTP_API_URL as string,
    });

    apiRoot = createApiBuilderFromCtpClient(
      createCtpClient({
        clientId: process.env.CTP_CLIENT_ID as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        apiUrl: process.env.CTP_API_URL as string,
      })
    ).withProjectKey({
      projectKey: process.env.CTP_PROJECT_KEY as string,
    });
    return apiRoot;
  };
})();

export { getApiRoot };
