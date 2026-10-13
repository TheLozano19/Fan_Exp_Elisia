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
const TIME_LIMIT = 12;

let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = TIME_LIMIT;

function startQuiz() {
  // Barajar y seleccionar 7 preguntas aleatorias
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
  document.getElementById('timer').textContent = timeLeft;

  const buttons = document.querySelectorAll('.btn-option');
  buttons.forEach((btn, index) => {
    btn.disabled = false;
    btn.className = `btn-option opt-${index}`;
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeOut();
    }
  }, 1000);
}

function selectAnswer(selectedIndex) {
  clearInterval(timerInterval);
  const q = selectedQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.btn-option');

  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.correct) {
    score++;
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

function showResults() {
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  document.getElementById('score-text').textContent = `Obtuviste ${score} de ${TOTAL_QUESTIONS} puntos.`;
}