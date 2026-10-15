const SUPABASE_URL = 'https://erfrkhrllovjspmsfcld.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TBKGTxt4WLRcX9SI6-pZVA_ZRDClr2C';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

function handleRegister(event) {
  event.preventDefault(); // Previene que la página se recargue al enviar el formulario

  // Capturar los valores introducidos
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const social = document.getElementById('user-social').value.trim();

  currentUser = {
    name,
    email,
    social: social || 'N/A'
  };

  // Ocultar formulario de registro y mostrar pantalla de inicio
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');

  // Mostrar mensaje personalizado de bienvenida
  document.getElementById('welcome-message').textContent = `Hola, ${currentUser.name}. ¡Demuestra tus conocimientos!`;
}

const questionBank = [
  { question: "¿Cuántos jugadores por equipo están en el campo al mismo tiempo durante una jugada?", options: ["10", "11", "12", "15"], correct: 1 },
  { question: "¿Cuántas oportunidades (downs) tiene la ofensiva para avanzar un mínimo de 10 yardas?", options: ["3", "5", "4", "6"], correct: 2 },
  { question: "¿Cuántos puntos vale un Touchdown (anotación)?", options: ["3 puntos", "6 puntos", "12 puntos", "8 puntos"], correct: 1 },
  { question: "¿Cómo se llama la posición del jugador encargada principalmente de lanzar el balón?", options: ["Running Back", "Wide Receiver", "Quarterback", "Tight End"], correct: 2 },
  { question: "¿Qué ocurre cuando un jugador defensivo atrapa un pase realizado por el Quarterback del equipo contrario?", options: ["Fumble", "Incompleto", "Safety", "Intercepción"], correct: 3 },
  { question: "¿Cuántos puntos otorga un Gol de Campo (Field Goal)?", options: ["2 puntos", "1 punto", "6 puntos", "3 puntos"], correct: 3 },
  { question: "¿Cuánto dura cada uno de los cuatro cuartos en un partido reglamentario de la NFL?", options: ["10 minutos", "12 minutos", "15 minutos", "20 minutos"], correct: 2 },
  { question: "¿Cómo se llama la línea imaginaria que separa a la ofensiva de la defensiva antes de que comience una jugada?", options: ["Línea de Touchback", "Línea de Ensayo", "Línea de Scrimmage ", "Línea de Goal"], correct: 2 },
  { question: "¿Cómo se llama el trofeo que se le entrega al campeón del Super Bowl?", options: ["Vince Lombardi", "Walter Payton", "Lamar Hunt", "George Halas"], correct: 0 },
];

const TOTAL_QUESTIONS = 7;
const TIME_LIMIT = 12; // segundos por pregunta
const MAX_POINTS_PER_QUESTION = 100;

let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = TIME_LIMIT;

function startQuiz() {
  selectedQuestions = [...questionBank].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.remove('hidden');

  showQuestion();
}

function showQuestion() {
  resetState();
  const q = selectedQuestions[currentQuestionIndex];
  
  document.getElementById('question-number').textContent = `Pregunta ${currentQuestionIndex + 1}/${TOTAL_QUESTIONS}`;
  document.getElementById('question-text').textContent = q.question;

  const buttons = document.querySelectorAll('.btn-option');
  buttons.forEach((btn, index) => {
    btn.textContent = q.options[index];
  });

  startTimer();
}

function resetState() {
  clearInterval(timerInterval);
  timeLeft = TIME_LIMIT;
  
  document.getElementById('timer').textContent = Math.ceil(timeLeft);

  const buttons = document.querySelectorAll('.btn-option');
  buttons.forEach((btn, index) => {
    btn.disabled = false;
    btn.className = `btn-option opt-${index}`;
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    
    if (timeLeft <= 0) {
      timeLeft = 0;
      document.getElementById('timer').textContent = 0;
      clearInterval(timerInterval);
      handleTimeOut();
    } else {
      document.getElementById('timer').textContent = Math.ceil(timeLeft);
    }
  }, 100);
}

function selectAnswer(selectedIndex) {
  clearInterval(timerInterval);
  const q = selectedQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.btn-option');

  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.correct) {
    const pointsGained = Math.round((timeLeft / TIME_LIMIT) * MAX_POINTS_PER_QUESTION);
    score += pointsGained;
    
    buttons[selectedIndex].classList.add('correct');
  } else {
    buttons[selectedIndex].classList.add('incorrect');
    buttons[q.correct].classList.add('correct');
  }

  setTimeout(nextQuestion, 1500);
}

function handleTimeOut() {
  const q = selectedQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.btn-option');

  buttons.forEach(btn => btn.disabled = true);
  buttons[q.correct].classList.add('correct');

  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < TOTAL_QUESTIONS) {
    showQuestion();
  } else {
    showResults();
  }
}

async function showResults() {
  const maxPossibleScore = TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION;
  
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  document.getElementById('score-text').textContent = `Obtuviste ${score} de ${maxPossibleScore} puntos posibles.`;

  // Insertar datos en Supabase
  if (currentUser) {
    try {
      const { data, error } = await supabaseClient
        .from('scores')
        .insert([
          {
            name: currentUser.name,
            email: currentUser.email,
            social: currentUser.social,
            score: score
          }
        ]);

      if (error) {
        console.error('Error de Supabase:', error.message);
      } else {
        console.log('¡Guardado en la base de datos con éxito!');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
    }
  }
}

//contraseña para la base de datos en supabase 
//LOsRedWolvessirifan_Espero 
