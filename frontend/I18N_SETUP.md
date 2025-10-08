# i18next Setup Guide for ExpenseEase Frontend

This guide explains how to use the i18next internationalization setup in your React application with English and Sinhala language support.

## 📁 File Structure

```
src/
├── i18n/
│   ├── index.js                    # i18next configuration
│   └── locales/
│       ├── en/
│       │   └── translation.json    # English translations
│       └── si/
│           └── translation.json    # Sinhala translations
├── components/
│   └── LanguageSwitcher.jsx        # Language switcher component
└── pages/
    └── Login.jsx                   # Example component using translations
```

## 🚀 Quick Start

### 1. Using Translations in Components

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. Language Switching

The `LanguageSwitcher` component is already included and can be used anywhere:

```jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### 3. Programmatic Language Change

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeToSinhala = () => {
    i18n.changeLanguage('si');
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage('en');
  };
  
  return (
    <div>
      <button onClick={changeToSinhala}>සිංහල</button>
      <button onClick={changeToEnglish}>English</button>
    </div>
  );
}
```

## 📝 Translation Keys Structure

### Available Translation Keys

```json
{
  "welcome": {
    "title": "Welcome to",
    "appName": "ExpenseEase",
    "description": "Manage your spending effortlessly...",
    "features": {
      "secure": "Secure",
      "fast": "Fast",
      "private": "Private"
    }
  },
  "login": {
    "title": "Sign in",
    "subtitle": "to continue to ExpenseEase",
    "email": "Email",
    "password": "Password",
    "emailPlaceholder": "you@example.com",
    "passwordPlaceholder": "••••••••",
    "loginButton": "Login",
    "loggingIn": "Logging in…",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up"
  },
  "signup": {
    "title": "Create Account",
    "subtitle": "Join ExpenseEase today",
    "firstName": "First Name",
    "lastName": "Last Name",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "signUpButton": "Sign Up",
    "signingUp": "Creating account…",
    "hasAccount": "Already have an account?",
    "signIn": "Sign in"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back",
    "totalExpenses": "Total Expenses",
    "thisMonth": "This Month",
    "recentTransactions": "Recent Transactions"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "transactions": "Transactions",
    "profile": "Profile",
    "logout": "Logout"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "date": "Date",
    "amount": "Amount",
    "category": "Category",
    "description": "Description"
  }
}
```

## 🔧 Configuration Details

### i18next Configuration (`src/i18n/index.js`)

- **Default Language**: English (`en`)
- **Fallback Language**: English (`en`)
- **Language Detection**: localStorage, navigator, htmlTag
- **Debug Mode**: Enabled in development
- **Caching**: localStorage for language preference

### Language Codes

- `en` - English
- `si` - Sinhala (සිංහල)

## 🎯 Usage Examples

### Basic Translation

```jsx
// Simple text
{t('common.save')}

// Nested keys
{t('welcome.features.secure')}

// With fallback
{t('some.key', 'Default text if key not found')}
```

### Dynamic Content

```jsx
// With interpolation
{t('welcome.message', { name: 'John' })}

// In translation.json:
// "welcome": {
//   "message": "Welcome, {{name}}!"
// }
```

### Pluralization

```jsx
// For plural forms
{t('items.count', { count: 5 })}

// In translation.json:
// "items": {
//   "count_one": "{{count}} item",
//   "count_other": "{{count}} items"
// }
```

## 🌐 Adding New Languages

1. Create a new directory in `src/i18n/locales/` (e.g., `ta` for Tamil)
2. Add `translation.json` with all required keys
3. Update `src/i18n/index.js` to include the new language:

```javascript
import taTranslation from './locales/ta/translation.json';

const resources = {
  en: { translation: enTranslation },
  si: { translation: siTranslation },
  ta: { translation: taTranslation }  // Add new language
};
```

4. Update the `LanguageSwitcher` component to include the new language option

## 📱 Language Persistence

The current language is automatically saved to localStorage and will be restored on page reload. Users can switch languages using the language switcher component.

## 🐛 Troubleshooting

### Common Issues

1. **Translation not showing**: Check if the key exists in both language files
2. **Language not switching**: Ensure the language code matches exactly (`en`, `si`)
3. **Missing translations**: Add the missing keys to the translation files

### Debug Mode

Enable debug mode by setting `debug: true` in the i18next configuration to see detailed logging.

## 📚 Additional Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Sinhala Unicode Support](https://unicode.org/charts/PDF/U0D80.pdf)

## 🔄 Updating Translations

To add new translation keys:

1. Add the key to both `en/translation.json` and `si/translation.json`
2. Use the key in your components with `t('your.new.key')`
3. Test both languages to ensure proper display

---

**Note**: The setup is complete and ready to use. The Login component has been updated as an example. You can now use the `useTranslation` hook in any component to access translations.
