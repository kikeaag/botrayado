const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
var base = require('./base.js');
var mysql = require('mysql');

var port = process.env.PORT || 3000;

const APP_TOKEN = 'EAAEPZAGMb78IBABAhfxNTDAlEjuOUIFuuc00d1uNWpelO4UOygq7ZBRFoSArBKHl3WA1j7ZCBhcYaCKm1tYet9kRJW8dkUFWTswx8gE2PUQNPYd6Stncb8OObp3e8h3JwfS9BxN2LWhAskLLjt5OMZCd5VwQnn8f6ST815Xz4gZDZD';

var app = express();

var nombre = "";
var payload = "";

var CronJob = require('cron').CronJob;
// Patrón de cron
// Corre todos los lunes a la 1:00 PM
new CronJob('50 22 * * *', function() {
  // Código a ejecutar
  //var sender = "1370976946347903";
  var danya = "1322995857822169";


  enviarMensajeTexto(danya, "I Love U");

}, function() {
  // Código a ejecutar cuando la tarea termina. 
  // Puedes pasar null para que no haga nada
  console.log("Si jala el cron");
}, true);

app.use(bodyParser.json());

app.listen(port,function(){
	console.log('Executing...');
})

app.get('/',function(req,res){
	//res.send('Abriendo el puerto bitches!')

	var msje = req.query.msje || '';
	var anotado = req.query.anotado || '';
	var marcador = req.query.marcador || '';

	if(msje != '' && anotado != '' && marcador != ''){
		res.send("si trae parametros");
		base.consultarNotificacionesActivadas(function(resultado){
		var r = resultado
		//console.log(r);
		for(var i = 0; i <= r.length - 1; i++){
			var vs = r[i].SenderID;
			//Enviar mensaje
			console.log(vs);
			enviarMensajeTexto(vs, msje + "\n" + anotado + "\n" + marcador );
		}
	});
	}else{
		res.send("No trae");
	}

	


})

function leerNombre(senderID, callback){
					request({
						uri: 'https://graph.facebook.com/v2.6/' + senderID + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + APP_TOKEN,	
						//qs: {access_token: APP_TOKEN},
						method: 'GET',
						//json: messageData
					}, function(error, response, data){

						if(error){
							console.log('No es posible enviar el mensaje');
							
						}else{
							console.log('Mensaje enviado para el nombre');
							var respuesta = JSON.parse(data);
							var res = respuesta.first_name;
							callback(res);
						}
					})
	
}



app.get('/webhook', function(req, res){

	if(req.query['hub.verify_token'] === 'hello_token'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send('Tu no tienes que entrar aqui');
	}

	
})

app.post('/webhook', function(req, res){
	var data = req.body
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){

					getMessage(messagingEvent);
					
				}
			})
		})
	}
	res.sendStatus(200);
})

function getMessage(event){

	payload = "";
	var senderID = event.sender.id;
	var messageText = event.message.text;
	if(event.message.quick_reply){
		payload = event.message.quick_reply.payload;
		console.log("PAYLOAD "+ event.message.quick_reply.payload );
	}
	
	console.log("Sender: " + senderID);
	evaluarMensaje(senderID,messageText);

}


function evaluarMensaje(senderID, messageText){

	var mensaje = '';
	nombre = '';

	sendReadReceipt(senderID);

	if(messageText === undefined || messageText === ""){
		mensaje = "(y)";		

	}
	else{

		messageText = messageText.toLowerCase();

		if(isContain(messageText, 'calendario')){
			
			calendario(senderID,"Calendario Apertura 2017")

		}else if(isContain(messageText, 'equipo')){

			plantel(senderID,"Plantel Rayado Apertura 2017","http://www.rayados.com/plantel/lista","Click aquí");

		}else if(isContain(messageText, 'posiciones')){

			sendButtonMessage(senderID,"Tabla Posiciones");

		}else if(isContain(messageText, 'gracias')){

			sendTypingOn(senderID);
			leerNombre(senderID, function(res){
				nombre = res;
				sendTypingOff(senderID);
				enviarMensajeTexto(senderID, "Gracias a ti, " + nombre + " y arriba los rayados!!");

			});

		}else if(payload === "Notificaciones"){

				base.consultarNotificaciones(senderID, function(res){

					if(res === "Si existe"){
						console.log("SI EXISTE NOTIFICACION");
						menu2(senderID,"cancelar", "Cancelar", "notificacion_no");
					}else if(res === "No encontrado"){
						console.log("NO EXISTE NOTIFICACION");
						menu2(senderID,"activar","Activar", "notificacion_si");
					}

				});
					
				
				
				//1.- Consulta a ver si esta en la tabla
				//2.- Mandar llamar menu2 con parametros, Cancelar ó Activar
				//3.- Activar se hace INSERT
				//4.- Cancelar se hace DELETE
		}else if(payload === "notificacion_si" || payload === "notificacion_no"){

			if(payload === "notificacion_si"){
				console.log("Se hace insert");
				new base.insertNotificacion(senderID, function(res){
					if(res === "insert"){
						//Se manda mensaje exito
						enviarMensajeTexto(senderID, "Se han activado las notificaciones con éxito.\nCuando haya partidos recibiras un mensaje avisandote la hora del partido e información del juego al momento. :)");	

					}else if(res === "error"){
						//Se manda mensaje de error
						enviarMensajeTexto(senderID, "Surgio un error... por favor intenta nuevamente.");	
					}
				});
			}else if(payload === "notificacion_no"){
				console.log("Se hace DELETE");
				new base.deleteNotificacion(senderID, function(res){
					if(res === "delete"){
						//Se manda mensaje exito delete
						enviarMensajeTexto(senderID, "Se desactivaron las notificaciones :)");	
					}else if(res === "error"){
						//se manda mensaje error
						enviarMensajeTexto(senderID, "Surgio un error... por favor intenta nuevamente.");	
					}
				})
			}

		
		}else if(isContain(messageText, 'hola')){
			
			sendTypingOn(senderID);
			enviarPlantilla(senderID);
			sendTypingOff(senderID);

		}else if(isContain(messageText, "menu")){
			sendTypingOn(senderID);
			leerNombre(senderID, function(res){
				nombre = res;
				sendTypingOff(senderID);
				menu1(senderID);

			});
			
		}else{
			sendTypingOn(senderID);
			leerNombre(senderID, function(res){
				nombre = res;
				sendTypingOff(senderID);
				menu1(senderID);

			});
		}

	}
		
		enviarMensajeTexto(senderID, mensaje);	
		
}

