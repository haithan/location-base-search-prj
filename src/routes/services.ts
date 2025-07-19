import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticateToken } from '../middleware/auth';
import { validateSearchParams, validateServiceId } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const serviceController = new ServiceController();

/**
 * @swagger
 * /services/search:
 *   get:
 *     tags: [Services]
 *     summary: Search for services by location
 *     description: Search for services within a specified radius of a location with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           example: 21.0285
 *         description: Latitude coordinate (Hanoi center for testing)
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           example: 105.8542
 *         description: Longitude coordinate (Hanoi center for testing)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *           maximum: 50
 *           example: 5
 *         description: Search radius in kilometers
 *       - in: query
 *         name: service_type
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by service type ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: "hospital"
 *         description: Filter by service name (partial match)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *           example: 10
 *         description: Maximum number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           example: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Services found successfully
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
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', authenticateToken, validateSearchParams, asyncHandler(serviceController.searchServices));

/**
 * @swagger
 * /services/types:
 *   get:
 *     tags: [Services]
 *     summary: Get all service types
 *     description: Retrieve a list of all available service types
 *     responses:
 *       200:
 *         description: Service types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceType'
 */
router.get('/types', asyncHandler(serviceController.getServiceTypes));

/**
 * @route   GET /api/v1/services/popular
 * @desc    Get popular services (most favorited)
 * @access  Private (requires authentication)
 * @query   limit?
 */
router.get('/popular', authenticateToken, asyncHandler(serviceController.getPopularServices));

/**
 * @route   GET /api/v1/services/type/:typeId
 * @desc    Get services by type
 * @access  Private (requires authentication)
 * @query   limit?, offset?
 */
router.get('/type/:typeId', authenticateToken, asyncHandler(serviceController.getServicesByType));

/**
 * @route   GET /api/v1/services/countries
 * @desc    Get all countries
 * @access  Public
 */
router.get('/countries', asyncHandler(serviceController.getCountries));

/**
 * @route   GET /api/v1/services/countries/:countryId/divisions
 * @desc    Get administrative divisions by country
 * @access  Public
 * @query   parent_id? (optional parent division ID)
 */
router.get('/countries/:countryId/divisions', asyncHandler(serviceController.getAdministrativeDivisions));

/**
 * @route   GET /api/v1/services/search-address
 * @desc    Search services by address components
 * @access  Private (requires authentication)
 * @query   q (search term), limit?
 */
router.get('/search-address', authenticateToken, asyncHandler(serviceController.searchByAddress));

/**
 * @route   GET /api/v1/services/:serviceId
 * @desc    Get service by ID
 * @access  Private (requires authentication)
 */
router.get('/:serviceId', authenticateToken, validateServiceId, asyncHandler(serviceController.getServiceById));

export default router;
