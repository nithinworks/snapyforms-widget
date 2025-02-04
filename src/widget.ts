import './widget.css';

interface SnapyFormsConfig {
  formId: string;
  apiKey: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  options?: Array<{
    label: string;
    value: string;
  }>;
  youtubeUrl?: string;
}

interface FormMetadata {
  title: string;
  description: string;
  themeColor: string;
  fontFamily: string;
  bubbleIcon: string;
  submitButtonText: string;
}

interface EmbedSettings {
  position: {
    type: 'bottom-right' | 'bottom-left' | 'custom';
    customX?: number;
    customY?: number;
  };
  timing: {
    type: 'immediate' | 'delay' | 'scroll' | 'exit';
    delay?: number;
    scrollPercentage?: number;
  };
  urlRules: {
    showOn: string[];
    hideOn: string[];
  };
}

interface FormData {
  fields: FormField[];
  metadata: FormMetadata;
  embed_settings: EmbedSettings;
}

class SnapyForms {
  private config: SnapyFormsConfig;
  private container: HTMLElement | null = null;
  private formData: FormData | null = null;
  private isOpen: boolean = false;
  private fontLoaded: boolean = false;

  constructor(config: SnapyFormsConfig) {
    this.config = config;
    this.init();
  }

  private async init() {
    try {
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
      await this.loadFont();
      this.createContainer();
      this.renderBubble();
      this.applyTimingRules();
      this.applyUrlRules();
    } catch (error) {
      console.error('SnapyForms initialization failed:', error);
    }
  }

  private async loadFont() {
    if (!this.formData?.metadata.fontFamily || this.formData.metadata.fontFamily === 'inherit') {
      this.fontLoaded = true;
      return;
    }

    try {
      const fontName = this.formData.metadata.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      await document.fonts.ready;
      this.fontLoaded = true;
    } catch (error) {
      console.error('Font loading failed:', error);
      this.fontLoaded = true; // Continue with fallback font
    }
  }

  private getIconSvg(iconName: string): string {
    const icons = {
      MessageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
      MessageSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      Mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      HandHelpingIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M12 14v4"/><path d="M12 10V6"/><path d="M16 10h-8"/></svg>'
    };
    
    return icons[iconName as keyof typeof icons] || icons.MessageCircle;
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'snapyforms-container';
    
    if (this.formData?.metadata.fontFamily) {
      this.container.style.fontFamily = this.formData.metadata.fontFamily;
    }
    
    document.body.appendChild(this.container);
  }

  private generateStarRating(field: FormField) {
    const max = field.validation?.max || 5;
    return `
      <div class="snapyforms-star-rating" data-max="${max}">
        ${Array.from({ length: max }, (_, i) => i + 1).map(num => `
          <button type="button" class="star-btn" data-value="${num}" onclick="this.parentElement.querySelector('input').value=${num};this.parentElement.querySelectorAll('.star-btn').forEach((b,i)=>b.classList.toggle('active',i<${num}))">★</button>
        `).join('')}
        <input type="hidden" name="${field.id}" value="">
      </div>
    `;
  }

  private generateEmojiRating(field: FormField) {
    return `
      <div class="snapyforms-emoji-rating">
        ${["😢", "😕", "😐", "🙂", "😊"].map((emoji, i) => `
          <button type="button" onclick="this.parentElement.querySelector('input').value=${i + 1};this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));this.classList.add('active')">
            ${emoji}
          </button>
        `).join('')}
        <input type="hidden" name="${field.id}" value="">
      </div>
    `;
  }

  private generateFieldHTML(field: FormField) {
    const required = field.required ? 'required' : '';
    let inputHTML = '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        const pattern = field.validation?.pattern ? `pattern="${field.validation.pattern}"` : '';
        const min = field.validation?.min !== undefined ? `min="${field.validation.min}"` : '';
        const max = field.validation?.max !== undefined ? `max="${field.validation.max}"` : '';
        
        inputHTML = `
          <input 
            type="${field.type}" 
            class="snapyforms-input" 
            name="${field.id}" 
            placeholder="${field.placeholder || ''}"
            ${pattern}
            ${min}
            ${max}
            ${required}
          >
        `;
        break;

      case 'textarea':
        inputHTML = `
          <textarea 
            class="snapyforms-textarea" 
            name="${field.id}" 
            placeholder="${field.placeholder || ''}"
            ${required}
          ></textarea>
        `;
        break;

      case 'checkbox':
        inputHTML = `
          <label class="snapyforms-checkbox">
            <input type="checkbox" name="${field.id}" ${required}>
            <span class="checkmark"></span>
            <span class="label-text">${field.label}</span>
          </label>
        `;
        break;

      case 'radio':
        inputHTML = `
          <div class="snapyforms-radio-group">
            ${field.options?.map(option => `
              <label class="snapyforms-radio">
                <input type="radio" name="${field.id}" value="${option.value}" ${required}>
                <span class="radio-mark"></span>
                <span class="label-text">${option.label}</span>
              </label>
            `).join('')}
          </div>
        `;
        break;

      case 'file':
        inputHTML = `
          <label class="snapyforms-file">
            <input type="file" name="${field.id}" ${required}>
            <span class="file-label">Choose file</span>
          </label>
        `;
        break;

      case 'starRating':
        inputHTML = this.generateStarRating(field);
        break;

      case 'emojiRating':
        inputHTML = this.generateEmojiRating(field);
        break;

      case 'youtube':
        inputHTML = `
          <div class="snapyforms-youtube">
            <iframe
              src="${field.youtubeUrl}?modestbranding=1&showinfo=0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        `;
        break;
    }

