import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { sharedFetchRunHandler, vFetchRunResponse } from "./fetch.shared";

/**
 * Implementation of the handler for the .run action as run in the Convex environment.
 */
export const run = internalAction({
	args: { url: v.string() },
	returns: vFetchRunResponse,
	handler: sharedFetchRunHandler,
});
