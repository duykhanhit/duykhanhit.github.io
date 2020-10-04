function giaiPT() {
    let a = document.getElementById('a').value;
    let b = document.getElementById('b').value;
    let c = document.getElementById('c').value;

    let result = document.getElementById('kq1');

    if (a && a !== null) {
        let delta = b * b - 4 * a * c;
        if (delta < 0) {
            result.innerText = 'Phương trình vô nghiệm.';
        } else if (delta === 0) {
            result.innerText = 'x = ' + (-b / (2 * a));
        } else {
            let x1 = (-b + Math.sqrt(delta)) / 2 * a;
            let x2 = (-b - Math.sqrt(delta)) / 2 * a;

            result.innerText = 'x1 = ' + x1 + '|' + ' x2 = ' + x2;
        }
    } else {
        result.innerText = 'x = ' + (-c / b);
    }
}

function timNgay() {
    let month = document.getElementById("month").value;
    let year = document.getElementById("year").value;

    let result = document.getElementById('kq2');

    switch (month) {
        case '1':
        case '3':
        case '5':
        case '7':
        case '8':
        case '10':
        case '12':
            result.innerText = 'Tháng ' + month + ' năm ' + year + ' có 31 ngày';
            break;
        case '4':
        case '6':
        case '9':
        case '11':
            result.innerText = 'Tháng ' + month + ' năm ' + year + ' có 30 ngày';
            break;
        case '2':
            if (year % 4 === 0) {
                result.innerText = 'Tháng ' + month + ' năm ' + year + ' có 29 ngày';
                break;
            } else {
                result.innerText = 'Tháng ' + month + ' năm ' + year + ' có 28 ngày';
                break;
            }
            break;
        default:
            result.innerText = 'Nhập sai tháng rồi :(';
            break;
    }

}

function checkSNT(n){
    if(n < 2){
        return false;
    }else{
        for(var i = 2; i <= n/2; i++){
            if(n % i === 0){
                return false;
            }
        }
    }
    return true;
}

function display(){
    let n = document.getElementById('number').value;

    let arr = [];

    for(var i = 0; i <= n; i++){
        if(checkSNT(i)){
            arr.push(i);
        }
    }

    document.getElementById('kq3').innerText = arr;
}