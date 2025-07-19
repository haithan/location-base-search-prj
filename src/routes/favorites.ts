import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { authenticateToken } from '../middleware/auth';
import { validateFavoriteRequest, validateServiceId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const favoriteController = new FavoriteController();

router.use(authenticateToken);

/**
 * @swagger
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get user's favorite services
 *     description: Retrieve all services marked as favorites by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *           example: 10
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           example: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: User favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', asyncHandler(favoriteController.getUserFavorites));

/**
 * @swagger
 * /favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Add service to favorites
 *     description: Add a service to the authenticated user's favorites list
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the service to add to favorites
 *     responses:
 *       201:
 *         description: Service added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid service ID or service already in favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateFavoriteRequest, asyncHandler(favoriteController.addFavorite));

/**
 * @route   DELETE /api/v1/favorites/:serviceId
 * @desc    Remove service from favorites
 * @access  Private
 */
router.delete('/:serviceId', validateServiceId, asyncHandler(favoriteController.removeFavorite));

/**
 * @route   GET /api/v1/favorites/:serviceId/status
 * @desc    Check if service is in user's favorites
 * @access  Private
 */
router.get('/:serviceId/status', validateServiceId, asyncHandler(favoriteController.checkFavoriteStatus));

/**
 * @route   PUT /api/v1/favorites/:serviceId/toggle
 * @desc    Toggle favorite status for a service
 * @access  Private
 */
router.put('/:serviceId/toggle', validateServiceId, asyncHandler(favoriteController.toggleFavorite));

/**
 * @route   DELETE /api/v1/favorites
 * @desc    Clear all user favorites
 * @access  Private
 */
router.delete('/', asyncHandler(favoriteController.clearAllFavorites));

export default router;
