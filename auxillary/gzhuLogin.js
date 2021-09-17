document.body.onload=a; 

var qrcodehtml;

function a(){
    document.cookie = "cas_hash=" + encodeURIComponent(window.location.hash) ;
    if(window.localStorage){
        //重新登录的时候清除掉localStorage
        window.localStorage.clear();
    }
    if(window.sessionStorage){
        //重新登录的时候清除掉sessionStorage
        window.sessionStorage.clear();
    }
    jQuery('#camera_wrap_4').camera({
        height: 'auto',//高度
        hover: false,//鼠标经过幻灯片时暂停(true, false)
        //imagePath: 图片的目录
        loader: 'none',//加载图标(pie, bar, none)
        //loaderColor: 加载图标颜色( '颜色值,例如:#eee' )
        //loaderBgColor: 加载图标背景颜色
        loaderOpacity: '8',//加载图标的透明度( '.8'默认值, 其他的可以写 0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1 )
        loaderPadding: '2',//加载图标的大小( 填数字,默认为2 )
        navigation: false,//左右箭头显示/隐藏(true, false)
        navigationHover: false,//鼠标经过时左右箭头显示/隐藏(true, false)
        pagination: false,//是否显示分页(true, false)
        playPause: false,//暂停按钮显示/隐藏(true, false)
        pauseOnClick: false,//鼠标点击后是否暂停(true, false)
        portrait: false,//显示幻灯片里所有图片的实际大小(true, false)
        thumbnails: false,//是否显示缩略图(true, false)
        time: 500,// 幻灯片播放时间( 填数字 )
        //transPeriod: 4000,//动画速度( 填数字 )
        imagePath: '../images/',
        thumbnails:false
    });
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        slidesPerView: 1,
        paginationClickable: false,
        spaceBetween: 0,
        pagination : '#swiper-pagination1',
        paginationType: 'bullets',
        autoplay : 5500,
        loop : true
    });

    var setting = {
        imageWidth : 1680,
        imageHeight : 1050
        
    };
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    var init = function(){
        $(".login_conatiner").height(windowHeight).width(windowWidth);
        $("#container_bg").height(windowHeight).width(windowWidth);
        $("#login_right_box").height(windowHeight);
        var imgW = setting.imageWidth;
        var imgH = setting.imageHeight;
        var ratio = imgH / imgW; //图片的高宽比
    
        imgW = windowWidth; //图片的宽度等于窗口宽度
        imgH = Math.round(windowWidth * ratio); //图片高度等于图片宽度 乘以 高宽比
    
        if(imgH < windowHeight){ //但如果图片高度小于窗口高度的话
            imgH = windowHeight; //让图片高度等于窗口高度
            imgW = Math.round(imgH / ratio); //图片宽度等于图片高度 除以 高宽比
        }
        $(".login_img_01").width(imgW).height(imgH);  //设置图片高度和宽度
    };
    init();
    $(window).resize(function(){
        init();
    });
    
    //密码找回的中英文切换
    if($("#pwd_url").attr("href").indexOf('?') == -1){
    if($("#change_language").attr("value") == "中文"){
        $("#pwd_url").attr("href",$("#pwd_url").attr("href")+"?locale=en");
    }else{
        $("#pwd_url").attr("href",$("#pwd_url").attr("href")+"?locale=zh_CN");
    }
    }
    $("#change_language").unbind("click").click(function(){
        var re=eval('/(locale=)([^&]*)/gi');  
        var url = window.location.href;
        if($("#change_language").attr("value") == "中文"){
            if(url.indexOf("locale") >= 0 ) { 
                url=url.replace(re,'locale=zh_CN');
                location.href=url;
            }else{
                if(url.indexOf("?") >= 0){
                    location.href=url+"&locale=zh_CN";                  
                }else{
                    location.href=url+"?locale=zh_CN";
                }
            }
        }else if($("#change_language").attr("value") == "English") {
            if(url.indexOf("locale") >= 0 ) { 
                url=url.replace(re,'locale=en');
                location.href=url;
            }else{
                if(url.indexOf("?") >= 0){
                    location.href=url+"&locale=en";                 
                }else{
                    location.href=url+"?locale=en";
                }
            }
        }
    });
    //初始化点击事件
    initPassWordEvent();
} 

