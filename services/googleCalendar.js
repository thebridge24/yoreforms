const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const createGoogleMeetEvent = async (clientName, clientEmail, businessName, dateTime) => {
  try {
    const eventStartTime = new Date(dateTime);
    const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `Consultation with ${clientName} - ${businessName}`,
      description: `Business Consultation\nClient: ${clientName}\nBusiness: ${businessName}`,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        { email: clientEmail },
        { email: 'johnayomide920@gmail.com' }
        // { email: 'info@bankstonalliance.com' }
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    return {
      meetLink: response.data.hangoutLink,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime
    };

  } catch (error) {
    console.error('Google Calendar Error:', error);
    throw error;
  }
};

const generateReservationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK${code}`;
};

module.exports = {
  createGoogleMeetEvent,
  generateReservationCode
};