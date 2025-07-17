const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();
const cors = require("cors");

// import clodinary connection
const { cloudinaryConnection } = require('./config/cloudinaryConnection');

// import all the routes
const authRouter = require('./routes/auth');
const categoryRouter = require('./routes/category');
const courseRouter = require('./routes/course');
const dashboardRouter = require('./routes/dashboard');
const razorPayPaymentIntegrationRouter = require('./routes/razorPayPaymentIntegration');
const resetPasswordRouter = require('./routes/resetPassword');
const sectionRouter = require('./routes/section');
const subSectionRouter = require('./routes/subSection');
const streamRouter = require('./routes/stream');
const courseProgressRouter = require('./routes/courseProgress')
const ratingRoutes = require('./routes/RatingAndReview');

// import database connection
const { dataBaseConnection } = require('./config/dataBaseConnection');

app.use(cors({
  origin: ['http://localhost:5173', 'https://edunest-frontend-virid.vercel.app'], // allow both dev and prod
  credentials: true
}));

// for live streaming
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://edunest-frontend-virid.vercel.app'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    console.log(`📢 Socket ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("signal", ({ to, from, data }) => {
    io.to(to).emit("signal", { from, data });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.set("io", io);




// connecting the middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// connecting the routes
app.use('/EDUNEST/api/v1/auth', authRouter);
app.use('/EDUNEST/api/v1/dashboard', dashboardRouter);
app.use('/EDUNEST/api/v1/category', categoryRouter);
app.use('/EDUNEST/api/v1/course', courseRouter);
app.use('/EDUNEST/api/v1/razorPayPaymentIntegrationRouter', razorPayPaymentIntegrationRouter);
app.use('/EDUNEST/api/v1/resetPasswordRouter', resetPasswordRouter);
app.use('/EDUNEST/api/v1/sectionRouter', sectionRouter);
app.use('/EDUNEST/api/v1/subSectionRouter', subSectionRouter);
app.use('/EDUNEST/api/v1/streamRouter', streamRouter)
app.use('/EDUNEST/api/v1/courseProgressRouter', courseProgressRouter)
app.use('/EDUNEST/api/v1/RatingAndReview', ratingRoutes)

// connecting the cloudinary connection
cloudinaryConnection();

// connecting the database connection
dataBaseConnection();

// connecting the server
server.listen(process.env.PORT, () => {
  console.log(`Server is running with Socket.IO on port ${process.env.PORT}`);
});

// default route
app.get('/', (req, res) => {
  res.send('Server is ready to rock');
})
