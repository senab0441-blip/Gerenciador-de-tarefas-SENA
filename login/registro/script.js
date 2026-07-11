// ==========================================================================
// 1. SELEÇÃO DOS ELEMENTOS
// ==========================================================================
// Centralizar os seletores no topo evita repetir document.getElementById()
// várias vezes espalhado pelo código.

const form = document.getElementById('registerForm');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const birthdateInput = document.getElementById('birthdate');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');

const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

const submitBtn = document.getElementById('submitBtn');
const formFeedback = document.getElementById('formFeedback');


// ==========================================================================
// 2. FUNÇÕES AUXILIARES DE UI
// ==========================================================================

/**
 * Marca um campo como inválido, mostra a mensagem de erro
 * e remove qualquer marcação de sucesso anterior.
 */
function setError(input, errorSpanId, message) {
  input.classList.add('form__input--error');
  input.classList.remove('form__input--success');
  document.getElementById(errorSpanId).textContent = message;
}

/**
 * Marca um campo como válido e limpa a mensagem de erro.
 */
function setSuccess(input, errorSpanId) {
  input.classList.remove('form__input--error');
  input.classList.add('form__input--success');
  document.getElementById(errorSpanId).textContent = '';
}

/**
 * Remove qualquer estado visual (usado quando o campo está vazio,
 * pra não mostrar erro antes do usuário digitar algo).
 */
function clearState(input, errorSpanId) {
  input.classList.remove('form__input--error', 'form__input--success');
  document.getElementById(errorSpanId).textContent = '';
}


// ==========================================================================
// 3. VALIDAÇÕES INDIVIDUAIS
// ==========================================================================

function validateUsername() {
  const value = usernameInput.value.trim();

  if (value === '') {
    clearState(usernameInput, 'usernameError');
    return false;
  }

  // Nome completo = pelo menos duas palavras (nome + sobrenome)
  const words = value.split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    setError(usernameInput, 'usernameError', 'Digite seu nome completo (nome e sobrenome).');
    return false;
  }

  setSuccess(usernameInput, 'usernameError');
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();

  if (value === '') {
    clearState(emailInput, 'emailError');
    return false;
  }

  // Regex simples e confiável para formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    setError(emailInput, 'emailError', 'Digite um e-mail válido.');
    return false;
  }

  setSuccess(emailInput, 'emailError');
  return true;
}

function validateBirthdate() {
  const value = birthdateInput.value;

  if (value === '') {
    clearState(birthdateInput, 'birthdateError');
    return false;
  }

  const birthDate = new Date(value);
  const today = new Date();

  // Calcula idade exata (considerando mês e dia, não só o ano)
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (birthDate > today) {
    setError(birthdateInput, 'birthdateError', 'Data de nascimento inválida.');
    return false;
  }

  if (age < 13) {
    setError(birthdateInput, 'birthdateError', 'Você precisa ter pelo menos 13 anos.');
    return false;
  }

  setSuccess(birthdateInput, 'birthdateError');
  return true;
}

/**
 * Avalia a força da senha e atualiza a barra visual + checklist.
 * Retorna true somente se todos os requisitos mínimos forem cumpridos.
 */
function validatePassword() {
  const value = passwordInput.value;

  const rules = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  // Atualiza visualmente cada item do checklist
  document.getElementById('ruleLength').classList.toggle('password-rules__item--valid', rules.length);
  document.getElementById('ruleUpper').classList.toggle('password-rules__item--valid', rules.upper);
  document.getElementById('ruleNumber').classList.toggle('password-rules__item--valid', rules.number);
  document.getElementById('ruleSpecial').classList.toggle('password-rules__item--valid', rules.special);

  const passedCount = Object.values(rules).filter(Boolean).length;

  if (value === '') {
    strengthFill.style.width = '0%';
    strengthLabel.textContent = '';
    clearState(passwordInput, 'passwordError');
    return false;
  }

  // Define a cor e o texto da barra de força
  const strengthLevels = [
    { width: '25%', color: 'var(--color-error)', label: 'Fraca' },
    { width: '50%', color: 'var(--color-warning)', label: 'Razoável' },
    { width: '75%', color: 'var(--color-warning)', label: 'Boa' },
    { width: '100%', color: 'var(--color-success)', label: 'Forte' },
  ];

  const level = strengthLevels[Math.max(passedCount - 1, 0)];
  strengthFill.style.width = level.width;
  strengthFill.style.backgroundColor = level.color;
  strengthLabel.textContent = level.label;

  const allRulesPassed = Object.values(rules).every(Boolean);

  if (!allRulesPassed) {
    setError(passwordInput, 'passwordError', 'A senha não atende a todos os requisitos.');
    return false;
  }

  setSuccess(passwordInput, 'passwordError');
  return true;
}

