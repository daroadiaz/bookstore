const ApiGateway = require("moleculer-web");

module.exports = {
   name: "api",
   mixins: [ApiGateway],

   settings: {
   	port: process.env.PORT || 3000,
   	ip: "0.0.0.0",
   	
   	cors: {
   		origin: "*",
   		methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
   		allowedHeaders: "*",
   		exposedHeaders: "*",
   		credentials: true,
   		maxAge: 3600
   	},
   	
   	use: [],
   	routes: [
   		{
   			path: "/api",
   			whitelist: [
   				"**"
   			],
   			
   			cors: {
   				origin: "*",
   				methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
   				allowedHeaders: "*",
   				exposedHeaders: "*",
   				credentials: true,
   				maxAge: 3600
   			},
   			
   			use: [],
   			mergeParams: true,
   			authentication: true,
   			authorization: false,
   			autoAliases: true,
   			aliases: {
   				"GET /books/search": "books.search",
   				"GET /books/last-search": "books.lastSearches",
   				"POST /books/my-library": "books.addToLibrary",
   				"GET /books/my-library/:id": "books.getBookFromLibrary",
   				"PUT /books/my-library/:id": "books.updateBook",
   				"DELETE /books/my-library/:id": "books.deleteBook",
   				"GET /books/my-library": "books.getMyLibrary",
   				"GET /books/library/front-cover/:id": "books.getCover"
   			},
   			onBeforeCall(ctx, route, req, res) {
   				res.setHeader("Access-Control-Allow-Origin", "*");
   				res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT, DELETE, PATCH");
   				res.setHeader("Access-Control-Allow-Headers", "*");
   				res.setHeader("Access-Control-Allow-Credentials", "true");
   				
   				if (req.method === "OPTIONS") {
   					res.writeHead(200);
   					res.end();
   					return;
   				}
   				
   				if (req.$params && typeof req.$params === 'object') {
   					Object.keys(req.$params).forEach(key => {
   						if (req.$params[key] === 'true') {
   							req.$params[key] = true;
   						} else if (req.$params[key] === 'false') {
   							req.$params[key] = false;
   						}
   					});
   				}
   			},
   			callingOptions: {},
   			bodyParsers: {
   				json: {
   					strict: false,
   					limit: "10MB"
   				},
   				urlencoded: {
   					extended: true,
   					limit: "10MB"
   				}
   			},
   			mappingPolicy: "all",
   			logging: true
   		}
   	],
   	log4XXResponses: false,
   	logRequestParams: null,
   	logResponseData: null,
   	assets: {
   		folder: "public",
   		options: {}
   	}
   },

   methods: {
   	async authenticate(ctx, route, req) {
   		const auth = req.headers["authorization"];
   		
   		if (!auth) {
   			throw new ApiGateway.Errors.UnAuthorizedError("NO_AUTHORIZATION_HEADER", null);
   		}

   		if (!auth.startsWith("Basic ")) {
   			throw new ApiGateway.Errors.UnAuthorizedError("INVALID_AUTH_TYPE", null);
   		}

   		const base64Credentials = auth.split(" ")[1];
   		const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
   		const [username, password] = credentials.split(":");

   		const user = await ctx.call("auth.validateUser", { username, password });
   		
   		if (!user) {
   			throw new ApiGateway.Errors.UnAuthorizedError("INVALID_CREDENTIALS", null);
   		}

   		ctx.meta.user = user;
   		return user;
   	},

   	authorize(ctx, route, req) {
   		return Promise.resolve(ctx.meta.user);
   	}
   }
};