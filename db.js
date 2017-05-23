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

var chiPhi = sequelize.define('ChiPhi', {
    loainguyenlieu: {
        type: Sequelize.TEXT
    },
    giathanh: {
        type: Sequelize.DECIMAL,
        allowNull: false
    }
});

var donHang = sequelize.define('DonHang', {
    sam: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    bongcuc: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    nhadam: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    rongbien: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    yogurt: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

var khachHang = sequelize.define('KhachHang', {
    loaikhachhang: {
        type: Sequelize.TEXT
    },
    hoten: {
        type: Sequelize.TEXT
    },
    sodienthoai: {
        type: Sequelize.INTEGER
    },
    diachi: {
        type: Sequelize.TEXT
    },
    laytien: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    }
});

var nguyenLieu = sequelize.define('NguyenLieu', {
    soluong: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    donvitinh: {
        type: Sequelize.TEXT,
        defaultValue: 'KG'
    },
    diachimua: {
        type: Sequelize.TEXT
    },
    giathanh: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
    }
});

var thanhPham = sequelize.define('ThanhPham', {
    tenthanhpham: {
        type: Sequelize.TEXT
    }
});


exports.sync = function () {
    sequelize.sync().then(function () {
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