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
    timestamps: false,
    freezeTableName: true
});

var distribute = sequelize.define('Distribute', {
    Type: {
        type: Sequelize.TEXT
    }
}, {
    timestamps: false,
    freezeTableName: true
});

var invoice_product = sequelize.define('invoice_product', {
    Quantity: {
        type: Sequelize.INTEGER
    }
},{
    timestamps: false
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
invoices.belongsToMany(products, {
    through: invoice_product
});
products.belongsToMany(invoices, {
    through: invoice_product
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

var reportByDate = function (requestBody, callback) {
    invoices.findAll({
        where: {
            InvoiceDate: requestBody.reportDate
        },
        include: [customers]
    }).then(function (invoice) {
        callback(JSON.parse(JSON.stringify(invoice)))
    })
};

//Exports
exports.sync = function () {
    sequelize.sync({force: false}).then(function () {
        console.log('Sync completed');
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