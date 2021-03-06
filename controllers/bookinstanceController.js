const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const { body, validationResult } = require('express-validator');
const async = require('async');


// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    // Display list of Book Instances
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances) {
            if (err) { return next(err); }

            // Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance) {
            if (err) { return next(err); }

            if (bookinstance === null) {
                var err = new Error('Book Instance not found');
                err.status = 404;
                return next(err);
            }

            // Successful, so render
            res.render('bookinstance_detail', { title: `Copy: ${bookinstance.book.title}`, bookinstance: bookinstance });
        })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
        .exec(function(err, books) {
            if (err) { return next(err); }

            // Successful, so render
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
        })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitized fields
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('sttaus').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation erros from req
        const errors = validationResult(req);

        // Create Bookinstance object with trimmed and sanitized data
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            // There are errors. So render form again with sanitized values and error messages
            Book.find({}, 'title')
                .exec(function(err, books) {
                    if (err) { return next(err); }

                    // Successul, so render
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
                });
            return;
        } else {
            // Data from form is valid
            bookinstance.save(function(err) {
                if (err) { return next(err); }

                // Successful, so redirect
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .exec(function(err, bookinstance) {
            if (err) { return next(err); }

            // Success, so render delete form
            res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: bookinstance });
        })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
        if (err) { return next(err); }

        // Success, so redirectto bookinstances
        res.redirect('/catalog/bookinstances');
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
            bookinstance: function(callback) {
                BookInstance.findById(req.params.id).populate('book').exec(callback);
            },
            books: function(callback) {
                Book.find(callback)
            }
        },
        function(err, results) {
            if (err) { return next(err); }

            if (results.bookinstance === null) {
                var error = new Error('Book instancee not found');
                error.status = 404;
                return next(err);
            }

            // Success
            res.render('bookinstance_form', { title: 'Update BookInstance', book_list: results.books, selected_book: results.bookinstance.book._id, bookinstance: results.bookinstance });
        }
    );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Validate and sanitized fields
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('sttaus').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation erros from req
        const errors = validationResult(req);

        // Create book instance object with validated and santized data
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors. So render the form as GET
            Book.find({}, 'title').exec(function(err, books) {
                if (err) { return next(err); }

                // Success, so render form
                res.render('bookinstance_form', { title: 'Update BookInstance', book_list: books, selected_book: bookinstance.book._id, bookinstance: bookinstance, errors: errors.array() });
            });
            return;
        } else {
            // Data from form is valid
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, thebookinstance) {
                if (err) { return next(err); }

                // Success, so redirect to detail page
                res.redirect(bookinstance.url);
            });
        }
    }
];