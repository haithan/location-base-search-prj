import { Router } from 'express';
import authRoutes from './auth';
import serviceRoutes from './services';
import favoriteRoutes from './favorites';
import { config } from '../config';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Location-Based Service Search API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "v1"
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Location-Based Service Search API is running',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
  });
});

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
