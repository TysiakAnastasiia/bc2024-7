const express = require('express');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();  // Зчитуємо змінні з .env файлу

// Ініціалізація сервера
const app = express();
app.use(express.json());  // для парсингу JSON в тілі запиту

// Налаштування підключення до PostgreSQL через Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,  // вимкнемо логування SQL запитів
});

// Модель для пристроїв
const Device = sequelize.define('Device', {
    device_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    serial_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    user_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

// Підключення до БД
sequelize.sync()
    .then(() => console.log("Connected to database"))
    .catch(err => console.error('Unable to connect to the database:', err));

// POST /register - реєстрація пристрою
app.post('/register', async (req, res) => {
    const { device_name, serial_number } = req.body;

    try {
        const existingDevice = await Device.findOne({ where: { serial_number } });
        if (existingDevice) {
            return res.status(400).json({ message: 'Device already exists' });
        }

        const device = await Device.create({ device_name, serial_number, user_name: null });
        res.status(200).json({ message: 'Device registered successfully', device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /devices - список пристроїв
app.get('/devices', async (req, res) => {
    try {
        const devices = await Device.findAll();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /take - взяття пристрою в користування
app.post('/take', async (req, res) => {
    const { user_name, serial_number } = req.body;

    try {
        const device = await Device.findOne({ where: { serial_number } });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (device.user_name) {
            return res.status(400).json({ message: 'Device already taken' });
        }

        device.user_name = user_name;
        await device.save();
        res.status(200).json({ message: 'Device taken successfully', device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /return - повернення пристрою
app.post('/return', async (req, res) => {
    const { serial_number } = req.body;

    try {
        const device = await Device.findOne({ where: { serial_number } });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        device.user_name = null;
        await device.save();
        res.status(200).json({ message: 'Device returned successfully', device });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /devices/:serial_number - інформація про пристрій
app.get('/devices/:serial_number', async (req, res) => {
    const { serial_number } = req.params;

    try {
        const device = await Device.findOne({ where: { serial_number } });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
