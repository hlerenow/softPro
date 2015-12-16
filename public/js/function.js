$(document).ready(function(){
	innit();
});


function innit() {
	//ajax提交登录
	$("#login-form").on("submit", function(event) {
		event.preventDefault();
		login(this);
		return false;
	});

	//ajax提交注册
	$(".sign-form").on("submit", function(event) {
		event.preventDefault();
		sign(this);
		return false;
	});

	//注册失败事件
	$("button.resign").on("click",function(){
		$(this).parent().addClass("hidden");
		$(this).addClass("hidden");
		console.log("55");
	});

};


function login(self){
$.ajax({
   url: self.action,
   type:self.method,
   processData: false,
   data: $(self).serialize(),
   dataType:"json",
   success: function(data){
   	if(data.login=="true")
   	{
   		window.location.href=data.url; 
   	}
   	else
   	{
   		$(".loginErroMesg").html("用户名或密码错误");
   	}
   }
 });
};

function contact(self){
$.ajax({
   url: self.action,
   type:self.method,
   processData: false,
   data: $(self).serialize(),
   dataType:"json",
   success: function(data){
   	if(data.login=="true")
   	{
   		window.location.href=data.url; 
   	}
   	else
   	{
   		$(".loginErroMesg").html("用户名或密码错误");
   	}
   }
 });
};

function sign(self) {
	$.ajax({
		url: self.action,
		type: self.method,
		processData: false,
		data: $(self).serialize(),
		dataType: "json",
		success: function(data) {
			$(".hideen-diolog").removeClass('hidden');
			if (data.sign=="true") {
				$(".hideen-diolog .message").html("注册成功！！！");
				$("a.login").removeClass("hidden");

			} else {
				$(".hideen-diolog .message").html("注册失败！！！");
				$("button.resign").removeClass("hidden");
			}
		},
		error: function() {
			console.log("failesd");
		}
	});
};



