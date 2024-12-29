require('dotenv').config();
const bcrypt = require('bcrypt');
const { MongoClient , ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());


const client = new MongoClient(process.env.MONGO_URI);
const dbName = "YZAK";

// Verify user for sign-in
async function verifyUser(email, plainPassword) {
  await client.connect();
  const db = client.db(dbName);
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user.role;
}

// Sign-in endpoint
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const role = await verifyUser(email, password);
    const userEmail = email; // Define userEmail from the provided email
    res.json({ role, email: userEmail }); // Include email in response
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});


// Join-us endpoint
app.post('/join-us', async (req, res) => {
    const { fullName, email, password, role, contribution } = req.body;
  
    console.log("Received data:", { fullName, email, password, role, contribution }); // Log received data
  
    try {
      if (!fullName || !email || !password || !role || !contribution) {
        throw new Error("Missing required fields");
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const application = {
        fullName,
        email,
        passwordHash: hashedPassword,
        role,
        contribution,
        status: "pending",
        createdAt: new Date(),
      };
  
      await client.connect();
      const db = client.db(dbName);
      const applicationsCollection = db.collection("applications");
      await applicationsCollection.insertOne(application);
  
      console.log("Application successfully added:", application); // Log successful insertion
      res.status(200).json({ message: "Application submitted successfully!" });
    } catch (error) {
      console.error("Error occurred:", error.message); // Log the error
      res.status(500).json({ error: "Failed to submit application." });
    } finally {
      await client.close();
    }
  });

  // Endpoint to application
app.get('/applications', async (req, res) => {
  try {
      await client.connect();
      const db = client.db(dbName);
      const applicationsCollection = db.collection("applications");
      const applications = await applicationsCollection.find({}).toArray();
      res.status(200).json(applications);
  } catch (error) {
      console.error("Error fetching applications:", error.message);
      res.status(500).json({ error: "Failed to fetch applications." });
  } finally {
      await client.close();
  }
});

  
// Submit Idea Endpoint
app.post('/submit-idea', async (req, res) => {
  const { fullName, email, idea } = req.body;

  try {
    if (!fullName || !email || !idea) {
      throw new Error("Missing required fields");
    }

    const ideaEntry = {
      fullName,
      email,
      idea,
      submittedAt: new Date(),
    };

    await client.connect();
    const db = client.db(dbName);
    const ideasCollection = db.collection("ideas");
    await ideasCollection.insertOne(ideaEntry);

    res.status(200).json({ message: "Idea submitted successfully!" });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: "Failed to submit idea." });
  } finally {
    await client.close();
  }
});

// Fetch Ideas Endpoint
app.get('/ideas', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const ideasCollection = db.collection("ideas");
    const ideas = await ideasCollection.find({}).toArray();

    res.status(200).json(ideas);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: "Failed to fetch ideas." });
  } finally {
    await client.close();
  }
});


