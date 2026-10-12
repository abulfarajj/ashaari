// WhatsApp: the link is built on tap, so the number isn't written out as plain text on the page
document.getElementById('wa').addEventListener('click',function(){
  this.href='https://wa.me/'+['234','703','119','0843'].join('')+'?text='+encodeURIComponent('السلام عليكم');
});
