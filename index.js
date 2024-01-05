const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://brockstanley810:Flea9912345@cluster0.moaeqqe.mongodb.net/my_social_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  timestamp: {type: Date, default: Date.now},
});

const SocialMediaLink = mongoose.model('SocialMediaLink', {
  name: String,
  customId: String,
  url: String,

});

const socialMediaLinks = [];

app.post('/api/setUser', async (req, res) => {
  const { user } = req.body;

  if (!user || !user.name) {
    return res.status(400).json({ error: 'Invalid user data' });
  }

  try {
    const savedUser = await User.create(user);
    res.json({ message: 'User set successfully', user: savedUser });
  } catch (error) {
    console.error('Error saving user to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/getUser', async (req, res) => {
  try {
    const latestUser = await User.findOne().sort({ _id: -1 }).limit(1);
    res.json({ user: latestUser });
  } catch (error) {
    console.error('Error fetching user data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/addNews', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const news = await News.create({ title, content });
    res.status(201).json({ message: 'News added successfully', news });
  } catch (error) {
    console.error('Error adding news on the backend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/getSocialMediaLinks', async (req, res) => {
  try {
    const socialMediaLinks = await SocialMediaLink.find();
    res.json({ socialMediaLinks });
  } catch (error) {
    console.error('Error fetching social media links from MongoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/getFriends', async (req, res) => {
  try {
    // Fetch the list of friends for the logged-in user
    // You can get this information from your database based on the user's ID
    const user = await User.findOne().sort({ _id: -1 }).limit(1);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const friends = await Friend.find({ userId: user._id });

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/addSocialMediaLink', async (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, error: 'name and URL are required' });
  }
  try {
    const newSocialMediaLink = await SocialMediaLink.create({ name, url });
    res.status(201).json({ success: true, message: 'Social media link added successfully', link: newSocialMediaLink });
  } catch (error) {
    console.error('Error adding social media link on the backend:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error ' });
  }
});

app.delete('/api/deleteFriend/:id', async (req, res) => {
  const friendId = req.params.id;

  try {
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


app.post('/api/addFriend', async (req, res) => {
  const { friendName } = req.body;

  if (!friendName) {
    return res.status(400).json({ error: 'Friend name is required' });
  }

  try {
    // Use the default user ID
    const loggedInUserId = req.loggedInUserId;

    // Check if the friend already exists for the logged-in user
    const existingFriend = await Friend.findOne({ name: friendName, userId: loggedInUserId });

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

// Add this route to your backend code
app.delete('/api/deleteMessage/:id', async (req, res) => {
  const messageId = req.params.id;

  try {
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

app.post('/api/sendMessage', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const newMessage = await Message.create({ text });
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error saving message to MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/getMessage', async (req, res) => {
  try {
    const messages = await Message.find();
    console.log('Raw Timestamps from API:', messages.map(message => message.timestamp));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/api/deleteSocialMediaLink/:id', async (req, res) => {
  const linkId = req.params.id;

  try {
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


app.post('/api/addSocialMediaLink', async (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'name and URL are required' });
  }
  try {
    const newSocialMediaLink = await SocialMediaLink.create({ name, url });
    res.status(201).json({ success: true, message: 'Social media link added successfully', link: newSocialMediaLink });
  } catch (error) {
    console.error('Error adding social media link on the backend:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error ' });
  }
});

// Add this route to your backend code
app.post('/api/addNews', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const news = await News.create({ title, content });
    res.status(201).json({ message: 'News added successfully', news });
  } catch (error) {
    console.error('Error adding news on the backend:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this route to your backend code
app.delete('/api/deleteNews/:id', async (req, res) => {
  const newsId = req.params.id;

  try {
    const deletedNews = await News.findByIdAndDelete(newsId);

    if (deletedNews) {
      res.status(200).json({ success: true, message: 'News deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'News not found' });
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});