const nodemailer = require('nodemailer');

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email provider if not using Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to handle sending emails
// Endpoint to handle sending emails
app.post('/send-email', async (req, res) => {
  const { requestTitle, userEmail, contactEmail, messageBody } = req.body;

  if (!requestTitle || !userEmail || !contactEmail || !messageBody) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Email styles
  const emailStyles = `
    body {
      font-family: "Epilogue-Regular", Helvetica, Arial, sans-serif;
      background-color: #fdf6c2 !important; /* Force light background */
      color: #2d2d2d !important; /* Force dark text */
      line-height: 1.5;
      margin: 0;
      padding: 20px;
    }
    h2 {
      color: #2d2d2d !important; /* Force title color */
      font-family: "Epilogue-Bold", Helvetica, Arial, sans-serif;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center; /* Center the title */
    }
    p {
      font-family: "Epilogue-Regular", Helvetica, Arial, sans-serif;
      font-size: 16px;
      margin: 10px 0;
      color: #2d2d2d !important; /* Force paragraph text color */
    }
    .footer {
      font-size: 14px;
      color: #555 !important; /* Force footer text color */
      margin-top: 30px;
      text-align: left; /* Left-aligned footer */
    }
  `;

  // Email HTML Template
  const htmlTemplate = `
    <html>
      <head>
        <style>${emailStyles}</style>
      </head>
      <body style="background-color: #fdf6c2; color: #2d2d2d; font-family: 'Epilogue-Regular', Helvetica, Arial, sans-serif; line-height: 1.5; margin: 0; padding: 20px;">
        <h2 style="color: #2d2d2d; font-family: 'Epilogue-Bold', Helvetica, Arial, sans-serif; font-size: 24px; margin-bottom: 20px; text-align: center;">
          YZAK Request: ${requestTitle}
        </h2>
        <p style="font-size: 16px; margin: 10px 0; color: #2d2d2d;">
          ${messageBody}
        </p>
        <div class="footer" style="font-size: 14px; color: #555; margin-top: 30px; text-align: left;">
          <p>Sent by: <strong>${userEmail}</strong></p>
        </div>
      </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: userEmail,
    to: contactEmail,
    subject: `YZAK Request: ${requestTitle}`, // Updated subject
    html: htmlTemplate, // Use HTML for styled emails
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error occurred while sending email:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});



// Fetch all events from the database
app.get('/api/events', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    const now = new Date();

    const events = await eventsCollection
      .aggregate([
        {
          $addFields: {
            parsedDateTime: { $toDate: "$dateTime" }, // Ensure dateTime is treated as a Date object
            isUpcoming: { $gte: [{ $toDate: "$dateTime" }, now] },
          },
        },
        {
          $sort: {
            isUpcoming: -1, // Upcoming events first
            parsedDateTime: 1, // Ascending for upcoming events
          },
        },
      ])
      .toArray();

    // Separate and sort past events by descending date
    const pastEvents = events.filter(event => !event.isUpcoming).sort((a, b) => new Date(b.parsedDateTime) - new Date(a.parsedDateTime));
    const upcomingEvents = events.filter(event => event.isUpcoming);

    res.status(200).json({ upcomingEvents, pastEvents });
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Failed to fetch events." });
  } finally {
    await client.close();
  }
});




//get events by id
app.get('/api/events/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    // Fetch the event by ID
    const event = await eventsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event." });
  } finally {
    await client.close();
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
      console.log("Received ID:", id);

      // Connect to the database
      await client.connect();
      const db = client.db("YZAK");
      const eventsCollection = db.collection("events");

      // Delete the event by ID
      const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
          console.error("Event not found for ID:", id);
          return res.status(404).json({ message: 'Event not found' });
      }

      console.log("Deleted Event ID:", id);
      res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: 'An error occurred while deleting the event' });
  } finally {
      await client.close();
  }
});


//for leader to create an event
app.put('/api/events/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    const { title, subtitle, dateTime, location, description } = req.body;

    // Update the event by ID
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, subtitle, dateTime, location, description } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event." });
  } finally {
    await client.close();
  }
});


app.post('/api/events', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    const { title, subtitle, dateTime, location, description } = req.body;

    const newEvent = {
      title,
      subtitle,
      dateTime: new Date(dateTime),
      location,
      description,
      signupsCount: 0,
      signedUpUsers: [],
    };

    await eventsCollection.insertOne(newEvent);

    res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event." });
  } finally {
    await client.close();
  }
});

// Route to handle the signup and unsignup button
app.put('/api/events/:id/signup', async (req, res) => {
  const { id } = req.params;
  const { email, action } = req.body; // Pass an "action" parameter: "signup" or "unsignup"

  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    const objectId = new ObjectId(id);
    const event = await eventsCollection.findOne({ _id: objectId });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (action === "signup") {
      // Check if already signed up
      if (event.signedUpUsers.includes(email)) {
        return res.status(400).json({ error: "Already signed up for this event." });
      }

      // Add the email to the signedUpUsers array
      const result = await eventsCollection.updateOne(
        { _id: objectId },
        {
          $inc: { signupsCount: 1 },
          $push: { signedUpUsers: email },
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: "Failed to sign up for the event." });
      }

      return res.status(200).json({ message: "Signup successful!" });
    } else if (action === "unsignup") {
      // Check if the user is signed up
      if (!event.signedUpUsers.includes(email)) {
        return res.status(400).json({ error: "You are not signed up for this event." });
      }

      // Remove the email from the signedUpUsers array
      const result = await eventsCollection.updateOne(
        { _id: objectId },
        {
          $inc: { signupsCount: -1 },
          $pull: { signedUpUsers: email },
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: "Failed to unsign up for the event." });
      }

      return res.status(200).json({ message: "Unsign-up successful!" });
    } else {
      return res.status(400).json({ error: "Invalid action specified." });
    }
  } catch (error) {
    console.error("Error during signup/unsignup:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  } finally {
    await client.close();
  }
});






//signup button will increment the signupsCount
app.put('/api/events/:id/signup', async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const db = client.db("YZAK");
    const eventsCollection = db.collection("events");

    const objectId = new ObjectId(id);

    const result = await eventsCollection.updateOne(
      { _id: objectId },
      { $inc: { signupsCount: 1 } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "An error occurred while signing up." });
  } finally {
    await client.close();
  }
});


// Fetch leaders for the dropdown
app.get('/leaders', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Fetch users with the role of "leader"
    const leaders = await usersCollection
      .find({ role: "leader" })
      .project({ email: 1, fullName: 1 }) // Fetch only email and full name
      .toArray();

    res.status(200).json(leaders);
  } catch (error) {
    console.error("Error fetching leaders:", error.message);
    res.status(500).json({ error: "Failed to fetch leaders." });
  } finally {
    await client.close();
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});