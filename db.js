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
        type: Sequelize.INTEGER
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

// var thanhPham = sequelize.define('ThanhPham', {
//     tenthanhpham: {
//         type: Sequelize.TEXT
//     }
// });

//Tables relationship
customer.hasMany(invoice);

//Add data to tables
var createCustomer = function (requestBody) {
    customer.create({
        Name: requestBody.name,
        Phone: requestBody.phone,
        Address: requestBody.address
    })
};

var createInvoice = function (requestBody) {
    customer.findOne({
        where: {
            Name: requestBody.name,
            Phone: requestBody.phone
        }
    }).then(function (_customer) {
        var id = _customer.id;
        invoice.create({
            Sam: requestBody.sam,
            BongCuc: requestBody.bongcuc,
            NhaDam: requestBody.nhadam,
            RongBien: requestBody.rongbien,
            Yogurt: requestBody.yogurt,
            ShippingAddress: requestBody.shipaddress,
            InvoiceDate: requestBody.invoicedate,
            MoneyReceive: requestBody.getmoney,
            CustomerId: id
        });
    })
};

var createCost = function (requestBody) {
    costing.create({
        Material: requestBody.material,
        Quantity: requestBody.quantity,
        Unit: requestBody.unit,
        ShopAddress: requestBody.shopaddress,
        Price: requestBody.price
    })
};

//DB function
var dataFinding = function (requestBody, callback) {
    customer.findAll({
        where: {
            $or: [
                {Name: {$like: '%' + requestBody.searchstring + '%'}},
                {Phone: {$like: '%' + requestBody.searchstring + '%'}},
                {Address: {$like: '%' + requestBody.searchstring + '%'}}
            ]
        }
    }).then(function (_customer) {
        callback(JSON.stringify(_customer));
    });
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
        .catch(function () {
            console.error('Unable to connect to the database:', err);
        });
};

exports.createCustomer = createCustomer;
exports.createInvoice = createInvoice;
exports.dataFinding = dataFinding;
exports.createCost = createCost;