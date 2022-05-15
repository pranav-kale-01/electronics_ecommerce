var express = require('express');
var router = express.Router();

var slug = require('slug');

// database module
var database = require('../config/database');
var RunQuery = database.RunQuery;

function isAdmin(req, res, next) {

    if (req.isAuthenticated()) {
        if (req.user.Admin == 1) {
            return next();
        }
        else {
            res.redirect('/usr/' + req.user.Username);
        }
    }

    res.redirect('/');
}

router.route('/')
    .get(isAdmin, function (req, res, next) {
        res.redirect('/admin/cat');
        /*var contextDict = {
         title: 'Admin',
         customer: req.user
         };
         res.render('admin/admin', contextDict);*/
    });

router.route('/cat')
    .get(isAdmin, function (req, res, next) {

        var sqlStr = '\
        SELECT *\
        FROM categories';

        RunQuery(sqlStr, function (categories) {
            var contextDict = {
                title: 'Admin - categories',
                categories: categories,
                customer: req.user
            };

            res.render('admin/categories', contextDict);
        });
    });

router.route('/cat/:id/edit')
    .get(isAdmin, function (req, res, next) {

        var sqlStr = '\
        SELECT *\
        FROM categories\
        WHERE CategoryID = ' + req.params.id;

        RunQuery(sqlStr, function (category) {
            var contextDict = {
                title: 'Admin - Edit Category',
                category: category[0],
                customer: req.user
            };

            res.render('admin/editCat', contextDict);
        });
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
        UPDATE categories\
        SET CategoryName = \'' + req.body.name + '\', \
            Description = \'' + req.body.description + '\', \
            CategorySlug = \'' + slug(req.body.name) + '\' ' +
                /*Image = name.png\*/
            'WHERE CategoryID = ' + req.params.id;

        RunQuery(sqlStr, function (category) {
            res.redirect('/admin/cat');
        });
    });

router.route('/cat/:id/delete')
    .post(isAdmin, function (req, res, next) {
        sqlStr = '\
            DELETE FROM categories\
            WHERE CategoryID = ' + req.params.id;

        RunQuery(sqlStr, function (result) {
            res.redirect('/admin/cat');
        });
    });

