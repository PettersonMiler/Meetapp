import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
// import ProviderController from './app/controllers/ProviderController';
import MeetupsController from './app/controllers/MeetupsController';
// import ScheduleController from './app/controllers/ScheduleController';
// import NotificationController from './app/controllers/NotificationController';
// import AvailableController from './app/controllers/AvailableController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.get('/meetups', MeetupsController.index);
routes.post('/meetups', MeetupsController.store);
routes.put('/meetups/:id', MeetupsController.update);
routes.delete('/meetups/:id', MeetupsController.delete);

// routes.get('/providers', ProviderController.index);
// routes.get('/providers/:providerID/available', AvailableController.index);

// routes.post('/appointments', AppointmentController.store);
// routes.get('/appointments', AppointmentController.index);
// routes.delete('/appointments/:id', AppointmentController.delete);

// routes.get('/schedule', ScheduleController.index);

// routes.get('/notifications', NotificationController.index);
// routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
