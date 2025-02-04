# SnapyForms Widget

This is the embeddable widget for SnapyForms that can be added to any website to display your forms.

## Installation

Add the following script to your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/your-username/snapyforms-widget@1.0.0/dist/widget.min.js"></script>
<script>
  new SnapyForms({
    formId: 'your-form-id',
    apiKey: 'your-supabase-anon-key'
  });
</script>
