import { Infer, v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { vFetchRunResponse } from "./fetch.shared";

const vFetchRunResponseOrError = v.union(
	vFetchRunResponse,
	v.object({
		error: v.string(),
	}),
);

/**
 * Runs the fetch call on both the Node.js and Convex environments and compares the results.
 */
export const compare = internalAction({
	args: {
		url: v.string(),
	},
	returns: v.object({
		node: vFetchRunResponseOrError,
		convex: vFetchRunResponseOrError,
	}),
	handler: async (
		ctx,
		args,
	): Promise<{
		node: Infer<typeof vFetchRunResponseOrError>;
		convex: Infer<typeof vFetchRunResponseOrError>;
	}> => {
		const [nodeResponse, convexResponse] = await Promise.all([
			ctx
				.runAction(internal.nodeFetch.run, { url: args.url })
				.catch((err) => ({ error: err.message })),
			ctx
				.runAction(internal.convexFetch.run, { url: args.url })
				.catch((err) => ({ error: err.message })),
		]);

		return {
			node: nodeResponse,
			convex: convexResponse,
		};
	},
});
