var express = require('express');

var app = express();
var serv = require("http").Server(app);
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);
var io = require('socket.io')(serv,{});
var SOCKET_LIST = {};
function Calculeaza_puncte(Player, atu){
  let puncte = 0;
  for(let i = 0 ; i < Player.Carti_mana.length ; i++){
	if(Player.Carti_mana[i] == '2' && Player.Carti_mana != atu)
		puncte += 2;
	else if(Player.Carti_mana[i] == '3' && Player.Carti_mana[i] != atu)
		puncte += 3;
	else if(Player.Carti_mana[i] == '4' && Player.Carti_mana[i] != atu)
		puncte += 4;
	else if(Player.Carti_mana[i] == '5' && Player.Carti_mana[i] != atu)
		puncte += 5;
	else if(Player.Carti_mana[i] == '6' && Player.Carti_mana[i] != atu)
		puncte += 6;
	else if(Player.Carti_mana[i] == '7' && Player.Carti_mana[i] != atu)
		puncte += 7;
	else if(Player.Carti_mana[i] == '8' && Player.Carti_mana[i] != atu)
		puncte += 8;
	else if(Player.Carti_mana[i] == '9' && Player.Carti_mana[i] != atu)
		puncte += 9;
	else if(Player.Carti_mana[i] == '10' && Player.Carti_mana[i] != atu)
		puncte += 10;
	else if(Player.Carti_mana[i] == 'J' && Player.Carti_mana[i] != atu)
		puncte += 12;
	else if(Player.Carti_mana[i] == 'Q' && Player.Carti_mana[i] != atu)
		puncte += 13;
	else if(Player.Carti_mana[i] == 'K' && Player.Carti_mana[i] != atu)
		puncte += 14;
	else if(Player.Carti_mana[i] == 'A' && Player.Carti_mana[i] != atu)
		puncte += 1;
  }
  return puncte;
}
function Imparte_carti(Player){
  if(nr_carti < 4)
    while(pachet_jos.length > 1){
      pachet.push(pachet_jos[pachet_jos.length - 1]);
      pachet_jos.pop();
    }
  for(let i = 0 ; i < 5 ; i++){
    Player.Carti_mana[i] = pachet[nr_carti];
    pachet.splice(nr_carti,1);
    nr_carti--;
  }

}

var nr_carti = 50;
var Turns = 0;
var pachet = ['2','2','2','2','3','3','3','3','4','4','4','4','5',
			'5','5','5','6','6','6','6','7','7','7','7','8','8','8','8','9','9',
			'9','9','10','10','10','10','J','J','J','J','Q','Q','Q','Q','K','K',
			'K','K','A','A','A','A'];
function shuffle(pachet) {
      var ctr = pachet.length, temp, index;
      while (ctr > 0) {
              index = Math.floor(Math.random() * ctr);
              ctr--;
              temp = pachet[ctr];
              pachet[ctr] = pachet[index];
              pachet[index] = temp;
      }
      return pachet;
}