    return `
      <div class="snapyforms-field">
        ${field.type !== 'checkbox' ? `
          <label class="snapyforms-label">
            ${field.label}
            ${required ? '<span class="required">*</span>' : ''}
          </label>
        ` : ''}
        ${inputHTML}
        ${field.validation?.message ? `
          <div class="snapyforms-error-message">${field.validation.message}</div>
        ` : ''}
      </div>
    `;
  }

  private generateFormHTML() {
    if (!this.formData) return '';

    return `
      <div class="snapyforms-header" style="background-color: ${this.formData.metadata.themeColor}">
        <button class="snapyforms-close" onclick="this.closest('.snapyforms-form').classList.remove('open')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="snapyforms-header-content">
          <h2>${this.formData.metadata.title}</h2>
          <p>${this.formData.metadata.description}</p>
        </div>
      </div>
      <div class="snapyforms-content">
        <form novalidate>
          ${this.formData.fields.map(field => this.generateFieldHTML(field)).join('')}
          <button type="submit" class="snapyforms-submit" style="background-color: ${this.formData.metadata.themeColor}">
            ${this.formData.metadata.submitButtonText}
          </button>
        </form>
      </div>
      <div class="snapyforms-footer">
        <a href="https://getlovable.io" target="_blank" rel="noopener noreferrer">
          Made with Lovable
        </a>
      </div>
    `;
  }

  private renderBubble() {
    if (!this.formData) return;

    const { position } = this.formData.embed_settings;
    const bubblePosition = position.type === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';

    const bubble = document.createElement('div');
    bubble.className = 'snapyforms-bubble';
    bubble.style.cssText = `background-color: ${this.formData.metadata.themeColor}; ${bubblePosition}`;
    
    const iconName = this.formData.metadata.bubbleIcon?.replace(/\s+/g, "") || "MessageCircle";
    bubble.innerHTML = this.getIconSvg(iconName);
    bubble.onclick = () => this.toggleForm();
    
    this.container?.appendChild(bubble);

    const form = document.createElement('div');
    form.className = 'snapyforms-form';
    form.style.cssText = position.type === 'bottom-left' ? 'left: 20px; right: auto;' : 'right: 20px; left: auto;';
    form.innerHTML = this.generateFormHTML();
    
    this.container?.appendChild(form);

    const formElement = form.querySelector('form');
    if (formElement) {
      formElement.onsubmit = (e) => this.handleSubmit(e);
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    if (!this.validateForm(form)) {
      return;
    }

    const formData = new FormData(form);
    const responseData: Record<string, any> = {};

    formData.forEach((value, key) => {
      responseData[key] = value;
    });

    try {
      form.classList.add('submitting');
      
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

      form.classList.remove('submitting');
      form.classList.add('submitted');
      
      setTimeout(() => {
        this.toggleForm();
        form.reset();
        form.classList.remove('submitted');
      }, 2000);

    } catch (error) {
      console.error('Form submission failed:', error);
      form.classList.remove('submitting');
      form.classList.add('error');
      
      setTimeout(() => {
        form.classList.remove('error');
      }, 3000);
    }
  }

  private validateForm(form: HTMLFormElement): boolean {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const field = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const fieldWrapper = field.closest('.snapyforms-field');
      
      if (field.hasAttribute('required') && !field.value) {
        isValid = false;
        fieldWrapper?.classList.add('error');
      } else if (field.type === 'email' && field.value && !this.validateEmail(field.value)) {
        isValid = false;
        fieldWrapper?.classList.add('error');
      } else if (field.type === 'tel' && field.value && !this.validatePhone(field.value)) {
        isValid = false;
        fieldWrapper?.classList.add('error');
      } else {
        fieldWrapper?.classList.remove('error');
      }
    });

    return isValid;
  }

  private validateEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  private validatePhone(phone: string): boolean {
    const pattern = /^\+[1-9]\d{1,14}$/;
    return pattern.test(phone);
  }

  private toggleForm() {
    const form = this.container?.querySelector('.snapyforms-form');
    if (form) {
      this.isOpen = !this.isOpen;
      form.classList.toggle('open', this.isOpen);
    }
  }

  private applyTimingRules() {
    if (!this.formData) return;

    const { timing } = this.formData.embed_settings;
    
    if (timing.type === 'delay' && timing.delay) {
      setTimeout(() => this.toggleForm(), timing.delay * 1000);
    } else if (timing.type === 'scroll' && timing.scrollPercentage) {
      this.handleScrollTiming(timing.scrollPercentage);
    } else if (timing.type === 'exit') {
      this.handleExitIntent();
    }
  }

  private handleScrollTiming(percentage: number) {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled >= percentage) {
        this.toggleForm();
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
  }

  private handleExitIntent() {
    const handleExit = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        this.toggleForm();
        document.removeEventListener('mouseleave', handleExit);
      }
    };
    document.addEventListener('mouseleave', handleExit);
  }

  private applyUrlRules() {
    if (!this.formData) return;

    const { urlRules } = this.formData.embed_settings;
    const currentPath = window.location.pathname;

    if (urlRules.hideOn.some(rule => new RegExp(rule).test(currentPath))) {
      this.container?.remove();
    } else if (urlRules.showOn.length > 0 && !urlRules.showOn.some(rule => new RegExp(rule).test(currentPath))) {
      this.container?.remove();
    }
  }
}

(window as any).SnapyForms = SnapyForms;

export default SnapyForms;
