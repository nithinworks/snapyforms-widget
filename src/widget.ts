// At the top of your widget.ts file
import './widget.css';
// Widget initialization and configuration
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
    this.container = document.createElement('div');
    this.container.id = 'snapyforms-container';
    document.body.appendChild(this.container);

    // Create and append stylesheet link
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'widget.css';
    document.head.appendChild(styleLink);
  }

  private getIconSvg(iconName: string) {
    const icons = {
      MessageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
      MessageSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      Mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      HandHelpingIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M12 14v4"/><path d="M12 10V6"/><path d="M16 10h-8"/></svg>'
    };
    return icons[iconName as keyof typeof icons] || icons.MessageCircle;
  }

  private generateFormHTML() {
    return `
      <div class="snapyforms-header" style="background-color: ${this.formData.metadata.themeColor || '#0EA5E9'}">
        <button class="snapyforms-close" onclick="this.closest('.snapyforms-form').classList.remove('open')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div>
          <h2>${this.formData.metadata.title}</h2>
          <p>${this.formData.metadata.description}</p>
        </div>
      </div>
      <div class="snapyforms-content">
        <form>
          ${this.formData.fields.map(field => this.generateFieldHTML(field)).join('')}
          <button type="submit" class="snapyforms-submit" style="background-color: ${this.formData.metadata.themeColor || '#0EA5E9'}">
            ${this.formData.metadata.submitButtonText || 'Submit'}
          </button>
        </form>
        <div class="snapyforms-footer">
          <a href="https://getlovable.io" target="_blank" rel="noopener noreferrer">
            Made with Lovable
          </a>
        </div>
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
        inputHTML = `<textarea class="snapyforms-textarea" name="${field.id}" placeholder="${field.placeholder || ''}" ${required}></textarea>`;
        break;
      case 'emojiRating':
        inputHTML = `
          <div class="snapyforms-rating">
            ${["😢", "😕", "😐", "🙂", "😊"].map((emoji, i) => `
              <button type="button" onclick="this.parentElement.querySelector('input').value=${i + 1};this.parentElement.querySelectorAll('button').forEach(b => b.style.transform = '');this.style.transform = 'scale(1.1)'">
                ${emoji}
              </button>
            `).join('')}
            <input type="hidden" name="${field.id}" value="">
          </div>
        `;
        break;
      case 'youtube':
        inputHTML = `
          <div class="snapyforms-youtube">
            <iframe
              src="${field.youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}?modestbranding=1&showinfo=0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        `;
        break;
    }

    return `
      <div class="snapyforms-field">
        <label class="snapyforms-label">
          ${field.label}
          ${required ? '<span style="color: red">*</span>' : ''}
        </label>
        ${inputHTML}
      </div>
    `;
  }

  private renderBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'snapyforms-bubble';
    bubble.style.backgroundColor = this.formData.metadata.themeColor || '#0EA5E9';
    const iconName = this.formData.metadata.bubbleIcon?.replace(/\s+/g, "") || "MessageCircle";
    bubble.innerHTML = this.getIconSvg(iconName);
    bubble.onclick = () => this.toggleForm();
    this.container?.appendChild(bubble);

    const form = document.createElement('div');
    form.className = 'snapyforms-form';
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

(window as any).SnapyForms = SnapyForms;

export default SnapyForms;
