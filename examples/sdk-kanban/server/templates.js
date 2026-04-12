/**
 * Email Templates for urKanban
 * Modern, high-contrast design to match the app aesthetic.
 */

const style = `
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #000000;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  border: 4px solid #000000;
  padding: 40px;
  background-color: #ffffff;
`;

const headerStyle = `
  background-color: #000000;
  color: #ffffff;
  padding: 20px;
  margin: -40px -40px 40px -40px;
  text-align: center;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #2563eb;
  color: #ffffff;
  padding: 12px 24px;
  text-decoration: none;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 4px solid #000000;
  margin-top: 20px;
`;

const cardStyle = `
  border: 4px solid #000000;
  padding: 20px;
  margin: 20px 0;
  background-color: #f9fafb;
`;

/**
 * Task Activity Notification Template
 */
const taskNotificationTemplate = ({ taskTitle, boardName, action, statusColor = '#2563eb' }) => `
  <div style="${style}">
    <div style="${headerStyle}">urKanban Activity</div>
    <h2 style="font-weight: 900; font-size: 24px; margin-bottom: 20px;">TASK UPDATE</h2>
    <p>Hi there,</p>
    <p>There has been a change on your board <strong>"${boardName}"</strong>.</p>
    
    <div style="${cardStyle}">
      <div style="width: 100%; height: 8px; background-color: ${statusColor}; margin-bottom: 15px;"></div>
      <p style="margin: 0; font-size: 18px; font-weight: 900;">${taskTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666666; font-size: 12px; font-weight: 700; text-transform: uppercase;">
        Action: ${action}
      </p>
    </div>
    
    <p>Visit your dashboard to see the latest updates and keep the momentum going.</p>
    
    <a href="http://localhost:5173" style="${buttonStyle}">View Board</a>
    
    <div style="margin-top: 40px; border-top: 2px solid #000000; padding-top: 20px; font-size: 10px; font-weight: 700; color: #666666; text-transform: uppercase;">
      urKanban • Built with urBackend SDK v2.0
    </div>
  </div>
`;

module.exports = {
  taskNotificationTemplate
};
