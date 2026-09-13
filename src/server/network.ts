import { GlobalEvents, GlobalFunctions } from "shared/network";

/** Single server-side networking handler — import this instead of calling createServer again. */
export const Events = GlobalEvents.createServer({});
export const Functions = GlobalFunctions.createServer({});
