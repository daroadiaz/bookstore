const DbMixin = require("../mixins/db.mixin");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports = {
	name: "books",
	mixins: [DbMixin("books")],

	settings: {
		fields: {
			_id: { type: "string", primaryKey: true, columnName: "_id" },
			bookId: { type: "string", required: true },
			title: { type: "string", required: true },
			author: { type: "string" },
			publishYear: { type: "number" },
			coverBase64: { type: "string" },
			review: { type: "string", max: 500 },
			rating: { type: "number", min: 1, max: 5 },
			userId: { type: "string", required: true },
			createdAt: { type: "number", onCreate: () => Date.now() },
			updatedAt: { type: "number", onUpdate: () => Date.now() }
		}
	},

	actions: {
		search: {
			rest: {
				method: "GET",
				path: "/search"
			},
			params: {
				q: { type: "string", min: 1 }
			},
			async handler(ctx) {
				const { q } = ctx.params;
				const userId = ctx.meta.user.id.toString();

				await ctx.call("searches.saveSearch", { 
					userId: userId,
					query: q 
				});

				try {
					const response = await axios.get(`https://openlibrary.org/search.json`, {
						params: {
							q: q,
							limit: 10
						}
					});

					const results = response.data.docs.map(book => ({
						key: book.key,
						title: book.title,
						author_name: book.author_name,
						first_publish_year: book.first_publish_year,
						cover_i: book.cover_i
					}));

					return {
						success: true,
						count: results.length,
						results: results
					};
				} catch (error) {
					this.logger.error("Error searching books:", error);
					return {
						success: true,
						count: 0,
						results: []
					};
				}
			}
		},

		lastSearches: {
			rest: {
				method: "GET",
				path: "/last-search"
			},
			async handler(ctx) {
				const userId = ctx.meta.user.id.toString();
				return await ctx.call("searches.getLastSearches", { userId });
			}
		},

		addToLibrary: {
			rest: {
				method: "POST",
				path: "/my-library"
			},
			params: {
				title: { type: "string", required: true },
				author: { type: "string", optional: true },
				publishYear: { type: "number", optional: true },
				coverBase64: { type: "string", optional: true },
				review: { type: "string", max: 500, optional: true },
				rating: { type: "number", min: 1, max: 5, optional: true }
			},
			async handler(ctx) {
				const userId = ctx.meta.user.id.toString();
				const bookId = uuidv4();

				const existingBook = await this.adapter.findOne({
					userId,
					title: ctx.params.title
				});

				if (existingBook) {
					return {
						success: false,
						message: "Este libro ya existe en tu biblioteca"
					};
				}

				const book = await this.adapter.insert({
					bookId,
					...ctx.params,
					userId,
					createdAt: Date.now()
				});

				return {
					success: true,
					message: "Libro agregado exitosamente a tu biblioteca",
					book: {
						id: book.bookId,
						title: book.title,
						author: book.author,
						publishYear: book.publishYear,
						review: book.review,
						rating: book.rating
					}
				};
			}
		},

		getBookFromLibrary: {
			rest: {
				method: "GET",
				path: "/my-library/:id"
			},
			params: {
				id: { type: "string" }
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const userId = ctx.meta.user.id.toString();

				const book = await this.adapter.findOne({
					bookId: id,
					userId
				});

				if (!book) {
					throw new Error("Libro no encontrado en tu biblioteca");
				}

				return {
					success: true,
					book: {
						id: book.bookId,
						title: book.title,
						author: book.author,
						publishYear: book.publishYear,
						coverBase64: book.coverBase64,
						review: book.review,
						rating: book.rating,
						createdAt: book.createdAt,
						updatedAt: book.updatedAt
					}
				};
			}
		},

		updateBook: {
			rest: {
				method: "PUT",
				path: "/my-library/:id"
			},
			params: {
				id: { type: "string" },
				review: { type: "string", max: 500, optional: true },
				rating: { type: "number", min: 1, max: 5, optional: true }
			},
			async handler(ctx) {
				const { id, review, rating } = ctx.params;
				const userId = ctx.meta.user.id.toString();

				const book = await this.adapter.findOne({
					bookId: id,
					userId
				});

				if (!book) {
					throw new Error("Libro no encontrado en tu biblioteca");
				}

				const updateData = {
					updatedAt: Date.now()
				};

				if (review !== undefined) updateData.review = review;
				if (rating !== undefined) updateData.rating = rating;

				await this.adapter.updateById(book._id, { $set: updateData });

				return {
					success: true,
					message: "Libro actualizado exitosamente"
				};
			}
		},

		deleteBook: {
			rest: {
				method: "DELETE",
				path: "/my-library/:id"
			},
			params: {
				id: { type: "string" }
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const userId = ctx.meta.user.id.toString();

				const book = await this.adapter.findOne({
					bookId: id,
					userId
				});

				if (!book) {
					throw new Error("Libro no encontrado en tu biblioteca");
				}

				await this.adapter.removeById(book._id);

				return {
					success: true,
					message: "Libro eliminado exitosamente de tu biblioteca"
				};
			}
		},

		getMyLibrary: {
			rest: {
				method: "GET",
				path: "/my-library"
			},
			params: {
				title: { type: "string", optional: true },
				author: { type: "string", optional: true },
				excludeNoReview: { 
					type: "boolean", 
					optional: true, 
					default: false,
					convert: true
				},
				sortByRating: { type: "enum", values: ["asc", "desc"], optional: true }
			},
			async handler(ctx) {
				const userId = ctx.meta.user.id.toString();
				const { title, author, excludeNoReview, sortByRating } = ctx.params;

				let query = { userId };

				if (title) {
					query.title = { $regex: title, $options: "i" };
				}

				if (author) {
					query.author = { $regex: author, $options: "i" };
				}

				if (excludeNoReview === true) {
					query.review = { $exists: true, $ne: null, $ne: "" };
				}

				let sort = {};
				if (sortByRating) {
					sort.rating = sortByRating === "asc" ? 1 : -1;
				}

				const books = await this.adapter.find({
					query,
					sort
				});

				return {
					success: true,
					count: books.length,
					books: books.map(book => ({
						id: book.bookId,
						title: book.title,
						author: book.author,
						publishYear: book.publishYear,
						coverBase64: book.coverBase64,
						review: book.review,
						rating: book.rating,
						createdAt: book.createdAt,
						updatedAt: book.updatedAt
					}))
				};
			}
		},

		getCover: {
			rest: {
				method: "GET",
				path: "/library/front-cover/:id"
			},
			params: {
				id: { type: "string" }
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const userId = ctx.meta.user.id.toString();

				const book = await this.adapter.findOne({
					bookId: id,
					userId
				});

				if (!book || !book.coverBase64) {
					throw new Error("Portada no encontrada");
				}

				ctx.meta.$responseType = "image/jpeg";
				ctx.meta.$responseHeaders = {
					"Content-Type": "image/jpeg"
				};

				const base64Data = book.coverBase64.replace(/^data:image\/\w+;base64,/, "");
				return Buffer.from(base64Data, "base64");
			}
		}
	}
};