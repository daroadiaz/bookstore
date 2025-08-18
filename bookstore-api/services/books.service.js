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

					const userBooks = await this.adapter.find({
						query: { userId: userId }
					});

					const results = response.data.docs.map(book => {
						const savedBook = userBooks.find(ub => 
							ub.title === book.title || 
							(book.key && ub.bookId === book.key)
						);

						let coverUrl = null;
						if (savedBook && savedBook.coverBase64) {
							coverUrl = `/api/books/library/front-cover/${savedBook.bookId}`;
						} else if (book.cover_i) {
							coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
						}

						return {
							key: book.key,
							title: book.title,
							author: book.author_name ? book.author_name[0] : "Unknown",
							publishYear: book.first_publish_year,
							coverUrl: coverUrl,
							isInLibrary: !!savedBook
						};
					});

					return {
						success: true,
						count: results.length,
						results: results
					};
				} catch (error) {
					throw new Error("Error searching books from OpenLibrary");
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
					throw new Error("Book already exists in your library");
				}

				const book = await this.adapter.insert({
					bookId,
					...ctx.params,
					userId,
					createdAt: Date.now()
				});

				return {
					success: true,
					message: "Book added successfully to your library",
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
					throw new Error("Book not found in your library");
				}

				return {
					id: book.bookId,
					title: book.title,
					author: book.author,
					publishYear: book.publishYear,
					coverBase64: book.coverBase64,
					review: book.review,
					rating: book.rating,
					createdAt: book.createdAt,
					updatedAt: book.updatedAt
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
					throw new Error("Book not found in your library");
				}

				const updateData = {
					updatedAt: Date.now()
				};

				if (review !== undefined) updateData.review = review;
				if (rating !== undefined) updateData.rating = rating;

				await this.adapter.updateById(book._id, { $set: updateData });

				return {
					success: true,
					message: "Book updated successfully"
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
					throw new Error("Book not found in your library");
				}

				await this.adapter.removeById(book._id);

				return {
					success: true,
					message: "Book deleted successfully from your library"
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

				if (excludeNoReview) {
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
						coverUrl: book.coverBase64 ? `/api/books/library/front-cover/${book.bookId}` : null,
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
					throw new Error("Cover not found");
				}

				ctx.meta.$responseType = "image/jpeg";
				ctx.meta.$responseHeaders = {
					"Content-Type": "image/jpeg"
				};

				return Buffer.from(book.coverBase64, "base64");
			}
		}
	}
};