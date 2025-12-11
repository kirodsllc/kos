import express, { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  status: z.enum(['A', 'I']).optional().default('A'),
});

// All routes require authentication
router.use(verifyToken);

// Get all brands
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, status } = req.query;

    const where: any = {};
    
    if (search) {
      where.name = { contains: search as string };
    }
    
    if (status) {
      where.status = status;
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    // Format brands to return name strings for compatibility with PartForm
    const brandNames = brands.map(brand => brand.name);

    res.json({ 
      brands: brandNames,
      brandList: brands // Full brand objects for the brands page
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get single brand by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Create new brand
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = brandSchema.parse(req.body);

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name: data.name },
    });

    if (existingBrand) {
      return res.status(400).json({ error: 'Brand already exists' });
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name.trim(),
        status: data.status || 'A',
      },
    });

    res.status(201).json({ brand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ error: 'Brand name already exists' });
    }
    
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Update brand
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = brandSchema.partial().parse(req.body);

    // If name is being updated, check if it already exists
    if (data.name) {
      const existingBrand = await prisma.brand.findUnique({
        where: { name: data.name },
      });

      if (existingBrand && existingBrand.id !== req.params.id) {
        return res.status(400).json({ error: 'Brand name already exists' });
      }
    }

    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.status && { status: data.status }),
      },
    });

    res.json({ brand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ error: 'Brand name already exists' });
    }
    
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if brand is used in any items
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    if (brand.items.length > 0) {
      // Instead of deleting, set status to inactive
      const updatedBrand = await prisma.brand.update({
        where: { id: req.params.id },
        data: { status: 'I' },
      });
      return res.json({ 
        brand: updatedBrand,
        message: 'Brand marked as inactive because it is in use'
      });
    }

    await prisma.brand.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;

