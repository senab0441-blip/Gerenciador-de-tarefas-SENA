// ==========================================================================
// 1. SELEÇÃO DOS ELEMENTOS
// ==========================================================================

const form = document.getElementById('loginForm');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const togglePasswordBtn = document.getElementById('togglePassword');

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
// No login, a validação é mais simples que no cadastro: só precisamos
// checar se os campos foram preenchidos. Quem confere se o usuário e a
// senha realmente existem e batem é o backend, não o front-end.

function validateUsername() {
  const value = usernameInput.value.trim();

  if (value === '') {
    clearState(usernameInput, 'usernameError');
    return false;
  }

  setSuccess(usernameInput, 'usernameError');
  return true;
}

function validatePassword() {
  const value = passwordInput.value;

  if (value === '') {
    clearState(passwordInput, 'passwordError');
    return false;
  }

  setSuccess(passwordInput, 'passwordError');
  return true;
}


// ==========================================================================
// 4. VALIDAÇÃO EM TEMPO REAL (enquanto o usuário digita)
// ==========================================================================

usernameInput.addEventListener('input', validateUsername);
passwordInput.addEventListener('input', validatePassword);


// ==========================================================================
// 5. MOSTRAR / OCULTAR SENHA
// ==========================================================================

togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';

  const icon = togglePasswordBtn.querySelector('.form__toggle-password-icon');
  icon.textContent = isPassword ? '🙈' : '👁️';

  togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});


// ==========================================================================
// 6. ENVIO DO FORMULÁRIO
// ==========================================================================

form.addEventListener('submit', function (event) {
  event.preventDefault(); // impede o recarregamento padrão da página

  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();

  const allValid = isUsernameValid && isPasswordValid;

  if (!allValid) {
    formFeedback.textContent = 'Preencha seu nome e senha para continuar.';
    formFeedback.className = 'form__feedback form__feedback--error';
    return;
  }

  // Aqui, num projeto real, você faria uma chamada fetch() pro backend
  // pra checar se o usuário e a senha realmente existem e batem:
  //
  // fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     username: usernameInput.value.trim(),
  //     password: passwordInput.value,
  //   }),
  // })
  //   .then(response => {
  //     if (!response.ok) throw new Error('Credenciais inválidas');
  //     return response.json();
  //   })
  //   .then(data => { /* redirecionar o usuário logado, ex: window.location.href = '/dashboard' */ })
  //   .catch(error => {
  //     formFeedback.textContent = 'Nome ou senha incorretos.';
  //     formFeedback.className = 'form__feedback form__feedback--error';
  //   });

  submitBtn.disabled = true;
  submitBtn.textContent = 'Entrando...';

  // Simulação de requisição assíncrona
  setTimeout(() => {
    formFeedback.textContent = 'Login realizado com sucesso! 🎉';
    formFeedback.className = 'form__feedback form__feedback--success';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';
  }, 1200);
});