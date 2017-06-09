var vietnameseSlug = require('vietnamese-slug');
var Sequelize = require('sequelize');
const sequelize = new Sequelize('salesmanagerDB', 'admin', 'Adm!n', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: './database/salesmanager.db'
});

//Change UTC timezone
sequelize.options.timezone = '+07:00';

//Define tables
var invoices = sequelize.define('Invoice', {
    ShippingAddress: {
        type: Sequelize.TEXT
    },
    InvoiceDate: {
        type: Sequelize.DATEONLY
    },
    MoneyReceive: {
        type: Sequelize.TEXT
    }
});

var customers = sequelize.define('Customer', {
    Name: {
        type: Sequelize.TEXT
    },
    Phone: {
        type: Sequelize.TEXT
    },
    Address: {
        type: Sequelize.TEXT
    }
});

var products = sequelize.define('Product', {
    Name: {
        type: Sequelize.TEXT
    },
    Price1: {
        type: Sequelize.INTEGER
    },
    Price2: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false
});

var features = sequelize.define('Feature', {
    Type: {
        type: Sequelize.TEXT
    }
}, {
    timestamps: false
});

var invoice_product_feature = sequelize.define('Invoice_Product_Feature', {
    Quantity: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false,
    freezeTableName: true
});

var product_feature = sequelize.define('Product_Feature', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

var costings = sequelize.define('Costing', {
    Material: {
        type: Sequelize.TEXT
    },
    Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    Unit: {
        type: Sequelize.TEXT
    },
    ShopAddress: {
        type: Sequelize.TEXT
    },
    Price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },
    Total: {
        type: Sequelize.DECIMAL
    }
});

//Tables relationship
customers.hasMany(invoices);
invoices.belongsTo(customers);

products.belongsToMany(features, {
    through: product_feature
});

features.belongsToMany(products, {
    through: product_feature
});

product_feature.belongsToMany(invoices, {
    through: invoice_product_feature
});

invoices.belongsToMany(product_feature, {
    through: invoice_product_feature
});

//Add data to tables
var createInvoice = function (requestBody) {
    //Create customer if not exist first, then create invoice
    if (requestBody.name || requestBody.phone) {
        customers.findOrCreate({
            where: {
                Name: requestBody.name,
                Phone: requestBody.phone
            },
            defaults: {
                Address: requestBody.address
            }
        }).spread(function (createdCustomer, created) {
            invoices.create({
                ShippingAddress: requestBody.shipaddress,
                InvoiceDate: requestBody.invoicedate,
                MoneyReceive: requestBody.getmoney,
                CustomerId: createdCustomer.id
            }).then(function (invoice) {
                for (element in requestBody) {
                    if (requestBody[element] === 'Lớn') {
                        productFinder(element, 'Lớn', function (result) {
                            var productQuantity = vietnameseSlug(result.Name);
                            invoice_product_feature.create({
                                Quantity: requestBody[productQuantity.replace('-', '')],
                                ProductFeatureId: result.id,
                                InvoiceId: invoice.id
                            })
                        })
                    } else if (requestBody[element] === 'Nhỏ') {
                        productFinder(element, 'Nhỏ', function (result) {
                            var productQuantity = vietnameseSlug(result.Name);
                            invoice_product_feature.create({
                                Quantity: requestBody[productQuantity.replace('-', '')],
                                ProductFeatureId: result.id,
                                InvoiceId: invoice.id
                            })
                        })
                    }
                }
            });
        });
    }
};

var createCost = function (requestBody) {
    costings.create({
        Material: requestBody.material,
        Quantity: requestBody.quantity,
        Unit: requestBody.unit,
        ShopAddress: requestBody.shopaddress,
        Price: requestBody.price,
        Total: requestBody.price * requestBody.quantity
    })
};

//DB function
var customerFinder = function (requestBody, callback) {
    var searchstr = requestBody.searchstring.trim();    //trim() to remove spaces
    customers.findAll({
        where: {
            $or: [
                {Name: {$like: '%' + searchstr + '%'}},
                {Phone: {$like: '%' + searchstr + '%'}},
                {Address: {$like: '%' + searchstr + '%'}}
            ]
        }
    }).then(function (customer) {
        callback(JSON.parse(JSON.stringify(customer)));
    });
};

var productFinder = function (productName, productFeature, callback) {
    products.findOne({
        where: {
            Name: productName
        },
        include: [{
            model: features,
            where: {
                Type: productFeature
            }
        }]
    }).then(function (result) {
        callback(JSON.parse(JSON.stringify(result)));
    })
};

var reportByDate = function (requestBody, callback) {
    invoices.findAll({
        where: {
            InvoiceDate: requestBody.reportDate
        },
        include: [{
            model: customers,
            attributes: ['Name']
        }, {
            model: product_feature,
            include: {
                model: products
            }
        }]
    }).then(function (invoice) {
        var _invoice = JSON.parse(JSON.stringify(invoice));
        console.log(_invoice);

        // callback(JSON.parse(JSON.stringify(invoice)))
    })
};

//Manual run at frist time
var productFeatureData = function () {
    products.findAll()
        .then(function (_products) {
            var product = JSON.parse(JSON.stringify(_products));
            features.findAll()
                .then(function (_features) {
                    var feature = JSON.parse(JSON.stringify(_features));
                    for (i in _products) {
                        for (j in _features) {
                            product_feature.create({
                                ProductId: product[i].id,
                                FeatureId: feature[j].id
                            })
                        }
                    }
                })
        })
};

//Exports
exports.sync = function () {
    sequelize.sync({force: false}).then(function () {
        console.log('Sync completed');
        // productFeatureData();
    });
};

exports.authenticateConnection = function () {
    sequelize
        .authenticate()
        .then(function () {
            console.log('Connection has been established successfully.');
        })
        .catch(function (err) {
            console.error('Unable to connect to the database:', err);
        });
};

exports.createInvoice = createInvoice;
exports.customerFinder = customerFinder;
exports.createCost = createCost;
exports.reportByDate = reportByDate;