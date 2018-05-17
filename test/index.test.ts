import { combineQueries } from "../src/index";
import { print, parse } from "graphql";

test("it should combine queries", () => {
  const queries = [
    `
query q1 {
  person {
    name
  }
}
  `,
    `
query q2 {
  person {
    age
  }
}
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should combine more than 2 queries", () => {
  const queries = [
    `
query q1 {
  person {
    name
  }
}
  `,
    `
query q2 {
  person {
    age
  }
}
  `,
    `
query q3 {
  person {
    dob
  }
}
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should remove duplicate fields", () => {
  const queries = [
    `
query q1 {
  person {
    name
  }
}
  `,
    `
query q2 {
  person {
    name
  }
}
  `,
    `
query q3 {
  person {
    age
  }
}`
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should combine nested queries", () => {
  const queries = [
    `
query q1 {
  person {
    address {
      street
    }
  }
}
  `,
    `
query q2 {
  person {
    address {
      city
    }
  }
}
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should combine nested queries with fields at different levels", () => {
  const queries = [
    `
query q1 {
  person {
    firstName
    address {
      street
    }
  }
}
  `,
    `
query q2 {
  person {
    lastName
    address {
      city
    }
  }
}
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should combine queries with fragment spread", () => {
  const queries = [
    `
query q1 {
  person {
    firstName
    address {
      street
    }
  }
}
  `,
    `
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
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});

test("it should combine queries with multiple fragment spreads", () => {
  const queries = [
    `
query q1 {
  person {
    firstName
    address {
      street
    }
  }
}
  `,
    `
query q2 {
  person {
    ...personFragment
    address {
      city
      ...cityFragment
    }
  }
}

fragment personFragment on Person {
  lastName
}

fragment cityFragment on City {
  country
}
  `,
    `
query q3 {
  person {
    ...dobFragment
  }
}

fragment dobFragment on Person {
  dob
}
  `
  ];

  const rv = combineQueries(queries);
  expect(rv).toMatchSnapshot();
});