function login(){
    var $u = $("#un") , $p=$("#pd");
    var u = $u.val().trim();
    if(u==""){
        //$u.focus();
        //$u.parent().addClass("login_error_border");
        $("#robot-msg").text("账号或密码不能为空").show();
        $(".robot-mag-win").addClass("error");
        $(".robot-mag-win").addClass("small-big-small");
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
        return ;
    }
    
    var p = $p.val().trim();
    if(p==""){
        //$p.focus();
        //$p.parent().addClass("login_error_border");
        $("#robot-msg").text("账号或密码不能为空").show();
        $(".robot-mag-win").addClass("error");
        $(".robot-mag-win").addClass("small-big-small");
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
        return ;
    }
    
    $u.attr("disabled","disabled");
    $p.attr("disabled","disabled");
    
    //防止记录错误密码，每次要刷新记住的密码
    if($("#rememberName").is(":checked")){
        //不等于空，写cookie
        setCookie('neusoft_cas_un' , u , 7);
        setCookie('neusoft_cas_pd' , strEnc(p,'neusoft','cas','pd') , 7);
    }
    
    var lt = $("#lt").val();
    
    $("#un").val(u);
    $("#pd").val(p);
    $("#ul").val(u.length);
    $("#pl").val(p.length);
    $("#rsa").val(strEnc(u+p+lt , '1' , '2' , '3'));
    $("#loginForm")[0].submit();
    
}

