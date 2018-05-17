# graphql-add

A simple tool for combining graphql queries

## usage

```javascript
import { combineQueries } from "graphql-add";

const q1 = `
  query q1 {
    person {
      firstName
      address {
        street
      }
    }
  }
`;

const q2 = `
  query q2 {
    person {
      ...personFragment
      address {
        city
      }
    }
  }

  fragment personFragment on Person {
    lastName
  }
`;

const combinedQuery = combineQueries([q1, q2, q3]);

combinedQuery ===
  `query mergedQuery {
    person {
      firstName
      address {
        street
        city
      }
      ...personFragment
    }
  }

  fragment personFragment on Person {
    lastName
  }
`;
```
