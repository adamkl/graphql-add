const debug = require("debug")("graphql-add");
import { map, filter, uniqWith, flow } from "lodash/fp";

import {
  DocumentNode,
  parse,
  print,
  visit,
  FieldNode,
  SelectionSetNode,
  SelectionNode,
  FragmentSpreadNode,
  FragmentDefinitionNode
} from "graphql";
import { inspect } from "util";

const logObj = (document: any) => {
  debug(inspect(document, { depth: 20, colors: true }));
};

type NamedSelectionNode = FieldNode | FragmentSpreadNode;

const isNamedNode = (node: SelectionNode): boolean => {
  return (node as NamedSelectionNode).name !== undefined;
};

export const combineQueries = (queries: (string | DocumentNode)[]) => {
  debug("combining queries");
  if (queries.length === 0) {
    return "";
  }

  const documents = queries.map(q => (typeof q === "string" ? parse(q) : q));

  if (documents.length < 2) {
    return print(documents[0]);
  }
  documents.forEach(d => debug(inspect(d, { depth: 20, colors: true })));
  let merged = documents.shift();
  while (documents.length > 0) {
    let incoming = documents.shift();
    merged = visit(merged, {
      Document: node => {
        let incomingFragments: FragmentDefinitionNode[] = [];
        visit(incoming, {
          FragmentDefinition: incomingNode =>
            incomingFragments.push(incomingNode)
        });
        return {
          ...node,
          definitions: [...node.definitions, ...incomingFragments]
        };
      },
      SelectionSet: {
        leave: (mNode, mKey, mParent, mPath, mAncestors) => {
          const mergedParent = mParent as FieldNode;
          let found: SelectionSetNode;
          incoming = visit(incoming, {
            SelectionSet: {
              leave: (iNode, iKey, iParent, iPath, iAncestors) => {
                const incomingParent = iParent as FieldNode;
                debug({
                  mergedParent,
                  incomingParent
                });
                if (mergedParent.name.value === incomingParent.name.value) {
                  found = iNode;
                  return null;
                }
              }
            },
            Field: {
              leave: iNode => {
                if (iNode.selectionSet === null) {
                  return null;
                }
              }
            }
          });
          if (!found) {
            return;
          }
          const selections = flow(
            filter(isNamedNode),
            map(n => n as NamedSelectionNode),
            uniqWith((a, b) => a.name.value === b.name.value)
          )([...mNode.selections, ...found.selections]);

          const combined = {
            kind: "SelectionSet",
            selections
          };
          //logObj({ mNode, found, combined });
          return combined;
        }
      }
    });
  }
  merged = visit(merged, {
    OperationDefinition: node => {
      return {
        ...node,
        name: {
          kind: "Name",
          value: "mergedQuery"
        }
      };
    }
  });

  return print(merged);
};
