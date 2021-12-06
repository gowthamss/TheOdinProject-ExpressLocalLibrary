const Author = require('../models/author');
const Book = require('../models/book');

const async = require('async');

// Display list of authors
exports.author_list = function(req, res, next) {
    Author.find()
        .sort({ 'family_name': 1 })
        .exec(function(err, list_authors) {
            if (err) { return next(err); }

            // Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        })
}

// Display detail page for a specific author
exports.author_detail = function(req, res) {
    async.parallel({
            author: function(callback) {
                Author.findById(req.params.id)
                    .exec(callback);
            },

            author_books: function(callback) {
                Book.find({ author: req.params.id }, 'title summary')
                    .exec(callback);
            }
        },
        function(err, results) {
            if (err) { return next(err); }

            if (results.author === null) {
                var err = new Error('Author not found');
                err.status = 404;
                return next(err);
            }

            // Successful, so render
            res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.author_books });
        }
    )
}

// Display Author create form on GET
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Create get');
}

// Handle Author create on POST
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Create post');
}

// Display Author delete form on GET
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Delete get');
}

// Handle Author delete on POST
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Delete post');
}

// Display Author update form on GET
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Update get');
}

// Handle Author update on POST
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author Update post');
}