// Import required modules and packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create an Express application
const app = express();

// Set the port for the server to listen on, either from the environment variable or default to 3001
const port = process.env.PORT || 3001;

// Middleware to handle Cross-Origin Resource Sharing (CORS)
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

// Middleware to parse incoming JSON requests
app.use(express.json());

// Connect to MongoDB database using Mongoose
mongoose.connect('mongodb+srv://brockstanley810:Flea9912345@cluster0.moaeqqe.mongodb.net/my_social_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose models for different collections in the database
const User = mongoose.model('User', {
  name: String,
});

const Friend = mongoose.model('Friend', {
  name: String,
  userId: String,
});

const News = mongoose.model('News', {
  title: String,
  content: String,
});

const Message = mongoose.model('Message', {
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const SocialMediaLink = mongoose.model('SocialMediaLink', {
  name: String,
  customId: String,
  url: String,
});

// Routes

// Route to set a new user
app.post('/api/setUser', async (req, res) => {
  // Extract user data from the request body
  const { user } = req.body;

  // Validate user data
  if (!user || !user.name) {
    return res.status(400).json({ error: 'Invalid user data' });
  }

  try {
    // Save the user to the MongoDB database
    const savedUser = await User.create(user);
    res.json({ message: 'User set successfully', user: savedUser });
  } catch (error) {
    console.error('Error saving user to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get the latest user
app.get('/api/getUser', async (req, res) => {
  try {
    // Fetch the latest user from the MongoDB database
    const latestUser = await User.findOne().sort({ _id: -1 }).limit(1);
    res.json({ user: latestUser });
  } catch (error) {
    console.error('Error fetching user data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to add news
app.post('/api/addNews', async (req, res) => {
  // Extract news data from the request body
  const { title, content } = req.body;

  // Validate news data
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    // Save the news to the MongoDB database
    const news = await News.create({ title, content });
    res.status(201).json({ message: 'News added successfully', news });
  } catch (error) {
    console.error('Error adding news on the backend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get social media links
app.get('/api/getSocialMediaLinks', async (req, res) => {
  try {
    // Fetch social media links from the MongoDB database
    const socialMediaLinks = await SocialMediaLink.find();
    res.json({ socialMediaLinks });
  } catch (error) {
    console.error('Error fetching social media links from MongoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get friends for a user
app.get('/api/getFriends', async (req, res) => {
  try {
    // Fetch the latest user from the MongoDB database
    const user = await User.findOne().sort({ _id: -1 }).limit(1);

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Fetch friends associated with the user
    const friends = await Friend.find({ userId: user._id });

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to add a social media link
app.post('/api/addSocialMediaLink', async (req, res) => {
  // Extract social media link data from the request body
  const { name, url } = req.body;

  // Validate social media link data
  if (!name || !url) {
    return res.status(400).json({ success: false, error: 'name and URL are required' });
  }

  try {
    // Save the social media link to the MongoDB database
    const newSocialMediaLink = await SocialMediaLink.create({ name, url });
    res.status(201).json({ success: true, message: 'Social media link added successfully', link: newSocialMediaLink });
  } catch (error) {
    console.error('Error adding social media link on the backend:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error ' });
  }
});

// Route to delete a friend
app.delete('/api/deleteFriend/:id', async (req, res) => {
  // Extract friend ID from the request parameters
  const friendId = req.params.id;

  try {
    // Delete the friend from the MongoDB database by ID
    const deletedFriend = await Friend.findByIdAndDelete(friendId);

    if (deletedFriend) {
      res.status(200).json({ success: true, message: 'Friend deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Friend not found' });
    }
  } catch (error) {
    console.error('Error deleting friend:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to add a friend
app.post('/api/addFriend', async (req, res) => {
  // Extract friend name from the request body
  const { friendName } = req.body;

  // Validate friend name
  if (!friendName) {
    return res.status(400).json({ error: 'Friend name is required' });
  }

  try {
    // Check if the friend already exists for the logged-in user
    const existingFriend = await Friend.findOne({ name: friendName, userId: loggedInUserId });

    // If the friend already exists, return an error
    if (existingFriend) {
      return res.status(400).json({ error: 'Friend already exists' });
    }

    // Create a new friend and associate it with the logged-in user
    const newFriend = await Friend.create({ name: friendName, userId: loggedInUserId });

    res.status(201).json({ message: 'Friend added successfully', friend: newFriend });
  } catch (error) {
    console.error('Error adding friend on the backend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete a message
app.delete('/api/deleteMessage/:id', async (req, res) => {
  // Extract message ID from the request parameters
  const messageId = req.params.id;

  try {
    // Delete the message from the MongoDB database by ID
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (deletedMessage) {
      res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Message not found' });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to send a message
app.post('/api/sendMessage', async (req, res) => {
  // Extract text from the request body
  const { text } = req.body;

  // Validate text
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Save the message to the MongoDB database
    const newMessage = await Message.create({ text });
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get messages
app.get('/api/getMessage', async (req, res) => {
  try {
    // Fetch messages from the MongoDB database
    const messages = await Message.find();
    console.log('Raw Timestamps from API:', messages.map((message) => message.timestamp));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete a social media link
app.delete('/api/deleteSocialMediaLink/:id', async (req, res) => {
  // Extract social media link ID from the request parameters
  const linkId = req.params.id;

  try {
    // Delete the social media link from the MongoDB database by ID
    const deletedLink = await SocialMediaLink.findByIdAndDelete(linkId);

    if (deletedLink) {
      res.status(200).json({ success: true, message: 'Social media link deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Social media link not found' });
    }
  } catch (error) {
    console.error('Error deleting social media link:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to add a social media link
app.post('/api/addSocialMediaLink', async (req, res) => {
  // Extract social media link data from the request body
  const { name, url } = req.body;

  // Validate social media link data
  if (!name || !url) {
    return res.status(400).json({ error: 'name and URL are required' });
  }

  try {
    // Save the social media link to the MongoDB database
    const newSocialMediaLink = await SocialMediaLink.create({ name, url });
    res.status(201).json({ success: true, message: 'Social media link added successfully', link: newSocialMediaLink });
  } catch (error) {
    console.error('Error adding social media link on the backend:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error ' });
  }
});

// Route to send a webhook
app.post('/api/sendWebhook', async (req, res) => {
  try {
    // Assuming you have some data to send as the webhook payload
    const webhookPayload = {
      event: 'something_happened',
      data: { /* your data here */ },
    };

    // Replace 'YOUR_VERCEL_ENDPOINT' with the actual Vercel webhook endpoint
    const vercelWebhookEndpoint = 'YOUR_VERCEL_ENDPOINT';

    // Send a POST request to the Vercel webhook endpoint
    const response = await fetch(vercelWebhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Parse the response JSON
    const result = await response.json();

    // Process the result if needed

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending webhook to Vercel:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
