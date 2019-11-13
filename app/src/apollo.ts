import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";

export const serverBase =
  process.env.NODE_ENV == "development" ? `http://localhost:3000` : "";

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-PASS": localStorage.getItem("password")
    }
  };
});

export default new ApolloClient({
  link: authLink.concat(
    new HttpLink({
      uri: serverBase + "/ql"
    })
  ),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "no-cache", errorPolicy: "ignore" },
    query: { fetchPolicy: "no-cache", errorPolicy: "all" }
  }
});
