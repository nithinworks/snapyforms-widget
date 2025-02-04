interface SnapyFormsConfig {
  formId: string;
  apiKey: string;
}

class SnapyForms {
  private config: SnapyFormsConfig;
  private container: HTMLElement | null = null;
  private formData: any = null;
  private isOpen: boolean = false;

  constructor(config: SnapyFormsConfig) {
    this.config = config;
    this.init();
  }

  private async init() {
    try {
      // Fetch form configuration
      const response = await fetch(
        `https://cwcyjjogegbttltkextf.supabase.co/functions/v1/get-published-form?formId=${this.config.formId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load form configuration');
      }

      this.formData = await response.json();
      this.createContainer();
      this.renderBubble();
    } catch (error) {
      console.error('SnapyForms initialization failed:', error);
    }
  }

  private createContainer() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'snapyforms-container';
    document.body.appendChild(this.container);

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #snapyforms-container {
        position: fixed;
        z-index: 9999;
        font-family: ${this.formData.metadata.fontFamily || 'system-ui'};
      }

      .snapyforms-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${this.formData.metadata.themeColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .snapyforms-bubble:hover {
        transform: scale(1.1);
      }

      .snapyforms-form {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 360px;
        max-height: 70vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .snapyforms-form.open {
        display: flex;
        animation: snapyforms-slide-up 0.3s ease-out;
      }

      @keyframes snapyforms-slide-up {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .snapyforms-header {
        padding: 16px;
        background-color: ${this.formData.metadata.themeColor};
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .snapyforms-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .snapyforms-close:hover {
        opacity: 1;
      }

      .snapyforms-content {
        padding: 16px;
        overflow-y: auto;
      }

      .snapyforms-field {
        margin-bottom: 16px;
      }

      .snapyforms-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .snapyforms-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 14px;
      }

      .snapyforms-input:focus {
        outline: none;
        border-color: ${this.formData.metadata.themeColor};
        box-shadow: 0 0 0 1px ${this.formData.metadata.themeColor};
      }

      .snapyforms-submit {
        width: 100%;
        padding: 10px;
        background-color: ${this.formData.metadata.themeColor};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .snapyforms-submit:hover {
        opacity: 0.9;
      }

      .snapyforms-error {
        color: #e53e3e;
        font-size: 12px;
        margin-top: 4px;
      }
    `;
    document.head.appendChild(styles);
  }

  private renderBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'snapyforms-bubble';
    bubble.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
    bubble.onclick = () => this.toggleForm();
    this.container?.appendChild(bubble);

    // Create form container
    const form = document.createElement('div');
    form.className = 'snapyforms-form';
    form.innerHTML = this.generateFormHTML();
    this.container?.appendChild(form);

    // Add form submit handler
    const formElement = form.querySelector('form');
    if (formElement) {
      formElement.onsubmit = (e) => this.handleSubmit(e);
    }
  }

  private generateFormHTML() {
    return `
      <div class="snapyforms-header">
        <div>
          <h2 style="margin: 0; font-size: 18px;">${this.formData.metadata.title}</h2>
          <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">${this.formData.metadata.description}</p>
        </div>
        <button class="snapyforms-close" onclick="this.toggleForm()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="snapyforms-content">
        <form>
          ${this.formData.fields.map(field => this.generateFieldHTML(field)).join('')}
          <button type="submit" class="snapyforms-submit">
            ${this.formData.metadata.submitButtonText || 'Submit'}
          </button>
        </form>
      </div>
    `;
  }

  private generateFieldHTML(field: any) {
    const required = field.required ? 'required' : '';
    let inputHTML = '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        inputHTML = `<input type="${field.type}" class="snapyforms-input" name="${field.id}" placeholder="${field.placeholder || ''}" ${required}>`;
        break;
      case 'textarea':
        inputHTML = `<textarea class="snapyforms-input" name="${field.id}" placeholder="${field.placeholder || ''}" ${required}></textarea>`;
        break;
      default:
        inputHTML = `<input type="text" class="snapyforms-input" name="${field.id}" placeholder="${field.placeholder || ''}" ${required}>`;
    }

    return `
      <div class="snapyforms-field">
        <label class="snapyforms-label">
          ${field.label}
          ${required ? '<span style="color: #e53e3e;">*</span>' : ''}
        </label>
        ${inputHTML}
      </div>
    `;
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const responseData: Record<string, any> = {};

    formData.forEach((value, key) => {
      responseData[key] = value;
    });

    try {
      const response = await fetch(
        'https://cwcyjjogegbttltkextf.supabase.co/functions/v1/submit-form-response',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            formId: this.config.formId,
            responseData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Show success message and close form
      alert('Form submitted successfully!');
      this.toggleForm();
      form.reset();
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Failed to submit form. Please try again.');
    }
  }

  private toggleForm() {
    const form = this.container?.querySelector('.snapyforms-form');
    if (form) {
      this.isOpen = !this.isOpen;
      form.classList.toggle('open', this.isOpen);
    }
  }
}

// Make SnapyForms available globally
(window as any).SnapyForms = SnapyForms;

export default SnapyForms;
