var k = 0;
function sen() {
    var text = window.document.send.mess.value;
    var a = document.getElementsByClassName("nd");
    var i = k;
    var n = i + 1;
    while (i < n) {
        n = i + 1;
        for (i; i < n; i++) {
            a[i].innerHTML = "<h6>"+text+"</h6>";
        }
        k++;
    }
}
function get() {
    document.getElementById("nguoi1").style.display = "none";
    document.getElementById("nguoi2").style.display = "flex";
}
function get2() {
    document.getElementById("nguoi1").style.display = "flex";
    document.getElementById("nguoi2").style.display = "none";
}