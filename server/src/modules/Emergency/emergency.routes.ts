import { Router } from 'express';
import { EmergencyController } from './emergency.controller';

const router = Router();

/**
 * Emergency Visits Routes
 */
router.post('/visits', EmergencyController.createEmergencyVisit);
router.get('/visits', EmergencyController.getEmergencyVisits);
router.get('/visits/:id', EmergencyController.getEmergencyVisit);

/**
 * Emergency Triage Routes
 */
router.post('/triage', EmergencyController.performTriage);

/**
 * Emergency Bed Management Routes
 */
router.post('/beds/assign', EmergencyController.assignEmergencyBed);
router.get('/beds/available', EmergencyController.getAvailableEmergencyBeds);

/**
 * Emergency Statistics Routes
 */
router.get('/statistics', EmergencyController.getEmergencyStatistics);

export default router;