shuffle(pachet);
var pachet_jos = [];
var CarteaDeJos = " ";
var atu = pachet[51];
pachet.splice(51,1);
var iduri = 0;
var GameStarted = false;
var Randul_jucatorului = 0;
CarteaDeJos = pachet[nr_carti];
pachet_jos.push(pachet[nr_carti]);
pachet.splice(nr_carti, 1);
nr_carti--;

  io.sockets.on('connection', function(socket){
    if(iduri < 4 && GameStarted == false){
      socket.id = iduri;
      socket.OK = 0;
      SOCKET_LIST[iduri] = socket;
      iduri ++ ;
      socket.Carti_mana = [];
      Imparte_carti(socket);
      socket.puncte = 0;
      socket.puncte = Calculeaza_puncte(socket,atu);
      socket.emit("DateJoc",{
        Idul:socket.id,
        UltimaCartee:CarteaDeJos,
        atuul:atu,
        CartileDinMana:socket.Carti_mana,
        Punctele:socket.puncte,
      });
      console.log('socket connection');
        socket.on("CereJucatorCurent",function() {
          socket.emit("PrimesteJucatorCurent",{
            JucatorCurent:Randul_jucatorului,
            NumarJucatori:iduri,
          });
        });
      socket.on("UltimaCarteDeJos", function(data){
        pachet_jos.push(data.UltimaCarte);
        GameStarted = true;
      });
      socket.on("CereUltimaCarte",function(){
          GameStarted = true;
          socket.emit("UltimaCarte",{
            UltimaaCarte:CarteaDeJos,
      });
    });
      socket.on("TragDinPachet",function(data){
        if(Turns == 1){
          socket.emit("YouCanFinishNow",{});
        }
        CarteaDeJos = pachet_jos[pachet_jos.length - 1];
        let temporal = data.Player;
        if(nr_carti > 0){
          temporal.Carti_mana.push(pachet[nr_carti]);
          pachet.splice(nr_carti,1);
          temporal.Puncte = Calculeaza_puncte(temporal,atu);
          socket.puncte = temporal.Puncte;
          nr_carti--;
        }
        else{
          while(pachet_jos.length > 1){
            pachet.push(pachet_jos[pachet_jos.length - 1]);
            pachet_jos.pop();
          }
          CarteaDeJos = pachet_jos[0];
          nr_carti = pachet.length - 1;
          shuffle(pachet);
          temporal.Carti_mana.push(pachet[nr_carti]);
          pachet.splice(nr_carti,1);
          temporal.Puncte = Calculeaza_puncte(temporal,atu);
          socket.puncte = temporal.Puncte;
          socket.puncte = temporal.Puncte;
          nr_carti--;
        }
          console.log(nr_carti);
          if(Randul_jucatorului < iduri - 1)
            Randul_jucatorului++;
          else{
            Turns++;
            Randul_jucatorului = 0;
          }
            socket.emit("AmTrasDinPachet",{
              Turns:Turns,
              NoulPunctaj : temporal.Puncte,
              NouaMana : temporal.Carti_mana[temporal.Carti_mana.length - 1],
            });
            for(let i in SOCKET_LIST)
              SOCKET_LIST[i].emit("WhosTurn",{
                id:Randul_jucatorului - 1,
                UltimaCartee:CarteaDeJos,
                LastChoice:0,
              });
        });
        socket.on("TrageDeJos",function(data){
          if(Turns == 1){
            socket.emit("YouCanFinishNow",{});
          }
          var temporal = data.Player;
          temporal.Puncte = Calculeaza_puncte(temporal,atu);
          socket.puncte = temporal.Puncte;
          for(let i = 0 ; i < pachet_jos.length ; i++)
            if(pachet_jos[i] == temporal.UltimaCarte){
              pachet_jos.splice(i,1);
              break;
            }
            let Cardpicked = CarteaDeJos;
            CarteaDeJos = pachet_jos[pachet_jos.length - 1];
            if(Randul_jucatorului < iduri - 1)
              Randul_jucatorului++;
            else{
              Turns++;
              Randul_jucatorului = 0;
            }
          socket.emit("AmTrasDeJos",{
            NoulPunctaj:temporal.Puncte,
          });
          for(let i in SOCKET_LIST)
            SOCKET_LIST[i].emit("WhosTurn",{
              id:Randul_jucatorului - 1,
              UltimaCartee:CarteaDeJos,
              LastChoice:1,
              CardPicked:Cardpicked,
            });
        });

        socket.on("TerminaJoc",function(jucator){
          let OK = 1;
          let id = 0;
          let Maxim = 0;
          for(let i in SOCKET_LIST)
            if(SOCKET_LIST[i].puncte <= jucator.Puncte && SOCKET_LIST[i].id != jucator.Idul){
              OK = 0;
              id = jucator.Idul;
            }
          if(OK == 1){
              for(let i in SOCKET_LIST){
                if(SOCKET_LIST[i].puncte > Maxim){
                  Maxim = SOCKET_LIST[i].puncte;
                  id = SOCKET_LIST[i].id;
                }
              }
          }
          Randul_jucatorului = 10;
          setTimeout(function(){
            GameStarted = false;
            Turns = 0;
            iduri = 0;

            Randul_jucatorului = 0;
          },4800);
          for(let i in SOCKET_LIST)
            SOCKET_LIST[i].emit("Castigator",{
              Idul:id,
              Punctaj:Maxim,
              MeorNot:OK,
            });
        });

  }
  else socket.emit("NuTePotiConecta",{});
  socket.on('disconnect',function(){
    if(Randul_jucatorului == socket.id)
      if(iduri > socket.id + 1)
        Randul_jucatorului ++;
      else Randul_jucatorului = 0;
      delete SOCKET_LIST[socket.id];

  });
});
