(() => {
  const root = document.documentElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const preferences = ['system', 'light', 'dark'];
  let preference = 'system';

  try {
    const saved = localStorage.getItem('theme');
    if (preferences.includes(saved)) preference = saved;
  } catch (error) {
    console.warn('Theme preference could not be read; using the system theme.', error);
  }

  function applyTheme() {
    root.dataset.theme = preference === 'system'
      ? (systemTheme.matches ? 'dark' : 'light')
      : preference;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === preference));
    });
  }

  applyTheme();
  systemTheme.addEventListener('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => {
        preference = button.dataset.themeChoice;
        applyTheme();
        try {
          localStorage.setItem('theme', preference);
        } catch (error) {
          console.warn('Theme changed for this page but could not be saved.', error);
        }
      });
    });
    const nav = document.getElementById('nav');
    const updateNav = () => nav.classList.toggle('scrolled', scrollY > 8);
    updateNav();
    addEventListener('scroll', updateNav, { passive: true });
  });
})();
