import {Router, Request, Response} from 'express';
import jwtDecode from 'jwt-decode';
import User from '../models/user';
import {checkJwt} from '../middleware/checkJwt';

const router = Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', checkJwt, async (req: Request, res: Response) => {
    const {name, dateOfBirth} = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken: any = jwtDecode(token!);
    const userId = decodedToken.sub;

    try {
        const newUser = new User({_id: userId, name, dateOfBirth});
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({message: 'Error creating user', error});
    }
});

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/', checkJwt, async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken: any = jwtDecode(token!);
    const userId = decodedToken.sub;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({message: 'Error retrieving user', error});
    }
});

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/', checkJwt, async (req: Request, res: Response) => {
    const {name, dateOfBirth} = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken: any = jwtDecode(token!);
    const userId = decodedToken.sub;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {name, dateOfBirth}, {new: true});
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({message: 'Error updating user', error});
    }
});

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/', checkJwt, async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken: any = jwtDecode(token!);
    const userId = decodedToken.sub;

    try {
        await User.findByIdAndDelete(userId);
        res.status(200).json({message: 'User deleted successfully'});
    } catch (error) {
        res.status(400).json({message: 'Error deleting user', error});
    }
});

export default router;
