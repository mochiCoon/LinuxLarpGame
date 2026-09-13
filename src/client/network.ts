import { GlobalEvents, GlobalFunctions } from "shared/network";

/** Single client-side networking handler — import this instead of calling createClient again. */
export const Events = GlobalEvents.createClient({});
export const Functions = GlobalFunctions.createClient({});
