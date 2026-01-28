require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { getAuthUrl, getTokens } = require("./services/oauth");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [ 
      'https://bankstonalliance.com',
      'https://www.bankstonalliance.com',
      'http://localhost:5173',
      'http://10.64.221.80:5173',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      process.env.FRONTEND_URL 
    ].filter(Boolean)
  : [
      'http://localhost:5173', 
      'http://10.64.221.80:5173', 
      'https://bankstonalliance.com',
      'https://www.bankstonalliance.com',
      'http://127.0.0.1:5500', 
      'http://localhost:5500',
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'Set-Cookie',
    'Content-Length',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin'
  ],
  credentials: true,
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));
app.use(morgan("dev"));

const contactRoutes = require("./routes/contact");
const cloudinaryRoutes = require("./routes/cloudinary.route");
const meetRoutes = require("./routes/meet");

app.use("/api/meet", meetRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

app.get("/oauth", (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await getTokens(code);
    res.json({
      success: true,
      tokens: tokens,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/cors-test", (req, res) => {
  res.json({ 
    success: true, 
    message: "CORS is working!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "yoreforms API is running!",
    timestamp: new Date().toISOString(),
    cors: "Enabled for: " + allowedOrigins.join(', ')
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed',
      allowedOrigins: allowedOrigins
    });
  }
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for:`, allowedOrigins);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}`);
  console.log(`Google OAuth URL: http://localhost:${PORT}/oauth`);
});