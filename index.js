const express = require('express');
const app = express();
app.use(express.json());  // для парсингу JSON в тілі запиту

let devices = [];  // масив для зберігання пристроїв

// POST /register - реєстрація пристрою
app.post('/register', (req, res) => {
    console.log(req.body);
    const { device_name, serial_number } = req.body;
    
    // Перевірка, чи вже є такий пристрій
    if (devices.find(device => device.serial_number === serial_number)) {
        return res.status(400).json({ message: 'Device already exists' });
    }

    // Додавання нового пристрою
    devices.push({ device_name, serial_number, user_name: null });
    res.status(200).json({ message: 'Device registered successfully' });
});

// GET /devices - повернення списку всіх пристроїв
app.get('/devices', (req, res) => {
    res.json(devices);
});

// POST /take - взяття пристрою в користування
app.post('/take', (req, res) => {
    const { user_name, serial_number } = req.body;
    const device = devices.find(device => device.serial_number === serial_number);

    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    if (device.user_name) {
        return res.status(400).json({ message: 'Device already taken' });
    }

    device.user_name = user_name;
    res.status(200).json({ message: 'Device taken successfully' });
});

// GET /devices/:serial_number - інформація про пристрій
app.get('/devices/:serial_number', (req, res) => {
    const { serial_number } = req.params;
    const device = devices.find(device => device.serial_number === serial_number);

    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
