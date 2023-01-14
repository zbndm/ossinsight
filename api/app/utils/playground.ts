import { AST, Parser, Select, With } from "node-sql-parser";
import { BadParamsError } from "../core/QueryParam";
import { getEnv } from "./env";

export class SqlParser {
  parser: Parser;
  sql: string;
  ast?: AST;
  type: string;
  id: number;

  constructor(type: "repo" | "user", id: string, sql: string) {
    this.parser = new Parser();
    this.sql = sql;
    switch (type) {
      case "repo":
        this.type = "repo_id";
        break;
      case "user":
        this.type = "actor_id";
        break;
      default:
        throw new BadParamsError("playground", `invalid type ${type}`);
    }
    this.id = parseInt(id, 10); // consider bigint
    this.ast = this.sqlToAst(sql);
  }

  private sqlToAst(sqlString: string) {
    try {
      const ast = this.parser.astify(sqlString);
      if (Array.isArray(ast) && ast.length > 1) {
        throw new BadParamsError(
          "playground",
          "only one sql statement is allowed"
        );
      } else if (Array.isArray(ast)) {
        return ast[0];
      } else {
        return ast;
      }
    } catch (error: any) {
      // throw new BadParamsError("playground", `${error.name} ${error.message}`);
      // Node-sql-parser does not support SHOW statement, etc.
      // So we need to allow the error. If Node-sql-parser cannot parse the sql, we will use the original sql.
      return undefined;
    }
  }

  private validateAst(ast: AST) {
    const type = ast.type;
    switch (type as string) {
      case "select":
        parseSelectAst(ast as Select, this.type, this.id);
        return ast;
      case "set":
        throw new BadParamsError("playground", `SET is not supported`);
      default:
        return ast;
    }
  }

  private astToString(ast: AST) {
    const parsedSQLStr = this.parser.sqlify(ast);
    return parsedSQLStr;
  }

  public sqlify() {
    // If Node-sql-parser cannot parse the sql, we will use the original sql.
    if (this.ast) {
      const ast = this.validateAst(this.ast);
      return this.astToString(ast);
    }
    return this.sql;
  }
}

const LIMIT_AST_NODE = {
  seperator: "",
  value: [
    {
      type: "number",
      value: 100,
    },
  ],
};

const WHERE_AST_NODE = (fieldName: string, value: number) => ({
  type: "binary_expr",
  operator: "=",
  left: {
    type: "column_ref",
    table: null,
    column: fieldName,
  },
  right: {
    type: "number",
    value,
  },
});

declare module "node-sql-parser" {
  interface Select {
    _next?: AST;
    union?: string;
  }
}

function parseSelectAst(
  ast: Select,
  fieldName: string,
  value: number,
  depth = 0
) {
  // only handle select statement
  if (ast.type !== "select") {
    return;
  }
  const { where, from, limit, with: astWith, union } = ast;
  // Only add LIMIT to the outermost layer of SQL expression
  if (depth === 0 && !union) {
    // Add limit
    if (limit?.value && limit.value[0]?.value > 100) {
      limit.value[0].value = 100;
    } else if (!limit?.value?.length) {
      ast.limit = LIMIT_AST_NODE;
    }
  }
  // Check FROM clause
  from &&
    from.length > 0 &&
    from.forEach((fromItem) => {
      const fromItemAst = fromItem?.expr?.ast as Select | undefined;
      fromItemAst && parseSelectAst(fromItemAst, fieldName, value, depth + 1);
    });
  // Check WITH clause
  const astWithList = Array.isArray(astWith)
    ? (astWith as With[])
    : astWith
    ? [astWith]
    : [];
  astWithList.forEach((withItem) => {
    const stmt = withItem?.stmt as any;
    const withItemAst = stmt.ast as Select | undefined;
    withItemAst && parseSelectAst(withItemAst, fieldName, value, depth + 1);
  });
  // Wrap where clause
  // 30-Sep-2021: We don't need to add "repo_id = xxx" condition into where clause anymore
  if (!where) {
    // ast.where = WHERE_AST_NODE(fieldName, value);
    if (from && from?.length > 0) {
      throw new BadParamsError(
        "playground",
        `WHERE is required. Please add "WHERE ${fieldName} = ${value}" to your query.`
      );
    }
  } else {
    // Check if where clause already has the repo_id = xxx or actor_id = xxx
    const whereLimitExist = isWhereLimitExist(where, fieldName, value);
    if (whereLimitExist) {
      // do nothing
    } else {
      // where.parentheses = true;
      // ast.where = {
      //   type: "binary_expr",
      //   operator: "AND",
      //   left: WHERE_AST_NODE(fieldName, value),
      //   right: where,
      // };
      throw new BadParamsError(
        "playground",
        `Please add "${fieldName} = ${value}" to your each WHERE clause.`
      );
    }
  }
  // Check UNION clause
  if (union) {
    const unionAst = ast._next as Select;
    parseSelectAst(unionAst, fieldName, value, depth);
  }
}

const isWhereLimitExist = (
  where: Select["where"],
  fieldName: string,
  fieldValue: number
): boolean => {
  const operator: string = where?.operator;
  const type: string = where?.type;
  // Check if where clause already has the repo_id = xxx or actor_id = xxx
  // Only handle binary_expr
  // Only handle "AND" operator
  if (operator === "AND") {
    return (
      isWhereLimitExist(where.left, fieldName, fieldValue) ||
      isWhereLimitExist(where.right, fieldName, fieldValue)
    );
  }
  if (operator === "=") {
    const left = where?.left?.column || where?.left?.value;
    const right = where?.right?.value;
    if (left === fieldName && right === fieldValue) {
      return true;
    }
  }
  return false;
};

export function getPlaygroundSessionLimits() {
  return getEnv(/^PLAYGROUND_SESSION_(.+)$/).map(
    ([key, value]) => `SET SESSION ${key} = ${value};`
  );
}
