export function validateUsername(
    value: string,
    mode: string,
    setError?: (msg: string | null) => void,
  ): boolean {
    if(mode === 'signup') {
      if (value.trim() === '') {
        setError?.('שם משתמש לא יכול להיות ריק');
        return false;
      }
      if (!/^[A-Z][a-z]+\.[A-Z][a-z]+$/.test(value)) {
        setError?.('שם המשתמש צריך להיות בפורמט: שם פרטי.שם משפחה (עם אות גדולה בתחילת כל מילה');
        return false;
      }
      if (value.length < 3) {
        setError?.('שם םשתמש חייב להיות להיוך באורך של לפחות 3 תווים');
        return false;
      }
    }
    if(mode === 'signupLight' || mode === 'login')
    {
      if (value.trim() === '') {
        setError?.('שם משתמש לא יכול להיות ריק');
        return false;
      }
      if (value.length < 3) {
        setError?.('שם םשתמש חייב להיות להיוך באורך של לפחות 3 תווים');
        return false;
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
        setError?.('שם םשתמש יכול להכיל אותיות באנגלית, מספרים וקו תחתון בלבד');
        return false;
      }
    }
  
    setError?.(null);
    return true;
  }
  
  export function validatePassword(
    value: string,
    setError?: (msg: string | null) => void
  ): boolean {
    if (value.trim() === '') {
      setError?.('סיסמה לא יכולה להיות ריקה');
      return false;
    }
    if (value.length < 6) {
      setError?.('סיסמה חייבת להיות באורך של לפחות 6 תווים');
      return false;
    }

    setError?.(null);
    return true;
  }