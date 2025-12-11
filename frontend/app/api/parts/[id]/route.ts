import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { verifyToken } from '@/lib/middleware/auth';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get a single part by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const part = await prisma.part.findUnique({
      where: { id: params.id },
      include: {
        models: true,
        stock: true,
      },
    });

    if (!part) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    return NextResponse.json({ part });
  } catch (error: any) {
    console.error('Part fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch part', message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a part
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: any;
  try {
    // Read body first
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract models from body
    const { models, ...partData } = body;

    // Check if part exists
    const existingPart = await prisma.part.findUnique({
      where: { id: params.id },
    });

    if (!existingPart) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    // Update part in a transaction
    const part = await prisma.$transaction(async (tx) => {
      // Update the part
      const updatedPart = await tx.part.update({
        where: { id: params.id },
        data: partData,
      });

      // Delete existing models
      await tx.partModel.deleteMany({
        where: { partId: params.id },
      });

      // Create new models if provided
      if (models && models.length > 0) {
        await tx.partModel.createMany({
          data: models.map((model: any) => ({
            partId: params.id,
            modelNo: model.modelNo,
            qtyUsed: model.qtyUsed,
            tab: model.tab || 'P1',
          })),
        });
      }

      // Return the updated part with models
      return await tx.part.findUnique({
        where: { id: params.id },
        include: {
          models: true,
          stock: true,
        },
      });
    });

    return NextResponse.json({ part });
  } catch (error: any) {
    console.error('Part update error:', error);
    return NextResponse.json(
      { error: 'Failed to update part', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a part
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if part exists
    const existingPart = await prisma.part.findUnique({
      where: { id: params.id },
    });

    if (!existingPart) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    // Delete the part (models will be deleted automatically due to cascade)
    await prisma.part.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Part deleted successfully' });
  } catch (error: any) {
    console.error('Part deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete part', message: error.message },
      { status: 500 }
    );
  }
}