router.route('/cat/add')
    .get(isAdmin, function (req, res, next) {
        var contextDict = {
            title: 'Admin - Add Category',
            customer: req.user
        };

        res.render('admin/addCat', contextDict);
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
        INSERT INTO categories\
        VALUES (null, \'' + req.body.name + '\', \
            \'' + req.body.description + '\', \
            \'' + slug(req.body.name) + '\', \
            \'' + slug(req.body.name) + '.png\')'
        /*Image = name.png\*/
            ;

        RunQuery(sqlStr, function (category) {
            res.redirect('/admin/cat');
        });
    });

router.route('/products')
    .get(isAdmin, function (req, res, next) {
        var sqlStr = '\
                    SELECT products.*, categories.CategoryName\
                    FROM products\
                    INNER JOIN categories\
                    ON products.CategoryID = categories.CategoryID';

        RunQuery(sqlStr, function (products) {

            var contextDict = {
                title: 'Admin - products',
                products: products,
                customer: req.user
            };

            res.render('admin/products', contextDict);
        });
    });

router.route('/products/:id/edit')
    .get(isAdmin, function (req, res, next) {

        var sqlStr = '\
                    SELECT products.*, categories.CategoryName\
                    FROM products\
                    INNER JOIN categories\
                    ON products.CategoryID = categories.CategoryID\
                    WHERE ProductID = ' + req.params.id;

        RunQuery(sqlStr, function (product) {

            sqlStr = '\
                SELECT *\
                FROM categories';

            RunQuery(sqlStr, function (categories) {
                var contextDict = {
                    title: 'Admin - Edit Product',
                    product: product[0],
                    categories: categories,
                    customer: req.user
                };

                res.render('admin/editProduct', contextDict);
            });
        });
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
        UPDATE products\
        SET ProductName = \'' + req.body.name + '\', \
            CategoryID = ' + req.body.category + ', \
            ProductPrice = ' + req.body.price + ', \
            UnitsInStock = ' + req.body.unit + ', \
            Description = \'' + req.body.description + '\', \
            ManufactureYear = ' + req.body.year + ', \
            ProductSlug = \'' + slug(req.body.name) + '\', ' +
                /*Image = name.png\*/
            'Feature = ' + req.body.feature + ' \
        WHERE ProductID = ' + req.params.id;

        RunQuery(sqlStr, function (category) {
            res.redirect('/admin/products');
        });
    });

router.route('/products/:id/delete')
    .post(isAdmin, function (req, res, next) {

        var sqlStr = '\
            DELETE FROM products\
            WHERE ProductID = ' + req.params.id;

        RunQuery(sqlStr, function (result) {
            res.redirect('/admin/products');
        });
    });

router.route('/products/add')
    .get(isAdmin, function (req, res, next) {

        var sqlStr = '\
            SELECT *\
            FROM categories';

        RunQuery(sqlStr, function (categories) {
            var contextDict = {
                title: 'Admin - Add Product',
                categories: categories,
                customer: req.user
            };

            res.render('admin/addProduct', contextDict);
        });
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
            INSERT INTO products\
            VALUES (null, \'' + req.body.name + '\', '
                + req.body.category + ', '
                + req.body.price + ', '
                + req.body.unit + ', \
            \'' + req.body.description + '\', '
                + req.body.year + ', \
            \'' + slug(req.body.name) + '.png\', \
            \'' + slug(req.body.name) + '\', '
                + req.body.feature + ')'
        /*Image = name.png\*/
            ;

        RunQuery(sqlStr, function (category) {
            res.redirect('/admin/products');
        });
    });

router.route('/orders')
    .get(isAdmin, function (req, res) {

        var selectQuery = '\
            SELECT *\
            FROM orders';

        RunQuery(selectQuery, function (orders) {

            var contextDict = {
                title: 'Admin - Orders',
                customer: req.user,
                orders: orders
            };

            res.render('admin/orders', contextDict);
        });
    });

router.route('/orders/:id')
    .get(isAdmin, function (req, res) {
        //get order info
        var selectQuery = '\
            SELECT *\
            FROM orders\
            WHERE OrderID = ' + req.params.id;

        RunQuery(selectQuery, function (order) {
            //get user info
            selectQuery = '\
            SELECT *\
            FROM users\
            WHERE UserID = ' + order[0].UserID;

            RunQuery(selectQuery, function (orderCustomer) {
                //get delivery info
                selectQuery = '\
                SELECT *\
                FROM addresses\
                WHERE AddressID = ' + order[0].AddressID;

                RunQuery(selectQuery, function (address) {
                    //get order info
                    selectQuery = '\
                    SELECT *\
                    FROM `order details`\
                    INNER JOIN (\
                        SELECT products.*, categories.CategorySlug\
                        FROM products\
                        INNER JOIN categories\
                        ON products.CategoryID = categories.CategoryID\
                    ) `Table`\
                    ON `Order Details`.ProductID = `Table`.ProductID\
                    WHERE OrderID = ' + order[0].OrderID;

                    RunQuery(selectQuery, function (products) {
                        //get order info

                        var contextDict = {
                            title: 'Admin - Orders',
                            customer: req.user,
                            order: order[0],
                            orderCustomer: orderCustomer[0],
                            address: address[0],
                            products: products
                        };

                        res.render('admin/viewOrder', contextDict);
                    });
                });
            });
        });
    });

router.route('/orders/:id/update')
    .get(isAdmin, function (req, res, next) {

        var selectQuery = '\
            SELECT *\
            FROM orders\
            WHERE OrderID = ' + req.params.id;

        RunQuery(selectQuery, function (order) {

            selectQuery = '\
                SELECT *\
                FROM addresses\
                WHERE AddressID = ' + order[0].AddressID;

            RunQuery(selectQuery, function (address) {

                selectQuery = '\
                    SELECT *\
                    FROM `order details`\
                    INNER JOIN (\
                        SELECT products.*, categories.CategorySlug\
                        FROM products\
                        INNER JOIN categories\
                        ON products.CategoryID = categories.CategoryID\
                    ) `Table`\
                    ON `Order Details`.ProductID = `Table`.ProductID\
                    WHERE OrderID = ' + order[0].OrderID;

                RunQuery(selectQuery, function (products) {
                    var contextDict = {
                        title: 'Admin - Update Status Order ' + req.params.id,
                        customer: req.user,
                        order: order[0],
                        address: address[0],
                        products: products
                    };

                    res.render('admin/updateOrder', contextDict);

                });
            });
        });
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
        UPDATE Orders\
        SET Status = \'' + req.body.status + '\' \
        WHERE OrderID = ' + req.params.id;

        RunQuery(sqlStr, function (result) {
            res.redirect('/admin/orders');
        });
    });

router.route('/customers')
    .get(isAdmin, function (req, res) {

        var selectQuery = '\
            SELECT *\
            FROM users';

        RunQuery(selectQuery, function (customers) {

            var contextDict = {
                title: 'Admin - Customers',
                customer: req.user,
                customers: customers
            };

            res.render('admin/customers', contextDict);
        });
    });

router.route('/customers/:id/makeAdmin')
    .post(isAdmin, function (req, res) {

        var updateQuery = '\
            UPDATE Users\
            SET Admin = 1\
            WHERE UserID = ' + req.params.id;

        RunQuery(updateQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

router.route('/customers/:id/removeAdmin')
    .post(isAdmin, function (req, res) {

        var updateQuery = '\
            UPDATE Users\
            SET Admin = 0\
            WHERE UserID = ' + req.params.id;

        RunQuery(updateQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

router.route('/customers/:id/delete')
    .post(isAdmin, function (req, res) {

        var deleteQuery = '\
            DELETE FROM Users\
            WHERE UserID = ' + req.params.id;

        RunQuery(deleteQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

module.exports = router;