function menu1(senderID){

	console.log(senderID);
	
	//console.log(nombre);
	var messageData = {

		

		recipient : {
			id : senderID
		},



		message : {
			text : "En qué te puedo ayudar, " + nombre + "? :)" ,
			quick_replies : [
      			{
			        content_type : "text",
			        title : "Calendario",
			        payload : "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      			},
      			{
			        content_type : "text",
			        title : "Posiciones",
			        payload : "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      			},
      			{
			        content_type : "text",
			        title : "Equipo",
			        payload : "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      			},
      			{
			        content_type : "text",
			        title : "Notificaciones",
			        payload : "Notificaciones"
      			}
    						]
				}
				

				
		}

	callSendAPI(messageData);
}


function menu2(senderID, otro1, otro2, notificacion_){

	var messageData = {

		recipient : {
			id : senderID
		},

		message : {
			text : "Deseas "+otro1+" las notificaciones?" ,
			quick_replies : [
      			{
			        content_type : "text",
			        title : otro2,
			        payload : notificacion_
      			}
      			
      		
    						]
				}
				

				
		}

	callSendAPI(messageData);
}



function enviarImagen(senderID){
	var messageData = {
		recipient : {
    	id : senderID
  	},
  		message : {
	    attachment : {
	    	type : "image",
	      	payload : {
	        	url : "https://img.vavel.com/b/DCPBpslUIAA1cQz.jpg"
	        	}		}
    		
  		}
	}

	callSendAPI(messageData);
}

function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  

  
  	callSendAPI(messageData);	
  

}

function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  
  	callSendAPI(messageData);	
  
}

function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

function enviarPlantilla(senderID){

	var messageData = {
		recipient : {
			id : senderID
		},

		

		message : {
			attachment : {
				type : "template" ,
				payload : {
					template_type : 'generic' ,
					elements : [elementTemplate()]
				}
			}
		}
		
		
	}

	console.log(messageData);
	callSendAPI(messageData);
}

function elementTemplate(){
	return {
		title : "Robot Rayado" ,
		subtitle : "Soy el primer Robot Rayado\nQuieres saber cuando juega Rayados?\nActiva las notificaciones! " ,
		item_url : "https://www.facebook.com/Bot-Rayado-338043926630989" ,
		image_url : "https://media.giphy.com/media/dZjduPmFS3feU/giphy.gif" ,
		buttons : [
			buttonTemplate("Contacto", "https://www.facebook.com/ealejandroguzman")
		]
	}
}

function plantel(recipientId,texto,url,titulo) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: texto,
          buttons:[
     			     {
						type: "web_url",
						url: url,
						title: titulo,
						webview_height_ratio: "tall"
					}
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function calendario(recipientId,texto) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: texto,
          buttons:[
          calendarioBotones("http://www.rayados.com/calendario","Liga Mx"),
          calendarioBotones("http://www.rayados.com/monterrey/calendario_copamxc17","Copa Mx")
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function calendarioBotones(url,titulo){
	return {
		type: "web_url",
		url: url,
		title: titulo,
		"webview_height_ratio": "tall"
	}
}

function sendButtonMessage(recipientId,texto) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: texto,
          buttons:[
          posiciones("http://www.rayados.com/calendarios/tabla_general","Liga Mx Ap. 2017")
          //posiciones("http://www.rayados.com/calendarios/tabla_general","Copa Mx")
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function posiciones(url,titulo){
	return {
		type: "web_url",
		url: url,
		title: titulo,
		"webview_height_ratio": "tall"
	}
}

function buttonTemplate(title, url){
	return {
		type : 'web_url' ,
		url : url ,
		title : title,
		"webview_height_ratio": "tall"
	}
}


function enviarMensajeTexto(senderID, mensaje){

	var messageData = {
						recipient : {
							id: senderID
						},
						message: {
							text: mensaje
						}
					}

	callSendAPI(messageData);
}

function callSendAPI(messageData){
	// api Facebook
					request({
						uri: 'https://graph.facebook.com/v2.6/me/messages',
						qs: {access_token: APP_TOKEN},
						method: 'POST',
						json: messageData
					}, function(error, response, data){

						if(error){
							console.log('No es posible enviar el mensaje');
						}else{
							console.log('Mensaje enviado');
						}
					})

}

function isContain(texto, word){

		if(texto === undefined){
			return "(y)";
		}else{
			return texto.indexOf(word) > -1	
		}
}

