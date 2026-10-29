const SUPABASE_URL = 'https://erfrkhrllovjspmsfcld.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TBKGTxt4WLRcX9SI6-pZVA_ZRDClr2C';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let chartsInitialized = false;

// Auto-detectar al cargar la página si ya existe un usuario o si ya completó la trivia
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('rw_user');
  const savedCompleted = localStorage.getItem('rw_completed');
  const savedScore = localStorage.getItem('rw_score');

  if (savedUser) {
    currentUser = JSON.parse(savedUser);

    if (savedCompleted === 'true') {
      score = parseInt(savedScore || '0', 10);
      const maxPossibleScore = TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION;
      document.getElementById('score-text').textContent = `Obtuviste ${score} de ${maxPossibleScore} puntos posibles.`;
      showScreen('result-screen');
    } else {
      document.getElementById('welcome-message').textContent = `Hola de nuevo, ${currentUser.name}. ¡Demuestra tus conocimientos!`;
      showScreen('start-screen');
    }
  }
});

// Control de pantallas (SPA)
function showScreen(screenId) {
  const screens = [
    'auth-screen',
    'start-screen',
    'quiz-screen',
    'result-screen',
    'photos-screen',
    'stats-screen',
    'roster-screen'
  ];

  screens.forEach(id => {
    const screen = document.getElementById(id);
    if (screen) {
      screen.classList.add('hidden');
    }
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  // Renderizar gráficas cuando se ingrese a estadísticas
  if (screenId === 'stats-screen' && !chartsInitialized) {
    initRadarCharts();
    chartsInitialized = true;
  }

  // Pop-up de valoración automático tras ingresar a una sección por primera vez
  const optionScreens = ['photos-screen', 'stats-screen', 'roster-screen'];
  const feedbackShown = localStorage.getItem('rw_feedback_shown');

  if (optionScreens.includes(screenId) && !feedbackShown) {
    setTimeout(() => {
      openFeedbackModal();
      localStorage.setItem('rw_feedback_shown', 'true');
    }, 1000);
  }
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const social = document.getElementById('user-social').value.trim();

  currentUser = {
    name,
    email,
    social: social || 'N/A'
  };

  localStorage.setItem('rw_user', JSON.stringify(currentUser));

  showScreen('start-screen');
  document.getElementById('welcome-message').textContent = `Hola, ${currentUser.name}. ¡Demuestra tus conocimientos!`;
}

function resetSession() {
  localStorage.removeItem('rw_user');
  localStorage.removeItem('rw_completed');
  localStorage.removeItem('rw_score');
  localStorage.removeItem('rw_feedback_shown');
  currentUser = null;
  showScreen('auth-screen');
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
  { question: "¿Cómo se llama la jugada en la que un jugador defensivo taclea al Quarterback detrás de la línea de scrimmage antes de que pase o corra?", options: ["Intercepción", "Sack", "Safety", "Fumble"], correct: 1 },
  { question: "¿Cuántos puntos vale una conversión de dos puntos (2-point conversion) tras un Touchdown?", options: ["1 punto", "2 puntos", "3 puntos", "6 puntos"], correct: 1 },
  { question: "¿Cómo se denomina la zona de 10 yardas en cada extremo del campo donde se anotan los Touchdowns?", options: ["Red Zone", "End Zone", "Neutral Zone", "Goal Zone"], correct: 1 },
  { question: "¿Cómo se llama la jugada en la que el balón se patea hacia adelante en cuarta oportunidad para entregar la posesión al rival?", options: ["Kickoff", "Punt (Despeje)", "Field Goal", "Onside Kick"], correct: 1 },
  { question: "¿Qué ocurre cuando a un jugador ofensivo se le cae el balón vivo antes de ser derribado y cualquier equipo puede recuperarlo?", options: ["Incompleto", "Intercepción", "Fumble", "Offside"], correct: 2 },
  { question: "¿Cuántos puntos consigue la defensiva al anotar un Safety (taclear al rival dentro de su propia zona de anotación)?", options: ["2 puntos", "3 puntos", "6 puntos", "1 punto"], correct: 0 },
  { question: "¿Cómo se le llama al pase largo y desesperado de último segundo hacia la End Zone?", options: ["Pick Six", "Screen Pass", "Hail Mary", "Trick Play"], correct: 2 },
  { question: "¿Qué posición de la línea ofensiva es la encargada de centrar el balón (hacer el snap) al Quarterback?", options: ["Guard", "Tackle", "Center", "Tight End"], correct: 2 },
  { question: "¿Cuántas yardas de castigo se otorgan generalmente por una falta de 'Sujetando' (Holding) de la ofensiva?", options: ["5 yardas", "10 yardas", "15 yardas", "20 yardas"], correct: 1 },
  { question: "¿Cómo se llama la jugada inicial con la que comienza cada mitad del partido o se reanuda tras una anotación?", options: ["Punt", "Snap", "Kickoff", "Safety"], correct: 2 },
  { question: "¿Qué sanción recibe la defensiva si un jugador cruza la línea de scrimmage antes de que el balón sea centrado?", options: ["Holding", "Offside (Fuera de lugar)", "Pass Interference", "Personal Foul"], correct: 1 },
  { question: "¿Cómo se denomina cuando la defensiva intercepta un pase y lo regresa hasta la zona de anotación rival para hacer un Touchdown?", options: ["Pick Six", "Touchback", "Safety", "Fumble Recovery"], correct: 0 },
  { question: "¿Cuál es el tiempo de posesión (reloj de jugada) que tiene la ofensiva para iniciar una jugada antes de ser penalizada por retraso de juego?", options: ["25 segundos", "30 segundos", "40 segundos", "45 segundos"], correct: 2 },
  { question: "¿Cuántos puntos otorga el punto extra pateado (PAT - Extra Point) justo después de anotar un Touchdown?", options: ["1 punto", "2 puntos", "3 puntos", "0 puntos"], correct: 0 },
  { question: "¿Cómo se llama el área del campo comprendida entre la línea de la yarda 20 y la zona de anotación (End Zone)?", options: ["No-Fly Zone", "Red Zone", "Comfort Zone", "Green Zone"], correct: 1 },
];

const TOTAL_QUESTIONS = 7;
const TIME_LIMIT = 12;
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

  showScreen('quiz-screen');
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
  
  showScreen('result-screen');
  document.getElementById('score-text').textContent = `Obtuviste ${score} de ${maxPossibleScore} puntos posibles.`;

  localStorage.setItem('rw_completed', 'true');
  localStorage.setItem('rw_score', score.toString());
  
  if (currentUser && typeof supabaseClient !== 'undefined') {
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

      if (error) console.error('Error de Supabase:', error.message);
    } catch (err) {
      console.error('Error de conexión:', err);
    }
  }
}

