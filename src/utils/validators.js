// Validações de formulários em português brasileiro

// Regex para validação de email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex para validação de senha forte (mínimo 6 caracteres, pelo menos uma letra e um número)
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Regex para validação de nome (mínimo 3 caracteres, apenas letras e espaços)
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]{3,}$/;

/**
 * Valida se o email está em formato válido
 * @param {string} email - Email a ser validado
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Email é obrigatório'
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      message: 'Por favor, insira um email válido'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Valida se a senha atende aos critérios de segurança
 * @param {string} password - Senha a ser validada
 * @returns {object} - { isValid: boolean, message: string, strength: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: 'Senha é obrigatória',
      strength: 'weak'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Senha deve ter pelo menos 6 caracteres',
      strength: 'weak'
    };
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: 'Senha deve conter pelo menos uma letra e um número',
      strength: 'medium'
    };
  }

  // Calcular força da senha
  let strength = 'weak';
  if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
    strength = 'medium';
  }

  return {
    isValid: true,
    message: '',
    strength
  };
};

/**
 * Valida se o nome está em formato válido
 * @param {string} name - Nome a ser validado
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      message: 'Nome é obrigatório'
    };
  }

  if (name.trim().length < 3) {
    return {
      isValid: false,
      message: 'Nome deve ter pelo menos 3 caracteres'
    };
  }

  if (!NAME_REGEX.test(name.trim())) {
    return {
      isValid: false,
      message: 'Nome deve conter apenas letras e espaços'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Valida se a confirmação de senha confere com a senha original
 * @param {string} password - Senha original
 * @param {string} confirmPassword - Confirmação da senha
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      isValid: false,
      message: 'Confirmação de senha é obrigatória'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'As senhas não coincidem'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Valida um formulário completo de registro
 * @param {object} formData - Dados do formulário { name, email, password, confirmPassword }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateRegistrationForm = (formData) => {
  const { name, email, password, confirmPassword } = formData;
  const errors = {};

  // Validar nome
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }

  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  // Validar senha
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  // Validar confirmação de senha
  const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    passwordStrength: passwordValidation.strength
  };
};

/**
 * Valida um formulário de login
 * @param {object} formData - Dados do formulário { email, password }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const { email, password } = formData;
  const errors = {};

  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  // Validar senha
  if (!password || password.trim() === '') {
    errors.password = 'Senha é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida se um email já está cadastrado
 * @param {string} email - Email a ser verificado
 * @param {Array} users - Array de usuários cadastrados
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmailUniqueness = (email, users) => {
  if (!users || !Array.isArray(users)) {
    return {
      isValid: true,
      message: ''
    };
  }

  const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (emailExists) {
    return {
      isValid: false,
      message: 'Este email já está cadastrado'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Sanitiza uma string removendo caracteres especiais perigosos
 * @param {string} str - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Valida se uma string não está vazia após sanitização
 * @param {string} str - String a ser validada
 * @param {string} fieldName - Nome do campo para mensagem de erro
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateRequiredField = (str, fieldName = 'Campo') => {
  const sanitized = sanitizeString(str);
  
  if (!sanitized) {
    return {
      isValid: false,
      message: `${fieldName} é obrigatório`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Exportar todas as validações como um objeto para facilitar o uso
export const validators = {
  email: validateEmail,
  password: validatePassword,
  name: validateName,
  passwordConfirmation: validatePasswordConfirmation,
  registrationForm: validateRegistrationForm,
  loginForm: validateLoginForm,
  emailUniqueness: validateEmailUniqueness,
  required: validateRequiredField,
  sanitize: sanitizeString
};

export default validators;
