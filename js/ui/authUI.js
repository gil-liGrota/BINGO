import { AuthService } from '../services/auth.service.js';

export class AuthUI {
  constructor() {
    this.form = document.getElementById('auth-form');
    this.usernameInput = document.getElementById('auth-username');
    this.passwordInput = document.getElementById('auth-password');
    this.loginBtn = document.getElementById('login-btn');
    this.registerBtn = document.getElementById('register-btn');
    this.errorMsg = document.getElementById('auth-error');

    this.onSuccessCallback = null;
  }

  init(onSuccessCallback) {
    this.onSuccessCallback = onSuccessCallback;
    this.clearForm();

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (this.registerBtn) {
      this.registerBtn.addEventListener('click', (e) => this.handleRegister(e));
    }
  }

  async handleLogin(event) {
    if (event) event.preventDefault();
    this.clearError();

    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showError('נא למלא את כל השדות!');
      return;
    }

    try {
      this.setLoading(true);
      const user = await AuthService.login(username, password);
      this.clearForm();
      
      if (typeof this.onSuccessCallback === 'function') {
        this.onSuccessCallback(user);
      }
    } catch (error) {
      this.showError(this.translateErrorMessage(error.message));
    } finally {
      this.setLoading(false);
    }
  }

    async handleRegister(event) {
        if (event) event.preventDefault();
        this.clearError();

        const username = this.usernameInput ? this.usernameInput.value.trim() : '';
        const password = this.passwordInput ? this.passwordInput.value : '';

        if (!username || !password) {
            this.showError('נא למלא שם משתמש וסיסמה!');
            return;
        }

        if (password.length < 6) {
            this.showError('הסיסמה חייבת להכיל לפחות 6 תווים!');
            return;
        }

        // המרת שם המשתמש לאימייל חוקי עבור Firebase Auth במידת הצורך
        const email = username.includes('@') ? username : `${username}@bingo.app`;

        try {
            this.setLoading(true);
            const user = await AuthService.register(email, password, username);
            this.clearForm();

            if (typeof this.onSuccessCallback === 'function') {
            this.onSuccessCallback(user);
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError(this.translateErrorMessage(error.message));
        } finally {
            this.setLoading(false);
        }
    }

  showError(message) {
    if (this.errorMsg) {
      this.errorMsg.textContent = message;
      this.errorMsg.classList.remove('hidden');
    }
  }

  clearError() {
    if (this.errorMsg) {
      this.errorMsg.textContent = '';
      this.errorMsg.classList.add('hidden');
    }
  }

  clearForm() {
    if (this.usernameInput) this.usernameInput.value = '';
    if (this.passwordInput) this.passwordInput.value = '';
    this.clearError();
  }

  setLoading(isLoading) {
    if (this.loginBtn) this.loginBtn.disabled = isLoading;
    if (this.registerBtn) this.registerBtn.disabled = isLoading;
  }

  translateErrorMessage(errorMsg) {
    if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password') || errorMsg.includes('auth/invalid-credential')) {
      return 'שם משתמש או סיסמה שגויים';
    }
    if (errorMsg.includes('auth/email-already-in-use')) {
      return 'שם המשתמש כבר תפוס, נסה להתחבר';
    }
    if (errorMsg.includes('auth/weak-password')) {
      return 'הסיסמה חלשה מדי (לפחות 6 תווים)';
    }
    return errorMsg || 'התרחשה שגיאה, נסה שוב מאוחר יותר';
  }

    bindEvents() {
    const registerBtn = document.getElementById('registerBtn'); // ודאי את ה-ID המדויק מ-index.html
    
    if (registerBtn) {
        registerBtn.onclick = async (e) => {
        e.preventDefault();
        await this.handleRegister();
        };
    }
    }
}