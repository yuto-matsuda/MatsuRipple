import { useState } from 'react';
import { registerUser } from '../api/auth';

interface RegisterForm {
    username: string;
    email: string;
    password: string;
}

interface ValidationErrors {
    username?: string;
    email?: string;
    password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form: RegisterForm): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!form.username.trim()) errors.username = 'ユーザー名を入力してください';
    if (!EMAIL_REGEX.test(form.email)) errors.email = '有効なメールアドレスを入力してください';
    if (form.password.length < 8) errors.password = 'パスワードは8文字以上で入力してください';
    return errors;
};

const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const register = async (form: RegisterForm): Promise<boolean> => {
        const errors = validate(form);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }
        setValidationErrors({});
        setServerError(null);
        setLoading(true);
        try {
            await registerUser(form.username, form.email, form.password);
            return true;
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            if (detail === 'Email already registered') {
                setServerError('このメールアドレスはすでに登録されています');
            } else if (detail === 'Username already registered') {
                setServerError('このユーザー名はすでに使用されています');
            } else {
                setServerError('登録に失敗しました。もう一度お試しください');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, serverError, validationErrors };
};

export default useRegister;
