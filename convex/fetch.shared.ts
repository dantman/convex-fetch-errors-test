import { ConvexError, Infer, v } from "convex/values";
import { serialize as serializeError } from "error-serializer";
import { ActionCtx } from "./_generated/server";

export const vFetchRunResponse = v.object({
	fromIp: v.nullable(v.string()),
	ok: v.boolean(),
	status: v.optional(v.number()),
	statusText: v.optional(v.string()),
	location: v.optional(v.string()),
	textIntro: v.optional(v.string()),
	error: v.optional(v.any()),
});

/**
 * Implementation of the handler for the .run action in both convexFetch and nodeFetch.
 *
 * - Validates and parses the URL, ensuring basic safety checks.
 * - Performs a fetch request with manual redirect handling.
 * - Returns metadata about the request and a preview of the response text.
 */
export const sharedFetchRunHandler = async (
	ctx: ActionCtx,
	args: { url: string },
): Promise<Infer<typeof vFetchRunResponse>> => {
	let url: URL;

	// Validate and parse the URL. Ensure it uses http or https, does not contain credentials, and strip the fragment.
	try {
		url = new URL(args.url);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			throw new ConvexError("URL must use http or https protocol");
		}
		if (url.username || url.password) {
			throw new ConvexError("URL must not contain username or password");
		}
		url.hash = "";
	} catch (error) {
		throw new ConvexError("Invalid URL");
	}
	// @note I wanted to add one of the SSRF protection libraries here, but they are all Node.js only

	const { ip: fromIp } = await ctx.meta.getRequestMetadata();
	try {
		const response = await fetch(url.href, {
			redirect: "manual",
		});
		const text = await response.text();
		return {
			fromIp,
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			location: response.headers.get("Location") ?? undefined,
			textIntro: text.substring(0, 512),
		};
	} catch (error) {
		return {
			fromIp,
			ok: false,
			status: undefined,
			statusText: undefined,
			textIntro: undefined,
			error: serializeError(error, {
				exclude: ["stack"],
			}),
		};
	}
};
