var express = require("express"),
	app = express(),
	mysql = require("mysql"),
	appServer = require("http").Server(app),
	io = require("socket.io")(appServer);

appServer.listen(3000, function() {
	console.log("Game start");
});

var config = require("./config");
var db = mysql.createClient(config);

app.set("view engine", "jade");
app.set("views", __dirname + "/views");
app.set("view options", {
	layout: false
});

app.use(express.bodyParser());
app.use(express.static(__dirname + "/public"));
app.use(express.favicon());
app.use(express.cookieParser());

app.use(express.session({
	secret: "123qweHl",
	cookie: {
		maxAge: 60 * 60 * 60 * 3
	},
	resave: false,
	saveUninitialized: true,
}));

//路由过滤
app.all('/:url/', function(req, res) {
	res.redirect("/" + req.params.url);
});

app.get('/main', function(req, res) {

	if (req.session.loginStatus != 1) {
		res.render("login");
	} 
	else {
		db.query("select relName,email,phone,workNumber from contactBook limit 0,8;",
			function(err,results){
				var contactBook=results;
				//console.log(results);
				db.query("select  DATE_FORMAT(date,'%Y-%m-%d %h:%m:%s') date,title,id,status,fromUser from message  where type='1' limit 0,10",
					function(err, results) {
						var vacationMsg=results;
						db.query("select DATE_FORMAT(date,'%Y-%m-%d %h:%m:%s') date,title,id,status,fromUser from message  where type='2' limit 0,10",
							function(err, results) {
								res.render("main", {
									"relName": req.session.relName,
									"userName": req.session.userName,
									"contactBook": contactBook,
									"message": results,
									"vacationMsg":vacationMsg,
									"statusJob": req.session.statusJob
								});
								//console.log(results);
							});
					});
			});
	}
});

app.get('/', function(req, res) {
	res.render("login");
});


app.all('/sign', function(req, res) {
	res.render("sign");
});

//处理注册
app.post('/process/sign', function(req, res) {
	//console.log(req.body.username);
	db.query("insert into users set username=?,relName=?,sex=?,email=?,phone=?,password=?", 
		[req.body.username, req.body.relname, req.body.sex, req.body.email, req.body.phone, req.body.password], function(err, info) {
		if (err) {
			res.send({
				"sign": "false"
			});

		} else {
			//console.log('-item created whith id %s', info.insertId);
			res.send({
				"sign": "true"
			});
		}
	})
});

//处理登陆
app.post("/process/login", function(req, res) {

	var username = req.body.username;
	var password = req.body.password;
	//res.render("main");

	db.query("select count(*) countExits from users where username=? and password=?", 
		[req.body.username, req.body.password], function(err, results) {
		if (err) {
			throw err
			console.log(err.toString());
			return ;
		}

		if (results[0].countExits == 1) {

			req.session.loginStatus = 1;

			req.session.userName = req.body.username;
			db.query("select relname,statusJob from users where userName=?",
				[req.body.username], function(err, results) {
				if (!err) {
					req.session.relName = results[0].relname;
					req.session.statusJob=results[0].statusJob;
					res.send({
						login: "true",
						url: "./main"
					});
				} else
					return err;
			});
		} 
		else {
			res.send({login: "false"});
		}

	});

});

//处理密码修改
app.post("/process/repassword",function(req,res){

	db.query("select count(*) from users where username=? and password=?",
		[req.session.userName,req.body.oldPassword],function(err,results){
			if(err)
				res.send({"status":0,"msg":"密码输入错误！！"});
			else
			{
				db.query("UPDATE users SET password=? WHERE username=?",
					[req.body.newPassword,req.session.userName],function(err,results){
						if(err){
							res.send({"status":0,"msg":"内部繁忙，请稍候重试！！"});			
						}
						else{
							res.send({"status":1,"msg":"修改成功"});
						}
					});
			}
		});
});

//请假
app.post("/process/vacation",function(req,res){
	var content=req.body.content;
	var time=req.body.time;
	var username=req.body.username;
	//console.log(username);

	db.query("insert into message (`fromUser`, `toUser`,`content`, `date`,`title`) VALUES (?,'root',?,?,'请假');",
		[req.body.username,req.body.content,req.body.time],
		function(err,info,results){
			if(!err){
				res.send({"status":1,"id":info.insertId});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});

//查看请假
app.post("/process/showVacation",function(req,res){
	var content=req.body.content;
	var time=req.body.time;
	var username=req.body.username;

	db.query("select  DATE_FORMAT(date,'%Y-%m-%d %h:%m:%s') date,status,title,content from message where id=? ;",
		[req.body.vid],
		function(err,results){
			if(!err){
				//console.log(results);
				res.send({"status":1,"msg":results[0]});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});

//进行审核操作
app.post("/process/doCheck",function(req,res){
	var vcmsg=req.body.vcmsg;
	var messageStatus=req.body.messageStatus;


	db.query("update  message set status=? where id=? ;",
		[messageStatus,vcmsg],
		function(err,results){
			if(!err){
				//console.log(results);
				res.send({"status":1,"msg":results[0]});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});

//通知发布
app.post("/process/anounce",function(req,res){;

	db.query("insert into message (title,fromUser, toUser,content, date,type) VALUES (?,?,'root',?,?,2);",
		[req.body.title,req.body.username,req.body.content,req.body.time],
		function(err,info,results){
			if(!err){
				res.send({"status":1,"id":info.insertId});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});

//通知查看
app.post("/process/showMessage",function(req,res){
	var content=req.body.content;
	var time=req.body.time;
	var username=req.body.username;

	db.query("select  DATE_FORMAT(date,'%Y-%m-%d %h:%m:%s') date,title,content from message where id=? ;",
		[req.body.mid],
		function(err,results){
			if(!err){
				res.send({"status":1,"msg":results[0]});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});


//查询通讯录
app.post("/process/serachPhone",function(req,res){
	var relNameQuery='%'+req.body.relName+'%';

	db.query("select  * from contactbook where relName like ? ;",
		[relNameQuery],
		function(err,results){
			if(!err){
				res.send({"status":1,"message":results});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});


//退出登录
app.post("/outLogin", function(req, res) {

	req.session.loginStatus = 0;

	res.send("55");
});

//初始化vacation
app.post("/process/innit/vacation",function(req,res){
	var username=req.body.username;

	db.query("select  id,DATE_FORMAT(date,'%Y-%m-%d') date from message where fromUser=? limit 0,6;",
		[username],
		function(err,results){
			if(!err){
				res.send({"status":1,"message":results});
			}
			else{
				res.send({"status":0,"err":err});
				console.log(err);

			}
	});
});


//chatRoomCode
io.on("connection", function(socket) {

	socket.emit("connect", {"aa": "qwe"});

	socket.on("join", function(msg) {

	});

	socket.on("message", function(msg) {
		db.query("INSERT INTO chathistory (`from`, `chat_Content`, `date`) VALUES ( ?, ?, ?);",
			[msg.from,msg.contentText,msg.chatTime],function(err, results, fields){
				if(err) console.log(err);
				console.log(socket.id+":"+socket.Array);				
				console.log(results);
				socket.broadcast.emit("message",{
					"type:":"1",
					"chatNews":msg});
				console.log(msg);
			});
	});

	socket.on("close", function() {

	});

});