//初始化登录页事件
function initPassWordEvent(){
//  var passwordhtml = document.getElementById("password_template").innerHTML;
    qrcodehtml = document.getElementById("scanLogin").innerHTML;
    var passwordhtml = "";
    
    $("#index_login_btn").click(function(){
        login();
        $("inout").blur()
        if($(".robot-mag-win").hasClass("error")){
            toAlertInfo()
            console.log("smile")
            setTimeout("toSmile()", 3500)
        }
    }); 
    //点击记住账号密码
    $("#rememberName").change(function(){
        if($(this).is(":checked")){
            var $u = $("#un").val() ;
            var $p = $("#pd").val() ;
            if($.trim($u)==''||$.trim($p)==''){
                $("#errormsg").text("账号和密码不能为空").show();
                $(this).prop("checked", false);
            }else{
                //不等于空，写cookie
                setCookie('neusoft_cas_un' , $u , 7);
                setCookie('neusoft_cas_pd' , strEnc($p,'neusoft','cas','pd') , 7);
            }
        }else{
            //反选之后清空cookie
            clearCookie('neusoft_cas_un');
            clearCookie('neusoft_cas_pd');
        }
    });
    //获取cookie值
    var cookie_u = getCookie('neusoft_cas_un');
    var cookie_p = getCookie('neusoft_cas_pd');
    if(cookie_u&&cookie_p){
        $("#un").val(cookie_u);
        $("#pd").val(strDec(cookie_p,'neusoft','cas','pd'));
        $("#rememberName").attr("checked","checked");
    }
    
    $("#un").focus(function(){
        $("#robot-msg").text(document.getElementById("unwords").innerHTML);
        
        $(".robot-mag-win").removeClass("error");
        $(".robot-mag-win").addClass("small-big-small");
        
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
        toOneEyeBlink()
    });
    
    $("#pd").focus(function(){
        $("#robot-msg").text(document.getElementById("pdwords").innerHTML);
        $(".robot-mag-win").removeClass("error");
        $(".robot-mag-win").addClass("small-big-small");
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
        toCloseEye();
    });
    $("#pd").on('blur',function(){
        toBothEyeBlink()
    })
    $("#un").on('blur',function(){
        toBothEyeBlink()
    })
    $("#code").focus(function(){
        $("#robot-msg").text(document.getElementById("codewords").innerHTML);
        $(".robot-mag-win").removeClass("error");
        $(".robot-mag-win").addClass("small-big-small");
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
    });
    
    //用户名文本域keyup事件
    $("#un").keyup(function(e){
        if(e.which == 13) {
            login();
        }
    }).keydown(function(e){
        //$("#errormsg").hide();
    }).focus();
    
    //密码文本域keyup事件
    $("#pd").keyup(function(e){
        if(e.which == 13) {
            login();
        }
    }).keydown(function(e){
        $("#errormsg").hide();
    });
    smile();
    //如果有错误信息，则显示
    if($("#errormsghide").text()){
        debugger;
        $("#errormsg").text($("#errormsghide").text());
        $("#robot-msg").text($("#errormsghide").text());
        if($("#errormsghide").text()=='用户名不存在'){
            $("#errormsg").text("账号或密码错误");
            $("#robot-msg").text("账号或密码错误");
            $.post('getDataByMethod', {method:"getServiceInfo",service_id:$("#service_id").val(),not_exit_number:$("#not_exit_number").val()}, function(data){
                if(data.success){
                    if(data.is_up_service){
                        layer.open({
                            title: '业务系统列表',
                            type: 1,
                            offset: ['100px', '50px'],
                            shade:0.8,
                            content: "<table id='servicesinfo' lay-filter='test'></table>", 
                            success: function(layero, index){
                                layui.use('table', function(){
                                    var table = layui.table;  
                                    //第一个实例
                                    table.render({
                                        elem: '#servicesinfo'
                                            ,data: data.data 
                                            ,height: 312
                                            ,page: true //开启分页
                                            ,cols: [[ //表头
                                              {field: 'SERVICE_NAME', title: '系统名称',minWidth:100}
                                              ,{field: 'ORIGINAL_LOGIN_URL', title: '原登录地址',minWidth:100,templet: function(d){
                                                  return '<a href="'+d.ORIGINAL_LOGIN_URL+'?account='+$("#not_exit_number").val()+'" class="layui-table-link">原登录地址</a>'
                                              }}
                                              ]]
                                    });
                                    
                                });
                            }
                        }); 
                    }else{
                        layer.confirm('当前登录账号不是统一身份账号，是否使用业务系统的登录认证？', {
                               title:"登录提示",
                               time: 0 //不自动关闭
                              ,btn: ['确认', '取消']
                              ,yes: function(index){
                                layer.close(index);
                                window.location.href = data.service_link_url+"?account="+$("#not_exit_number").val();
                              }
                        });
                    }
                }               
            });
        }
        //$("#errormsg").show();
        $(".robot-mag-win").addClass("error");
        toAlertInfo();
        console.log("smile");
        setTimeout("toSmile()", 3500);
    }else{
        $(".robot-mag-win").addClass("small-big-small")
        setTimeout(
            function(){
                $(".robot-mag-win").removeClass("small-big-small")
                $(".robot-mag-win").addClass("big-small")
                setTimeout(
                    function(){
                        $(".robot-mag-win").removeClass("big-small")
                }, 450)
        }, 3000)
    }
    //重新获取验证码
    $("#codeImage").click(function(){
        $("#codeImage").attr("src", "code?"+Math.random()) ;
    });
    //重新获取验证码
    $("#a_changeCode").click(function(){
        $("#codeImage").attr("src", "code?"+Math.random()) ;
    });
    //触发如何使用360极速模式图片
    $("#open_360").mouseover(function(){
        $("#open_360_img").show();
    }).mouseout(function(){
        $("#open_360_img").hide();
    });
    //点击账号登陆
//  $("#password_login").click(function(){
//      $("#password_login").addClass("active");
//      $("#qrcode_login").removeClass("active");
//      $("#login_content").html(passwordhtml);
//      initPassWordEvent();
//  });
    //点击扫码登陆
    $("#qrcode_login").unbind().click(function(){
        $("#scanLoginDiv").html(qrcodehtml);
//      $("#errormsg").hide();
        $("#loginFormShow").hide()
        $("#scanLoginDiv").show()
        $("#qrcode_login").parent().addClass("active");
        $("#password_login").parent().removeClass("active");
        //$("#login_content").html(qrcodehtml);
        //微信企业号扫码登录 add by TJL
        var lqrcode = new loginQRCode("qrcode",213,213);
        
        lqrcode.generateLoginQRCode(function(result){
//          alert("4456");
//          alert(result.redirect_url);
            window.location.href = result.redirect_url;
        });
        //触发如何使用360极速模式图片
//      $("#open_360").mouseover(function(){
//          $("#open_360_img").show();
//      }).mouseout(function(){
//          $("#open_360_img").hide();
//      });
        //$(this).unbind();
        //点击账号登陆
        $("#password_login").unbind().click(function(){
            $("#loginFormShow").show()
            $("#scanLoginDiv").hide()
            $("#password_login").parent().addClass("active");
            $("#qrcode_login").parent().removeClass("active");
            //initPassWordEvent();
        });     
    });
    
}

function getParameter(hash,name,nvl) {
    if(!nvl){
        nvl = "";
    }
    var svalue = hash.match(new RegExp("[\?\&]?" + name + "=([^\&\#]*)(\&?)", "i"));
    if(svalue == null){
        return nvl;
    }else{
        svalue = svalue ? svalue[1] : svalue;
        svalue = svalue.replace(/<script>/gi,"").replace(/<\/script>/gi,"").replace(/<html>/gi,"").replace(/<\/html>/gi,"").replace(/alert/gi,"").replace(/<span>/gi,"").replace(/<\/span>/gi,"").replace(/<div>/gi,"").replace(/<\/div>/gi,"");
        return svalue;
    }
}


//设置cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

//获取cookie
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}

//清除cookie  
function clearCookie(name) {  
  setCookie(name, "", -1);  
}  

a();