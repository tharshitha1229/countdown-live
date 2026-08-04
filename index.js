const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 1. Middleware
// This allows Express to read the data sent from your new HTML form
app.use(express.urlencoded({ extended: true }));
// This allows Express to send and receive JSON data
app.use(express.json());

// Serve your frontend static files (HTML, CSS, JS)
// Note: If your index.html is in a folder called 'public', change this to 'public' instead of __dirname
app.use(express.static(__dirname));

// 2. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('Database connection error:', err));

// 3. Database Schema & Model
// This defines what an event looks like in your database
const eventSchema = new mongoose.Schema({
    title: String,
    date: String
});
const Event = mongoose.model('Event', eventSchema);

// 4. Routes

// GET route for your frontend JavaScript to fetch the timer data
app.get('/api/event', async (req, res) => {
    try {
        const event = await Event.findOne({});
        // If no event exists yet, send a default one so the site doesn't crash
        if (!event) {
            return res.json({ title: "No Event Set", date: "2026-12-31" });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch event data" });
    }
});

// POST route to handle the submission from your professor's evaluation form
app.post('/update', async (req, res) => {
    try {
        const newTitle = req.body.title;
        const newDate = req.body.date;

        // Find the one existing event and overwrite it. 
        // upsert: true means if the database is completely empty, it will create it.
        await Event.findOneAndUpdate(
            {}, 
            { title: newTitle, date: newDate }, 
            { upsert: true }
        );

        // Instantly refresh the homepage so the new timer displays
        res.redirect('/');
        
    } catch (error) {
        console.error("Error saving new event:", error);
        res.status(500).send("Error updating the countdown.");
    }
});

// 5. Start the Server
app.listen(port, () => {
    console.log(`Server is running and listening on port ${port}`);
});