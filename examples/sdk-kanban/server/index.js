const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const urBackend = require('@urbackend/sdk').default;
const { taskNotificationTemplate } = require('./templates');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SDK with Secret Key (SK) for server-side operations
// In production, never expose this key to the frontend.
const client = urBackend({
  apiKey: process.env.URBACKEND_SECRET_KEY,
  baseUrl: process.env.URBACKEND_API_URL || 'https://api.ub.bitbros.in'
});

/**
 * Endpoint to send an activity notification via Email.
 * This is handled on the server to keep the Secret Key secure.
 */
app.post('/api/notify', async (req, res) => {
  const { to, subject, taskTitle, boardName, action, color } = req.body;

  if (!to || !taskTitle) {
    return res.status(400).json({ error: 'Recipient and task details are required' });
  }

  try {
    // Generate the HTML content using our high-contrast template
    const html = taskNotificationTemplate({
        taskTitle,
        boardName: boardName || 'Kanban Board',
        action: action || 'Task Updated',
        statusColor: color || '#2563eb'
    });

    // Using the SDK's mail module with the HTML payload
    await client.mail.send({ 
        to, 
        subject: subject || 'urKanban: Task Activity Alert', 
        html 
    });
    
    console.log(`[Mail] HTML Notification sent to ${to}`);
    res.json({ success: true, message: 'HTML Notification sent successfully' });
  } catch (error) {
    console.error('[Mail Error]', error.message);
    res.status(500).json({ 
      error: 'Failed to send notification', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 Kanban Notification Server running on http://localhost:${PORT}`);
});
