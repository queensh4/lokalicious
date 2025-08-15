// Data produk (maksimal 5)
const products = [
  {id:1, name:"Bolu Kukus Semangka", price:18000, img:"assets/img/bolu-semangka.svg", meta:"Lembut & mekar"},
  {id:2, name:"Klepon Pandan", price:12000, img:"assets/img/klepon.svg", meta:"Gurih, gula merah lumer"},
  {id:3, name:"Lapis Legit Mini", price:25000, img:"assets/img/lapis-legit.svg", meta:"Harum rempah"},
  {id:4, name:"Risoles Mayo", price:16000, img:"assets/img/risoles.svg", meta:"Crispy di luar"},
  {id:5, name:"Pastel Abon", price:15000, img:"assets/img/pastel.svg", meta:"Isi penuh"}
].slice(0,5);

const slider = document.getElementById('productSlider');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const drawerScrim = document.getElementById('drawerScrim');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const drawerCheckoutBtn = document.getElementById('drawerCheckout');

document.getElementById('year').textContent = new Date().getFullYear();

// Render slider cards
function toIDR(n){ return n.toLocaleString('id-ID',{style:'currency',currency:'IDR'}) }
function cardTemplate(p){
  return `
  <article class="card product" aria-label="${p.name}">
    <div class="thumb"><img src="${p.img}" alt="${p.name}"></div>
    <h3>${p.name}</h3>
    <div class="meta">${p.meta}</div>
    <div class="price">${toIDR(p.price)}</div>
    <div class="add">
      <div class="qty">
        <button aria-label="kurang" data-qminus="${p.id}">-</button>
        <input type="number" min="1" value="1" data-qty="${p.id}"/>
        <button aria-label="tambah" data-qplus="${p.id}">+</button>
      </div>
      <button class="btn btn-outline" data-add="${p.id}">Tambah</button>
    </div>
  </article>`
}
slider.innerHTML = products.map(cardTemplate).join('');

// Slider controls
nextBtn.addEventListener('click',()=> slider.scrollBy({left:260,behavior:'smooth'}));
prevBtn.addEventListener('click',()=> slider.scrollBy({left:-260,behavior:'smooth'}));

// Qty handlers
slider.addEventListener('click', (e)=>{
  const minus = e.target.getAttribute('data-qminus');
  const plus = e.target.getAttribute('data-qplus');
  const add = e.target.getAttribute('data-add');
  if(minus){
    const input = slider.querySelector(`input[data-qty="${minus}"]`);
    input.value = Math.max(1, (parseInt(input.value)||1)-1);
  }
  if(plus){
    const input = slider.querySelector(`input[data-qty="${plus}"]`);
    input.value = (parseInt(input.value)||1)+1;
  }
  if(add){
    const qty = parseInt(slider.querySelector(`input[data-qty="${add}"]`).value)||1;
    addToCart(parseInt(add), qty);
    openCart();
  }
});

// Cart state
const CART_KEY = 'lokalicious_cart_v1';
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY)||'[]') }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartUI(); }
function addToCart(id, qty){
  const p = products.find(x=>x.id===id);
  const cart = getCart();
  const row = cart.find(x=>x.id===id);
  if(row){ row.qty += qty }
  else { cart.push({id,pname:p.name,price:p.price,img:p.img,qty}) }
  setCart(cart);
}
function removeFromCart(id){
  setCart(getCart().filter(x=>x.id!==id));
}
function changeQty(id,delta){
  const cart = getCart();
  const row = cart.find(x=>x.id===id);
  if(!row) return;
  row.qty = Math.max(1,row.qty+delta);
  setCart(cart);
}
function updateCartUI(){
  const cart = getCart();
  cartCountEl.textContent = cart.reduce((a,b)=>a+b.qty,0);
  cartItems.innerHTML = cart.length? cart.map(item => `
    <div class="cart-row">
      <img src="${item.img}" alt="${item.pname}"/>
      <div>
        <div class="name">${item.pname}</div>
        <div class="meta">${toIDR(item.price)}</div>
        <div class="qty">
          <button onclick="changeQty(${item.id},-1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id},1)">+</button>
          <button class="btn btn-ghost" onclick="removeFromCart(${item.id})">Hapus</button>
        </div>
      </div>
      <div>${toIDR(item.price*item.qty)}</div>
    </div>`).join('')
    : `<div class="muted">Keranjang masih kosong.</div>`;
  const subtotal = cart.reduce((a,b)=>a+b.price*b.qty,0);
  subtotalEl.textContent = toIDR(subtotal);
}
updateCartUI();

// Drawer
function openCart(){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); }
function closeCartDrawer(){ cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); }
cartBtn.addEventListener('click', openCart);
drawerScrim.addEventListener('click', closeCartDrawer);
closeCart.addEventListener('click', closeCartDrawer);

// Checkout
function doCheckout(){
  const cart = getCart();
  if(!cart.length){ alert('Keranjang kosong. Tambahkan produk dulu ya!'); return; }
  const total = cart.reduce((a,b)=>a+b.price*b.qty,0);
  alert(`Terima kasih! Total belanja Anda ${toIDR(total)}. (Contoh tombol checkout)`);
}
checkoutBtn.addEventListener('click', doCheckout);
drawerCheckoutBtn.addEventListener('click', doCheckout);

// Testimonial feature
const TESTI_KEY = 'lokalicious_testi_v1';
const defaultTesti = [
  {nama:'Dewi', rating:5, pesan:'Bolu semangkanya empuk dan wangi!'},
  {nama:'Rama', rating:4, pesan:'Klepon gulanya lumer. Mantap!'},
  {nama:'Sinta', rating:5, pesan:'Packaging rapi, rasa autentik.'},
];
if(!localStorage.getItem(TESTI_KEY)){
  localStorage.setItem(TESTI_KEY, JSON.stringify(defaultTesti));
}
function getTesti(){ return JSON.parse(localStorage.getItem(TESTI_KEY)||'[]') }
function setTesti(t){ localStorage.setItem(TESTI_KEY, JSON.stringify(t)); renderTesti(); }

const testimonialList = document.getElementById('testimonialList');
function star(n){ return '★'.repeat(n) + '☆'.repeat(5-n) }
function renderTesti(){
  const t = getTesti();
  testimonialList.innerHTML = t.map(item => `
    <article class="card testi">
      <div class="who">${item.nama}</div>
      <div class="rating" aria-label="Rating ${item.rating}/5">${star(item.rating)}</div>
      <div class="say">${item.pesan}</div>
    </article>`).join('');
}
renderTesti();

document.getElementById('testimonialForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = Object.fromEntries(fd.entries());
  obj.rating = parseInt(obj.rating);
  setTesti([obj, ...getTesti()].slice(0,30)); // keep at most 30
  e.target.reset();
  alert('Terima kasih atas testimoninya!');
});

// Feedback
document.getElementById('feedbackForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  // Simpan ke localStorage sebagai contoh
  const list = JSON.parse(localStorage.getItem('lokalicious_feedback')||'[]');
  list.push({...data, ts: Date.now()});
  localStorage.setItem('lokalicious_feedback', JSON.stringify(list));
  e.target.reset();
  alert('Terima kasih atas masukan Anda!');
});

