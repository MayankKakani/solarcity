import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { isInstanceAdmin } from "./is-instance-admin";

export function requireInstanceAdmin() {
  return async (c: Context, next: Next) => {
    if (!(await isInstanceAdmin(c))) {
      throw new HTTPException(403, {
        message: "Instance admin access required",
      });
    }
    return next();
  };
}
