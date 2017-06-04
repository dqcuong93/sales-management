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
var invoice = sequelize.define('Invoice', {
    Sam: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    BongCuc: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    NhaDam: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    RongBien: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    Yogurt: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
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

var customer = sequelize.define('Customer', {
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

var costing = sequelize.define('Costing', {
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
customer.hasMany(invoice);
invoice.belongsTo(customer);

//Add data to tables
var createInvoice = function (requestBody) {
    //Create customer if not exist first, then create invoice
    if (requestBody.name || requestBody.phone) {
        customer.findOrCreate({
            where: {
                Name: requestBody.name,
                Phone: requestBody.phone
            },
            defaults: {
                Address: requestBody.address
            }
        }).spread(function (createdCustomer, created) {
            customer.findOne({
                where: {
                    Name: requestBody.name,
                    Phone: requestBody.phone
                }
            }).then(function (_customer) {
                invoice.create({
                    Sam: requestBody.sam,
                    BongCuc: requestBody.bongcuc,
                    NhaDam: requestBody.nhadam,
                    RongBien: requestBody.rongbien,
                    Yogurt: requestBody.yogurt,
                    ShippingAddress: requestBody.shipaddress,
                    InvoiceDate: requestBody.invoicedate,
                    MoneyReceive: requestBody.getmoney,
                    CustomerId: _customer.id
                });
            })
        });
    }
};

var createCost = function (requestBody) {
    costing.create({
        Material: requestBody.material,
        Quantity: requestBody.quantity,
        Unit: requestBody.unit,
        ShopAddress: requestBody.shopaddress,
        Price: requestBody.price,
        Total: requestBody.price * requestBody.quantity
    })
};

//DB function
var dataFinding = function (requestBody, callback) {
    var searchstr = requestBody.searchstring.trim();    //trim() to remove spaces
    customer.findAll({
        where: {
            $or: [
                {Name: {$like: '%' + searchstr + '%'}},
                {Phone: {$like: '%' + searchstr + '%'}},
                {Address: {$like: '%' + searchstr + '%'}}
            ]
        }
    }).then(function (_customer) {
        callback(JSON.parse(JSON.stringify(_customer)));
    });
};

var reportByDate = function (requestBody, callback) {
    invoice.findAll({
        where: {
            InvoiceDate: requestBody.reportDate
        },
        include: [customer]
    }).then(function (invoices) {
        callback(JSON.parse(JSON.stringify(invoices)))
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
exports.dataFinding = dataFinding;
exports.createCost = createCost;
exports.reportByDate = reportByDate;