// Inicialización de Gráficas de Radar con estilos oscuros optimizados
function initRadarCharts() {
  const commonRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.15)' },
        grid: { color: 'rgba(255, 255, 255, 0.15)' },
        pointLabels: { 
          color: '#e0e0e0', 
          font: { size: 10, weight: 'bold' } 
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { 
        labels: { color: '#ffffff', font: { size: 11 } }, 
        position: 'bottom' 
      }
    }
  };

  // 1. Gráfica Quarterbacks
  new Chart(document.getElementById('qbChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['% Efectividad', 'Yardas Pase', 'Yardas Acarreo', 'Touchdowns (Pase)', 'Primeros Downs'],
      datasets: [
        {
          label: 'Fernando Escalona (#14)',
          data: [54, 100, 68.4, 100, 87.5],
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        },
        {
          label: 'Iker Muñoz (#9)',
          data: [38, 100, 100, 50, 100],
          backgroundColor: 'rgba(227, 24, 55, 0.4)',
          borderColor: 'rgba(227, 24, 55, 1)',
          pointBackgroundColor: 'rgba(227, 24, 55, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 2. Gráfica Corredores
  new Chart(document.getElementById('rbChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Acarreos', 'Yardas', 'Promedio yd/acarreo', 'Touchdowns'],
      datasets: [
        {
          label: 'Moisés Díaz (#20)',
          data: [100, 100, 92.6, 100],
          backgroundColor: 'rgba(40, 167, 69, 0.4)',
          borderColor: 'rgba(40, 167, 69, 1)',
          pointBackgroundColor: 'rgba(40, 167, 69, 1)'
        },
        {
          label: 'Emiliano Hernández (#32)',
          data: [50, 54, 100, 0],
          backgroundColor: 'rgba(255, 193, 7, 0.4)',
          borderColor: 'rgba(255, 193, 7, 1)',
          pointBackgroundColor: 'rgba(255, 193, 7, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 3. Gráfica Receptores
  new Chart(document.getElementById('wrChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Recepciones', 'Yardas Recibidas', 'Promedio yd/rec', 'Touchdowns'],
      datasets: [
        {
          label: 'Genaro Flores (#0)',
          data: [81.8, 75.4, 35.9, 0],
          backgroundColor: 'rgba(153, 102, 255, 0.4)',
          borderColor: 'rgba(153, 102, 255, 1)',
          pointBackgroundColor: 'rgba(153, 102, 255, 1)'
        },
        {
          label: 'André Vergara (#18)',
          data: [100, 100, 53.0, 0],
          backgroundColor: 'rgba(255, 159, 64, 0.4)',
          borderColor: 'rgba(255, 159, 64, 1)',
          pointBackgroundColor: 'rgba(255, 159, 64, 1)'
        },
        {
          label: 'Sigfrido López (#6)',
          data: [90.9, 85.7, 49.8, 100],
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        },
        {
          label: 'Santiago Vargas (#19)',
          data: [0, 0, 100, 0],
          backgroundColor: 'rgba(201, 203, 207, 0.4)',
          borderColor: 'rgba(201, 203, 207, 1)',
          pointBackgroundColor: 'rgba(201, 203, 207, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 4. Gráfica Defensiva
  new Chart(document.getElementById('defChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Tackleadas', 'Capturas', 'Intercepciones', 'Fumbles Rec.'],
      datasets: [
        {
          label: 'Emilio Salvador (#28)',
          data: [100, 0, 100, 0],
          backgroundColor: 'rgba(255, 99, 132, 0.4)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)'
        },
        {
          label: 'Santiago Cerezo (#34)',
          data: [75, 0, 66.7, 100],
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        },
        {
          label: 'Elian García (#17)',
          data: [85, 100, 0, 0],
          backgroundColor: 'rgba(255, 206, 86, 0.4)',
          borderColor: 'rgba(255, 206, 86, 1)',
          pointBackgroundColor: 'rgba(255, 206, 86, 1)'
        },
        {
          label: 'Gael Amador (#21)',
          data: [80, 100, 33.3, 100],
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });
}

// LÓGICA DEL MODAL DE VALORACIÓN
let currentRating = 0;

function openFeedbackModal() {
  document.getElementById('feedback-modal').classList.remove('hidden');
}

function closeFeedbackModal() {
  document.getElementById('feedback-modal').classList.add('hidden');
  resetFeedbackForm();
}

function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.rating-stars span');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function resetFeedbackForm() {
  currentRating = 0;
  const commentInput = document.getElementById('feedback-comment');
  if (commentInput) commentInput.value = '';
  const stars = document.querySelectorAll('.rating-stars span');
  stars.forEach(star => star.classList.remove('active'));
}

async function submitFeedback() {
  const commentInput = document.getElementById('feedback-comment');
  const comment = commentInput ? commentInput.value.trim() : '';

  if (currentRating === 0) {
    alert('Por favor selecciona al menos una estrella para valorar.');
    return;
  }

  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data, error } = await supabaseClient.from('feedback').insert([
        {
          rating: currentRating,
          comment: comment,
          user_name: currentUser ? currentUser.name : 'Anónimo',
          user_email: currentUser ? currentUser.email : null
        }
      ]);

      if (error) throw error;

      alert('¡Muchas gracias por tus comentarios!');
      closeFeedbackModal();
    } catch (error) {
      console.error('Error al guardar la valoración:', error.message);
      alert('Hubo un error al guardar tu opinión. Inténtalo de nuevo.');
    }
  } else {
    alert('¡Muchas gracias por tus comentarios!');
    closeFeedbackModal();
  }
}