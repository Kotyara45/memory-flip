const boardEl = document.getElementById('board');
const sizeSel = document.getElementById('size');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const foundEl = document.getElementById('found');
const useEmojiChk = document.getElementById('useEmoji');
const bestRecordEl = document.getElementById('bestRecord');
const bestMovesEl = document.getElementById('bestMoves');

let gridSize = 4;
let totalCards = 16;
let pairsTotal = 8;
let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let found = 0;
let timer = null;
let startTime = 0;

function setGrid(n){
  gridSize = n;
  totalCards = n*n;
  pairsTotal = totalCards/2;
  const cardSize = (n<=8) ? (n<=4 ? 70 : 56) : (n<=16? 42 : 28);
  document.documentElement.style.setProperty('--card-size', cardSize+'px');
  boardEl.style.gridTemplateColumns = `repeat(${n}, ${cardSize}px)`;
  boardEl.style.gridAutoRows = `${cardSize}px`;
}

function randColor(){
  const h = Math.floor(Math.random()*360);
  const s = 60 + Math.floor(Math.random()*20);
  const l = 45 + Math.floor(Math.random()*10);
  return `hsl(${h} ${s}% ${l}%)`;
}

function generateFaces(){
  const faces = [];
  const useEmoji = useEmojiChk.checked && gridSize<=8;
  if(useEmoji){
    const emojis = ['🐶','🐱','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦉','🦄','🐝','🐛','🦋','🐌','🐢','🐍','🐙','🦀','🦞','🦑','🦐','🌵','🌸','🌞','⭐','🍎','🍌','🍇','🍓','🍒','🍉','🍍','🍔','🍕','🍣','🍩','🍪','☕','🍺','⚽','🎲','🎯','🎵','🎮','🚗','✈️','🚀','🛸','🏰','🎁','🎈','🎭'];
    for(let i=0;i<pairsTotal;i++){
      const e = emojis[i % emojis.length];
      faces.push({type:'emoji', value:e, color:null, id:i});
    }
  } else {
    for(let i=0;i<pairsTotal;i++){
      faces.push({type:'color', value:null, color:randColor(), id:i});
    }
  }
  return faces;
}

function shuffleArray(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function buildBoard(){
  boardEl.innerHTML='';
  cards = [];
  const faces = generateFaces();
  const deck = [];
  faces.forEach(f=>{
    deck.push(JSON.parse(JSON.stringify(f)));
    deck.push(JSON.parse(JSON.stringify(f)));
  });
  shuffleArray(deck);
  deck.forEach((face, idx)=>{
    const card = document.createElement('div');
    card.className='card';
    card.dataset.index = idx;
    card.dataset.id = face.id;

    const inner = document.createElement('div');
    inner.className='card-inner';

    const back = document.createElement('div');
    back.className='face back';
    back.innerHTML = '?';

    const front = document.createElement('div');
    front.className='face front';

    if(face.type === 'emoji'){
      front.innerHTML = `<span style="font-size:26px">${face.value}</span>`;
    } else {
      front.innerHTML = '';
      front.style.background = face.color;
    }
    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);

    card.addEventListener('click', ()=> onCardClick(card, face));
    boardEl.appendChild(card);
    cards.push({el:card, face});
  });
}

function onCardClick(card, face){
  if(lock) return;
  if(card.classList.contains('matched') || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  if(!firstCard){
    firstCard = {card, face};
    if(moves===0 && found===0){ startTimer(); }
    return;
  }
  secondCard = {card, face};
  lock = true;
  moves++;
  movesEl.textContent = moves;

  if(firstCard.face.id === secondCard.face.id){
    setTimeout(()=>{
      firstCard.card.classList.add('matched');
      secondCard.card.classList.add('matched');
      found++;
      foundEl.textContent = found + ' / ' + pairsTotal;
      resetPick();
      if(found === pairsTotal){ finishGame(); }
    }, 400);
  } else {
    setTimeout(()=>{
      firstCard.card.classList.remove('flipped');
      secondCard.card.classList.remove('flipped');
      resetPick();
    }, 700);
  }
}

function resetPick(){
  firstCard = null; secondCard = null; lock = false;
}

function startTimer(){
  startTime = performance.now();
  if(timer) cancelAnimationFrame(timer);
  function tick(){
    const now = performance.now();
    const sec = ((now - startTime)/1000).toFixed(1);
    timeEl.textContent = sec;
    timer = requestAnimationFrame(tick);
  }
  timer = requestAnimationFrame(tick);
}

function stopTimer(){
  if(timer) cancelAnimationFrame(timer);
  timer = null;
}

function finishGame(){
  stopTimer();
  const finalTime = parseFloat(timeEl.textContent) || 0;
  const key = `memory_best_${gridSize}`;
  const best = JSON.parse(localStorage.getItem(key) || 'null');
  let improved = false;
  if(!best || finalTime < best.time || (finalTime===best.time && moves < best.moves)){
    localStorage.setItem(key, JSON.stringify({time:finalTime, moves}));
    improved = true;
  }
  showBest();
  setTimeout(()=>{
    alert(`Вітаю! Ви знайшли всі пари. Час: ${finalTime} с, ходів: ${moves}${improved? ' — новий рекорд!':''}`);
  },200);
}

function showBest(){
  const key = `memory_best_${gridSize}`;
  const best = JSON.parse(localStorage.getItem(key) || 'null');
  if(best){
    bestRecordEl.textContent = best.time + ' с';
    bestMovesEl.textContent = best.moves;
  } else {
    bestRecordEl.textContent = '—';
    bestMovesEl.textContent = '—';
  }
}

function resetStats(){
  moves = 0; found = 0;
  movesEl.textContent = moves;
  timeEl.textContent = '0.0';
  foundEl.textContent = found + ' / ' + pairsTotal;
  stopTimer();
}

function startGame(){
  setGrid(gridSize);
  buildBoard();
  resetStats();
  showBest();
}

sizeSel.addEventListener('change', ()=>{
  const n = parseInt(sizeSel.value,10);
  setGrid(n);
});

startBtn.addEventListener('click', ()=>{
  gridSize = parseInt(sizeSel.value,10);
  startGame();
});

shuffleBtn.addEventListener('click', ()=>{
  gridSize = parseInt(sizeSel.value,10);
  startGame();
});

setGrid(4);
startGame();
