/** Email service configuration via Resend */
import { Resend } from 'resend';
import {config} from '../configs/config.js'

const resend = new Resend(config.EMAIL_API);

export default resend;