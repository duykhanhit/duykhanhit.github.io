function checklogin() {
    var username = window.document.login.username.value;
    var password = window.document.login.password.value;

    if(username == 'HIT' && password == 18082010)
       {
           return true;
       }
    else
        {
            document.getElementById("noti").innerText = "Đăng nhập thất bại.";
            return false;
        }
}

function checksignup() {
    var ten = window.document.signup.ten.value;
        sdt = window.document.signup.sdt.value;
        pass = window.document.signup.pass.value;

        document.getElementById("dk-noti").innerText = ten;
}
