import { Router, type Router as ExpressRouter } from 'express';
import { VehiclesController } from './vehicles.controller';

const router: ExpressRouter = Router();
const vehiclesController = new VehiclesController();

// Get all vehicles
router.get('/', vehiclesController.getAll.bind(vehiclesController));

// Get vehicle by ID
router.get('/:id', vehiclesController.getById.bind(vehiclesController));

// Get vehicle statistics
router.get('/statistics', vehiclesController.getStatistics.bind(vehiclesController));

// Create vehicle
router.post('/', vehiclesController.create.bind(vehiclesController));

// Update vehicle
router.put('/:id', vehiclesController.update.bind(vehiclesController));

// Delete vehicle
router.delete('/:id', vehiclesController.delete.bind(vehiclesController));

export default router;
