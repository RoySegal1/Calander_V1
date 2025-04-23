export function validateUsername(
    value: string,
    setError?: (msg: string | null) => void
  ): boolean {
    if (value.trim() === '') {
      setError?.('Username cannot be empty.');
      return false;
    }
    if (!/^[A-Z][a-z]+\.[A-Z][a-z]+$/.test(value)) {
      setError?.('Username must be in the format Firstname.Lastname');
      return false;
    }
    if (value.length < 3) {
      setError?.('Username must be at least 3 characters long.');
      return false;
    }
  
    setError?.(null);
    return true;
  }
  
  export function validatePassword(
    value: string,
    setError?: (msg: string | null) => void
  ): boolean {
    if (value.trim() === '') {
      setError?.('Password cannot be empty.');
      return false;
    }
    if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
      ) {
        setError?.(
          'Password must include uppercase, lowercase, number, , special character and at least 8 characters.'
        );
        return false;
      }
    setError?.(null);
    return true;
  }