function validateConfirmPassword() {
  const value = confirmPasswordInput.value;

  if (value === '') {
    clearState(confirmPasswordInput, 'confirmPasswordError');
    return false;
  }

  if (value !== passwordInput.value) {
    setError(confirmPasswordInput, 'confirmPasswordError', 'As senhas não coincidem.');
    return false;
  }

  setSuccess(confirmPasswordInput, 'confirmPasswordError');
  return true;
}

function validateTerms() {
  const errorSpan = document.getElementById('termsError');

  if (!termsCheckbox.checked) {
    errorSpan.textContent = 'Você precisa aceitar os termos para continuar.';
    return false;
  }

  errorSpan.textContent = '';
  return true;
}


// ==========================================================================
// 4. VALIDAÇÃO EM TEMPO REAL (enquanto o usuário digita)
// ==========================================================================
// O evento "input" dispara a cada tecla digitada — dá feedback imediato,
// que é o padrão esperado em qualquer formulário moderno.

usernameInput.addEventListener('input', validateUsername);
emailInput.addEventListener('input', validateEmail);
birthdateInput.addEventListener('input', validateBirthdate);

passwordInput.addEventListener('input', () => {
  validatePassword();
  // Se a confirmação já tinha sido preenchida, revalida ela também,
  // porque a senha original pode ter mudado.
  if (confirmPasswordInput.value !== '') {
    validateConfirmPassword();
  }
});

confirmPasswordInput.addEventListener('input', validateConfirmPassword);
termsCheckbox.addEventListener('change', validateTerms);


// ==========================================================================
// 5. MOSTRAR / OCULTAR SENHA
// ==========================================================================

function setupPasswordToggle(button, input) {
  button.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const icon = button.querySelector('.form__toggle-password-icon');
    icon.textContent = isPassword ? '🙈' : '👁️';

    button.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
}

setupPasswordToggle(togglePasswordBtn, passwordInput);
setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);


// ==========================================================================
// 6. ENVIO DO FORMULÁRIO
// ==========================================================================

form.addEventListener('submit', function (event) {
  event.preventDefault(); // impede o recarregamento padrão da página

  // Roda todas as validações de uma vez, mesmo que o usuário
  // não tenha "tocado" em todos os campos ainda.
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isBirthdateValid = validateBirthdate();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  const isTermsValid = validateTerms();

  const allValid =
    isUsernameValid &&
    isEmailValid &&
    isBirthdateValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isTermsValid;

  if (!allValid) {
    formFeedback.textContent = 'Corrija os campos destacados antes de continuar.';
    formFeedback.className = 'form__feedback form__feedback--error';
    return;
  }

  // Aqui, num projeto real, você faria uma chamada fetch() pro backend:
  //
  // fetch('/api/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     fullName: usernameInput.value.trim(),
  //     email: emailInput.value.trim(),
  //     birthdate: birthdateInput.value,
  //     password: passwordInput.value,
  //   }),
  // })
  //   .then(response => response.json())
  //   .then(data => { /* tratar resposta do servidor */ })
  //   .catch(error => { /* tratar erro de rede */ });

  submitBtn.disabled = true;
  submitBtn.textContent = 'Criando conta...';

  // Simulação de requisição assíncrona
  setTimeout(() => {
    formFeedback.textContent = 'Conta criada com sucesso! 🎉';
    formFeedback.className = 'form__feedback form__feedback--success';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Criar conta';
    form.reset();

    // Limpa todos os estados visuais após o reset
    [usernameInput, emailInput, birthdateInput, passwordInput, confirmPasswordInput]
      .forEach(input => input.classList.remove('form__input--error', 'form__input--success'));

    strengthFill.style.width = '0%';
    strengthLabel.textContent = '';

    document.querySelectorAll('.password-rules__item').forEach(item => {
      item.classList.remove('password-rules__item--valid');
    });
  }, 1200);
});