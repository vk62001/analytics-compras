const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const io = require('socket.io')(server, {
  pingTimeout: 25000,
  pingInterval: 5000,
  cors: {origin: "*"}
});

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} =  require('./utils/users');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, './build')));
// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'));
});


app.get("/", (req, res) => {
  res.send({ response: "chat server" }).status(200);
});



io.on('connection', socket => {
  
  socket.on('joinRoom', userRemote => {
    userRemote.id = socket.id;
    const user = userJoin(userRemote);
    console.log(userRemote.user.username, '24')
    if(user){
      if(user.room)socket.join(user.room);
    }
    //Welcome current user
    // socket.emit('message', formatMessage(botName,'Welcome to chat streaming'), false);
    //Broadcast when a user connects
    // socket.broadcast
    // .to(user.room)
    // .emit('message', formatMessage(user.username,' has joined'), true);

    // send users and room infoSse
    console.log(user.room);
    io.to(user.room)
    .emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    });
    
  });

//   // //listen for chatMessage
//   // socket.on('chatMessage', msg=>{
//   //   const user = getCurrentUser(socket.id);
//   //   if(user){
//   //     io.to(user.room)
//   //     .emit('message', formatMessage(user.username,msg.message,msg.image, msg.donation,msg.permission), false);
//   //   }
//   // });

//   // //start videocalling
//   // socket.on('start.videoCalling', function (e) {
//   //   const objCalling = {
//   //       clientId: e.clientId,
//   //       modelId: e.modelId
//   //   }
//   //   io.to(e.clientId).emit('calling.client', objCalling);
//   // });

//   // socket.on('clientCancel.videoCalling', e => {
//   //       io.to(e.modelId).emit('clientCancelToModel.videoCalling', {resp: true});
//   // });

//   // socket.on('clientAccept.videoCalling', e =>{
//   //   io.to(e.modelId).emit('clientAcceptModel.videoCalling', e);
//   // });

//   // socket.on('stop.videoCalling', e => {
//   //     const idToSend = !e.client ? e.clientId : e.modelId;
//   //     io.to(idToSend).emit('closeRoom.videoCalling', {close: true});
//   // });

//   // socket.on("callUser", (data) => {
// 	// 	io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from})
// 	// })

// 	// socket.on("answerCall", (data) => {
// 	// 	io.to(data.to).emit("callAccepted", data.signal)
// 	// })


    

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if(user){
        // io.to(user.room)
        // .emit('message', formatMessage(botName,`${user.username} has left the chat`));

        // send users and room info
        io.to(user.room)
        .emit('roomUsers',{
          room: user.room,
          users: getRoomUsers(user.room)
        });
    }
  });
});
  
  const port = process.env.PORT || 5001;
  server.listen(port, () => console.log('server listening on port ' + port + ' date: '+ new Date()));