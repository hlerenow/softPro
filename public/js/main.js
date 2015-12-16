var H={};


H.getNowDateTime=function(){
		var time=new Date();
		var timeString=time.getFullYear()+"-"+
						(time.getMonth()+1)+"-"+
						time.getDate()+" "+
						time.getHours()+":"+
						time.getMinutes()+":"+
						time.getSeconds();
		return timeString;
};

H.getNowDate=function(){
	var time=new Date();
	var timeString=time.getFullYear()+"-"+
					(time.getMonth()+1)+"-"+
					time.getDate();
	return timeString;
}

$(document).ready(function(){
	innit();
});



WnowFuncion="meet";//当前显示窗口
WnowList=".meet";

function innit(){

	//右边窗口切换
	$(".left-function .list-group-item.event").on("click",function(event){
		var nowClass=$(this).attr("class");
		nowClass=nowClass.replace('list-group-item',"");
		nowClass=nowClass.replace(' event',"");
		nowClass=nowClass.replace(' active',"");
		nowClass=nowClass.replace(" ","");
		if(nowClass!=WnowFuncion)
		{
			//console.log(WnowFuncion+":"+nowClass);

			$(WnowList).removeClass("active");
			$(this).addClass("active");
			WnowList="."+nowClass;

			$(".function-diolog ."+nowClass+"-area").removeClass("hidden");
			$(".function-diolog ."+WnowFuncion+"-area").addClass("hidden");
			WnowFuncion=nowClass;
		}
	});

	//请假初始化
	$(".left-function .list-group-item.vacation").on("click",function(){
		$(".vacation-message .v-foot >span:first-child").html("申请人："+$(".top-box .relName").html());
		$(".vacation-message .v-foot >span:last-child").html("日期："+H.getNowDate());

		var username = $(".top-box .userNumber").html();
		$.ajax({
			url: "./process/innit/vacation",
			type: "post",
			processData: false,
			data: "&username=" + username,
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err.toString());
				} else {
					var thenTr = "";
					if (data.message.length != 0) {
						for (var i = 0; i < data.message.length; i++) {
							var item = data.message[i];
							thenTr += '<a type="button" vid="'+item.id+'" class="list-group-item">'+item.date+'</a>';
						}

					}
					$(".vacation-area .list-vacation .pannel-body .list-group").html(thenTr);
					console.log(thenTr);

				}
			}
		});
	});

	//	去掉bootstrap空白处小事dialog
	$('.modal').modal({backdrop: 'static', keyboard: false,show:false});

	//退出登录
	$(".outLogin").on("click",function(){
		$.ajax({
		   url: "./outLogin",
		   type:"post"
		 });
		window.location.href="./";

	});

	//修改密码
	$("#repasswordShow .modal-footer button").on("click",function(){
		var oldPassword=$("#repasswordShow input[name=oldPassword]").val();
		var newPassword="";

		if($("#repasswordShow input[name=newPassword]").val()===$("#repasswordShow input[name=newPassword2]").val())
			newPassword=$("#repasswordShow input[name=newPassword]").val();
		else
			{
				alert("两次密码不相同！！");
				return ;
			}

		if(newPassword!=""&&oldPassword!="")
		{
			$.ajax({
				url: "./process/repassword",
				type: "post",
				processData: false,
				data: "oldPassword="+oldPassword+"&newPassword="+newPassword,
				dataType: "json",
				success: function(data) {
					if (data.status === 0) {
						alert(data.msg);
					} else {
						alert(data.msg);
						$("#repasswordShow").modal('hide');

					}
				}
			});	
		}
		else
		{
			alert("输入为空！！！");
		}
	});

	//聊天室
	chatProcess();

	//请假申请
	$(".v-contaniner .submit div").on("click",function(){
		console.log("请假");
		var time = H.getNowDateTime();
		var content=$(".v-content textarea").val();
		var username=$(".top-box .userNumber").html();
		$.ajax({
				url: "./process/vacation",
				type: "post",
				processData: false,
				data: "content="+content+"&time="+time+"&username="+username,
				dataType: "json",
				success: function(data) {
					if (data.status === 0) {
						alert(data.err);
					} else {
						alert("已提交请假申请,请等待审核.");
						var content=$(".v-content textarea").val("");
						console.log(data.id);
						$(".list-vacation .list-group").append('<a type="button" vid="'+data.id+'" class="list-group-item">'+H.getNowDate()+'</a>');
					}
				}
			});	

	});

	//请假信息查看
	$(".list-vacation").on("click", ".list-group a", function() {
		console.log("showvacation");
		var username = $(".top-box .userNumber").html();
		$.ajax({
			url: "./process/showVacation",
			type: "post",
			processData: false,
			data: "vid=" + $(this).attr("vid") + "&username=" + username,
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err);
				} else {
					console.log(data);
					$("#vacationShow .modal-body").html(data.msg.content);

					if(data.msg.status==1)
						$("#vacationShow span.vstatus").html("通过");
					else if(data.msg.status==2)
							$("#vacationShow span.vstatus").html("驳回");
						else
							$("#vacationShow span.vstatus").html("待审核");

					$("#vacationShow").modal('show');
				}
			}
		});
	});

	//消息发布
	$(".ano-contaniner .submit div").on("click",function(){
		console.log("消息发布");
		var time = H.getNowDateTime();
		var title=$(".ano-contaniner input[name=anoTitle]").val();
		var content=$(".ano-contaniner textarea[name=anoContent]").val();
		var username=$(".top-box .userNumber").html();
		$.ajax({
				url: "./process/anounce",
				type: "post",
				processData: false,
				data: "content="+content+"&time="+time+"&username="+username+"&title="+title,
				dataType: "json",
				success: function(data) {
					if (data.status === 0) {
						alert(data.err);
					} else {
						alert("已发布！！！");
						$(".ano-contaniner input[name=anoTitle]").val("");
						$(".ano-contaniner textarea[name=anoContent]").val("");
					}
				}
			});	

	});

	//通知消息查看
	$(".message-area").on("click", "td a", function() {
		console.log("showmessage");
		console.log( $(this).attr("msgId"));
		var username = $(".top-box .userNumber").html();
		var title=$(this).html();
		$.ajax({
			url: "./process/showMessage",
			type: "post",
			processData: false,
			data: "mid=" + $(this).attr("msgId") + "&username=" + username,
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err);
				} else {
					console.log(data);
					$("#messageShow span.title").html(title);
					$("#messageShow .modal-body").html(data.msg.content);
					$("#messageShow").modal('show');
				}
			}
		});
	});

	//审核请假信息查看
	$(".checkNews-area").on("click", "td a", function() {
		console.log("showvCheckVacation");
		var username = $(".top-box .userNumber").html();
		var title="请假";
		var vcmsg=$(this).attr("vcmsg");

		if($(this).parent().parent().children('a.status').attr("messageStatus")!=0)
		{
			$("#checkNewsShow .modal-footer").css("display","none");
		}

		$.ajax({
			url: "./process/showVacation",
			type: "post",
			processData: false,
			data: "vid=" + $(this).attr("vcmsg") + "&username=" + username,
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err);
				} else {
					console.log(data);
					$("#checkNewsShow .modal-body").html(data.msg.content);
					$("#checkNewsShow").modal('show');
					$("#checkNewsShow span.title").html(title);
					$("#checkNewsShow span.title").attr("vcmsg",vcmsg);
				}
			}
		});
	});

	//审核请假信息批准
	$("#checkNewsShow .modal-footer button").on("click", function() {
		console.log("checkNewsShow");
		var vcmsg = $('#checkNewsShow span.title').attr("vcmsg");
		console.log(vcmsg);
		var messageStatus = $(this).attr("messageStatus");
		//console.log(messageStatus);
		$.ajax({
			url: "./process/doCheck",
			type: "post",
			processData: false,
			data: "vcmsg=" + vcmsg + "&messageStatus=" + messageStatus,
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err);
				} else {
					console.log("rrrrrrrrrrrrr");
					if (messageStatus == 1)
						$('.checkNews-area table td a.status[vcmsg='+vcmsg+']').html("通过").attr("messageStatus",messageStatus);
					else
						$('.checkNews-area table td a.status[vcmsg='+vcmsg+']').html("驳回").attr("messageStatus",messageStatus);
				}
				$("#checkNewsShow").modal('hide');
			

			}
		});
	});


	//查询通讯录
	$(".contact-area .serachPhone  button").on("click", function() {
		$.ajax({
			url: "./process/serachPhone",
			type: "post",
			processData: false,
			data: "relName=" + $(this).parent().children("input").val(),
			dataType: "json",
			success: function(data) {
				if (data.status === 0) {
					alert(data.err.toString());
				} else {
						var firstTr='<tr>'+$(".contact-area table tr:first-child").html()+'</tr>';
						var thenTr="";
						if(data.message.length!=0)
						{
							for(var i=0;i<data.message.length;i++)
							{
								var item=data.message[i];
								thenTr+='<tr><td id="'+item.id+'" class="ids">'+item.username+'</td><td>'+item.relName+'</td><td>'+item.phone+'</td><td>'+item.email+'</td></tr>';
							}

						}
						else{
							thenTr="<tr><td colspan='5' style='text-align:center'>没有此人信息！！！</td></tr>";
						}
						$(".contact-area table").html(firstTr+thenTr);

				}
			}
		});
	});


};

