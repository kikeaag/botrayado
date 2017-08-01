var express = require('express');
var mysql = require('mysql');

function consultarNotificaciones(SenderID, callback){
	var res = "";
	try
	{
		var connection = mysql.createConnection({

		host : 'localhost' ,
		user : 'root' ,
		password : '',
		database : 'notificaciones_botrayado'

	});


	connection.connect(function(error){
	   if(error){
	      //throw error;
	      return "error";
	   }else{
	      return "correcta";
	   }
	});

	
	var query = connection.query('SELECT * FROM notificaciones WHERE SenderID = ?', [SenderID], function(error, result){
   if(error){
      //throw error;
   }else{
      var resultado = result;
      if(resultado.length > 0){
      		console.log(resultado[0].SenderID);
      		res = "Si existe";
      		callback(res);
      }
      else{
      		console.log("Registro no encontrado");
      		res = "No encontrado";
      		callback(res);
      }
	   }
	 });
		
	}
	catch(err)
	{
		console.log(err);
		return "false"
	}
	finally
	{
		connection.end();	
	}
	
	callback(res);
}

function insertNotificacion(SenderID, callback){

	var res = "";
	try
	{
		var connection = mysql.createConnection({

		host : 'localhost' ,
		user : 'root' ,
		password : '',
		database : 'notificaciones_botrayado'

	});


	connection.connect(function(error){
	   if(error){
	      //throw error;
	      return "error";
	   }else{
	      console.log('Conexion correcta.');
	      return "correcta";
	   }
	});


	var query = connection.query('INSERT INTO notificaciones(Id,SenderID) VALUES(?, ?)', ['', SenderID], function(error, result){
   if(error){
      //throw error;
      res = "error";
      callback(res);
   }else{
      console.log(result);
      res = "insert";
      callback(res);
	   }
	 }
	);	
	}
	catch(err)
	{
		console.log(err);
		return "false"
	}
	finally
	{
		connection.end();	
	}

}//Cierra funcion

function deleteNotificacion(SenderID, callback){

	var res = "";
	try
	{
		var connection = mysql.createConnection({

		host : 'localhost' ,
		user : 'root' ,
		password : '',
		database : 'notificaciones_botrayado'

	});


	connection.connect(function(error){
	   if(error){
	      //throw error;
	      return "error";
	   }else{
	      console.log('Conexion correcta.');
	      return "correcta";
	   }
	});


	var query = connection.query('DELETE FROM notificaciones WHERE SenderID = ?', [SenderID], function(error, result){
   if(error){
      //throw error;
      res = "error";
      callback(res);
   }else{
      console.log(result);
      res = "delete";
      callback(res);
	   }
	 }
	);	
	}
	catch(err)
	{
		console.log(err);
		return "false"
	}
	finally
	{
		connection.end();	
	}

}//Cierra funcion

function consultarNotificacionesActivadas(callback){
	var res = "";
	var resultado = "";
	try
	{
		var connection = mysql.createConnection({

		host : 'localhost' ,
		user : 'root' ,
		password : '',
		database : 'notificaciones_botrayado'

	});


	connection.connect(function(error){
	   if(error){
	      //throw error;
	      return "error";
	   }else{
	      return "correcta";
	   }
	});

	
	var query = connection.query('SELECT * FROM notificaciones', [], function(error, result){
   if(error){
      //throw error;
   }else{
      resultado = result;
      if(resultado.length > 0){
      		//console.log(resultado[0].SenderID);
      		res = "Si existe";
      		callback(resultado);
      }
      else{
      		console.log("Registro no encontrado");
      		res = "No encontrado";
      		callback(resultado);
      }
	   }
	 });
		
	}
	catch(err)
	{
		console.log(err);
		return "false"
	}
	finally
	{
		connection.end();	
	}
	
	callback(resultado);
}

module.exports.deleteNotificacion = deleteNotificacion;
module.exports.insertNotificacion = insertNotificacion;
module.exports.consultarNotificaciones = consultarNotificaciones;
module.exports.consultarNotificacionesActivadas = consultarNotificacionesActivadas;