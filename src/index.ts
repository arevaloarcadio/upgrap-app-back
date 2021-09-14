import express from 'express';
const app =  express();

import cors from 'cors';
import {Request, Response} from 'express';
import path  from 'path';
import indexRouter from './routes/index';
import categoriesRouter from './routes/categories';
import uploadRouter from './routes/upload';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import productsRoutes from './routes/products';
import customersRoutes from './routes/customers';
import requestsRoutes from './routes/requests';
import notificationsRoutes from './routes/notifications';
import exchangesRoutes from './routes/exchanges';
import fcmRoutes from './routes/fcm';

import { encriptPassword } from './utils/auth';

app.set('port', process.env.PORT || 5000);

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cors());


app.use('/uploads',express.static(path.join(__dirname, '../uploads')));

// routers
app.use(indexRouter);
app.use(categoriesRouter);
app.use(uploadRouter);
app.use(authRoutes);
app.use(chatRoutes);
app.use(productsRoutes);
app.use(customersRoutes);
app.use(requestsRoutes);
app.use(notificationsRoutes);
app.use(exchangesRoutes);
app.use(fcmRoutes);

let http = require("http").Server(app);

const io = require("socket.io")(http,
   { 
  cors: {    
    origin: "*",    
    methods: ["GET", "POST"]  
  },
  allowEIO3: true 
});


io.on("connection", function(socket : any) {
 
  socket.on("chat_message",function(message : any){
    socket.broadcast.emit("new_message",message)
  })
 
  socket.on("user_conected",function(user : any){
    socket.broadcast.emit("users_conected",user)
  })
 
  socket.on('user_inactive', (user :any) => {
     socket.broadcast.emit("users_inactive",user)
  });

  socket.on('notifications', (notification :any) => {
     socket.broadcast.emit("notification",notification)
  });

});

http.listen(app.get('port'), () => {
    console.log(`Server on http://localhost:${app.get('port')}`);
})

app.locals.io = io;