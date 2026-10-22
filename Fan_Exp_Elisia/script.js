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
      // Si ya completó la trivia, lo enviamos directo a los resultados
      score = parseInt(savedScore || '0', 10);
      const maxPossibleScore = TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION;
      document.getElementById('score-text').textContent = `Obtuviste ${score} de ${maxPossibleScore} puntos posibles.`;
      showScreen('result-screen');
    } else {
      // Si solo completó el registro pero no ha hecho la trivia
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

  // Si se abre la pantalla de estadísticas, renderizar las gráficas de estrella
  if (screenId === 'stats-screen' && !chartsInitialized) {
    initRadarCharts();
    chartsInitialized = true;
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

  // Guardar datos del registro en localStorage
  localStorage.setItem('rw_user', JSON.stringify(currentUser));

  showScreen('start-screen');
  document.getElementById('welcome-message').textContent = `Hola, ${currentUser.name}. ¡Demuestra tus conocimientos!`;
}

// Función opcional por si deseas permitir que cambien de usuario o reinicien el registro
function resetSession() {
  localStorage.removeItem('rw_user');
  localStorage.removeItem('rw_completed');
  localStorage.removeItem('rw_score');
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

  // Marcar como completado y guardar puntaje en el navegador
  localStorage.setItem('rw_completed', 'true');
  localStorage.setItem('rw_score', score.toString());

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

// Inicialización de Gráficas de Radar
function initRadarCharts() {
  const commonRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
        pointLabels: { color: '#ffffff', font: { size: 10 } },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { labels: { color: '#ffffff' }, position: 'bottom' }
    }
  };

  // 1. Gráfica de Quarterbacks (Pase y Tierra)
  new Chart(document.getElementById('qbChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['% Efectividad', 'Yardas Pase', 'Yardas Acarreo', 'Touchdowns (Pase)', 'Primeros Downs'],
      datasets: [
        {
          label: 'Fernando Escalona (#14)',
          data: [54, 100, 68.4, 100, 87.5], // 54% efect, 296 yd pase, 80 yd acarreo, 2 TD, 7 1st Downs
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        },
        {
          label: 'Iker Muñoz (#9)',
          data: [38, 100, 100, 50, 100], // 38% efect, 296 yd pase, 117 yd acarreo, 1 TD, 8 1st Downs
          backgroundColor: 'rgba(227, 24, 55, 0.4)',
          borderColor: 'rgba(227, 24, 55, 1)',
          pointBackgroundColor: 'rgba(227, 24, 55, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 2. Gráfica de Corredores (Aporte Terrestre)
  new Chart(document.getElementById('rbChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Acarreos', 'Yardas', 'Promedio yd/acarreo', 'Touchdowns'],
      datasets: [
        {
          label: 'Moisés Díaz (#20)',
          data: [100, 100, 92.6, 100], // 14 acarreos, 63 yd, 4.50 yd/prom, 2 TD
          backgroundColor: 'rgba(40, 167, 69, 0.4)',
          borderColor: 'rgba(40, 167, 69, 1)',
          pointBackgroundColor: 'rgba(40, 167, 69, 1)'
        },
        {
          label: 'Emiliano Hernández (#32)',
          data: [50, 54, 100, 0], // 7 acarreos, 34 yd, 4.86 yd/prom, 0 TD
          backgroundColor: 'rgba(255, 193, 7, 0.4)',
          borderColor: 'rgba(255, 193, 7, 1)',
          pointBackgroundColor: 'rgba(255, 193, 7, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 3. Gráfica de Receptores (Volumen, Eficiencia y Explosividad)
  new Chart(document.getElementById('wrChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Recepciones', 'Yardas Recibidas', 'Promedio yd/rec', 'Touchdowns'],
      datasets: [
        {
          label: 'Genaro Flores (#0)',
          data: [81.8, 75.4, 35.9, 0], // 9 rec, 95 yd, 7.8 prom, 0 TD
          backgroundColor: 'rgba(153, 102, 255, 0.4)',
          borderColor: 'rgba(153, 102, 255, 1)',
          pointBackgroundColor: 'rgba(153, 102, 255, 1)'
        },
        {
          label: 'André Vergara (#18)',
          data: [100, 100, 53.0, 0], // 11 rec, 126 yd, 11.5 prom, 0 TD
          backgroundColor: 'rgba(255, 159, 64, 0.4)',
          borderColor: 'rgba(255, 159, 64, 1)',
          pointBackgroundColor: 'rgba(255, 159, 64, 1)'
        },
        {
          label: 'Sigfrido López (#6)',
          data: [90.9, 85.7, 49.8, 100], // 10 rec, 108 yd, 10.8 prom, 2 TD
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        },
        {
          label: 'Santiago Vargas (#19)',
          data: [0, 0, 100, 0], // 0 rec (retornos), 65 yd ret, 21.7 prom
          backgroundColor: 'rgba(201, 203, 207, 0.4)',
          borderColor: 'rgba(201, 203, 207, 1)',
          pointBackgroundColor: 'rgba(201, 203, 207, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

  // 4. Gráfica Defensiva (Líderes Defensivos)
  new Chart(document.getElementById('defChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Tackleadas', 'Capturas', 'Intercepciones', 'Fumbles Rec.'],
      datasets: [
        {
          label: 'Emilio Salvador (#28)',
          data: [100, 0, 100, 0], // 20 tck, 0 cap, 3 int, 0 fum
          backgroundColor: 'rgba(255, 99, 132, 0.4)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)'
        },
        {
          label: 'Santiago Cerezo (#34)',
          data: [75, 0, 66.7, 100], // 15 tck, 0 cap, 2 int, 1 fum
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        },
        {
          label: 'Elian García (#17)',
          data: [85, 100, 0, 0], // 17 tck, 1 cap, 0 int, 0 fum
          backgroundColor: 'rgba(255, 206, 86, 0.4)',
          borderColor: 'rgba(255, 206, 86, 1)',
          pointBackgroundColor: 'rgba(255, 206, 86, 1)'
        },
        {
          label: 'Gael Amador (#21)',
          data: [80, 100, 33.3, 100], // 16 tck, 1 cap, 1 int, 1 fum
          backgroundColor: 'rgba(75, 192, 192, 0.4)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        }
      ]
    },
    options: commonRadarOptions
  });

}