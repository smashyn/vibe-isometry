import { registerHandler } from './handlers/registerHandler';
import { loginHandler } from './handlers/loginHandler';
import { resetPasswordHandler } from './handlers/resetPasswordHandler';
import { createCharacterHandler } from './handlers/createCharacterHandler';
import { updateCharacterHandler } from './handlers/updateCharacterHandler';
import { deleteCharacterHandler } from './handlers/deleteCharacterHandler';
import { verifyTokenHandler } from './handlers/verifyTokenHandler'; // Додаємо імпорт
import { isRoute } from '../../utils/rest';
import { authMiddleware } from './middleware/authMiddleware';

export function handleUserRoutes(req: any, res: any): boolean {
    if (isRoute(req, 'POST', '/api/register')) {
        registerHandler(req, res);
        return true;
    }
    if (isRoute(req, 'POST', '/api/login')) {
        loginHandler(req, res);
        return true;
    }
    if (isRoute(req, 'POST', '/api/reset-password')) {
        resetPasswordHandler(req, res);
        return true;
    }
    if (isRoute(req, 'POST', '/api/verify')) {
        verifyTokenHandler(req, res);
        return true;
    }
    if (isRoute(req, 'POST', '/api/create-character')) {
        authMiddleware(req, res, () => createCharacterHandler(req, res));
        return true;
    }
    if (isRoute(req, 'PUT', '/api/update-character')) {
        authMiddleware(req, res, () => updateCharacterHandler(req, res));
        return true;
    }
    if (isRoute(req, 'DELETE', '/api/delete-character')) {
        authMiddleware(req, res, () => deleteCharacterHandler(req, res));
        return true;
    }
    return false;
}
