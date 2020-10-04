function check() {
    document.getElementById("create1").style.display = "none";
    document.getElementById("create2").style.display = "block";
    document.getElementById("create3").style.display = "none";
    document.getElementById("navs").style.display = "none";
}
function check1() {
    document.getElementById("create1").style.display = "none";
    document.getElementById("create2").style.display = "none";
    document.getElementById("create3").style.display = "block";
    document.getElementById("navs").style.display = "none";
}
function getname() {
    var getname = document.createpage.namepage.value;
    document.getElementById("namepage").innerText = getname;
}
function one() {
    document.getElementById("page1").style.display = "block";
    document.getElementById("page2").style.display = "none";
    document.getElementById("page3").style.display = "none";
}
function two() {
    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "block";
    document.getElementById("page3").style.display = "none";
}
function three() {
    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "none";
    document.getElementById("page3").style.display = "block";
}

