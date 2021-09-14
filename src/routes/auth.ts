import {Router} from 'express';
import { signIn, signUp , signUpMobile,signInMobile ,signUpPhone,signUpAuthSocial,signInAuthSocial,verifyCode} from '../controllers/auth.controller';
const router = Router();

router.post('/signup/mobile/:singin_method', signUpAuthSocial);
router.post('/signin/mobile/:singin_method', signInAuthSocial);
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signup/mobile', signUpMobile);
router.post('/signin/mobile', signInMobile);
router.post('/signup/phone', signUpPhone);
router.post('/signup/verify', verifyCode);


export default router;