function chatProcess(){

	var socket=io.connect("http://localhost:3000/");

	socket.on("connect",function(msg){
		console.log("shit");
		socket.emit("join","12");
	});

	//接收消息
	socket.on("message",function(msg){
		$(".historyChat table").append('<tr class="otherWord">'+
			'<td><div class="space"></div></td>'+
			'<td class="contentWordBox"><div class="contentWord">'+msg.chatNews.contentText+'</div></td>'+
			'<td class="name"><div class="who">'+msg.chatNews.relName+'</div></td></tr>');
		console.log(msg.chatNews.relName);
		$(".historyChat").scrollTop($(".historyChat table").height());
		console.log(msg);
	});

	//发送消息
	$("#buttonBox .btn").on("click",function(){
		var time=new Date();
		var timeString=time.getFullYear()+"/"+
						(time.getMonth()+1)+"/"+
						time.getDate()+"/ "+
						time.getHours()+":"+
						time.getMinutes()+":"+
						time.getSeconds();
						console.log(timeString);
		var fromPeople=$(".userNumber").html();
		var contentText=$("#chatInput textarea").val();
			$("#chatInput textarea").val("");

		$(".historyChat table").append('<tr class="selfWord">'+
			'<td class="name"><div class="who">我</div></td>'+
			'<td class="contentWordBox"><div class="contentWord">'+contentText+'</div></td>'+
			'<td><div class="space"></div></td></tr>');

		//发送消息
		$(".historyChat").scrollTop($(".historyChat table").height());
		socket.emit("message",{
			"relName":$(".relName").html(),
			"from":fromPeople,
			"contentText":contentText,
			"chatTime":timeString
		});

		console.log(socket.id+":"+contentText);
	});

}



