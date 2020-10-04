var images = document.querySelectorAll('.avt img');
var showImg = document.getElementById('show');
for(let image of images){
    image.addEventListener('click',function (){
        var imgsrc=image.getAttribute('src');
        showImg.setAttribute('src',imgsrc);
    })
}